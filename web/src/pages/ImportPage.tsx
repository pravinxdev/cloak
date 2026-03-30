import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/services/api";

interface Secret {
  key: string;
  value: string;
}

export default function ImportPage() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"overwrite" | "skip">("skip");
  const [loading, setLoading] = useState(false);

  // ✅ parse .env text
  const parseEnv = (text: string): Secret[] => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        if (index === -1) return null;

        return {
          key: line.slice(0, index).trim(),
          value: line.slice(index + 1).trim(),
        };
      })
      .filter(Boolean) as Secret[];
  };

  const handleImport = async () => {
    if (!text.trim()) {
      toast.error("Paste your .env content first");
      return;
    }

    try {
      setLoading(true);

      const parsed = parseEnv(text);

      if (parsed.length === 0) {
        toast.error("No valid secrets found");
        return;
      }

      let existingKeys: string[] = [];

      // 🔥 Skip mode → fetch existing keys
      if (mode === "skip") {
        const secrets = await api.getSecrets();
        existingKeys = secrets.map((s: Secret) => s.key);
      }

      let count = 0;
      let failed: string[] = [];

      // 🔥 import one by one
      for (const item of parsed) {
        if (mode === "skip" && existingKeys.includes(item.key)) {
          continue;
        }

        try {
          await api.addSecret(item.key, item.value);
          count++;
        } catch (err) {
          console.error("Failed:", item.key);
          failed.push(item.key);
        }
      }

      // ✅ success message
      toast.success(`Imported ${count} secret${count !== 1 ? "s" : ""}`);

      // ⚠️ partial failure message
      if (failed.length > 0) {
        toast.warning(`${failed.length} failed`);
      }

      setText("");

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Import</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Paste your .env file contents below
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          "# Paste your .env contents here\nDATABASE_URL=postgres://...\nAPI_KEY=sk-..."
        }
        className="w-full h-56 bg-secondary border border-border rounded-lg p-4 font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
      />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Existing keys:</span>

          <button
            onClick={() => setMode("skip")}
            className={`px-2 py-1 rounded text-xs ${
              mode === "skip"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            }`}
          >
            Skip
          </button>

          <button
            onClick={() => setMode("overwrite")}
            className={`px-2 py-1 rounded text-xs ${
              mode === "overwrite"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            }`}
          >
            Overwrite
          </button>
        </div>

        <Button size="sm" onClick={handleImport} disabled={loading}>
          {loading ? "Importing..." : "Import"}
        </Button>
      </div>
    </div>
  );
}