'use client'
import { Button } from '@/components/ui/button'
import React from 'react'
import { useRouter } from 'next/navigation'

const Page = () => {
  const router = useRouter()
  return (
    <div>
      <Button variant={"tausif"} onClick={() => router.push('/login')}>
     <h1>Login</h1>
      </Button>
    </div>
  )
}

export default Page