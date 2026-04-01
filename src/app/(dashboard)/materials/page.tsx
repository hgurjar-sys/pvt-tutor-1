"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FileText, Loader2, UploadCloud, File as FileIcon } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

interface Material {
  id: string;
  title: string;
  file_path: string;
  subject: string;
  created_at: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [uploading, setUploading] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: "", subject: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchMaterials = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setMaterials(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a file to upload");
    
    // Check if file is larger than 50MB limit
    if (selectedFile.size > 50 * 1024 * 1024) {
      return alert("File is larger than 50MB! Since you are on the Supabase Free Tier, please compress the PDF first. (You can use a free tool like ilovepdf.com/compress_pdf)");
    }
    
    setUploading(true);

    try {
      // 1. Upload to Supabase Storage (Bucket: 'materials')
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      // 3. Save to database
      const { data: dbData, error: dbError } = await supabase
        .from("materials")
        .insert([{
          title: newMaterial.title,
          subject: newMaterial.subject,
          file_path: publicUrl
        }])
        .select();

      if (dbError) throw dbError;

      if (dbData) setMaterials([dbData[0], ...materials]);
      setShowAddModal(false);
      setNewMaterial({ title: "", subject: "" });
      setSelectedFile(null);
    } catch (error: any) {
      alert("Error: " + error.message + " (Did you create the 'materials' storage bucket and make it public?)");
    } finally {
      setUploading(false);
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Teaching Materials</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Upload English textbook PDFs for AI processing</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Upload PDF
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Uploaded At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                    Loading materials...
                  </td>
                </tr>
              ) : filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    No materials found. Upload a textbook PDF to begin!
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <a href={material.file_path} target="_blank" rel="noreferrer" className="font-medium text-slate-900 dark:text-slate-200 hover:text-indigo-500 transition-colors">
                          {material.title}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                        {material.subject || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(material.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Material</h2>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Material Title</label>
                <input required type="text" placeholder="e.g. Science Chapter 4" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject / Category</label>
                <input required type="text" placeholder="e.g. Science (English Medium)" value={newMaterial.subject} onChange={e => setNewMaterial({...newMaterial, subject: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
              </div>

              <div className="pt-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Upload PDF File</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors relative">
                  <input required type="file" accept=".pdf" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                    {selectedFile ? selectedFile.name : "Click or drag PDF here"}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">PDF format (max 100MB)</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 rounded-lg transition-colors">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : "Upload File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
