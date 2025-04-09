import { DocumentUpload } from 'iconsax-react'
import React from 'react'

const Page = () => {
  return (
    <div className='flex flex-col items-start justify-start bg-gradient-to-t h-full from-white to-blue-100'>
         <div className='flex flex-col items-start justify-start px-4 py-6 gap-y-2'>
            <div className='flex flex-col items-start justify-start gap-y-2 w-full'>
                <img src="https://often-public-assets.blr1.cdn.digitaloceanspaces.com/trippy.png" alt="trippy" className='size-8' />
            <p style={{ fontFamily: 'var(--font-domine)'}}  className='text-xl text-slate-900'>I need you to share the deal details and we&apos;ll work on negotiating a better rate for you!</p>
            </div>
        </div>

        <div className='flex flex-col items-start justify-start gap-y-2 px-4 w-full'>
            <div className='flex flex-row items-center justify-center w-full gap-x-2 p-2 border border-primary rounded-lg'>
                <DocumentUpload size={24} color='#020A34' />
                <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-primary font-normal text-md pr-4 mt-0.5'>Upload Document</h2>
            </div>
            <div className='flex flex-row items-center justify-center w-full gap-x-2 p-2 bg-blue-600 rounded-lg'>
                <h2 style={{ fontFamily: 'var(--font-nohemi)' }} className='text-white font-normal text-md pr-4 mt-0.5'>Get me the best deal!</h2>
            </div>
            </div>
        </div>
  )
}

export default Page