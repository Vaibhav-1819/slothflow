import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ModelStatusBanner } from "./components/ModelStatusBanner";
import { FolderSelector } from "./components/FolderSelector";
import { StatsOverview } from "./components/StatsOverview";
import { PlanPreviewTable } from "./components/PlanPreviewTable";
import { CompletionModal } from "./components/CompletionModal";
import { SetupGuideModal } from "./components/SetupGuideModal";
import { AuditHistoryModal } from "./components/AuditHistoryModal";
import {
  api,
  type ModelStatus,
  type FileItem,
  type PlanItem,
  type ApplyResponse,
  type UndoResponse,
} from "./api";
import { Sparkles, FolderSearch } from "lucide-react";


export function App() {
  // Model state
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isCheckingModel, setIsCheckingModel] = useState<boolean>(false);
  const [useHeuristicFallback, setUseHeuristicFallback] = useState<boolean>(true);

  // Folder & Plan state
  const [folderPath, setFolderPath] = useState<string>("");
  const [demoPath, setDemoPath] = useState<string>("");
  const [demoFilesCount, setDemoFilesCount] = useState<number>(18);
  const [scannedFiles, setScannedFiles] = useState<FileItem[]>([]);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Loading states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [isLazyOrganizing, setIsLazyOrganizing] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isUndoing, setIsUndoing] = useState<boolean>(false);

  // Modals state
  const [isCompletionOpen, setIsCompletionOpen] = useState<boolean>(false);
  const [completionResult, setCompletionResult] = useState<ApplyResponse | null>(null);
  const [undoResult, setUndoResult] = useState<UndoResponse | null>(null);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Toast / notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial load
  useEffect(() => {
    checkModel();
    loadDemoPath();
  }, []);

  const checkModel = async () => {
    try {
      setIsCheckingModel(true);
      const status = await api.getModelStatus();
      setModelStatus(status);
      if (status.default_model) {
        setSelectedModel(status.default_model);
      } else if (status.models && status.models.length > 0) {
        setSelectedModel(status.models[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingModel(false);
    }
  };

  const loadDemoPath = async () => {
    try {
      const res = await api.getDefaultDemoPath();
      setDemoPath(res.demo_path);
      setDemoFilesCount(res.files_count || 18);
      if (!folderPath) {
        setFolderPath(res.demo_path);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUseDemoPath = () => {
    if (demoPath) {
      setFolderPath(demoPath);
      showToast("Demo folder selected! Ready to scan or organize.", "info");
    }
  };

  const handleGenerateNewDemoFiles = async () => {
    try {
      const res = await api.generateDemoFiles(demoPath);
      setDemoFilesCount(res.files_created);
      showToast(`Regenerated ${res.files_created} test files in demo folder!`, "success");
      // Clear plan and scan if were viewing demo
      setPlanItems([]);
      setScannedFiles([]);
    } catch (e: any) {
      showToast(e.message || "Could not generate demo files", "error");
    }
  };

  // 1. Scan Folder
  const handleScanFolder = async () => {
    if (!folderPath.trim()) return;
    try {
      setIsScanning(true);
      const res = await api.scanFolder(folderPath.trim());
      setScannedFiles(res.files);
      showToast(`Discovered ${res.total_files} supported files.`, "success");
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsScanning(false);
    }
  };

  // 2. Generate Plan
  const handleGeneratePlan = async () => {
    if (!folderPath.trim()) return;
    try {
      setIsPlanning(true);
      const res = await api.generatePlan(
        folderPath.trim(),
        selectedModel || undefined,
        useHeuristicFallback
      );
      setPlanItems(res.plan);
      setCurrentSessionId(res.session_id);
      showToast(`AI generated plan for ${res.files_count} files!`, "success");
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsPlanning(false);
    }
  };

  // 3. Lazy Mode: 1-Click Scan + Plan + Organize
  const handleLazyOrganize = async () => {
    if (!folderPath.trim()) return;
    try {
      setIsLazyOrganizing(true);
      const res = await api.lazyOrganize(
        folderPath.trim(),
        selectedModel || undefined,
        useHeuristicFallback
      );
      setCompletionResult(res);
      setUndoResult(null);
      setIsCompletionOpen(true);
      setPlanItems([]); // Clear plan table since applied
      loadDemoPath(); // update count
      showToast(`Lazy Mode complete! Organized ${res.organized_count} files.`, "success");
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsLazyOrganizing(false);
    }
  };

  // 4. Apply Approved Changes
  const handleApplyPlan = async () => {
    if (!currentSessionId || !folderPath) return;
    try {
      setIsApplying(true);
      const res = await api.applyPlan(currentSessionId, folderPath, planItems);
      setCompletionResult(res);
      setUndoResult(null);
      setIsCompletionOpen(true);
      setPlanItems([]);
      loadDemoPath();
      showToast(`Applied organization: ${res.organized_count} files organized!`, "success");
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsApplying(false);
    }
  };

  // 5. Safe Undo
  const handleUndo = async (sessionId: string) => {
    try {
      setIsUndoing(true);
      const res = await api.undoOperations(sessionId);
      setUndoResult(res);
      loadDemoPath();
      showToast(`Restored ${res.restored_count} files back to their original names!`, "success");
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsUndoing(false);
    }
  };

  // Plan item modifiers
  const handleToggleApproval = (id: string) => {
    setPlanItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, approved: !item.approved } : item))
    );
  };

  const handleSelectAll = (approved: boolean) => {
    setPlanItems((prev) => prev.map((item) => ({ ...item, approved })));
  };

  const handleUpdateFilename = (id: string, newFilename: string) => {
    setPlanItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, suggested_filename: newFilename } : item))
    );
  };

  const handleUpdateCategory = (id: string, newCategory: string) => {
    setPlanItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              category: newCategory,
              destination_folder: newCategory,
              destination_path: item.destination_path.replace(`/${item.category}/`, `/${newCategory}/`),
            }
          : item
      )
    );
  };

  // Metric calculations
  const totalScanned = planItems.length > 0 ? planItems.length : scannedFiles.length;
  const approvedCount = planItems.filter((i) => i.approved).length;
  const categoryCount = new Set(planItems.map((i) => i.category)).size;

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f3] text-[#2b392e]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
              toast.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-emerald-700"
                : toast.type === "error"
                ? "bg-red-900 text-red-100 border-red-700"
                : "bg-[#4d3626] text-[#fbf8f3] border-[#704f35]"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        modelStatus={modelStatus}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onRefreshModelStatus={checkModel}
        isCheckingModel={isCheckingModel}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Model Status Notification Banner */}
        <ModelStatusBanner
          modelStatus={modelStatus}
          useHeuristicFallback={useHeuristicFallback}
          onToggleHeuristic={() => setUseHeuristicFallback(!useHeuristicFallback)}
          onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
          onRefresh={checkModel}
        />

        {/* Primary Folder Selector & Lazy Mode Control */}
        <FolderSelector
          folderPath={folderPath}
          onFolderPathChange={setFolderPath}
          onUseDemoPath={handleUseDemoPath}
          onScanFolder={handleScanFolder}
          onGeneratePlan={handleGeneratePlan}
          onLazyOrganize={handleLazyOrganize}
          isScanning={isScanning}
          isPlanning={isPlanning}
          isLazyOrganizing={isLazyOrganizing}
          demoPath={demoPath}
          demoFilesCount={demoFilesCount}
          onGenerateNewDemoFiles={handleGenerateNewDemoFiles}
        />

        {/* Real-time Stats Overview */}
        {(planItems.length > 0 || scannedFiles.length > 0) && (
          <StatsOverview
            totalScanned={totalScanned}
            approvedCount={approvedCount}
            categoryCount={categoryCount}
            skippedCount={planItems.length - approvedCount}
          />
        )}

        {/* Organization Plan Preview Table */}
        {planItems.length > 0 && (
          <PlanPreviewTable
            planItems={planItems}
            onToggleApproval={handleToggleApproval}
            onSelectAll={handleSelectAll}
            onUpdateFilename={handleUpdateFilename}
            onUpdateCategory={handleUpdateCategory}
            onApplyPlan={handleApplyPlan}
            isApplying={isApplying}
          />
        )}

        {/* If scanned only, show simple file list card */}
        {planItems.length === 0 && scannedFiles.length > 0 && (
          <div className="bg-white border border-[#e8dac3] rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#4d3626] flex items-center gap-2">
                <FolderSearch className="w-5 h-5 text-[#a78255]" />
                Files Discovered in Directory ({scannedFiles.length})
              </h3>
              <button
                type="button"
                onClick={handleGeneratePlan}
                className="px-4 py-1.5 rounded-xl bg-[#5c402c] hover:bg-[#4d3626] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Generate Organization Plan
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {scannedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#fbf8f3] border border-[#e8dac3] flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-[#5c402c] truncate" title={file.filename}>
                    {file.filename}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">
                    {file.extension}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Completion Modal */}
      <CompletionModal
        isOpen={isCompletionOpen}
        onClose={() => setIsCompletionOpen(false)}
        result={completionResult}
        onUndo={handleUndo}
        isUndoing={isUndoing}
        undoResult={undoResult}
      />

      {/* Setup Guide Modal */}
      <SetupGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
        onRefresh={checkModel}
        isChecking={isCheckingModel}
      />

      {/* Audit History Modal */}
      <AuditHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onUndoSession={handleUndo}
        isUndoing={isUndoing}
      />

      {/* Footer */}
      <footer className="w-full bg-[#f4ede2] border-t border-[#e8dac3] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#704f35]">
          <div className="flex items-center gap-2 font-medium">
            <span>🦥 SlothFlow</span>
            <span>•</span>
            <span>Hacktoberfest Open-Source AI Challenge</span>
            <span>•</span>
            <span className="italic">"Stop organizing. Start relaxing."</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#8c6843]">
            <span>FastAPI + React + Ollama</span>
            <span>Zero Cloud Transmission</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
