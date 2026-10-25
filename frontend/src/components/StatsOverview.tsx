import React from "react";
import { Files, CheckCircle, FolderTree, ShieldAlert } from "lucide-react";

interface StatsOverviewProps {
  totalScanned: number;
  approvedCount: number;
  categoryCount: number;
  skippedCount: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalScanned,
  approvedCount,
  categoryCount,
  skippedCount,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* Stat 1: Total Scanned */}
      <div className="bg-white border border-[#e8dac3] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-[#8c6843] mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Discovered</span>
          <Files className="w-4 h-4 text-[#a78255]" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#4d3626]">
          {totalScanned}
        </div>
        <p className="text-[11px] text-[#704f35] mt-1">Supported documents</p>
      </div>

      {/* Stat 2: Approved for Move */}
      <div className="bg-white border border-[#e8dac3] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-emerald-800 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900">
          {approvedCount}
        </div>
        <p className="text-[11px] text-emerald-700 mt-1">Ready for safe organization</p>
      </div>

      {/* Stat 3: Target Categories */}
      <div className="bg-white border border-[#e8dac3] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-[#5c402c] mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Categories</span>
          <FolderTree className="w-4 h-4 text-[#8c6843]" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#4d3626]">
          {categoryCount}
        </div>
        <p className="text-[11px] text-[#704f35] mt-1">Work, Finance, Projects, etc.</p>
      </div>

      {/* Stat 4: Collision Protection & Skipped */}
      <div className="bg-white border border-[#e8dac3] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-sage-800 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Untouched</span>
          <ShieldAlert className="w-4 h-4 text-[#4a6b4e]" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#2b392e]">
          {skippedCount}
        </div>
        <p className="text-[11px] text-[#4a6b4e] mt-1">Zero overwrites, Zero deletions</p>
      </div>
    </div>
  );
};
