import React from "react";
import type { ApplyResponse, UndoResponse } from "../api";
import { SlothMascot } from "./SlothMascot";
import { CheckCircle2, RotateCcw, X } from "lucide-react";


interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ApplyResponse | null;
  onUndo: (sessionId: string) => void;
  isUndoing: boolean;
  undoResult: UndoResponse | null;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  result,
  onUndo,
  isUndoing,
  undoResult,
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#e8dac3] shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#f4ede2] via-[#e8dac3] to-[#f4ede2] p-6 border-b border-[#d7c09e] relative flex items-center gap-4">
          <SlothMascot size={72} />
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Organization Complete
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#4d3626] mt-1 tracking-tight">
              All Done! Time to Relax.
            </h3>
            <p className="text-xs text-[#704f35]">
              Your disorganized documents have been sorted into clean category folders.
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#704f35] hover:text-[#4d3626] hover:bg-white/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[#fbf8f3] border border-[#e8dac3] rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-700">
                {result.organized_count}
              </div>
              <div className="text-xs font-semibold text-[#704f35] mt-0.5">
                Files Organized
              </div>
            </div>
            <div className="bg-[#fbf8f3] border border-[#e8dac3] rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-[#5c402c]">
                {result.skipped_count}
              </div>
              <div className="text-xs font-semibold text-[#704f35] mt-0.5">
                Files Skipped
              </div>
            </div>
            <div className="bg-[#fbf8f3] border border-[#e8dac3] rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-[#704f35]">
                {result.total_requested}
              </div>
              <div className="text-xs font-semibold text-[#704f35] mt-0.5">
                Total Reviewed
              </div>
            </div>
          </div>

          {/* Undo Status Feedback if triggered */}
          {undoResult && (
            <div
              className={`p-4 rounded-2xl mb-5 text-xs flex items-center justify-between gap-3 ${
                undoResult.success
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                  : "bg-red-50 border border-red-200 text-red-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>
                  {undoResult.success
                    ? `Safely restored ${undoResult.restored_count} files back to their original names and locations!`
                    : `Undo failed: ${undoResult.error}`}
                </span>
              </div>
              <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-white shadow-2xs">
                Restored
              </span>
            </div>
          )}

          {/* Files moved preview list */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#704f35] mb-2 flex items-center justify-between">
              <span>Organized Items</span>
              <span className="text-[11px] font-normal text-gray-500 font-mono">
                {result.folder_path}
              </span>
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {result.organized_files.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#fbf8f3] border border-[#e8dac3]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-gray-400 font-mono text-[10px]">
                      {f.original_filename}
                    </span>
                    <span className="text-[#a78255]">→</span>
                    <span className="font-semibold text-[#2b392e] font-mono">
                      {f.new_filename}
                    </span>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {f.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#f4ede2]">
            <button
              type="button"
              onClick={() => onUndo(result.session_id)}
              disabled={isUndoing || undoResult?.success}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-amber-600/60 hover:bg-amber-50 text-amber-900 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Reverse all changes and restore files back to their original names"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isUndoing ? "animate-spin" : ""}`} />
              <span>{isUndoing ? "Restoring files..." : "Undo Organization"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-[#5c402c] hover:bg-[#4d3626] text-white text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              Done & Relax
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
