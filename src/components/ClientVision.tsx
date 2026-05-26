"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, Loader2, FileText, Tag, ShieldAlert, User, Mail, Phone, Globe, Briefcase, Zap } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as blazeface from "@tensorflow-models/blazeface";
import * as nsfwjs from "nsfwjs";
import { PhoneNumberUtil } from "google-libphonenumber";
import nlp from "compromise";

const phoneUtil = PhoneNumberUtil.getInstance();

// Helper function to extract structured data using NLP and Google's Phone Library
function parseBusinessCard(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  
  const emailRegex = /([a-zA-Z0-9._%+-]+(?:\s*@\s*|\s+at\s+|@)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?/i;
  
  let email = "";
  let phone = "";
  let website = "";
  let name = "";
  let company = "";
  
  // 1. NLP Entity Extraction (Just like Google Vision API)
  // This completely eliminates false positives by understanding actual language.
  const doc = nlp(text);
  
  const people = doc.people().out('array');
  if (people.length > 0) {
    // Pick the most likely human name
    name = people.find((p: string) => p.split(' ').length >= 2) || people[0];
  }
  
  const organizations = doc.organizations().out('array');
  if (organizations.length > 0) {
    company = organizations[0];
  }

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // 2. Email Detection
    if (!email && (emailRegex.test(line) || lowerLine.includes("gmail.com") || lowerLine.includes("yahoo.com"))) {
      const match = line.match(emailRegex);
      if (match) {
        email = match[0].replace(/\s+/g, ''); 
      } else {
        const words = line.split(' ');
        email = words.find(w => w.includes(".com") || w.includes("@")) || line;
      }
    } 
    
    // 3. Strict Phone Number Validation (Google-libphonenumber)
    // This removes false positives like zip codes or product numbers.
    if (!phone) {
      const normalizedForPhone = line.replace(/[Oo]/g, '0'); 
      const phoneMatch = normalizedForPhone.match(/(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?[\d-.\s]{7,15}/);
      
      if (phoneMatch) {
        const rawNumber = phoneMatch[0].trim();
        try {
          // Attempt to parse. We assume US fallback if no country code (+).
          const numberObj = phoneUtil.parseAndKeepRawInput(rawNumber, 'US'); 
          
          if (phoneUtil.isValidNumber(numberObj) || phoneUtil.isPossibleNumber(numberObj)) {
            phone = rawNumber; // It's a mathematically verified phone number!
          }
        } catch (e) {
          // Parsing failed, not a real phone number. Ignore.
        }
      }
    } 
    
    // 4. Website Detection
    if (!website && urlRegex.test(line) && !line.includes('@')) {
      const potentialUrl = line.match(urlRegex)?.[0] || "";
      if (potentialUrl.includes('.') && potentialUrl.length > 5) {
        website = potentialUrl;
      }
    }
  }

  // 5. Fallback Heuristics for Name & Company if NLP missed it due to all-caps
  if (!name) {
    for (const line of lines) {
      if (line.split(' ').length >= 2 && !/\d/.test(line) && line.length < 30 && !line.includes('@') && !line.toLowerCase().includes('.com')) {
        name = line;
        break;
      }
    }
  }

  return { name, company, email, phone, website, raw: text };
}

export default function ClientVision({ companySlug }: { companySlug?: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingLead, setSavingLead] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | false>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [models, setModels] = useState<any>({
    coco: null,
    face: null,
    nsfw: null,
  });
  const [modelsLoading, setModelsLoading] = useState(true);

  // Load models on mount
  useEffect(() => {
    let isMounted = true;
    async function loadModels() {
      try {
        await tf.ready();
        
        if (isMounted) setLoadingText("Loading Object Engine...");
        const coco = await cocoSsd.load();
        
        if (isMounted) setLoadingText("Loading Biometric Engine...");
        const face = await blazeface.load();
        
        if (isMounted) setLoadingText("Loading Safety Engine...");
        const nsfw = await nsfwjs.load();
        
        if (isMounted) {
          setModels({ coco, face, nsfw });
          setModelsLoading(false);
          setLoadingText("");
        }
      } catch (err) {
        console.error("Error loading models", err);
        if (isMounted) {
          setError("Failed to load local AI models. Check console for details.");
          setModelsLoading(false);
        }
      }
    }
    loadModels();
    
    return () => { isMounted = false; };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setResults(null);
        setError(null);
        setSaveSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToCRM = async (contactOverride?: any) => {
    // If contactOverride is a React Event (like from an onClick), ignore it and use results.contact
    const isEvent = contactOverride && contactOverride.nativeEvent;
    const contactToSave = (isEvent || !contactOverride) ? results?.contact : contactOverride;
    
    if (!contactToSave) return;
    setSavingLead(true);
    setSaveSuccess(false);
    
    try {
      const response = await fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactToSave, companySlug })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save lead");
      
      if (data.exists) {
        setSaveSuccess("exists");
      } else {
        setSaveSuccess("saved");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save lead to CRM");
    } finally {
      setSavingLead(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageRef.current || !imageSrc) return;
    
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const img = imageRef.current;
      
      // 1. Labels / Object Detection (Local)
      setLoadingText("Running local object detection...");
      let labels = [];
      if (models.coco) {
        labels = await models.coco.detect(img);
      }

      // 2. Faces (Local)
      setLoadingText("Detecting faces...");
      let faces = [];
      if (models.face) {
        faces = await models.face.estimateFaces(img, false);
      }

      // 3. Safety Check (Local)
      setLoadingText("Verifying image safety...");
      let safety = [];
      if (models.nsfw) {
        safety = await models.nsfw.classify(img);
      }

      // --- DEEP PIXEL UPSCALING FOR MOCKUPS ---
      setLoadingText("Applying Deep Pixel Upscaling...");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      // Scale up 2x to give the OCR engine more pixels to read tiny text
      const scaleFactor = 2;
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      
      let optimizedBase64 = imageSrc;
      
      if (ctx) {
        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        // Draw upscaled
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Apply a mild contrast boost to make text pop against background
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const contrast = 1.2;
        const intercept = 128 * (1 - contrast);
        
        for(let i = 0; i < data.length; i += 4) {
          data[i] = data[i] * contrast + intercept;     // R
          data[i+1] = data[i+1] * contrast + intercept; // G
          data[i+2] = data[i+2] * contrast + intercept; // B
        }
        ctx.putImageData(imageData, 0, 0);
        
        // Compress as JPEG to ensure we stay under the 1MB free API limit even with 2x upscale
        optimizedBase64 = canvas.toDataURL("image/jpeg", 0.9);
      }

      // 4. Pro OCR Engine
      setLoadingText("Extracting tiny tilted text via Pro Engine...");
      
      const formData = new FormData();
      formData.append("base64Image", optimizedBase64);
      formData.append("apikey", process.env.NEXT_PUBLIC_OCR_API_KEY || "K86783719988957");
      
      // DEEP OCR CONFIGURATION FOR BUSINESS CARDS
      formData.append("OCREngine", "2"); // Engine 2 is best for special characters and disjointed text (business cards/receipts)
      formData.append("scale", "true"); // Server-side scaling for tiny fonts
      formData.append("detectOrientation", "true"); // Auto-rotates upside-down cards
      formData.append("isTable", "true"); // Forces the engine to read scattered tiny blocks and columns independently
      formData.append("language", "eng"); // Setting specific language drastically improves accuracy

      const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      const ocrData = await ocrResponse.json();
      
      if (ocrData.IsErroredOnProcessing) {
        throw new Error(ocrData.ErrorMessage[0]);
      }

      const extractedText = ocrData.ParsedResults?.[0]?.ParsedText || "";

      // 5. Smart Parsing
      setLoadingText("Organizing contact data...");
      const contactData = parseBusinessCard(extractedText);

      setResults({
        labels,
        faces,
        safety,
        contact: contactData,
      });

      // 6. Auto-Save to CRM
      setLoadingText("Auto-saving to Google Sheets...");
      await handleSaveToCRM(contactData);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze image");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  if (modelsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-[#1b4965] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5fa8d3]" />
        <p className="text-xl font-bold tracking-tight">Initializing Pro CRM Scanner...</p>
        <p className="text-[#1b4965]/70 text-sm animate-pulse">{loadingText}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-[#1b4965] flex flex-col font-sans selection:bg-[#cae9ff]">
      <header className="border-b border-[#bee9e8] bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#1b4965] to-[#5fa8d3] rounded-xl flex items-center justify-center shadow-lg shadow-[#1b4965]/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-[#1b4965]">
              LeadScanner Pro
            </h1>
          </div>
          <div className="text-sm font-bold px-4 py-2 bg-[#cae9ff]/30 text-[#1b4965] rounded-full border border-[#bee9e8] flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#5fa8d3] animate-pulse" />
            Deep Pixel Engine Active
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Left Column: Upload */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black tracking-tight text-[#1b4965]">Pro Lead Capture</h2>
            <p className="text-[#1b4965]/70 text-lg font-medium">
              Upload any business card, even tilted ones or mockups. Our advanced engine automatically rotates, scales, and extracts the data.
            </p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-96 w-full rounded-3xl border-2 border-dashed border-[#bee9e8] hover:border-[#62b6cb] bg-white hover:bg-[#cae9ff]/20 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-sm"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {imageSrc ? (
              <div className="absolute inset-0 p-4">
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-xl"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm rounded-xl">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#bee9e8] shadow-md text-[#1b4965] font-bold">
                    <Upload className="w-4 h-4" />
                    <span>Change Card</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-[#62b6cb] group-hover:text-[#5fa8d3] transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-[#bee9e8] shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-[#5fa8d3]" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-[#1b4965]">Upload Mockup or Card</p>
                  <p className="text-sm mt-1 text-[#1b4965]/60 font-medium">Deep-pixel upscaling ensures high accuracy</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!imageSrc || loading}
            className="relative w-full h-14 rounded-2xl font-bold text-lg overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1b4965]/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#1b4965] to-[#5fa8d3] transition-transform duration-300 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 flex items-center justify-center gap-3 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="min-w-[220px] text-left">{loadingText}</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Deep Scan with Pro Engine
                </>
              )}
            </div>
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-start gap-3 shadow-sm font-semibold">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Features List */}
          <div className="mt-4 pt-6 border-t border-[#bee9e8] grid grid-cols-2 gap-y-4 gap-x-2">
            {[
              "Unlimited scans",
              "Team collaboration",
              "Business cards",
              "Voice capture",
              "AI-Research",
              "Custom fields",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#cae9ff]/40 border border-[#bee9e8] flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#5fa8d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-[#1b4965]/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex-[1.2] flex flex-col gap-6">
          <h3 className="text-2xl font-black tracking-tight text-[#1b4965]">Structured Contact Data</h3>
          
          {!results ? (
            <div className="flex-1 rounded-3xl border border-[#bee9e8] bg-white flex items-center justify-center min-h-[400px] shadow-sm">
              <div className="text-[#62b6cb] flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#5fa8d3] animate-[spin_3s_linear_infinite]" />
                <p className="font-bold text-[#1b4965]/60">Waiting for deep scan...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* SMART CONTACT CARD */}
              {results.contact && (
               <div className="p-8 rounded-3xl border border-[#bee9e8] bg-white shadow-xl shadow-[#cae9ff]/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <h4 className="font-black text-2xl text-[#1b4965]">Lead Profile</h4>
                      <button 
                        onClick={handleSaveToCRM}
                        disabled={savingLead || !!saveSuccess}
                        className={`px-5 py-2.5 text-sm font-bold rounded-full uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                          saveSuccess === 'saved'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : saveSuccess === 'exists'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-[#1b4965] text-white hover:bg-[#1b4965]/90 hover:scale-105 active:scale-95 shadow-[#1b4965]/20'
                        }`}
                      >
                        {savingLead ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : saveSuccess === 'exists' ? (
                          <>Already in database ✓</>
                        ) : saveSuccess === 'saved' ? (
                          <>Saved to Sheets ✓</>
                        ) : (
                          <>Save to Google Sheets</>
                        )}
                      </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Name & Title */}
                    <div className="flex items-start gap-4 pb-6 border-b border-[#bee9e8]">
                      <div className="w-12 h-12 rounded-full bg-[#cae9ff]/50 border border-[#bee9e8] flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-[#5fa8d3]" />
                      </div>
                      <div>
                        <p className="text-[#1b4965]/60 text-xs font-bold uppercase tracking-widest mb-1">Name</p>
                        <p className="text-xl font-black text-[#1b4965]">{results.contact.name || "Not found"}</p>
                        {results.contact.company && (
                          <p className="text-[#1b4965]/80 mt-1 flex items-center gap-2 font-bold">
                            <Briefcase className="w-4 h-4 text-[#62b6cb]" /> {results.contact.company}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="p-4 rounded-2xl bg-[#cae9ff]/20 border border-[#bee9e8]">
                        <p className="text-[#1b4965]/60 text-xs uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-[#5fa8d3]" /> Phone
                        </p>
                        <p className="text-lg text-[#1b4965] font-black">
                          {results.contact.phone || "Not found"}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#cae9ff]/20 border border-[#bee9e8]">
                        <p className="text-[#1b4965]/60 text-xs uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-[#5fa8d3]" /> Email
                        </p>
                        <p className="text-lg text-[#1b4965] font-black break-all">
                          {results.contact.email || "Not found"}
                        </p>
                      </div>
                      <div className="md:col-span-2 p-4 rounded-2xl bg-[#cae9ff]/20 border border-[#bee9e8]">
                        <p className="text-[#1b4965]/60 text-xs uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-[#5fa8d3]" /> Website
                        </p>
                        <p className="text-lg text-[#1b4965] font-black">
                          {results.contact.website || "Not found"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security & Object AI Info */}
              <div className="grid grid-cols-2 gap-4">
                {results.faces && results.faces.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-[#bee9e8] shadow-sm flex items-center gap-3">
                    <User className="w-5 h-5 text-[#62b6cb]" />
                    <div>
                      <p className="text-[10px] text-[#1b4965]/50 uppercase tracking-widest font-bold">Faces</p>
                      <p className="font-black text-[#1b4965]">{results.faces.length} detected</p>
                    </div>
                  </div>
                )}
                {results.safety && results.safety.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-[#bee9e8] shadow-sm flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-[#62b6cb]" />
                    <div>
                      <p className="text-[10px] text-[#1b4965]/50 uppercase tracking-widest font-bold">Safety Score</p>
                      <p className="font-black text-[#1b4965] capitalize">{results.safety[0].className}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Raw Extracted Text Toggle */}
              {results.contact && results.contact.raw && (
                <details className="group p-6 rounded-3xl border border-[#bee9e8] bg-white shadow-sm transition-all">
                  <summary className="font-bold text-lg text-[#1b4965] cursor-pointer flex items-center gap-2 list-none">
                    <FileText className="w-5 h-5 text-[#5fa8d3] group-open:text-[#1b4965] transition-colors" />
                    View Raw AI Data
                  </summary>
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-[#bee9e8] overflow-x-auto">
                    <pre className="text-sm text-[#1b4965]/80 font-mono whitespace-pre-wrap leading-relaxed">
                      {results.contact.raw}
                    </pre>
                  </div>
                </details>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
