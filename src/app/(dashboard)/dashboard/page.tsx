"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Users, BookOpen, GraduationCap, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    materials: 0,
    assessments: 0
  });
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          { count: sCount },
          { count: mCount },
          { count: aCount },
          { data: recent }
        ] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('materials').select('*', { count: 'exact', head: true }),
          supabase.from('assessments').select('*', { count: 'exact', head: true }),
          supabase.from('assessments')
            .select('id, title, score, total_points, created_at, student:students(first_name, last_name)')
            .order('created_at', { ascending: false })
            .limit(5)
        ]);
        
        setStats({
          students: sCount || 0,
          materials: mCount || 0,
          assessments: aCount || 0
        });
        
        if (recent) setRecentAssessments(recent);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500 max-w-6xl mx-auto">
      
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          Tutor Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Your centralized command center for student progress and AI materials.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          {/* Metric Cards Real Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Link href="/students" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 block group">
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Students</div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {stats.students}
              </div>
            </Link>

            <Link href="/materials" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 block group">
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Materials Uploaded</div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {stats.materials}
              </div>
            </Link>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 block group">
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Assessments Built</div>
                <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white">
                {stats.assessments}
              </div>
            </div>

          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm pt-6 mt-8">
            <h2 className="px-6 pb-4 text-xl font-bold border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
              Recent Assessments
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Date Generated</th>
                    <th className="px-6 py-4">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {recentAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No assessments generated yet. Use the Generator to build one!
                      </td>
                    </tr>
                  ) : (
                    recentAssessments.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                          <Link href={`/assessments/${a.id}`} className="hover:text-indigo-600 hover:underline">
                            {a.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {a.student ? `${a.student.first_name} ${a.student.last_name}` : <span className="text-slate-400 italic">None assigned</span>}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(a.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {a.score !== null ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20 shadow-sm">
                              Graded ({a.score}/{a.total_points})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              Not graded
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
