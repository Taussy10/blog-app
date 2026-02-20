import { Button } from '@/components/ui/button'
import React from 'react'

const LearnShadcn = () => {
  return (
    <div>
             {/* The destructive variant already applies background styles.
If we want to override them, we should either remove the variant
or define a custom variant instead of using inline styles cause your custom-tailwind CSS won't work here */}
        <Button className="bg-green-500" variant={'destructive'} style={{ backgroundColor:'orange'}} size={'default'} >Shadcn Button</Button>
          <Button variant={'tausif'} size={'default'}> Tausif</Button>

    </div>
  )
}

export default LearnShadcn