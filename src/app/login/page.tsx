"use client";

import { useState } from "react";
import { BookOpen, ArrowRight, Loader2, Target, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    // 800ms visual loading state for a smoother transition
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-500/30 flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      
      {/* Left Pane - Marketing / Branding */}
      <div className="flex-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-8 md:p-12 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-500/20 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative z-10 space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 mb-6 shadow-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Pvt Tutor AI
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100/90 font-medium max-w-lg mt-4">
            The intelligent operating system for Gujarati-medium private educators.
          </p>
        </div>

        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 hidden md:block mt-12">
           <div className="grid gap-6">
             <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
               <div className="p-3 bg-white/10 rounded-xl"><Target className="w-6 h-6 text-indigo-200" /></div>
               <div>
                 <div className="font-bold text-lg">AI Test Generation</div>
                 <div className="text-indigo-200 text-sm">Convert chapters into assessments instantly.</div>
               </div>
             </div>
             <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
               <div className="p-3 bg-white/10 rounded-xl"><Users className="w-6 h-6 text-indigo-200" /></div>
               <div>
                 <div className="font-bold text-lg">Classroom Scaling</div>
                 <div className="text-indigo-200 text-sm">Assign, track, and grade bulk student records effortlessly.</div>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900 shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.1)] z-10 relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
          
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tutor Portal
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Access your classroom and AI generator natively.
            </p>
          </div>

          <div className="space-y-6">

            <button
              disabled={loading}
              onClick={handleLogin}
               className="w-full relative group overflow-hidden bg-indigo-600 text-white border border-transparent flex justify-center py-4 px-4 rounded-2xl font-semibold shadow-xl shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <div className="absolute inset-0 w-full h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="relative flex items-center gap-3">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
                Enter Dashboard (v1.0 Sandbox)
              </span>
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-400">SSO Coming in System Version 2.0</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
