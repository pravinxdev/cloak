import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { api, SecretData } from "@/services/api";
import { useApp } from "@/contexts/AppContext";
import { decryptValue } from "@/utils/decrypt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Checkbox,
} from "@/components/ui/checkbox";

export default function ExportPage() {
  const appContext = useApp();

  const [secrets, setSecrets] = useState<SecretData[]>([]);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({});
  const [selectedEnv, setSelectedEnv] = useState<string>(appContext?.activeEnvironment || "");
  const [exportFormat, setExportFormat] = useState<".env" | "txt" | "json">(
    ".env"
  );
  const [includeMetadata, setIncludeMetadata] = useState(false);

  // ✅ fetch secrets using api.ts
  useEffect(() => {
    const fetchSecrets = async () => {
      try {
        setLoading(true);
        const data = await api.getSecrets();
        setSecrets(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load secrets");
      } finally {
        setLoading(false);
      }
    };

    fetchSecrets();
  }, []);

  // 🌍 Update selectedEnv when active environment changes
  useEffect(() => {
    if (appContext?.activeEnvironment) {
      setSelectedEnv(appContext.activeEnvironment);
    }
  }, [appContext?.activeEnvironment]);

  // ✅ Filter by environment
  const allEnvs = appContext?.environments?.map(e => e.name) || [];
  const filtered = secrets.filter((s) => {
    const matchesEnv =
      selectedEnv === "__all__" || !selectedEnv || (s.environment || "default") === selectedEnv;
    return matchesEnv;
  });

  // 🔄 Auto-decrypt new filtered list when environment changes while revealed
  useEffect(() => {
    if (revealed && filtered.length > 0 && appContext?.sessionKey) {
      const decryptNewFilter = async () => {
        try {
          const decrypted: Record<string, string> = {};
          for (const secret of filtered) {
            // Only decrypt if not already in cache
            if (!decryptedValues[secret.key]) {
              decrypted[secret.key] = await decryptValue(secret.value, appContext.sessionKey);
            } else {
              decrypted[secret.key] = decryptedValues[secret.key];
            }
          }
          setDecryptedValues(decrypted);
        } catch (err: any) {
          console.error("Failed to decrypt new filter:", err);
        }
      };
      decryptNewFilter();
    }
  }, [filtered, revealed, appContext?.sessionKey]);

  // ✅ toggle reveal - decrypt locally using session key
  const toggleReveal = async () => {
    if (revealed) {
      setRevealed(false);
      return;
    }

    // Decrypt all values
    try {
      if (!appContext?.sessionKey) {
        throw new Error("Session key not available");
      }

      const decrypted: Record<string, string> = {};
      for (const secret of filtered) {
        decrypted[secret.key] = await decryptValue(secret.value, appContext.sessionKey);
      }
      setDecryptedValues(decrypted);
      setRevealed(true);
    } catch (err: any) {
      toast.error("Failed to decrypt secrets");
      console.error(err);
    }
  };

  // 🔐 Generate content based on format
  const generateContent = () => {
    if (!revealed) {
      if (exportFormat === "json") {
        return JSON.stringify(
          filtered.map((s) => ({
            key: s.key,
            value: "••••••••",
            ...(includeMetadata && {
              tags: s.tags || [],
              environment: s.environment || "default",
              expiresAt: s.expiresAt || null,
            }),
          })),
          null,
          2
        );
      } else if (exportFormat === "txt") {
        return filtered
          .map(
            (s) =>
              `Key: ${s.key}\nValue: ••••••••${
                includeMetadata
                  ? `\nTags: ${(s.tags || []).join(", ") || "none"}\nEnvironment: ${s.environment || "default"}\nExpires: ${s.expiresAt || "never"}\n---`
                  : ""
              }`
          )
          .join("\n");
      } else {
        return filtered
          .map((s) => `${s.key}=••••••••`)
          .join("\n");
      }
    }

    // Revealed content
    if (exportFormat === "json") {
      return JSON.stringify(
        filtered.map((s) => ({
          key: s.key,
          value: decryptedValues[s.key] || "***",
          ...(includeMetadata && {
            tags: s.tags || [],
            environment: s.environment || "default",
            expiresAt: s.expiresAt || null,
          }),
        })),
        null,
        2
      );
    } else if (exportFormat === "txt") {
      return filtered
        .map(
          (s) =>
            `Key: ${s.key}\nValue: ${decryptedValues[s.key] || "***"}${
              includeMetadata
                ? `\nTags: ${(s.tags || []).join(", ") || "none"}\nEnvironment: ${s.environment || "default"}\nExpires: ${s.expiresAt || "never"}\n---`
                : ""
            }`
        )
        .join("\n");
    } else {
      return filtered
        .map((s) => `${s.key}=${decryptedValues[s.key] || "***"}`)
        .join("\n");
    }
  };

  // 📋 Get file extension based on format
  const getFileExtension = () => {
    return exportFormat;
  };

  const content = generateContent();

  const handleCopy = () => {
    if (!revealed) {
      toast.warning("Please reveal secrets first to copy actual values");
      return;
    }
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    if (!revealed) {
      toast.warning("Please reveal secrets first to download actual values");
      return;
    }

    const mimeType = exportFormat === "json" ? "application/json" : "text/plain";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `secrets${getFileExtension()}`;
    a.click();

    URL.revokeObjectURL(url);

    toast.success(`Downloaded secrets${getFileExtension()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Export</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preview and export your secrets in multiple formats
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleReveal}
          >
            {revealed ? (
              <EyeOff className="h-4 w-4 mr-1" />
            ) : (
              <Eye className="h-4 w-4 mr-1" />
            )}
            {revealed ? "Mask" : "Reveal"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!revealed}>
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>

          <Button size="sm" onClick={handleDownload} disabled={!revealed}>
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
        </div>
      </div>

      {/* Filters & Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Environment Filter */}
        {allEnvs.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Environment:</label>
            <Select value={selectedEnv} onValueChange={setSelectedEnv}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select environment..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Environments</SelectItem>
                {allEnvs.map((env) => (
                  <SelectItem key={env} value={env}>
                    {env}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Export Format */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Format:</label>
          <Select value={exportFormat} onValueChange={(val: any) => setExportFormat(val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select format..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=".env">.env (KEY=value)</SelectItem>
              <SelectItem value="txt">TXT (Detailed)</SelectItem>
              <SelectItem value="json">JSON (Structured)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Include Metadata */}
        <div className="space-y-2 flex items-end">
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-metadata"
              checked={includeMetadata}
              onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
              disabled={exportFormat === ".env"}
              title={exportFormat === ".env" ? ".env format doesn't support metadata" : ""}
            />
            <label htmlFor="include-metadata" className="text-sm cursor-pointer">
              Include metadata
            </label>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          {revealed ? (
            <span className="text-green-600 dark:text-green-400">✓ Decrypted - Ready to export</span>
          ) : (
            <span>Click "Reveal" to decrypt and see actual values</span>
          )}
        </div>
        <pre className="bg-terminal-bg text-terminal-text p-4 rounded-lg font-mono text-xs leading-relaxed overflow-auto border border-border max-h-96">
          {loading
            ? "Loading secrets..."
            : content || "# No secrets to export"}
        </pre>
      </div>

      {/* Summary */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} secret{filtered.length !== 1 ? "s" : ""} to export
          {includeMetadata ? " (with metadata)" : ""}
        </p>
      )}
    </div>
  );
}