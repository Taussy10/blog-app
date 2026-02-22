'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export function LogoutButton() {
    const supabase = createClient()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = async () => {
        setIsLoading(true)
        await supabase.auth.signOut()
        router.refresh() // This clears the server-side cache
        router.push('/')
    }

    return (
        <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors"
        >
            <LogOut className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
            {isLoading ? 'Signing out...' : 'Logout'}
        </Button>
    )
}