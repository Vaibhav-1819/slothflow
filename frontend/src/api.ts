/**
 * SlothFlow API Client
 */

const API_BASE = "http://127.0.0.1:8000/api";

export interface ModelStatus {
  available: boolean;
  models: string[];
  default_model: string | null;
  recommended_models: Array<{
    name: string;
    size: string;
    speed: string;
    fit: string;
  }>;
  base_url: string;
  error: string | null;
}

export interface FileItem {
  filename: string;
  original_path: string;
  extension: string;
  size_bytes: number;
  modified_time: string;
  supported: boolean;
  text_snippet?: string;
  word_count?: number;
  page_count?: number;
  error?: string | null;
}

export interface PlanItem {
  id: string;
  original_path: string;
  original_filename: string;
  suggested_filename: string;
  category: string;
  destination_folder: string;
  destination_path: string;
  reasoning: string;
  confidence: number;
  size_bytes: number;
  approved: boolean;
  error?: string | null;
}

export interface PlanResponse {
  session_id: string;
  folder_path: string;
  files_count: number;
  plan: PlanItem[];
  message?: string;
}

export interface ApplyResponse {
  session_id: string;
  folder_path: string;
  total_requested: number;
  organized_count: number;
  skipped_count: number;
  failed_count: number;
  organized_files: Array<{
    original_filename: string;
    new_filename: string;
    category: string;
    new_path: string;
  }>;
  skipped_files: any[];
  failed_files: any[];
  plan_details?: PlanItem[];
}

export interface UndoResponse {
  session_id: string;
  success: boolean;
  restored_count: number;
  skipped_count: number;
  failed_count: number;
  restored_files: Array<{
    op_id: number;
    from_path: string;
    restored_path: string;
    original_filename: string;
  }>;
  skipped: any[];
  failed: any[];
  error?: string;
}

export interface SessionHistory {
  id: string;
  folder_path: string;
  mode: string;
  total_files: number;
  organized_files: number;
  skipped_files: number;
  status: string;
  created_at: string;
}

export const api = {
  async getModelStatus(): Promise<ModelStatus> {
    const res = await fetch(`${API_BASE}/model-status`);
    if (!res.ok) throw new Error("Failed to fetch model status");
    return res.json();
  },

  async getDefaultDemoPath(): Promise<{ demo_path: string; exists: boolean; files_count: number }> {
    const res = await fetch(`${API_BASE}/default-demo-path`);
    if (!res.ok) throw new Error("Failed to fetch demo path");
    return res.json();
  },

  async scanFolder(folderPath: string): Promise<{ folder_path: string; total_files: number; files: FileItem[] }> {
    const res = await fetch(`${API_BASE}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder_path: folderPath }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Scan failed" }));
      throw new Error(err.detail || "Failed to scan folder");
    }
    return res.json();
  },

  async generatePlan(
    folderPath: string,
    modelName?: string,
    useHeuristicFallback: boolean = true
  ): Promise<PlanResponse> {
    const res = await fetch(`${API_BASE}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder_path: folderPath,
        model_name: modelName,
        use_heuristic_fallback: useHeuristicFallback,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Plan generation failed" }));
      throw new Error(err.detail || "Failed to generate plan");
    }
    return res.json();
  },

  async applyPlan(sessionId: string, folderPath: string, items: PlanItem[]): Promise<ApplyResponse> {
    const res = await fetch(`${API_BASE}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        folder_path: folderPath,
        items: items,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Apply plan failed" }));
      throw new Error(err.detail || "Failed to apply organization plan");
    }
    return res.json();
  },

  async lazyOrganize(
    folderPath: string,
    modelName?: string,
    useHeuristicFallback: boolean = true
  ): Promise<ApplyResponse> {
    const res = await fetch(`${API_BASE}/lazy-organize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder_path: folderPath,
        model_name: modelName,
        use_heuristic_fallback: useHeuristicFallback,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Lazy organize failed" }));
      throw new Error(err.detail || "Failed to organize files");
    }
    return res.json();
  },

  async undoOperations(sessionId: string): Promise<UndoResponse> {
    const res = await fetch(`${API_BASE}/undo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Undo failed" }));
      throw new Error(err.detail || "Failed to undo operations");
    }
    return res.json();
  },

  async getHistory(): Promise<{ sessions: SessionHistory[] }> {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error("Failed to fetch history");
    return res.json();
  },

  async generateDemoFiles(targetFolder?: string): Promise<{ success: boolean; target_folder: string; files_created: number }> {
    const res = await fetch(`${API_BASE}/generate-demo-files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_folder: targetFolder }),
    });
    if (!res.ok) throw new Error("Failed to generate demo files");
    return res.json();
  },

  async browseDirectory(currentPath?: string): Promise<{
    current_path: string;
    parent_path: string | null;
    subdirectories: string[];
  }> {
    const query = currentPath ? `?current_path=${encodeURIComponent(currentPath)}` : "";
    const res = await fetch(`${API_BASE}/browse-directory${query}`);
    if (!res.ok) throw new Error("Failed to browse directory");
    return res.json();
  },
};
