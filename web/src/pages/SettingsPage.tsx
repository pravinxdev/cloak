import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const { logout, secrets } = useApp();

  const handleClearVault = () => {
    toast.error("This is a placeholder — vault not actually cleared");
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your session and vault</p>
      </div>

      <div className="border border-border rounded-lg divide-y divide-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Session</p>
            <p className="text-xs text-muted-foreground">Logged in • {secrets.length} secrets loaded</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Clear Vault</p>
            <p className="text-xs text-muted-foreground">Remove all secrets permanently</p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleClearVault}>Clear</Button>
        </div>
      </div>
    </div>
  );
}
