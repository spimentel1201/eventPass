import { redirect } from 'next/navigation';

// Redirect root to events page (public listing)
export default function Home() {
  redirect('/events');
}
