import React, { useContext } from 'react'
import { authContext } from './Context'
import logo from './../assets/logo.png'
import landing from './../assets/landing.jpg'

function Login() {
     const {signIn} = useContext(authContext);
  return (
    <div>
      < header className='flex justify-between items-center px-12 py-8'>
      <div className='logo flex justify-start gap-5 items-center pl-6'>
          <img src={logo} alt='logo' className='w-10' />
          <h1 className='text-3xl text-gray-600'>Drive</h1>
        </div>
        <button onClick={()=>signIn()} className='py-3 px-4 rounded bg-blue-500 text-white font-bold hover:bg-blue-700'>Log In</button>
      </header>
      <main className='flex justify-between items-center w-full px-8 py-8'>
      <div className='flex justify-start items-start flex-col gap-4'>
        <h1 className='text-6xl'>Easy and secure <br />access to your content</h1>
        <p className='text-2xl'>Store, share, and collaborate on files and folders from <br /> your mobile device, tablet, or computer</p>
        <button onClick={()=>signIn()} className='py-3 px-4 rounded bg-blue-500 text-white font-bold hover:bg-blue-700'>Log In</button>
      </div>
      <img src={landing} alt="landing" className='w-2/4'/>
      </main>
    </div>
  ) 
}

export default Login
