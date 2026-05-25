"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

const ClientVision = dynamic(() => import('@/components/ClientVision'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-neutral-400">Loading AI Engine...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <ClientVision />;
}
