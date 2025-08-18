import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function HomePage() {
  const sessionCookie = cookies().get('session');
  if (!sessionCookie) {
    redirect('/login');
  }

  const session = JSON.parse(sessionCookie.value);

  switch (session.role) {
    case 'admin':
      redirect('/admin-dashboard');
    case 'user':
      redirect('/user-dashboard');
    default:
      redirect('/login');
  }
}
