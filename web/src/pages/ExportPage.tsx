import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

interface Secret {
  key: string;
  value: string;
}

export default function ExportPage() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(false);
  const [masked, setMasked] = useState(true);

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

  // ✅ masked preview
  const envContent = secrets
    .map((s) => `${s.key}=${masked ? "••••••••" : s.value}`)
    .join("\n");

  // ✅ actual content
  const rawContent = secrets
    .map((s) => `${s.key}=${s.value}`)
    .join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(rawContent);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([rawContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = ".env";
    a.click();

    URL.revokeObjectURL(url);

    toast.success("Downloaded .env file");
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Export</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preview and export your .env file
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMasked(!masked)}
          >
            {masked ? (
              <Eye className="h-4 w-4 mr-1" />
            ) : (
              <EyeOff className="h-4 w-4 mr-1" />
            )}
            {masked ? "Reveal" : "Mask"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>

          <Button size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <pre className="bg-terminal-bg text-terminal-text p-4 rounded-lg font-mono text-xs leading-relaxed overflow-auto border border-border">
        {loading
          ? "Loading secrets..."
          : envContent || "# No secrets to export"}
      </pre>
    </div>
  );
}