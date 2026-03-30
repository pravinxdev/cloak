import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Copy, Download, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";

export default function ExportPage() {
  const { secrets } = useApp();
  const [masked, setMasked] = useState(true);

  const envContent = secrets
    .map((s) => `${s?.key || "Unknown"}=${masked ? "••••••••" : s.value}`)
    .join("\n");

  const rawContent = secrets.map((s) => `${s?.key || "Unknown"}=${s.value}`).join("\n");

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
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Export</h2>
          <p className="text-sm text-muted-foreground mt-1">Preview and export your .env file</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMasked(!masked)}>
            {masked ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
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
      <pre className="bg-terminal-bg text-terminal-text p-4 rounded-lg font-mono text-xs leading-relaxed overflow-auto border border-border">
        {envContent || "# No secrets to export"}
      </pre>
    </div>
  );
}
