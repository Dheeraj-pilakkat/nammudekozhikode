import Image from 'next/image'
import React from 'react'

function Footer() {
  return (
    <div className='flex items-center justify-between px-4 mt-4 mx-16 py-2 bg-neutral-200 rounded-lg'>
      <div className='flex gap-x-4 items-center'>
            <Image src="/logo.png" alt="logo" width={50} height={50} className='rounded-full size-12' />
            <h1 className="text-3xl font-black text-primary">Nammude Kozhikode</h1>
        </div>
        <div className='text-2xl py-3'>
                  <button className="px-1 hover:font-bold hover:tracking-wider py-1 mx-3 hover:text-primary hover:underline transition-all  delay-10 duration-300 ease-in-out rounded-none border-primary active:text-primary">Features</button>
                  <button className="px-1 hover:font-bold hover:tracking-wider py-1 mx-3 hover:text-primary hover:underline transition-all  delay-10 duration-300 ease-in-out rounded-none border-primary active:text-primary">Officials</button>
                  <button className="px-1 hover:font-bold hover:tracking-wider py-1 mx-3 hover:text-primary hover:underline transition-all  delay-10 duration-300 ease-in-out rounded-none border-primary active:text-primary">How it works</button>
        </div>
              
    </div>
  )
}

export default Footer
