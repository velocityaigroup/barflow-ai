// Floor plan is now at the root route (/)
// This redirect keeps legacy /floor links working
import { redirect } from 'next/navigation';

export default function FloorRedirect() {
  redirect('/');
}
