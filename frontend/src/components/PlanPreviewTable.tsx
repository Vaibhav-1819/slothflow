import React, { useState } from "react";
import type { PlanItem } from "../api";
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  Check,
  X,
  Edit2,
  Folder,
  Sparkles,
} from "lucide-react";


interface PlanPreviewTableProps {
  planItems: PlanItem[];
  onToggleApproval: (id: string) => void;
  onSelectAll: (approved: boolean) => void;
  onUpdateFilename: (id: string, newFilename: string) => void;
  onUpdateCategory: (id: string, newCategory: string) => void;
  onApplyPlan: () => void;
  isApplying: boolean;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Work: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Education: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Finance: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Personal: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  Projects: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  Miscellaneous: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" },
};

const CATEGORIES_LIST = [
  "Work",
  "Education",
  "Finance",
  "Personal",
  "Projects",
  "Miscellaneous",
];

export const PlanPreviewTable: React.FC<PlanPreviewTableProps> = ({
  planItems,
  onToggleApproval,
  onSelectAll,
  onUpdateFilename,
  onUpdateCategory,
  onApplyPlan,
  isApplying,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  const approvedCount = planItems.filter((i) => i.approved).length;
  const allApproved = planItems.length > 0 && approvedCount === planItems.length;

  const startEditing = (item: PlanItem) => {
    setEditingId(item.id);
    setEditingName(item.suggested_filename);
  };

  const saveEditing = (id: string) => {
    if (editingName.trim()) {
      onUpdateFilename(id, editingName.trim());
    }
    setEditingId(null);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="w-4 h-4 text-red-500 shrink-0" />;
    if (ext === "md" || ext === "markdown") return <FileCode className="w-4 h-4 text-blue-500 shrink-0" />;
    if (ext === "json" || ext === "csv") return <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />;
    return <FileText className="w-4 h-4 text-[#8c6843] shrink-0" />;
  };

  return (
    <div className="bg-white border border-[#e8dac3] rounded-3xl overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-[#fbf8f3] border-b border-[#e8dac3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-[#4d3626] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#a78255]" />
            Proposed Organization Plan
          </h3>
          <p className="text-xs text-[#704f35]">
            Review, edit suggested names, or uncheck any files you want to keep untouched.
          </p>
        </div>

        {/* Global toggles and Apply Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectAll(!allApproved)}
            className="text-xs font-semibold text-[#704f35] hover:text-[#4d3626] px-3 py-1.5 rounded-lg border border-[#d7c09e] bg-white hover:bg-[#f4ede2] transition-colors"
          >
            {allApproved ? "Deselect All" : "Select All"}
          </button>

          <button
            type="button"
            onClick={onApplyPlan}
            disabled={approvedCount === 0 || isApplying}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isApplying ? "Applying..." : `Apply Changes (${approvedCount})`}</span>
          </button>
        </div>
      </div>

      {/* Interactive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f4ede2]/60 border-b border-[#e8dac3] text-[11px] font-bold uppercase tracking-wider text-[#704f35]">
              <th className="py-3 px-4 w-12 text-center">Approve</th>
              <th className="py-3 px-4 min-w-[200px]">Original File</th>
              <th className="py-3 px-4 min-w-[240px]">AI Suggested Name</th>
              <th className="py-3 px-4 min-w-[130px]">Category</th>
              <th className="py-3 px-4 min-w-[150px]">Destination</th>
              <th className="py-3 px-4 min-w-[120px]">Confidence & Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4ede2] text-xs">
            {planItems.map((item) => {
              const isEditing = editingId === item.id;
              const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES["Miscellaneous"];

              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    item.approved ? "hover:bg-[#fbf8f3]" : "bg-gray-50/70 opacity-60"
                  }`}
                >
                  {/* Approval Checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={item.approved}
                      onChange={() => onToggleApproval(item.id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-[#c5a378] cursor-pointer"
                    />
                  </td>

                  {/* Original Filename */}
                  <td className="py-3.5 px-4 font-mono text-[#5c402c] text-xs">
                    <div className="flex items-center gap-2">
                      {getFileIcon(item.original_filename)}
                      <span className="truncate max-w-[180px]" title={item.original_filename}>
                        {item.original_filename}
                      </span>
                    </div>
                  </td>

                  {/* Suggested Filename (Editable) */}
                  <td className="py-3.5 px-4">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEditing(item.id)}
                          className="px-2 py-1 bg-white border-2 border-emerald-500 rounded text-xs font-mono w-full focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEditing(item.id)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          title="Save changes"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between group gap-2">
                        <span
                          className="font-medium text-[#2b392e] font-mono text-xs truncate max-w-[210px]"
                          title={item.suggested_filename}
                        >
                          {item.suggested_filename}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditing(item)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#8c6843] hover:text-[#4d3626] transition-opacity rounded"
                          title="Click to rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Category Dropdown Pill */}
                  <td className="py-3.5 px-4">
                    <select
                      value={item.category}
                      onChange={(e) => onUpdateCategory(item.id, e.target.value)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                    >
                      {CATEGORIES_LIST.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Destination Folder */}
                  <td className="py-3.5 px-4 text-[#704f35]">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[#f4ede2] border border-[#e8dac3]">
                      <Folder className="w-3 h-3 text-[#a78255]" />
                      /{item.category}/
                    </span>
                  </td>

                  {/* Confidence & Reasoning */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.confidence > 0.8
                                ? "bg-emerald-500"
                                : item.confidence > 0.6
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.round(item.confidence * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500">
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                      <p
                        className="text-[11px] text-[#8c6843] truncate max-w-[140px]"
                        title={item.reasoning}
                      >
                        {item.reasoning || "Automatic classification"}
                      </p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
