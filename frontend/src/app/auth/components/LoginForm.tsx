import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    // Error message timer for 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error])

    return (
        <form onSubmit={(e) => { e.preventDefault(); loginAPI() }} className='w-full flex flex-col'>
            <span className='text-3xl font-bold mb-6 flex justify-around'>Login</span>
            <div className='flex flex-col gap-4 max-w-100 w-full justify-center self-center'>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700'>Email</label>
                <input type='email' id='email' name='email' className="p-2 bg-gray-400 rounded-2xl text-white flex justify-center" placeholder="Enter email here..." 
                value={email} onChange={(e) => setEmail(e.target.value)} />
                <label htmlFor='password' className='block text-sm font-medium text-gray-700'>Password</label>
                <input type='password' id='password' name='password' className="p-2 bg-gray-400 rounded-2xl text-white flex justify-center" placeholder="Enter password here..." 
                value={password} onChange={(e) => setPassword(e.target.value)} />
                <span className='text-red-500 text-sm text-center'>{error}</span>
                <button type='submit' className="flex place-self-center w-full justify-center max-w-30 p-3 mt-3 rounded-2xl bg-gray-600 text-white text-center hover:cursor-pointer hover:bg-gray-200 hover:text-black">Login</button>
            </div>
            <div className='flex justify-center items-center mt-4'>
                <span className='text-sm text-gray-700'>Dont have an account?</span>
                <button type='button' onClick={() => router.push('/auth/signup')} className='text-black hover:underline hover:cursor-pointer ml-1 text-sm'>Signup</button>
            </div>
        </form>
    )

    async function loginAPI() {

        // Sign in to Supabase auth 
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            })
            if (error) {
                setError(error.message)
            }

            if (data?.session) {
                router.push('/dashboard/menu');
            }


        }
        catch (error) {
            console.error("Error fetching table data:", error);
            return [];
        }
    }
}

