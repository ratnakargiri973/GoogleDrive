import React, { useContext } from 'react';
import { authContext } from './Context';
import logo from './../assets/logo.png';
import landing from './../assets/landing.jpg';

function Login() {
  const { signIn } = useContext(authContext);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 sm:px-12 sm:py-8">
        <div className="logo flex items-center gap-2 sm:gap-5">
          <img src={logo} alt="logo" className="w-8 sm:w-10" />
          <h1 className="text-2xl sm:text-3xl text-gray-600">Drive</h1>
        </div>
        <button
          onClick={() => signIn()}
          className="py-2 px-3 sm:py-3 sm:px-4 rounded bg-blue-500 text-white font-bold hover:bg-blue-700 transition duration-300"
        >
          Log In
        </button>
      </header>
      <main className="flex flex-col-reverse sm:flex-row justify-between items-center w-full px-6 py-8 sm:px-12 sm:py-16 flex-1">
        <div className="flex flex-col gap-4 sm:gap-6 text-center sm:text-left">
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
            Easy and secure <br className="hidden sm:block" />
            access to your content
          </h1>
          <p className="text-lg sm:text-2xl">
            Store, share, and collaborate on files and folders from <br className="hidden sm:block" />
            your mobile device, tablet, or computer.
          </p>
          <button
            onClick={() => signIn()}
            className="py-2 px-3 sm:py-3 sm:px-4 rounded bg-blue-500 text-white font-bold hover:bg-blue-700 transition duration-300"
          >
            Log In
          </button>
        </div>
        <img src={landing} alt="landing" className="w-full sm:w-1/2 mb-8 sm:mb-0 object-cover" />
      </main>
    </div>
  );
}

export default Login;
