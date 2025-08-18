'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { Role } from '@/lib/types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["admin", "warden", "floor_incharge", "student"]),
});

export type LoginState = {
  message: string;
  success: boolean;
};

// Mock users with different roles
const users = {
    admin: { email: 'admin@gmail.com', password: '123456', role: 'admin' as const },
    warden: { email: 'warden@gmail.com', password: '1234', role: 'warden' as const, hostelName: 'Podhigai' },
    floor_incharge: { email: 'fincharge@gmail.com', password: '12345', role: 'floor_incharge' as const, hostelName: 'Podhigai', floor: '1' },
    student: { email: 'student@gmail.com', password: '123', role: 'student' as const, hostelName: 'Podhigai', floor: '1', roomNumber: '101' },
};


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

  const { email, password, role } = validatedFields.data;
  const user = users[role as keyof typeof users];

  if (user && user.email === email && user.password === password) {
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
            redirect('/admin-dashboard');
        case 'warden':
            redirect('/warden-dashboard');
        case 'floor_incharge':
            redirect('/floorincharge-dashboard');
        case 'student':
            redirect('/student-dashboard');
        default:
            // This default should ideally not be reached if roles are validated
            redirect('/login');
    }
  }

  return { message: 'Invalid credentials. Please try again.', success: false };
}

export async function logout() {
    cookies().delete('session');
    redirect('/login');
}
