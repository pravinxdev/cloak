import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

interface SecretWithMetadata {
  key: string;
  value: string;
  tags: string[];
  expires: string;
}

export default function ImportPage() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"overwrite" | "skip">("skip");
  const [loading, setLoading] = useState(false);
  const [environment, setEnvironment] = useState("default");
  const [environments, setEnvironments] = useState<string[]>(["default"]);
  const [parsed, setParsed] = useState<SecretWithMetadata[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 🔥 Load environments on mount
  useEffect(() => {
    const loadEnvironments = async () => {
      try {
        const response = await fetch("/api/environments", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          // Backend returns { environments: string[], activeEnvironment: string }
          const envList = Array.isArray(data) ? data : (data.environments || []);
          setEnvironments(envList.length > 0 ? envList : ["default"]);
        }
      } catch (err) {
        console.error("Failed to load environments", err);
        setEnvironments(["default"]);
      }
    };
    loadEnvironments();
  }, []);

  // ✅ parse .env text
  const parseEnv = (text: string): SecretWithMetadata[] => {
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
          tags: [],
          expires: "",
        };
      })
      .filter(Boolean) as SecretWithMetadata[];
  };

  // 🔥 Handle textarea change and update parsed secrets
  const handleTextChange = (value: string) => {
    setText(value);
    if (value.trim()) {
      setParsed(parseEnv(value));
    } else {
      setParsed([]);
    }
  };

  // 🏷️ Update tags for a specific secret
  const updateSecretTags = (index: number, tagsStr: string) => {
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    
    const updated = [...parsed];
    updated[index].tags = tags;
    setParsed(updated);
  };

  // ⏰ Update expiration for a specific secret
  const updateSecretExpires = (index: number, expires: string) => {
    const updated = [...parsed];
    updated[index].expires = expires;
    setParsed(updated);
  };

  const handleImport = async () => {
    if (parsed.length === 0) {
      toast.error("No secrets to import");
      return;
    }

    try {
      setLoading(true);

      let existingKeys: string[] = [];

      // 🔥 Skip mode → fetch existing keys
      if (mode === "skip") {
        const secrets = await api.getSecrets();
        existingKeys = secrets.map((s: any) => s.key);
      }

      let count = 0;
      let failed: string[] = [];

      // 🔥 import one by one with per-secret metadata
      for (const item of parsed) {
        if (mode === "skip" && existingKeys.includes(item.key)) {
          continue;
        }

        try {
          await api.addSecret(item.key, item.value, {
            environment,
            tags: item.tags.length > 0 ? item.tags : undefined,
            expires: item.expires || undefined,
          });
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
      setParsed([]);

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
        onChange={(e) => handleTextChange(e.currentTarget.value)}
        placeholder={
          "# Paste your .env contents here\nDATABASE_URL=postgres://...\nAPI_KEY=sk-..."
        }
        className="w-full h-56 bg-secondary border border-border rounded-lg p-4 font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
      />

      {/* 🔧 ENVIRONMENT SELECTOR */}
      <div className="space-y-2">
        <Label htmlFor="env-select" className="text-sm">
          Environment (applies to all)
        </Label>
        <Select value={environment} onValueChange={setEnvironment}>
          <SelectTrigger id="env-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {environments.map((env) => (
              <SelectItem key={env} value={env}>
                {env}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 📋 SECRETS PREVIEW TABLE */}
      {parsed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Secrets to Import ({parsed.length})</h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-2 bg-secondary p-2 text-xs font-medium text-muted-foreground">
              <div className="col-span-3">Key</div>
              <div className="col-span-3">Tags</div>
              <div className="col-span-4">Expiration</div>
              <div className="col-span-2"></div>
            </div>
            <div className="divide-y divide-border">
              {parsed.map((secret, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-2 items-center text-xs hover:bg-secondary">
                  {/* Key */}
                  <div className="col-span-3 font-mono text-foreground truncate">
                    {secret.key}
                  </div>

                  {/* Tags */}
                  <div className="col-span-3">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={secret.tags.join(", ")}
                        onChange={(e) => updateSecretTags(index, e.currentTarget.value)}
                        placeholder="tag1, tag2"
                        className="w-full px-2 py-1 text-xs bg-background border border-border rounded"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="text-muted-foreground cursor-pointer hover:underline"
                        onClick={() => setEditingIndex(index)}
                      >
                        {secret.tags.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {secret.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expiration */}
                  <div className="col-span-4">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={secret.expires}
                        onChange={(e) => updateSecretExpires(index, e.currentTarget.value)}
                        placeholder="7d, 5h, or timestamp"
                        className="w-full px-2 py-1 text-xs bg-background border border-border rounded"
                      />
                    ) : (
                      <div
                        className="text-muted-foreground cursor-pointer hover:underline"
                        onClick={() => setEditingIndex(index)}
                      >
                        {secret.expires || <span className="text-muted-foreground">—</span>}
                      </div>
                    )}
                  </div>

                  {/* Edit/Done Button */}
                  <div className="col-span-2 flex justify-end">
                    {editingIndex === index && (
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded hover:opacity-80"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode and Import Button */}
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