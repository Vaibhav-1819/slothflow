import React from "react";
import { Folder, Play, Eye, Search, Sparkles, FolderOpen, RefreshCw } from "lucide-react";

interface FolderSelectorProps {
  folderPath: string;
  onFolderPathChange: (path: string) => void;
  onUseDemoPath: () => void;
  onScanFolder: () => void;
  onGeneratePlan: () => void;
  onLazyOrganize: () => void;
  isScanning: boolean;
  isPlanning: boolean;
  isLazyOrganizing: boolean;
  demoPath: string;
  demoFilesCount: number;
  onGenerateNewDemoFiles: () => void;
}

export const FolderSelector: React.FC<FolderSelectorProps> = ({
  folderPath,
  onFolderPathChange,
  onUseDemoPath,
  onScanFolder,
  onGeneratePlan,
  onLazyOrganize,
  isScanning,
  isPlanning,
  isLazyOrganizing,
  demoPath,
  demoFilesCount,
  onGenerateNewDemoFiles,
}) => {
  const isBusy = isScanning || isPlanning || isLazyOrganizing;


  return (
    <div className="bg-white border border-[#e8dac3] rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4d3626] tracking-tight flex items-center gap-2.5">
            <Folder className="w-6 h-6 text-[#a78255]" />
            Select Your Disorganized Folder
          </h2>
          <p className="text-sm text-[#704f35] mt-1">
            Choose any local directory containing PDFs, notes, markdown files, invoices, or downloads.
          </p>
        </div>

        {/* Quick Demo preset button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onUseDemoPath}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#f4ede2] hover:bg-[#e8dac3] text-[#5c402c] border border-[#d7c09e] transition-all shadow-xs"
            title={`Load the 18 pre-generated demo test files from ${demoPath}`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Load Demo Folder ({demoFilesCount} sample files)</span>
          </button>

          <button
            type="button"
            onClick={onGenerateNewDemoFiles}
            disabled={isBusy}
            className="p-2 rounded-xl text-xs text-[#8c6843] hover:text-[#4d3626] hover:bg-[#f4ede2] border border-transparent hover:border-[#d7c09e] transition-colors"
            title="Regenerate clean set of 18 test sample files"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Path Input Box */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a78255]">
          <FolderOpen className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={folderPath}
          onChange={(e) => onFolderPathChange(e.target.value)}
          placeholder="e.g. C:\Users\YourName\Downloads or select the Demo Folder above..."
          disabled={isBusy}
          className="w-full pl-12 pr-4 py-3.5 bg-[#fbf8f3] border-2 border-[#e8dac3] rounded-2xl text-sm font-mono text-[#4d3626] placeholder-[#a78255]/70 focus:outline-none focus:border-[#a78255] focus:bg-white transition-all shadow-inner"
        />
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#f4ede2]">
        <div className="flex items-center gap-2 text-xs text-[#8c6843]">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Files stay strictly on your local filesystem. Never uploaded.</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Secondary Action: Scan */}
          <button
            type="button"
            onClick={onScanFolder}
            disabled={isBusy || !folderPath.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#d7c09e] bg-white hover:bg-[#f4ede2] text-[#5c402c] text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <Search className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scanning..." : "Scan Folder"}</span>
          </button>

          {/* Secondary Button: Preview Organization */}
          <button
            type="button"
            onClick={onGeneratePlan}
            disabled={isBusy || !folderPath.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#a78255] bg-white hover:bg-[#fbf8f3] text-[#704f35] text-xs sm:text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs hover:shadow"
          >
            <Eye className={`w-4 h-4 ${isPlanning ? "animate-spin" : ""}`} />
            <span>{isPlanning ? "Analyzing Files..." : "Preview Organization"}</span>
          </button>

          {/* Primary Button: Lazy Mode: Organize My Files */}
          <button
            type="button"
            onClick={onLazyOrganize}
            disabled={isBusy || !folderPath.trim()}
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-[#5c402c] hover:bg-[#4d3626] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className={`w-4 h-4 fill-white ${isLazyOrganizing ? "animate-spin" : ""}`} />
            <span>{isLazyOrganizing ? "Organizing Files..." : "Organize My Files"}</span>
            <span className="text-[10px] font-semibold tracking-wide bg-[#8c6843] px-2 py-0.5 rounded-md text-[#fbf8f3] uppercase ml-1">
              Lazy Mode
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
