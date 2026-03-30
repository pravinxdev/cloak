import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/services/api";

export default function SettingsPage() {
  const { logout } = useApp();

  const [count, setCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ fetch count
  const fetchSecrets = async () => {
    try {
      const data = await api.getSecrets();
      setCount(Array.isArray(data) ? data.length : 0);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load secrets");
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, []);

  // ✅ clear vault
  const handleClearVault = async () => {
    try {
      setLoading(true);

      await api.clearVault();

      setCount(0);

      toast.success("Vault cleared successfully");

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to clear vault");
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your session and vault
        </p>
      </div>

      <div className="border border-border rounded-lg divide-y divide-border">

        {/* Session */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Session</p>
            <p className="text-xs text-muted-foreground">
              Logged in • {count} secrets loaded
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* Clear Vault */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Clear Vault</p>
            <p className="text-xs text-muted-foreground">
              Remove all secrets permanently
            </p>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setOpenDialog(true)}
          >
            Clear
          </Button>
        </div>

      </div>

      {/* 🔥 Confirmation Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Vault</DialogTitle>
            <DialogDescription>
              This will permanently delete all secrets. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setOpenDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleClearVault}
              disabled={loading}
            >
              {loading ? "Clearing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}