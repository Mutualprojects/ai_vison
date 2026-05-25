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
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-purple-950 font-sans">
      <div className="max-w-xl w-full">
        
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">LeadScanner Admin</h1>
        </div>

        <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl shadow-purple-900/5 p-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
          
          <h2 className="text-xl font-bold mb-2">Create your Public Scanner</h2>
          <p className="text-purple-600/70 text-sm mb-8">
            Connect your Google Account so your public scanner can write leads directly to your personal Google Sheets. No manual sharing required!
          </p>

          <div className="mb-8">
            {isAuthenticated === null ? (
              <div className="w-full h-12 flex items-center justify-center text-purple-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : isAuthenticated ? (
              <div className="w-full h-12 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-xl font-bold shadow-sm flex items-center justify-center gap-3">
                <CheckCircle className="w-5 h-5" />
                Step 1: Google Account Connected
              </div>
            ) : (
              <a 
                href="/api/auth/google" 
                className="w-full h-12 bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl font-bold shadow-sm flex items-center justify-center gap-3 transition-all"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Step 1: Connect Google Account
              </a>
            )}
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" /> Step 2: Company or Project Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full h-12 px-4 rounded-xl border border-purple-200 bg-purple-50/50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-purple-950 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Step 3: Target Google Sheet ID
              </label>
              <input
                type="text"
                required
                value={sheetId}
                onChange={e => setSheetId(e.target.value)}
                placeholder="e.g. 1BxiMVs0XRYFgwnTE..."
                className="w-full h-12 px-4 rounded-xl border border-purple-200 bg-purple-50/50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-purple-950 font-mono text-sm"
              />

              <div className="flex items-center gap-4 mt-3">
                <div className="h-px bg-purple-100 flex-1" />
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">OR</span>
                <div className="h-px bg-purple-100 flex-1" />
              </div>

              <button
                type="button"
                onClick={handleAutoCreateSheet}
                disabled={isAutoCreating || !isAuthenticated || !companyName}
                className="mt-3 w-full h-10 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 font-bold">
                <CheckCircle className="w-5 h-5" /> Successfully Configured!
              </div>
              <p className="text-sm text-purple-700 mb-2 font-medium">Your public scanner is live at:</p>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 h-12 bg-white border border-purple-200 rounded-xl flex items-center px-4 font-mono text-sm text-purple-900 truncate">
                  {typeof window !== 'undefined' ? window.location.origin : ''}{result.publicUrl}
                </div>
                <button 
                  onClick={handleCopy}
                  className="h-12 w-12 bg-white border border-purple-200 rounded-xl flex items-center justify-center hover:bg-purple-100 transition-colors text-purple-600 shadow-sm"
                >
                  {copied ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              
              <a 
                href={result.publicUrl} 
                target="_blank"
                rel="noreferrer"
                className="mt-4 block text-center text-sm font-bold text-purple-600 hover:text-fuchsia-600 underline underline-offset-4"
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
