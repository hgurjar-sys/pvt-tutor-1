"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  FileText, 
  LogOut,
  GraduationCap,
  Menu,
  X
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    router.push('/login');
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/students", icon: Users },
    { name: "Materials & PDFs", href: "/materials", icon: BookOpen },
    { name: "Generate Assessment", href: "/generator", icon: FileText },
    { name: "Test Papers", href: "/test-papers", icon: FileText },
    { name: "Class Gradebook", href: "/gradebook", icon: GraduationCap },
  ];

  return (
    <div className="flex h-screen print:h-auto print:block bg-slate-50 dark:bg-slate-950 font-sans print:bg-white flex-col md:flex-row overflow-hidden w-full absolute inset-0">
      
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-400">
            Pvt Tutor AI
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)} 
          className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Background Overlay for Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        print:hidden fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand/Logo Area (Desktop) / Mobile Close Header */}
          <div className="h-16 md:h-20 flex items-center justify-between md:justify-start px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mr-3 hidden md:flex">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-400 hidden md:block">
                Pvt Tutor AI
              </span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 md:hidden flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Menu
              </span>
            </div>
            
            {/* Mobile Close Button */}
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="md:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                  {item.name}
                  {isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button 
             onClick={handleSignOut}
             className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-red-500 dark:hover:text-red-400 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-500 dark:group-hover:text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 print:p-0 print:bg-white w-full relative">
        <div className="max-w-7xl mx-auto w-full">
           {children}
        </div>
      </main>
    </div>
  );
}
