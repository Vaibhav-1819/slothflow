import React from "react";
import type { ModelStatus } from "../api";
import { AlertCircle, CheckCircle2, Sparkles, Terminal, ArrowRight, RefreshCw } from "lucide-react";

interface ModelStatusBannerProps {
  modelStatus: ModelStatus | null;
  useHeuristicFallback: boolean;
  onToggleHeuristic: () => void;
  onOpenSetupGuide: () => void;
  onRefresh: () => void;
}

export const ModelStatusBanner: React.FC<ModelStatusBannerProps> = ({
  modelStatus,
  useHeuristicFallback,
  onToggleHeuristic,
  onOpenSetupGuide,
  onRefresh,
}) => {
  const isOnline = modelStatus?.available && (modelStatus?.models?.length || 0) > 0;

  if (isOnline) {
    return (
      <div className="bg-[#e4ebe4]/80 border border-[#ccd9cd] text-[#2b392e] rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-[#2b392e]">Ollama Local Engine Connected:</span>{" "}
            <span className="text-[#3c553f]">
              Ready with open-weight model ({modelStatus?.default_model || modelStatus?.models[0]}). All documents processed on device.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
            Zero Cloud Leakage
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <span>Local AI Engine (Ollama) Unavailable</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-amber-200/80 text-amber-800">
                localhost:11434
              </span>
            </h4>
            <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
              SlothFlow runs open-weight models (Qwen, Gemma, Llama) entirely on your machine.
              Start Ollama in your terminal or install it to enable full open-weight inference.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-amber-900 text-xs transition-colors"
            title="Refresh Ollama status"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
          </button>

          <button
            onClick={onOpenSetupGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Setup Instructions</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </button>

          <button
            onClick={onToggleHeuristic}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              useHeuristicFallback
                ? "bg-amber-200/80 border-amber-400 text-amber-900 font-semibold shadow-xs"
                : "bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
            }`}
            title="Enables local content heuristic fallback while model is downloading"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Fallback Heuristic: {useHeuristicFallback ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
