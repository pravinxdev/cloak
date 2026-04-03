import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decryptValue } from "@/utils/decrypt";
import {
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api, SecretData } from "@/services/api";
import { ExpirationIndicator } from "@/components/ExpirationIndicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";

export default function SecretsPage() {
  const navigate = useNavigate();
  const appContext = useApp();

  const [secrets, setSecrets] = useState<SecretData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({});
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedEnv, setSelectedEnv] = useState<string>(appContext?.activeEnvironment || "");

  // ✅ fetch secrets
  const fetchSecrets = async () => {
    try {
      setLoading(true);
      const data = await api.getSecrets();
      console.log(`📝 Loaded ${Array.isArray(data) ? data.length : 0} secrets`);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`   First secret:`, data[0]);
      }
      setSecrets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load secrets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, []);

  // 🌍 Update selectedEnv when active environment changes
  useEffect(() => {
    if (appContext?.activeEnvironment) {
      setSelectedEnv(appContext.activeEnvironment);
    }
  }, [appContext?.activeEnvironment]);

  // ✅ Get unique tags and environments
  const allTags = Array.from(
    new Set(secrets.flatMap((s) => s.tags || []).filter(tag => tag && tag.trim()))
  ).sort();
  
  // 🌍 Get all environments from appContext (API), not just from secrets
  const allEnvs = appContext?.environments?.map(e => e.name) || [];

  // ✅ filter
  const filtered = secrets.filter((s) => {
    const matchesSearch = s.key
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesTag = !selectedTag || (s.tags || []).includes(selectedTag);
    const matchesEnv =
      selectedEnv === "__all__" || !selectedEnv || (s.environment || "default") === selectedEnv;
    return matchesSearch && matchesTag && matchesEnv;
  });
console.log(filtered)
  // ✅ toggle reveal - decrypt locally using session key
  const toggleReveal = async (key: string, encryptedValue: string) => {
    console.log(`🔍 Toggle reveal for key: ${key}`);
    console.log(`   Encrypted value: ${encryptedValue}`);
    console.log(`   Session key available: ${!!appContext?.sessionKey}`);
    
    // If already revealed, just hide it
    if (revealed.has(key)) {
      setRevealed((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      return;
    }

    // If not revealed yet, decrypt the value locally
    try {
      if (!appContext?.sessionKey) {
        throw new Error("Session key not available");
      }

      const decrypted = await decryptValue(encryptedValue, appContext.sessionKey);
      console.log(`   ✅ Decrypted successfully: ${decrypted}`);
      setDecryptedValues((prev) => ({ ...prev, [key]: decrypted }));
      setRevealed((prev) => new Set([...prev, key]));
    } catch (err: any) {
      console.error(`❌ Decryption failed:`, err);
      toast.error("Failed to decrypt secret");
      console.error(err);
    }
  };

  // ✅ copy - decrypt locally and copy to clipboard
  const copyValue = async (key: string, encryptedValue: string) => {
    try {
      // If already decrypted, use cached value
      let valueToCopy = decryptedValues[key];
      
      // If not cached, decrypt it locally
      if (!valueToCopy) {
        if (!appContext?.sessionKey) {
          throw new Error("Session key not available");
        }

        valueToCopy = await decryptValue(encryptedValue, appContext.sessionKey);
        setDecryptedValues((prev) => ({ ...prev, [key]: valueToCopy }));
      }

      navigator.clipboard.writeText(valueToCopy);
      toast.success("Copied to clipboard");
    } catch (err: any) {
      toast.error("Failed to copy secret");
      console.error(err);
    }
  };

  // ✅ delete
  const confirmDelete = async () => {
    if (!deleteKey) return;

    try {
      await api.deleteSecret(deleteKey);
      setSecrets((prev) => prev.filter((s) => s.key !== deleteKey));
      toast.success("Secret deleted");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete");
    } finally {
      setOpenDialog(false);
      setDeleteKey(null);
    }
  };

  return (
    <div className="max-w-full space-y-4">

      {/* Search + Add */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search secrets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>

        <Button onClick={() => navigate("/add")} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Secret
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        {allTags.length > 0 && (
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-auto min-w-[150px]">
              <SelectValue placeholder="Filter by tag..." />
            </SelectTrigger>
            <SelectContent>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {allEnvs.length > 0 && (
          <Select value={selectedEnv} onValueChange={setSelectedEnv}>
            <SelectTrigger className="w-auto min-w-[150px]">
              <SelectValue placeholder="Filter by environment..." />
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
        )}

        {(selectedTag || selectedEnv) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTag("");
              setSelectedEnv("");
            }}
            className="text-xs"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3">Key</th>
              <th className="text-left px-4 py-3">Metadata</th>
              <th className="text-left px-4 py-3">Value</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  Loading secrets...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  No secrets found
                </td>
              </tr>
            ) : (
              filtered.map((secret) => (
                <tr key={secret.key} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{secret.key}</td>

                  <td className="px-4 py-3 text-xs space-y-1">
                    {/* Tags */}
                    {secret.tags && secret.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {secret.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Environment */}
                    {(secret.environment || "default") && (
                      <div className="text-muted-foreground">
                        Env: <kbd className="rounded bg-muted px-1 text-xs">{secret.environment || "default"}</kbd>
                      </div>
                    )}

                    {/* Expiration */}
                    {secret.expiresAt && (
                      <div>
                        <ExpirationIndicator expiresAt={secret.expiresAt} />
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {revealed.has(secret.key)
                      ? decryptedValues[secret.key] || "***"
                      : "•".repeat(Math.min(secret.value.length, 24))}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">

                      <Button size="icon" variant="ghost" onClick={() => toggleReveal(secret.key, secret.value)}>
                        {revealed.has(secret.key) ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>

                      <Button size="icon" variant="ghost" onClick={() => copyValue(secret.key, secret.value)}>
                        <Copy size={14} />
                      </Button>

                      <Button size="icon" variant="ghost" onClick={() => navigate("/add", { state: { secret } })}>
                        <Pencil size={14} />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          setDeleteKey(secret.key);
                          setOpenDialog(true);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Secret</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-mono font-semibold">{deleteKey}</span>?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>

            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Count */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} secret{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}