import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Secret {
  id: string;
  key: string;
  value: string;
}

export default function SecretsPage() {
  const navigate = useNavigate();

  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  // ✅ fetch secrets
  useEffect(() => {
    const fetchSecrets = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/secrets", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        console.log("API RESPONSE:", data);

        // 🔥 handle different response formats
        if (Array.isArray(data)) {
          setSecrets(data);
        } else if (data.data) {
          setSecrets(data.data);
        } else if (data.secrets) {
          setSecrets(data.secrets);
        } else {
          setSecrets([]);
        }

      } catch (err) {
        console.error(err);
        toast.error("Failed to load secrets");
      } finally {
        setLoading(false);
      }
    };

    fetchSecrets();
  }, []);

  // ✅ filter
  const filtered = secrets.filter((s) =>
    s.key.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ toggle reveal
  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ✅ copy
  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };
  const confirmDelete = async () => {
    if (!deleteKey) return;

    try {
      const res = await fetch(`/api/secrets/${deleteKey}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete failed");

      setSecrets((prev) => prev.filter((s) => s.key !== deleteKey));

      toast.success("Secret deleted");

    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    } finally {
      setOpenDialog(false);
      setDeleteKey(null);
    }
  };
  return (
    <div className="max-w-full space-y-4">

      {/* 🔍 Search + Add */}
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

      {/* 📋 Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3">Key</th>
              <th className="text-left px-4 py-3">Value</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center">
                  Loading secrets...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center">
                  No secrets found
                </td>
              </tr>
            ) : (
              filtered.map((secret) => (
                <tr key={secret.key} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{secret.key}</td>

                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {revealed.has(secret.key)
                      ? secret.value
                      : "•".repeat(Math.min(secret.value.length, 24))}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">

                      <Button size="icon" variant="ghost" onClick={() => toggleReveal(secret.key)}>
                        {revealed.has(secret.key) ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>

                      <Button size="icon" variant="ghost" onClick={() => copyValue(secret.value)}>
                        <Copy size={14} />
                      </Button>

                      <Button size="icon" variant="ghost" onClick={() => navigate("/edit/", { state: { secret } })}>
                        <Pencil size={14} />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          setDeleteKey(secret.key);
                          setOpenDialog(true);
                        }}                      >
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
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Secret</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-mono font-semibold">
                {deleteKey}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setOpenDialog(false)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 🔢 Count */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} secret{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}