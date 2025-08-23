import { RegistrationRoutes } from '@/lib/types';
import { redirect } from 'next/navigation';

export default function SignUpPage() {
  redirect(RegistrationRoutes.USER_INFO);
}
