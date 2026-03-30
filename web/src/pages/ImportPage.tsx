import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ImportPage() {
  const { importSecrets } = useApp();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"overwrite" | "skip">("skip");

  const handleImport = () => {
    if (!text.trim()) {
      toast.error("Paste your .env content first");
      return;
    }
    const count = importSecrets(text, mode);
    toast.success(`Imported ${count} secret${count !== 1 ? "s" : ""}`);
    setText("");
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Import</h2>
        <p className="text-sm text-muted-foreground mt-1">Paste your .env file contents below</p>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"# Paste your .env contents here\nDATABASE_URL=postgres://...\nAPI_KEY=sk-..."}
        className="w-full h-56 bg-secondary border border-border rounded-lg p-4 font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
      />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Existing keys:</span>
          <button
            onClick={() => setMode("skip")}
            className={`px-2 py-1 rounded text-xs transition-colors ${mode === "skip" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Skip
          </button>
          <button
            onClick={() => setMode("overwrite")}
            className={`px-2 py-1 rounded text-xs transition-colors ${mode === "overwrite" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Overwrite
          </button>
        </div>
        <Button size="sm" onClick={handleImport}>Import</Button>
      </div>
    </div>
  );
}
