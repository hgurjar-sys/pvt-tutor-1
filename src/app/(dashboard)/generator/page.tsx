"use client";

import { useEffect, useState } from "react";
import { Sparkles, FileText, CheckCircle2, Loader2, BookOpen, User } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Material {
  id: string;
  title: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

const QUESTION_TYPES = [
  { id: "multiple_choice", label: "Multiple Choice Questions" },
  { id: "fill_in_blank", label: "Fill in the Blanks" },
  { id: "short_answer", label: "Short Answer Questions" },
  { id: "true_false", label: "True / False" },
  { id: "match_following", label: "Match the Following" }
];

export default function GeneratorPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("materials").select("id, title").order("created_at", { ascending: false })
      .then(({ data }) => setMaterials(data || []));
      
    supabase.from("students").select("id, first_name, last_name").order("created_at", { ascending: false })
      .then(({ data }) => setStudents(data || []));
  }, []);

  const handleToggleType = (id: string) => {
    if (selectedTypes.includes(id)) {
      setSelectedTypes(selectedTypes.filter(t => t !== id));
    } else {
      setSelectedTypes([...selectedTypes, id]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedMaterial) return setError("Please select a study material PDF.");
    if (!assessmentTitle) return setError("Please enter an assessment title.");

    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: selectedMaterial,
          assessmentTitle,
          instructions,
          questionTypes: selectedTypes
        })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Generation failed.");

      // Success
      router.push(`/test-papers`);
      
    } catch (err: any) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          AI Assessment Generator <Sparkles className="w-6 h-6 text-indigo-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Select an uploaded textbook, configure your preferences, and let AI generate a customized test for your Gujarati-medium student.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden relative">
        
        {/* Decorative Header */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <form onSubmit={handleGenerate} className="p-8 space-y-8">
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">
                  Assessment Title
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Science Chapter 4 Mid-Term Quiz"
                  value={assessmentTitle}
                  onChange={e => setAssessmentTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-slate-900 dark:text-white" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" /> Source Material (PDF)
                </label>
                <select 
                  value={selectedMaterial}
                  onChange={e => setSelectedMaterial(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="">-- Select an uploaded PDF --</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">
                  Question Types
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUESTION_TYPES.map(type => {
                    const isSelected = selectedTypes.includes(type.id);
                    return (
                      <div 
                        key={type.id}
                        onClick={() => handleToggleType(type.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 dark:border-indigo-400 shadow-sm"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "bg-indigo-500 border-indigo-500" : "border-slate-300 dark:border-slate-600"}`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`text-sm ${isSelected ? "font-medium text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"}`}>
                          {type.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">
                  Custom AI Instructions
                </label>
                <textarea 
                  rows={4}
                  placeholder="E.g., Focus specifically on vocabulary words. Generate 5 questions minimum. Add Gujarati hints for grammar rules."
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none text-sm" 
                />
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="submit"
              disabled={isGenerating}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:shadow-none transition-all duration-200 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extracting PDF & Generating Magic... (this takes ~30 seconds)
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Assessment
                  </>
                )}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
