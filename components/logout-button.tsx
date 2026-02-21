'use client'

import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    // We have t to run it on browser side cause using interactiviy that's the reason 
    // suapabse client is used
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return <Button onClick={logout}>Logout</Button>
}
