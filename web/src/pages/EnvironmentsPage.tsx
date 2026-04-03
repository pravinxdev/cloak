import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, Loader } from "lucide-react";
import { toast } from "sonner";

export default function EnvironmentsPage() {
  const { environments, switchEnvironment, addEnvironment } = useApp();
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    
    try {
      setLoading(true);
      await addEnvironment(newName.toLowerCase().replace(/\s+/g, "-"));
      toast.success(`Environment "${newName}" created`);
      setNewName("");
      setShowAdd(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create environment");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async (envId: string) => {
    try {
      setLoading(true);
      await switchEnvironment(envId);
      const env = environments.find(e => e.id === envId);
      toast.success(`Switched to ${env?.name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to switch environment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Environments</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your environments</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)} disabled={loading}>
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
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button size="sm" onClick={handleAdd} disabled={loading}>
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Create"}
          </Button>
        </div>
      )}

      <div className="border border-border rounded-lg divide-y divide-border">
        {environments.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            No environments yet
          </div>
        ) : (
          environments.map((env) => (
            <div key={env.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{env.name}</span>
                {env.active && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">active</span>
                )}
              </div>
              {!env.active && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSwitch(env.id)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" /> Switch
                    </>
                  )}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
