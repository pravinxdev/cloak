import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertTriangle, Loader } from "lucide-react";

export default function RecoveryPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovered, setRecovered] = useState(false);

  const handleRecover = async () => {
    if (!oldPassword.trim()) {
      toast.error("Please enter your old password");
      return;
    }

    try {
      setLoading(true);
      
      const res = await fetch("/api/recover-vaults", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Recovery failed");
      }

      // Show results
      if (data.vaultsRecovered > 0) {
        toast.success(`✅ Successfully recovered ${data.vaultsRecovered} vault(s)!`);
        setRecovered(true);
        setOldPassword("");
        
        // Reload page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.info("ℹ️ All vaults are already using the current password");
        setRecovered(true);
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err: any) {
      toast.error(err.message || "Recovery failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Vault Recovery
          </CardTitle>
          <CardDescription>
            Your vaults need to be updated to use your new password
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="bg-warning/10 border-warning/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              After changing your password, some vaults couldn't be updated. 
              Enter your <strong>OLD password</strong> to recover them.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Old Password</label>
            <Input
              type="password"
              placeholder="Enter your old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={loading || recovered}
              onKeyDown={(e) => e.key === "Enter" && handleRecover()}
              className="bg-secondary border-border"
            />
          </div>

          <Button 
            onClick={handleRecover} 
            disabled={loading || recovered}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Recovering...
              </>
            ) : recovered ? (
              "✓ Recovery Complete"
            ) : (
              "Recover Vaults"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your old password will only be used to re-encrypt your vaults.
            It won't be stored.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
