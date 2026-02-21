import { redirect } from 'next/navigation'

// Sign-up is now handled by the magic link flow on the login page.
// Any visits to this route are redirected there.
export default function Page() {
  redirect('/auth/login')
}
