"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Search, FileText, Loader2, BookOpen, Clock, Lock, Unlock } from "lucide-react";
import Link from "next/link";

export default function TestPapersPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchAssessments() {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          id, 
          title, 
          is_locked,
          total_points, 
          created_at, 
          material:materials(title)
        `)
        .order('created_at', { ascending: false });

      if (data) setAssessments(data);
      setLoading(false);
    }
    fetchAssessments();
  }, []);

  const filteredAssessments = assessments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-500" />
            Test Papers Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and configure your AI-generated quiz templates</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search test paper title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white dark:bg-slate-900 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Assessment Template</th>
                <th className="px-6 py-4">Date Built</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                    Loading your test papers...
                  </td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex flex-col items-center justify-center mx-auto mb-3">
                      <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    No templates found. Generate some tests using the AI!
                  </td>
                </tr>
              ) : (
                filteredAssessments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-200 text-base mb-1">
                        {a.title}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {a.material?.title || "General Source"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {a.is_locked ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                          <Lock className="w-3 h-3" /> Locked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 shadow-sm animate-pulse">
                          <Unlock className="w-3 h-3" /> Config Required
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                      {a.total_points} pts
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/assessments/${a.id}`} 
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          a.is_locked 
                            ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20"
                            : "text-amber-700 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:hover:bg-amber-500/20"
                        }`}
                      >
                        {a.is_locked ? "View Paper / Grade Students" : "Configure Max Points"}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
