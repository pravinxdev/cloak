import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const { logout } = useApp();

  const [count, setCount] = useState(0);

  // ✅ fetch count
  useEffect(() => {
    const fetchSecrets = async () => {
      try {
        const res = await fetch("/api/secrets", {
          credentials: "include",
        });

        const data = await res.json();

        const secrets = Array.isArray(data)
          ? data
          : data.data || data.secrets || [];

        setCount(secrets.length);

      } catch (err) {
        console.error(err);
      }
    };

    fetchSecrets();
  }, []);

  const handleClearVault = () => {
    toast.error("This is a placeholder — vault not actually cleared");
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
            onClick={handleClearVault}
          >
            Clear
          </Button>
        </div>

      </div>
    </div>
  );
}