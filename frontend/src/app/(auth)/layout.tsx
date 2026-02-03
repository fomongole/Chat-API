export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Left Side: Form */}
            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 xl:px-24">
                {children}
            </div>

            {/* Right Side: Branding/Image (Hidden on mobile) */}
            <div className="hidden bg-zinc-100 lg:flex lg:w-1/2 items-center justify-center dark:bg-zinc-900">
                <div className="max-w-md text-center">
                    <h2 className="text-3xl font-bold text-primary">Enterprise Chat</h2>
                    <p className="mt-4 text-zinc-500">Secure, real-time communication for modern teams.</p>
                </div>
            </div>
        </div>
    );
}