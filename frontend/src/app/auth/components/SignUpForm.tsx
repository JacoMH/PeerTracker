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
            <form onSubmit={(e) => { e.preventDefault(); signUpAPI() }} className='flex flex-col w-full justify-center'>
                <span className='text-3xl font-bold mb-1 flex justify-around'>Sign Up</span>
                <div className='flex flex-col gap-3 max-w-100 w-full justify-center self-center'>
                    <label htmlFor="Role" className="block text-sm font-medium text-gray-700">Role</label>
                    <select id='Role' name='Role' className="p-2 bg-gray-400 rounded-2xl text-white flex justify-center" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value='Student'>Student</option>
                        <option value='Supervisor'>Supervisor</option>
                    </select>
                    <label htmlFor="FirstName" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" id="FirstName" name="FirstName" className="p-2 bg-gray-400 rounded-2xl text-white flex justify-center" placeholder="Enter First Name..."
                        value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    <label htmlFor="LastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" id="LastName" name="LastName" className="p-2 bg-gray-400 rounded-2xl text-white flex justify-center" placeholder="Enter Last Name..."
                        value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    <label htmlFor='email' className='block text-sm font-medium text-gray-700'>Email</label>
                    <input type='email' id='email' name='email' className="p-2 bg-gray-400 rounded-2xl text-white flex justify-center" placeholder="Enter email..."
                        value={email} onChange={(e) => setEmail(e.target.value)} />
                    <label htmlFor='password' className='block text-sm font-medium text-gray-700'>Password</label>
                    <input type='password' id='password' name='password' className="p-2 bg-gray-400 rounded-2xl text-white flex justify-center" placeholder="Enter Password..."
                        value={password} onChange={(e) => setPassword(e.target.value)} />
                    <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>Confirm Password</label>
                    <input type='password' id='confirmPassword' name='confirmPassword' className="p-2 bg-gray-400 rounded-2xl text-white flex justify-center" placeholder="Confirm Password..."
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <span className='text-red-500 text-sm text-center'>{error}</span>
                    <button type='submit' className="flex place-self-center w-full justify-center max-w-30 p-3 mt-3 rounded-2xl bg-gray-600 text-white text-center hover:cursor-pointer hover:bg-gray-200 hover:text-black">
                        Sign Up</button>
                    <div className=' flex justify-center items-center mt-4'>
                        <span className='text-sm text-gray-700'>Already have an account?</span>
                        <button type='button' onClick={() => router.push('/auth/login')} className='text-black hover:underline hover:cursor-pointer ml-1 text-sm'>Login</button>
                    </div>
                </div>
            </form>
        ) : (
            <div className='flex flex-col gap-6 items-center'>
                <span className='text-3xl font-bold mb-6 flex justify-around'>Signup Successful</span>
                <button onClick={() => router.push('/auth/login')} className="flex place-self-center w-full justify-center max-w-30 p-3 mt-3 rounded-2xl bg-gray-600 text-white text-center hover:cursor-pointer hover:bg-gray-200 hover:text-black">
                    Go to Login</button>
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
                console.log("helloasodijaos")

                // Store role from backend with user id from auth user in http cookie
                const res = await fetch("/api/account/createuser", {
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
                console.log("helloasodijaosijdaoisjdoiajsoidjasiojdaiosjdoiajskvmsko")

                const response = await res.json();
                console.log("hello redirect here")
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
