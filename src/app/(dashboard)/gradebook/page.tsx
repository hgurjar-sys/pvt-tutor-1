"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Search, Loader2, Users, GraduationCap, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, FileCheck } from "lucide-react";
import Link from "next/link";

export default function GradebookMatrixPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchData() {
      const [
        { data: studentsData },
        { data: assessmentsData },
        { data: scoresData }
      ] = await Promise.all([
        supabase.from('students').select('id, first_name, last_name').order('first_name'),
        supabase.from('assessments').select('id, title, total_points, is_locked, created_at').eq('is_locked', true).order('created_at', { ascending: false }),
        supabase.from('student_scores').select('*')
      ]);

      if (studentsData) setStudents(studentsData);
      if (assessmentsData) setAssessments(assessmentsData);
      if (scoresData) setScores(scoresData);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleTest = (id: string) => {
    setExpandedTests(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 text-slate-500 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      <p className="font-medium animate-pulse">Compiling classroom matrix...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-500" />
            Class Gradebook
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track classroom progress across all locked test papers</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
           <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm font-semibold text-sm flex items-center gap-2">
             <Users className="w-4 h-4 text-indigo-500" /> {students.length} Total Students
           </div>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        {assessments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center shadow-sm">
            <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No Locked Tests Yet</h3>
            <p className="text-slate-500 mt-2">Go to the Test Papers tab to finalize and lock in a paper to begin grading your classroom.</p>
          </div>
        ) : (
          assessments.map(test => {
            // Calculate Progress
            const testScores = scores.filter(s => s.assessment_id === test.id);
            const numGraded = testScores.length;
            const totalStudents = students.length;
            const isFullyGraded = numGraded === totalStudents && totalStudents > 0;
            
            // Average Score Calculation
            const sumScores = testScores.reduce((acc, curr) => acc + curr.score, 0);
            const avgScore = numGraded > 0 ? (sumScores / numGraded).toFixed(1) : "-";

            const isExpanded = expandedTests[test.id];

            return (
              <div key={test.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-700">
                {/* Header Row */}
                <div 
                  onClick={() => toggleTest(test.id)}
                  className="p-5 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-center gap-4 flex-1">
                     <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                       {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                     </button>
                     <div>
                       <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                         {test.title}
                       </h3>
                       <div className="text-xs text-slate-500 mt-1 font-medium bg-slate-100 dark:bg-slate-800 inline-block px-2 py-0.5 rounded">
                         Max {test.total_points} Points
                       </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-6 sm:w-auto w-full justify-between sm:justify-end">
                    
                    {/* Progress Indicator */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-1">
                        {isFullyGraded ? (
                          <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Graded
                          </span>
                        ) : (
                          <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-500 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Pending ({numGraded}/{totalStudents})
                          </span>
                        )}
                      </div>
                      <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${isFullyGraded ? 'bg-emerald-500' : 'bg-amber-400'}`}
                          style={{ width: `${totalStudents > 0 ? (numGraded / totalStudents) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right border-l pl-6 border-slate-200 dark:border-slate-700 hidden sm:block">
                      <div className="text-xs uppercase font-bold text-slate-400 mb-0.5">Class Average</div>
                      <div className="font-semibold text-lg text-slate-900 dark:text-white">{avgScore} <span className="text-sm font-normal text-slate-500">/ {test.total_points}</span></div>
                    </div>

                  </div>
                </div>

                {/* Expanded Student List */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-6 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" /> Student Progress Report
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {students.map(student => {
                        const studentScoreRecord = testScores.find(s => s.student_id === student.id);
                        const isGraded = !!studentScoreRecord;

                        return (
                          <div key={student.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                              {student.first_name} {student.last_name}
                            </div>
                            
                            {isGraded ? (
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-bold px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-lg">
                                  {studentScoreRecord.score} <span className="text-xs font-medium opacity-60">/ {test.total_points}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-md">
                                Needs Grading
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Link href={`/assessments/${test.id}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors">
                        <FileCheck className="w-4 h-4"/> Input Student Grades
                      </Link>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
