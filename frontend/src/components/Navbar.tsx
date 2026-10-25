import React from "react";
import { SlothMascot } from "./SlothMascot";
import type { ModelStatus } from "../api";
import { ShieldCheck, Cpu, History, HelpCircle, RefreshCw } from "lucide-react";


interface NavbarProps {
  modelStatus: ModelStatus | null;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onOpenSetupGuide: () => void;
  onOpenHistory: () => void;
  onRefreshModelStatus: () => void;
  isCheckingModel: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  modelStatus,
  selectedModel,
  onSelectModel,
  onOpenSetupGuide,
  onOpenHistory,
  onRefreshModelStatus,
  isCheckingModel,
}) => {
  const isOnline = modelStatus?.available && (modelStatus?.models?.length || 0) > 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fbf8f3]/90 backdrop-blur-md border-b border-[#e8dac3] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <SlothMascot size={52} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-[#4d3626]">
                SlothFlow
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e8dac3] text-[#704f35]">
                v1.0
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e4ebe4] text-[#3c553f] border border-[#ccd9cd]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4a6b4e]" />
                100% Local Privacy
              </span>
            </div>
            <p className="text-xs text-[#8c6843] font-medium hidden sm:block">
              Stop organizing. Start relaxing.
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Model status pill & selector */}
          <div className="flex items-center gap-2 bg-[#f4ede2] border border-[#e8dac3] rounded-xl px-3 py-1.5 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isOnline ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </span>

            {isOnline ? (
              <div className="flex items-center gap-1.5 text-xs text-[#5c402c] font-medium">
                <Cpu className="w-3.5 h-3.5 text-[#4a6b4e]" />
                <select
                  value={selectedModel}
                  onChange={(e) => onSelectModel(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-[#4d3626] focus:outline-none cursor-pointer"
                  title="Choose local open-weight model"
                >
                  {modelStatus?.models?.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <button
                onClick={onOpenSetupGuide}
                className="text-xs font-medium text-amber-900 hover:underline flex items-center gap-1"
                title="Click to view Ollama setup guide"
              >
                <span>Ollama Offline</span>
                <HelpCircle className="w-3 h-3 text-amber-700" />
              </button>
            )}

            <button
              onClick={onRefreshModelStatus}
              disabled={isCheckingModel}
              title="Refresh Ollama connection"
              className="text-[#8c6843] hover:text-[#4d3626] transition-colors p-0.5 rounded"
            >
              <RefreshCw className={`w-3 h-3 ${isCheckingModel ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Audit History Button */}
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d7c09e] text-xs font-medium text-[#704f35] bg-white hover:bg-[#f4ede2] transition-colors shadow-sm"
          >
            <History className="w-3.5 h-3.5 text-[#8c6843]" />
            <span className="hidden sm:inline">Audit Log</span>
          </button>

          {/* Setup Guide Button */}
          <button
            onClick={onOpenSetupGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d7c09e] text-xs font-medium text-[#704f35] bg-white hover:bg-[#f4ede2] transition-colors shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#8c6843]" />
            <span className="hidden sm:inline">Setup Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
