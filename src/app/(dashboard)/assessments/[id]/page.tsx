"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/utils/supabase/client";
import { ArrowLeft, Printer, FileCheck, CheckCircle2, Clock, BookOpen, UserCircle2, Save, X, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Assessment {
  id: string;
  title: string;
  created_at: string;
  total_points: number;
  questions: any[];
  answer_key: any[];
  score: number | null;
  is_locked: boolean;
  material: { title: string };
  student: { id: string, first_name: string, last_name: string } | null;
}

export default function AssessmentViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [studentsList, setStudentsList] = useState<{id:string, first_name:string, last_name:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  
  // App States
  const [gradingMode, setGradingMode] = useState(false);
  const [configuringMode, setConfiguringMode] = useState(false); // TRUE when is_locked == false
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [itemScores, setItemScores] = useState<Record<number, string>>({});
  const [maxItemScores, setMaxItemScores] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          material:materials(title),
          student:students(id, first_name, last_name)
        `)
        .eq('id', id)
        .single();
        
      if (data) {
        setAssessment(data);
        setSelectedStudentId(data.student?.id || "");
        
        // Use true if explicitly locked, otherwise false (unlocked config mode)
        const isLocked = Boolean(data.is_locked); 
        if (!isLocked) setConfiguringMode(true);

        const initialMax: Record<number, string> = {};
        data.questions.forEach((q: any, i: number) => {
          initialMax[i] = (q.points || Math.round((data.total_points||20) / data.questions.length)).toString();
        });
        setMaxItemScores(initialMax);
      }
      
      const { data: students } = await supabase.from('students').select('id, first_name, last_name').order('first_name');
      if (students) setStudentsList(students);
      
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const calculateTotal = () => {
    return Object.values(itemScores).reduce((acc, val) => acc + (Number(val) || 0), 0);
  };

  const calculateTotalMaxPoints = () => {
    return Object.values(maxItemScores).reduce((acc, val) => acc + (Number(val) || 0), 0);
  };

  // User locks in the max point values.
  const handleLockIn = async () => {
    setIsSaving(true);
    const newTotalPoints = calculateTotalMaxPoints();
    
    const updatedQuestions = assessment!.questions.map((q, i) => ({
      ...q,
      points: Number(maxItemScores[i]) || Number(q.points)
    }));
    
    // Attempting to save new locked state
    const { error } = await supabase
      .from('assessments')
      .update({
        total_points: newTotalPoints,
        questions: updatedQuestions,
        is_locked: true
      })
      .eq('id', id);

    if (!error && assessment) {
      setAssessment({ 
        ...assessment, 
        total_points: newTotalPoints, 
        questions: updatedQuestions, 
        is_locked: true 
      });
      setConfiguringMode(false);
    } else if (error) {
      alert("Failed to lock. Did you remember to add the is_locked boolean column to Supabase via SQL? Error: " + error.message);
    }
    setIsSaving(false);
  };

  // User saves a graded student paper.
  const handleSaveGrade = async () => {
    if (!selectedStudentId) {
      alert("Please select a student first!");
      return;
    }
    
    setIsSaving(true);
    const finalScore = calculateTotal();

    const { error } = await supabase
      .from('student_scores')
      .insert([{
         assessment_id: id,
         student_id: selectedStudentId,
         score: finalScore,
         max_score: assessment!.total_points
      }]);
      
    if (!error) {
      alert("Grade saved successfully!");
      router.push('/gradebook');
    } else {
      alert("Error saving grade. Make sure you created the student_scores table! Error: " + error.message);
    }
    setIsSaving(false);
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading assessment...</div>;
  if (!assessment) return <div className="p-12 text-center text-red-500">Assessment not found!</div>;


  // -------------------------------------------------------------------------------- //
  // MODE 1: CONFIGURATION MODE (Set Max Points & Lock In)                            //
  // -------------------------------------------------------------------------------- //
  if (configuringMode) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 rounded-2xl shadow-sm text-center">
          <Unlock className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-1">Test Paper Draft</h2>
          <p className="text-sm text-amber-700 dark:text-amber-500">
            This test isn't locked yet. Review the questions and assign maximum point values to each item below. 
            When you're happy, lock it in so you can assign it to a student and print!
          </p>
        </div>

        <div className="space-y-4">
          {assessment.questions.map((q, idx) => (
             <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm flex items-center justify-between gap-6">
               <div className="flex-1">
                 <span className="font-bold text-indigo-500 mr-2">Q{idx+1}.</span>
                 <span className="text-slate-900 dark:text-slate-100 font-medium">{q.question}</span>
               </div>
               <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                 <span className="text-xs font-bold uppercase text-slate-400">Max Points</span>
                 <input 
                    type="number"
                    min="1"
                    step="1"
                    value={maxItemScores[idx] ?? ""}
                    onChange={(e) => setMaxItemScores({...maxItemScores, [idx]: e.target.value})}
                    className="w-14 text-center font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1 focus:outline-none focus:border-indigo-500"
                 />
               </div>
             </div>
          ))}
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-6 p-2 px-6 z-50">
           <div className="text-sm font-medium">
             Total Calculated Paper Value: <span className="text-xl font-bold text-amber-400 ml-2">{calculateTotalMaxPoints()} pts</span>
           </div>
           <button 
            disabled={isSaving}
            onClick={handleLockIn} 
             className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold text-sm px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
           >
             {isSaving ? "Locking..." : <><Lock className="w-4 h-4"/> Lock In Question Paper</>}
           </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------------- //
  // MODE 2: GRADING MODE RENDER (Grade Locked Paper)                                 //
  // -------------------------------------------------------------------------------- //
  if (gradingMode && !configuringMode) {
    return (
      <div className="max-w-7xl mx-auto pb-32 animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-500" /> Grading: {assessment.title}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">Reviewing student paper and inputting scores</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 border dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl">
              <UserCircle2 className="w-4 h-4 text-slate-400" />
              <select 
                value={selectedStudentId} 
                onChange={e => setSelectedStudentId(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none dark:text-white"
              >
                <option value="">-- Assign Student --</option>
                {studentsList.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
            </div>
            <button onClick={() => setGradingMode(false)} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {assessment.questions.map((q, idx) => {
            const maxPoints = Number(maxItemScores[idx]) || 0;
            const ansKey = assessment.answer_key?.[idx] || {};
            
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-sm">
                      Q{idx + 1}
                    </div>
                    <div className="pt-1">
                      <p className="text-base font-medium text-slate-900 dark:text-slate-200">{q.question}</p>
                      {q.options && (
                        <div className="mt-3 space-y-1.5 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                          {q.options.map((opt:string, i:number) => <div key={i} className="text-sm text-slate-600 dark:text-slate-400">{opt}</div>)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:w-1/2 p-6 relative flex flex-col justify-between group">
                  <div>
                    <div className="mb-4">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                      </h4>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                        {ansKey.answer || "N/A"}
                      </p>
                    </div>

                    {ansKey.rubric && (
                      <div className="mb-6">
                        <h4 className="text-xs uppercase font-bold text-amber-600 dark:text-amber-500 mb-1">Grading Rubric</h4>
                        <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20 italic">
                          {ansKey.rubric}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                     <span className="text-xs font-semibold uppercase text-slate-400">Awarded</span>
                     <div className="flex items-center bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl px-2 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                        <input 
                          type="number"
                          min="0"
                          max={maxPoints}
                          step="1"
                          value={itemScores[idx] ?? ""}
                          onChange={(e) => setItemScores({...itemScores, [idx]: e.target.value})}
                          placeholder="0"
                          className="w-14 text-center font-bold text-indigo-700 dark:text-indigo-300 bg-transparent focus:outline-none text-xl"
                        />
                        <span className="text-slate-400 font-bold px-1.5">/ {maxPoints}</span>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-6 p-2 px-6 z-50">
           <div className="text-sm">
             Total Score:  <span className="text-xl font-bold text-green-400 ml-2">{calculateTotal()}</span> <span className="text-slate-400">/ {assessment.total_points}</span>
           </div>
           <button 
            disabled={isSaving}
            onClick={handleSaveGrade} 
             className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
           >
             {isSaving ? "Saving..." : <><Save className="w-4 h-4"/> Commit Final Grade</>}
           </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------------- //
  // MODE 3: STANDARD VIEW RENDER (PRINTABLE)                                         //
  // -------------------------------------------------------------------------------- //
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-24">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 print:hidden border-b border-slate-200 dark:border-slate-800 pb-6">
        <Link href="/gradebook" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Test Papers
        </Link>
        <div className="flex gap-3">
          
          <div className="hidden sm:flex px-4 py-2 text-sm font-semibold rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 items-center gap-2 mr-2 print-hide">
             <Lock className="w-4 h-4 text-emerald-500" /> Locked & Ready
          </div>
          
          <button 
             onClick={() => setGradingMode(true)}
             className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-2 transition-transform hover:-translate-y-0.5 print-hide"
          >
             <FileCheck className="w-4 h-4" /> Start Grading
          </button>

          <button 
             onClick={() => setShowAnswers(!showAnswers)}
             className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors flex items-center gap-2 print-hide ${showAnswers ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
          >
            <CheckCircle2 className="w-4 h-4" /> 
            {showAnswers ? "Hide Reference Key" : "Quick Reference Key"}
          </button>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-800 text-white hover:bg-slate-700 shadow-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Assessment
          </button>
        </div>
      </div>

      {/* Printable Paper Area */}
      <div className="bg-white text-black p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 relative">
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif mb-2">{assessment.title}</h1>
            <div className="text-sm font-medium flex gap-4 text-slate-600">
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Source: {assessment.material?.title || 'General'}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Time: 45 Mins</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold mb-1">
              Name: {assessment.student ? `${assessment.student.first_name} ${assessment.student.last_name}` : '______________________'}
            </div>
            <div className="text-sm">Date: ________________</div>
            <div className="text-sm mt-1 font-bold">Total Marks: {assessment.total_points}</div>
          </div>
        </div>

        <div className="space-y-8">
          {assessment.questions.map((q, idx) => (
            <div key={idx} className="space-y-3 page-break-avoid">
              <div className="flex gap-4">
                <span className="font-bold text-lg select-none">{idx + 1}.</span>
                <p className="text-lg leading-relaxed font-medium">
                   {q.question} 
                   {q.points && <span className="ml-2 text-sm text-slate-400 font-normal">[{q.points} pts]</span>}
                </p>
              </div>

              <div className="pl-8">
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2 mt-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border border-slate-800" />
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {q.type === 'true_false' && (
                  <div className="flex gap-8 mt-2">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 border border-slate-800" /> True</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 border border-slate-800" /> False</div>
                  </div>
                )}

                {(q.type === 'short_answer' || q.type === 'fill_in_blank') && (
                  <div className="mt-8 border-b border-dotted border-slate-400 w-full h-8" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Answer Key */}
        {showAnswers && assessment.answer_key && (
          <div className="mt-16 pt-8 border-t-2 border-dashed border-red-200 bg-red-50/50 p-6 rounded-2xl print:break-before-page">
            <h2 className="text-xl font-bold text-red-700 flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5" /> Quick Reference Key
            </h2>
            <div className="space-y-4">
              {assessment.answer_key.map((ans, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-white rounded-xl border border-red-100 shadow-sm">
                  <span className="font-bold text-red-700">{idx + 1}.</span>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">{ans.question}</div>
                    <div className="font-medium text-slate-900">{ans.answer}</div>
                    {ans.rubric && <div className="text-xs text-amber-700 mt-2 italic bg-amber-50 p-2 rounded">Rubric: {ans.rubric}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
