"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  FileText, 
  LogOut,
  GraduationCap
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

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
    <div className="flex h-screen print:h-auto print:block bg-slate-50 dark:bg-slate-950 font-sans print:bg-white">
      {/* Sidebar Navigation */}
      <aside className="print:hidden w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all">
        
        <div>
          {/* Brand/Logo Area */}
          <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mr-3">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-400">
              Pvt Tutor AI
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
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
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
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
      <main className="flex-1 overflow-auto print:overflow-visible bg-slate-50 dark:bg-slate-950 p-8 print:p-0 print:bg-white">
        {children}
      </main>
    </div>
  );
}
