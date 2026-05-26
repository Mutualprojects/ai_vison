"use client";

import { useState, useEffect } from "react";
import { Link, CheckCircle, Copy, FileSpreadsheet, Building2, Loader2, Zap, Lock } from "lucide-react";

export default function AdminPage() {
  const [companyName, setCompanyName] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ publicUrl: string; slug: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAutoCreating, setIsAutoCreating] = useState(false);

  useEffect(() => {
    fetch('/api/auth/google/check')
      .then(res => res.json())
      .then(data => setIsAuthenticated(data.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleAutoCreateSheet = async () => {
    if (!companyName) {
      setError("Please enter a Company or Project Name first.");
      return;
    }
    setIsAutoCreating(true);
    setError("");
    try {
      const response = await fetch('/api/admin/create-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to auto-create sheet");
      
      setSheetId(data.sheetId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAutoCreating(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, sheetId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to register admin.");
      
      setResult({ publicUrl: data.publicUrl, slug: data.slug });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(`${window.location.origin}${result.publicUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-[#1b4965] font-sans">
      <div className="max-w-xl w-full">
        
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#1b4965] to-[#5fa8d3] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1b4965]/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1b4965]">LeadScanner Admin</h1>
        </div>

        <div className="bg-white rounded-3xl border border-[#bee9e8] shadow-2xl shadow-[#cae9ff]/50 p-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5fa8d3] to-[#62b6cb]" />
          
          <h2 className="text-xl font-bold mb-2">Create your Public Scanner</h2>
          <p className="text-[#1b4965]/70 text-sm mb-8">
            Connect your Google Account so your public scanner can write leads directly to your personal Google Sheets. No manual sharing required!
          </p>

          <div className="mb-8">
            {isAuthenticated === null ? (
              <div className="w-full h-12 flex items-center justify-center text-[#62b6cb]">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : isAuthenticated ? (
              <div className="w-full h-12 bg-[#bee9e8]/30 border-2 border-[#62b6cb]/50 text-[#1b4965] rounded-xl font-bold shadow-sm flex items-center justify-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#62b6cb]" />
                Step 1: Google Account Connected
              </div>
            ) : (
              <a 
                href="/api/auth/google" 
                className="w-full h-12 bg-white border-2 border-[#bee9e8] text-[#1b4965] hover:bg-[#cae9ff]/30 rounded-xl font-bold shadow-sm flex items-center justify-center gap-3 transition-all"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Step 1: Connect Google Account
              </a>
            )}
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#5fa8d3]" /> Step 2: Company or Project Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full h-12 px-4 rounded-xl border border-[#bee9e8] bg-[#cae9ff]/20 focus:bg-white focus:ring-2 focus:ring-[#62b6cb] focus:border-transparent outline-none transition-all text-[#1b4965] font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#5fa8d3]" /> Step 3: Target Google Sheet ID
              </label>
              <input
                type="text"
                required
                value={sheetId}
                onChange={e => setSheetId(e.target.value)}
                placeholder="e.g. 1BxiMVs0XRYFgwnTE..."
                className="w-full h-12 px-4 rounded-xl border border-[#bee9e8] bg-[#cae9ff]/20 focus:bg-white focus:ring-2 focus:ring-[#62b6cb] focus:border-transparent outline-none transition-all text-[#1b4965] font-mono text-sm"
              />

              <div className="flex items-center gap-4 mt-3">
                <div className="h-px bg-[#bee9e8] flex-1" />
                <span className="text-xs font-bold text-[#62b6cb] uppercase tracking-wider">OR</span>
                <div className="h-px bg-[#bee9e8] flex-1" />
              </div>

              <button
                type="button"
                onClick={handleAutoCreateSheet}
                disabled={isAutoCreating || !isAuthenticated || !companyName}
                className="mt-3 w-full h-10 bg-[#cae9ff]/30 hover:bg-[#bee9e8] text-[#1b4965] border border-[#bee9e8] rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAutoCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : '✨ Auto-Create a new Google Sheet'}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isAuthenticated}
              className="w-full h-12 bg-gradient-to-r from-[#1b4965] to-[#5fa8d3] text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isAuthenticated ? (
                <><Lock className="w-4 h-4" /> Connect Google to Unlock</>
              ) : loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
              ) : (
                'Generate Scanner Link'
              )}
            </button>
          </form>

          {result && (
            <div className="mt-8 p-6 bg-[#cae9ff]/20 border border-[#bee9e8] rounded-2xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-3 text-[#5fa8d3] font-bold">
                <CheckCircle className="w-5 h-5" /> Successfully Configured!
              </div>
              <p className="text-sm text-[#1b4965]/80 mb-2 font-medium">Your public scanner is live at:</p>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 h-12 bg-white border border-[#bee9e8] rounded-xl flex items-center px-4 font-mono text-sm text-[#1b4965] truncate">
                  {typeof window !== 'undefined' ? window.location.origin : ''}{result.publicUrl}
                </div>
                <button 
                  onClick={handleCopy}
                  className="h-12 w-12 bg-white border border-[#bee9e8] rounded-xl flex items-center justify-center hover:bg-[#bee9e8]/50 transition-colors text-[#1b4965] shadow-sm"
                >
                  {copied ? <CheckCircle className="w-5 h-5 text-[#5fa8d3]" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              
              <a 
                href={result.publicUrl} 
                target="_blank"
                rel="noreferrer"
                className="mt-4 block text-center text-sm font-bold text-[#1b4965] hover:text-[#5fa8d3] underline underline-offset-4"
              >
                Open Public Scanner
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
