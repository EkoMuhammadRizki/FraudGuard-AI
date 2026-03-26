export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center relative overflow-hidden">
            {/* Immersive Cyber Grid & Glows */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
            
            {/* Floating Orbs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-blue/10 blur-[100px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-hyper-violet/10 blur-[100px] rounded-full animate-pulse delay-1000 pointer-events-none" />
            
            {/* Center Container */}
            <div className="relative z-10 w-full flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}
