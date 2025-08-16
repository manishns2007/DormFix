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
    case 'warden':
      redirect('/warden-dashboard');
    case 'floor_incharge':
      redirect('/floorincharge-dashboard');
    case 'student':
      redirect('/student-dashboard');
    default:
      redirect('/login');
  }
}
