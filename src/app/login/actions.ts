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

const ADMIN_EMAIL = 'admin1235@passmail.in';
const ADMIN_PASSWORD = '12345!';
const USER_EMAIL = 'user1235@passmail.in';
const USER_PASSWORD = '123!';

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
  let role: 'admin' | 'user' | null = null;
  let success = false;
  let redirectPath: string | null = null;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    role = 'admin';
    success = true;
    redirectPath = '/';
  } else if (email === USER_EMAIL && password === USER_PASSWORD) {
    role = 'user';
    success = true;
    redirectPath = '/user';
  }

  if (success && role) {
    const session = { email, role };
    cookies().set('session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    if (redirectPath) {
      redirect(redirectPath);
    }
  }

  return { message: 'Invalid credentials.', success: false };
}

export async function logout() {
    cookies().delete('session');
    redirect('/login');
}
