export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center relative overflow-hidden py-10 px-4 font-sans selection:bg-neon-cyan selection:text-dark-950">
            {/* Cyber Grid & Background Orbs */}
            <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-neon-cyan/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-hyper-violet/15 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-primary-blue/10 blur-[160px] rounded-full pointer-events-none" />

            {/* Center Container for Auth Card */}
            <div className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
