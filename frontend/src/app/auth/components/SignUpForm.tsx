"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
    const [role, setRole] = useState('Student');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [enableLoginRedirect, setEnableLoginRedirect] = useState(false);

    const router = useRouter();


    // Clear error messages after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        (!enableLoginRedirect) ? (
            <form onSubmit={(e) => { e.preventDefault(); signUpAPI() }}>
                <span className='text-3xl font-bold mb-6 flex justify-around'>Sign Up</span>
                <div className='flex flex-col gap-4'>
                    <label htmlFor="Role" className="block text-sm font-medium text-gray-700">Role</label>
                    <select id='Role' name='Role' className='border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500' value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value='Student'>Student</option>
                        <option value='Supervisor'>Supervisor</option>
                    </select>
                    <label htmlFor="FirstName" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" id="FirstName" name="FirstName" className="" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    <label htmlFor="LastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" id="LastName" name="LastName" className="" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    <label htmlFor='email' className='block text-sm font-medium text-gray-700'>Email</label>
                    <input type='email' id='email' name='email' className='' value={email} onChange={(e) => setEmail(e.target.value)} />
                    <label htmlFor='password' className='block text-sm font-medium text-gray-700'>Password</label>
                    <input type='password' id='password' name='password' className='' value={password} onChange={(e) => setPassword(e.target.value)} />
                    <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>Confirm Password</label>
                    <input type='password' id='confirmPassword' name='confirmPassword' className='' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <span className='text-red-500 text-sm text-center'>{error}</span>
                    <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 hover:cursor-pointer'>Sign Up</button>
                    <div className=' flex justify-center items-center mt-4'>
                        <span className='text-sm text-gray-700'>Already have an account?</span>
                        <button onClick={() => router.push('/auth/login')} className='text-blue-500 hover:underline hover:cursor-pointer ml-1 text-sm'>Login</button>
                    </div>
                </div>
            </form>
        ) : (
            <div className='flex flex-col gap-6 items-center'>
                <span className='text-3xl font-bold mb-6 flex justify-around'>Signup Successful</span>
                <button onClick={() => router.push('/auth/login')} className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 hover:cursor-pointer'>Go to Login</button>
            </div>
        )
    )
    async function signUpAPI() {
        if (password === confirmPassword) {
            try {
                // Sign up user with email and password using Supabase auth
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                })

                // error handling
                if (error) {
                    setError(error.message)
                }

                //fetch user id from auth user
                let userId = data.user?.id || ''

                let access_token = data.session?.access_token; 

                // Store role from backend with user id from auth user in http cookie
                const res = await fetch("/api/auth/createuser", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${access_token}`
                    },
                    body: JSON.stringify({
                        UserID: userId,
                        Role: role,
                        FirstName: firstName,
                        LastName: lastName,
                        email: email,
                    })
                });

                // transport error handling
                if (!res.ok) {
                    return setError("Error creating user in database")
                }

                const response = await res.json();

                // enables login redirect module if account creation is successful
                setEnableLoginRedirect(true);
            }
            catch (error) {
                console.error("Error fetching table data:", error);
                return [];
            }
        }
        else {
            setError("Passwords do not match")
        }
    }
}
