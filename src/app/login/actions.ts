'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { addRequest } from '@/lib/data';
import { createRequestSchema, type CreateRequestState, loginSchema, Role } from '@/lib/types';
import { predictRequestUrgency } from '@/ai/flows/predict-request-urgency';


export type LoginState = {
  message: string;
  success: boolean;
};

// Mock users with different roles
const users: {email: string, password: string, role: Role}[] = [
    { email: 'admin1235@passmail.in', password: '12345!', role: 'admin' },
    { email: 'user1235@passmail.in', password: '123!', role: 'user' },
];


export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      success: false,
    };
  }

  const { email, password } = validatedFields.data;
  
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    const session = {
        email,
        role: user.role,
    };

    cookies().set('session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    switch (user.role) {
        case 'admin':
            redirect('/admin-dashboard');
        case 'user':
            redirect('/user-dashboard');
        default:
            redirect('/login');
    }
  }

  return { message: 'Invalid credentials. Please try again.', success: false };
}

export async function logout() {
    cookies().delete('session');
    redirect('/login');
}


export async function createRequest(
  prevState: CreateRequestState | null,
  formData: FormData
): Promise<CreateRequestState> {
  const rawData = Object.fromEntries(formData.entries());

  // We only validate the fields in createRequestSchema, ignoring file inputs
  const validatedFields = createRequestSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
      success: false,
    };
  }

  const { category, description } = validatedFields.data;
  const photoDataUri = formData.get('photoDataUri') as string | null;

  try {
    const { urgency } = await predictRequestUrgency({ category, description });

    await addRequest({
      ...validatedFields.data,
      status: 'Submitted',
      urgency,
      imageUrl: photoDataUri || undefined,
    });
    
    revalidatePath('/user-dashboard');
    revalidatePath('/admin-dashboard');
    return { message: 'Request submitted successfully.', success: true };

  } catch (error) {
    console.error('Error creating request:', error);
    if (error instanceof Error) {
        return { message: `Request creation failed: ${error.message}`, success: false };
    }
    return { message: 'An unknown error occurred while creating the request.', success: false };
  }
}
