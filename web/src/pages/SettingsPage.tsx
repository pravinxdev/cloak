import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Lock, LogOut, Trash2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const { logout } = useApp();

  const [count, setCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const validatePasswords = () => {
    const errors: Record<string, string> = {};

    if (!oldPassword) errors.oldPassword = "Current password is required";
    if (!newPassword) errors.newPassword = "New password is required";
    if (!confirm) errors.confirm = "Please confirm your password";
    if (newPassword && newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    if (newPassword && confirm && newPassword !== confirm) {
      errors.confirm = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;

    try {
      setPasswordLoading(true);
      await api.changePassword(oldPassword, newPassword);
      
      toast.success("✅ Password changed successfully!");
      toast.info("🔐 Logging you out for security. Please login with your new password.");

      setOldPassword("");
      setNewPassword("");
      setConfirm("");
      setPasswordErrors({});

      // Logout user after password change
      setTimeout(() => {
        logout();
      }, 2500);

    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

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
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your vault and account preferences
        </p>
      </div>

      {/* Session Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            Session
          </CardTitle>
          <CardDescription>
            Manage your current session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Logged In</p>
              <p className="text-sm text-muted-foreground">
                {count} secret{count !== 1 ? 's' : ''} loaded
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your vault password to keep your secrets secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="old-password" className="text-sm font-medium">
              Current Password
            </label>
            <Input
              id="old-password"
              type="password"
              placeholder="Enter your current password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (passwordErrors.oldPassword) {
                  setPasswordErrors({ ...passwordErrors, oldPassword: "" });
                }
              }}
            />
            {passwordErrors.oldPassword && (
              <p className="text-xs text-red-500">{passwordErrors.oldPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-medium">
              New Password
            </label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordErrors.newPassword) {
                  setPasswordErrors({ ...passwordErrors, newPassword: "" });
                }
              }}
            />
            {passwordErrors.newPassword && (
              <p className="text-xs text-red-500">{passwordErrors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your new password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                if (passwordErrors.confirm) {
                  setPasswordErrors({ ...passwordErrors, confirm: "" });
                }
              }}
            />
            {passwordErrors.confirm && (
              <p className="text-xs text-red-500">{passwordErrors.confirm}</p>
            )}
          </div>

          <Button 
            onClick={handleChangePassword} 
            className="w-full"
            disabled={passwordLoading}
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Clear Vault Card */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            This action cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Clear Vault</p>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete all secrets from your vault
            </p>
            <Button
              variant="destructive"
              onClick={() => setOpenDialog(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Vault
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🔥 Confirmation Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Clear Vault
            </DialogTitle>
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
              {loading ? "Clearing..." : "Confirm Clear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}