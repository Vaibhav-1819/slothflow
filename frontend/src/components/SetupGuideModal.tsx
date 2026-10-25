import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  X,
  ShieldCheck,
  ExternalLink,
  Cpu,
} from "lucide-react";


interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  isChecking: boolean;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  isChecking,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: "1. Install Ollama",
      desc: "Install Ollama via Windows Package Manager (Winget) or download the installer from ollama.com.",
      code: "winget install Ollama.Ollama",
      url: "https://ollama.com/download",
      urlLabel: "ollama.com",
    },
    {
      title: "2. Pull Recommended Open-Weight Model",
      desc: "Download Qwen 2.5 (1.5B) or Gemma 2 (2B) — fast, high accuracy, and lightweight.",
      code: "ollama run qwen2.5:1.5b",
    },
    {
      title: "3. Alternative Ultra-Fast Model",
      desc: "For low-RAM machines, Meta Llama 3.2 (1B) operates with minimal overhead.",
      code: "ollama run llama3.2:1b",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#e8dac3] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#fbf8f3] p-6 border-b border-[#e8dac3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#4d3626]">
                Local AI Setup Instructions
              </h3>
              <p className="text-xs text-[#704f35]">
                Run open-weight AI completely on your laptop without cloud APIs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#704f35] hover:text-[#4d3626] hover:bg-[#f4ede2] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Privacy Box */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Why Open-Source Local AI?</span>
              <p className="mt-1 text-emerald-800 leading-relaxed">
                SlothFlow will never upload your documents, bank statements, or private notes to
                third-party cloud servers. By running an open-weight model through Ollama, all file
                analysis occurs entirely in your machine's memory.
              </p>
            </div>
          </div>

          {/* Steps */}
          {steps.map((s, idx) => (
            <div key={idx} className="bg-[#fbf8f3] border border-[#e8dac3] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-sm font-bold text-[#4d3626]">{s.title}</h4>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8c6843] hover:underline"
                  >
                    <span>{s.urlLabel}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-[#704f35] mb-2">{s.desc}</p>
              <div className="flex items-center justify-between bg-[#2b392e] text-emerald-300 font-mono text-xs px-3.5 py-2.5 rounded-xl">
                <span className="truncate">{s.code}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(s.code, idx)}
                  className="ml-2 p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors shrink-0"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Models comparison table */}
          <div className="border border-[#e8dac3] rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#704f35] mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#a78255]" />
              Recommended Open-Weight Models
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#fbf8f3] border border-[#e8dac3]">
                <div className="font-bold text-[#4d3626]">qwen2.5:1.5b</div>
                <div className="text-[11px] text-[#704f35]">Alibaba • 0.9 GB • Ultra-fast structured JSON</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#fbf8f3] border border-[#e8dac3]">
                <div className="font-bold text-[#4d3626]">gemma2:2b</div>
                <div className="text-[11px] text-[#704f35]">Google • 1.6 GB • High reasoning quality</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#fbf8f3] p-4 border-t border-[#e8dac3] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isChecking}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#d7c09e] text-xs font-bold text-[#5c402c] hover:bg-[#e8dac3] transition-colors"
          >
            <span>{isChecking ? "Checking..." : "Recheck Ollama Connection"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#5c402c] hover:bg-[#4d3626] text-white text-xs font-bold transition-all shadow-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
