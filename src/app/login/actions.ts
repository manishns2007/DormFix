'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginState = {
  message: string;
  success: boolean;
};

// Mock users with different roles
const users = {
  'admin@dormfix.com': { password: 'adminpassword', role: 'admin' as const },
  'warden.podhigai@dormfix.com': { password: 'wardenpassword', role: 'warden' as const, hostelName: 'Podhigai' },
  'floor1.podhigai@dormfix.com': { password: 'floorpassword', role: 'floor_incharge' as const, hostelName: 'Podhigai', floor: '1' },
};


export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid email or password format.',
      success: false,
    };
  }

  const { email, password } = validatedFields.data;
  const user = users[email as keyof typeof users];

  if (user && user.password === password) {
    const session = {
        email,
        role: user.role,
        hostelName: 'hostelName' in user ? user.hostelName : undefined,
        floor: 'floor' in user ? user.floor : undefined,
    };

    cookies().set('session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    switch (user.role) {
        case 'admin':
            redirect('/');
        case 'warden':
            redirect('/warden');
        case 'floor_incharge':
            redirect('/floor-incharge');
        default:
            redirect('/login');
    }
  }

  return { message: 'Invalid credentials.', success: false };
}

export async function logout() {
    cookies().delete('session');
    redirect('/login');
}
