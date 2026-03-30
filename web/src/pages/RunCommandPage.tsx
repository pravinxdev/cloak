import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play } from "lucide-react";

export default function RunCommandPage() {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    if (!command.trim()) return;
    setRunning(true);
    setOutput((prev) => [...prev, `$ ${command}`, "Loading environment variables..."]);

    setTimeout(() => {
      setOutput((prev) => [
        ...prev,
        "✓ 5 secrets injected",
        `Running: ${command}`,
        "",
        "> Ready on http://localhost:3000",
        "",
      ]);
      setRunning(false);
    }, 1500);
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Run Command</h2>
        <p className="text-sm text-muted-foreground mt-1">Execute a command with secrets injected</p>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="e.g. npm start"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRun()}
          className="bg-secondary border-border font-mono text-sm"
        />
        <Button onClick={handleRun} disabled={running} size="sm">
          <Play className="h-4 w-4 mr-1" /> Run
        </Button>
      </div>
      <div className="bg-terminal-bg border border-border rounded-lg p-4 min-h-[300px] font-mono text-xs text-terminal-text overflow-auto">
        {output.length === 0 ? (
          <span className="text-muted-foreground">Output will appear here...</span>
        ) : (
          output.map((line, i) => (
            <div key={i} className={line.startsWith("$") ? "text-foreground" : line.startsWith("✓") ? "text-success" : ""}>
              {line || "\u00A0"}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
