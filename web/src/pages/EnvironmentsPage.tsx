import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";

export default function EnvironmentsPage() {
  const { environments, switchEnvironment, addEnvironment } = useApp();
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addEnvironment(newName.toLowerCase().replace(/\s+/g, "-"));
    toast.success(`Environment "${newName}" created`);
    setNewName("");
    setShowAdd(false);
  };

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Environments</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your environments</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      {showAdd && (
        <div className="flex gap-2 animate-fade-in">
          <Input
            placeholder="Environment name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-secondary border-border text-sm"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button size="sm" onClick={handleAdd}>Create</Button>
        </div>
      )}

      <div className="border border-border rounded-lg divide-y divide-border">
        {environments.map((env) => (
          <div key={env.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{env.name}</span>
              {env.active && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">active</span>
              )}
            </div>
            {!env.active && (
              <Button variant="ghost" size="sm" onClick={() => { switchEnvironment(env.id); toast.success(`Switched to ${env.name}`); }}>
                <Check className="h-3.5 w-3.5 mr-1" /> Switch
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
