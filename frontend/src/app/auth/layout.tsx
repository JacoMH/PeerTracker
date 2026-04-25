export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <main className='flex items-center justify-center min-h-screen'>
            <div className='flex items-center justify-center rounded-4xl bg-gray-200 text-black w-150 p-15'>
                {children}
            </div>
        </main>
  )
}