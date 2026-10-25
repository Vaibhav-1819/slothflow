import React, { useEffect, useState } from "react";
import { type SessionHistory, api } from "../api";
import { History, X, RotateCcw, Clock } from "lucide-react";


interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUndoSession: (sessionId: string) => void;
  isUndoing: boolean;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  isOpen,
  onClose,
  onUndoSession,
  isUndoing,
}) => {
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getHistory();
      setSessions(res.sessions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#e8dac3] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#fbf8f3] p-5 border-b border-[#e8dac3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4ede2] border border-[#d7c09e] flex items-center justify-center text-[#704f35]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#4d3626]">
                Operation Audit Trail
              </h3>
              <p className="text-xs text-[#704f35]">
                Permanent SQLite log of all file organization sessions and safe undo checkpoints.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-10 text-xs text-[#8c6843]">
              Loading audit logs from SQLite...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-[#8c6843]">
              <Clock className="w-8 h-8 mx-auto text-[#c5a378] mb-2 opacity-60" />
              <p className="text-sm font-semibold">No organization sessions yet</p>
              <p className="text-xs text-[#a78255] mt-1">
                Run an organization job to see reversible history recorded here.
              </p>
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-[#fbf8f3] border border-[#e8dac3] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        s.status === "undone"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {s.status}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {new Date(s.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-medium text-[#4d3626] truncate max-w-sm">
                    {s.folder_path}
                  </div>
                  <div className="text-xs text-[#704f35] mt-1">
                    {s.organized_files} organized • {s.skipped_files} skipped • {s.total_files} total
                  </div>
                </div>

                {s.status !== "undone" && s.organized_files > 0 && (
                  <button
                    type="button"
                    onClick={() => onUndoSession(s.id)}
                    disabled={isUndoing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-semibold shadow-2xs transition-colors shrink-0"
                    title="Safely restore files from this session back to their original paths"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                    <span>Safe Undo</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#fbf8f3] p-4 border-t border-[#e8dac3] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#5c402c] hover:bg-[#4d3626] text-white text-xs font-bold transition-all shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
