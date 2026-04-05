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
        <form onSubmit={(e) => { e.preventDefault(); loginAPI() }}>
            <span className='text-3xl font-bold mb-6 flex justify-around'>Login</span>
            <div className='flex flex-col gap-4'>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700'>Email</label>
                <input type='email' id='email' name='email' className='' value={email} onChange={(e) => setEmail(e.target.value)} />
                <label htmlFor='password' className='block text-sm font-medium text-gray-700'>Password</label>
                <input type='password' id='password' name='password' className='' value={password} onChange={(e) => setPassword(e.target.value)} />
                <span className='text-red-500 text-sm text-center'>{error}</span>
                <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 hover:cursor-pointer'>Login</button>
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

