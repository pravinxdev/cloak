import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import { Lock, LogOut, Trash2, AlertTriangle, Moon, Eye, Bell, Shield, Database, Info } from "lucide-react";

export default function SettingsPage() {
  const { logout } = useApp();
  const appContext = useApp();

  const [count, setCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [selectedClearEnv, setSelectedClearEnv] = useState<string>("__all__"); // 🗑️ For clear vault dialog

  // App info states
  const [appInfo, setAppInfo] = useState<any>(null);
  const [appInfoLoading, setAppInfoLoading] = useState(true);

  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Preferences states
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [hideValues, setHideValues] = useState(localStorage.getItem("cloakx_hide_values") !== "false");
  const [notifications, setNotifications] = useState(localStorage.getItem("cloakx_notifications") !== "false");
  const [autoLockTimeout, setAutoLockTimeout] = useState(localStorage.getItem("cloakx_auto_lock_timeout") || "15");

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

      setTimeout(() => {
        logout();
      }, 2500);

    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Preference handlers
  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    localStorage.setItem("theme", value ? "dark" : "light");
    if (value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(value ? "🌙 Dark mode enabled" : "☀️ Light mode enabled");
  };

  const handleHideValuesToggle = (value: boolean) => {
    setHideValues(value);
    localStorage.setItem("cloakx_hide_values", String(value));
    toast.success(value ? "✓ Values hidden by default" : "✓ Values visible by default");
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
    localStorage.setItem("cloakx_notifications", String(value));
    toast.success(value ? "🔔 Notifications enabled" : "🔕 Notifications disabled");
  };

  const handleAutoLockChange = (value: string) => {
    setAutoLockTimeout(value);
    localStorage.setItem("cloakx_auto_lock_timeout", value);
    toast.success(`⏱️ Auto-lock timeout set to ${value} minutes`);
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

  // ✅ fetch app info (version, encryption type, etc)
  const fetchAppInfo = async () => {
    try {
      setAppInfoLoading(true);
      const info = await api.getInfo();
      setAppInfo(info);
    } catch (err: any) {
      console.error('Failed to fetch app info:', err);
      setAppInfo(null);
    } finally {
      setAppInfoLoading(false);
    }
  };

  useEffect(() => {
    fetchSecrets();
    fetchAppInfo();
  }, []);

  // ✅ clear vault
  const handleClearVault = async () => {
    try {
      setLoading(true);

      // 🗑️ If "All Environments" is selected, pass undefined (clears all)
      // Otherwise, pass the specific environment name
      const environment = selectedClearEnv === "__all__" ? undefined : selectedClearEnv;
      await api.clearVault(environment);

      setCount(0);

      const msg = selectedClearEnv === "__all__"
        ? "All vaults cleared successfully"
        : `${selectedClearEnv} vault cleared successfully`;
      toast.success(msg);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to clear vault");
    } finally {
      setLoading(false);
      setOpenDialog(false);
      setSelectedClearEnv("__all__"); // Reset selection
    }
  };

  return (
    <div className="w-full h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your vault and account preferences</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Session Information
                </CardTitle>
                <CardDescription>Manage your current session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-xs text-green-600 dark:text-green-400">● Active</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Secrets Loaded</p>
                      <p className="text-xs text-muted-foreground">{count} secret{count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={logout} className="w-full gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Theme */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how you see Cloakx</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="text-base font-medium">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme for better visibility</p>
                  </div>
                  <Switch 
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={handleDarkModeToggle}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Privacy & Display
                </CardTitle>
                <CardDescription>Control how secrets are displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hide-values" className="text-base font-medium">Hide Values by Default</Label>
                    <p className="text-sm text-muted-foreground">Secrets hidden until you reveal them</p>
                  </div>
                  <Switch 
                    id="hide-values"
                    checked={hideValues}
                    onCheckedChange={handleHideValuesToggle}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Get alerts for important actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="text-base font-medium">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Alerts for copy, delete, and import actions</p>
                  </div>
                  <Switch 
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={handleNotificationsToggle}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Auto-Lock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Session Timeout
                </CardTitle>
                <CardDescription>Auto-logout after inactivity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auto-lock" className="text-sm font-medium">Timeout (minutes)</Label>
                  <select
                    id="auto-lock"
                    value={autoLockTimeout}
                    onChange={(e) => handleAutoLockChange(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="0">Never</option>
                  </select>
                  <p className="text-xs text-muted-foreground">Automatically logout when inactive</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your vault password to keep your secrets secure</CardDescription>
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

            {/* Danger Zone */}
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
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  About Cloakx
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-semibold">{appInfoLoading ? '...' : appInfo?.version || '1.0.0'}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Created by</p>
                    <p className="font-semibold">{appInfo?.author || 'Pravin'}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Encryption</p>
                    <p className="font-semibold">{appInfo?.encryption || 'AES-256-CBC'}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Key Derivation</p>
                    <p className="font-semibold">{appInfo?.keyDerivation || 'Scrypt'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Local Encryption</p>
                    <p className="text-muted-foreground">All data encrypted locally on your device</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">No Cloud Storage</p>
                    <p className="text-muted-foreground">Your secrets never leave your device</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Open Source</p>
                    <p className="text-muted-foreground">Code available on GitHub for transparency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 🔥 Confirmation Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Clear Vault
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all selected secrets. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {/* Environment Selection */}
          <div className="space-y-3 py-4">
            <label className="text-sm font-medium">Select Environment to Clear:</label>
            <Select value={selectedClearEnv} onValueChange={setSelectedClearEnv}>
              <SelectTrigger>
                <SelectValue placeholder="Select environment..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">
                  🔄 All Environments
                </SelectItem>
                {appContext?.environments?.map((env) => (
                  <SelectItem key={env.id} value={env.name}>
                    {env.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedClearEnv === "__all__"
                ? "This will clear secrets from all environments"
                : `This will clear secrets from the "${selectedClearEnv}" environment only`}
            </p>
          </div>

          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setOpenDialog(false);
                setSelectedClearEnv("__all__");
              }}
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