export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <main className='flex items-center justify-center min-h-screen bg-gray-100'>
            <div className='bg-gray-300 p-8 rounded shadow-md w-full max-w-md'>
                {children}
            </div>
        </main>
  )
}