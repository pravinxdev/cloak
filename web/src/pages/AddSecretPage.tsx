// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useNavigate, useLocation } from "react-router-dom";
// import { toast } from "sonner";

// export default function AddSecretPage() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // 🔥 get secret from navigation (for edit)
//   const existing = location.state?.secret;

//   const isEdit = !!existing;

//   const [key, setKey] = useState(existing?.key || "");
//   const [value, setValue] = useState(existing?.value || "");
//   const [loading, setLoading] = useState(false);

//   // ✅ submit (ADD + EDIT both use POST)
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!key.trim() || !value.trim()) {
//       toast.error("Both key and value are required");
//       return;
//     }

//     try {
//       setLoading(true);

//       // 🔥 if key changed → delete old key first
//       if (isEdit && existing.key !== key) {
//         await fetch(`/api/secrets/${existing.key}`, {
//           method: "DELETE",
//           credentials: "include",
//         });
//       }

//       // 🔥 POST handles both add + update
//       const res = await fetch("/api/secrets", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ key, value }),
//       });

//       if (!res.ok) {
//         throw new Error("Save failed");
//       }

//       toast.success(isEdit ? "Secret updated" : "Secret added");

//       // 🔥 go back and refresh list
//       navigate("/", { state: { refresh: true } });

//     } catch (err) {
//       console.error(err);
//       toast.error("Save failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg space-y-6">

//       {/* Header */}
//       <div>
//         <h2 className="text-lg font-semibold">
//           {isEdit ? "Edit Secret" : "Add Secret"}
//         </h2>
//         <p className="text-sm text-muted-foreground mt-1">
//           {isEdit
//             ? "Update the key-value pair below."
//             : "Add a new key-value pair to your vault."}
//         </p>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="space-y-4">

//         {/* Key */}
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Key</label>
//           <Input
//             placeholder="e.g. DATABASE_URL"
//             value={key}
//             onChange={(e) =>
//               setKey(
//                 e.target.value
//                   .toUpperCase()
//                   .replace(/[^A-Z0-9_]/g, "")
//               )
//             }
//             className="bg-secondary border-border font-mono text-sm"
//             disabled={loading}
//           />
//         </div>

//         {/* Value */}
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Value</label>
//           <Input
//             placeholder="e.g. postgres://..."
//             value={value}
//             onChange={(e) => setValue(e.target.value)}
//             className="bg-secondary border-border font-mono text-sm"
//             disabled={loading}
//           />
//         </div>

//         {/* Actions */}
//         <div className="flex gap-2">
//           <Button type="submit" disabled={loading}>
//             {loading
//               ? "Saving..."
//               : isEdit
//               ? "Update"
//               : "Save"}
//           </Button>

//           <Button
//             type="button"
//             variant="ghost"
//             onClick={() => navigate("/")}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/services/api";
import { TagInput } from "@/components/TagInput";
import { EnvironmentSelector } from "@/components/EnvironmentSelector";
import { ExpirationPicker } from "@/components/ExpirationPicker";
import { useApp } from "@/contexts/AppContext";
import { decryptValue } from "@/utils/decrypt";

export default function AddSecretPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const appContext = useApp();

  const existing = location.state?.secret;
  const isEdit = !!existing;

  // 🔥 Extract base key from composite key (e.g., "TESTINGNEW@production" -> "TESTINGNEW")
  const baseKey = existing?.key ? existing.key.split('@')[0] : '';
  const existingEnv = existing?.environment || "default";

  const [key, setKey] = useState(baseKey);
  const [value, setValue] = useState("");
  const [tags, setTags] = useState<string[]>(existing?.tags || []);
  const [environment, setEnvironment] = useState(existingEnv);
  const [expires, setExpires] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [decrypting, setDecrypting] = useState(isEdit); // 🔐 Track if still decrypting

  // 🌍 Auto-select active environment on mount (only for new secrets)
  useEffect(() => {
    if (!isEdit && appContext?.activeEnvironment && environment === "default") {
      setEnvironment(appContext.activeEnvironment);
    }
  }, [isEdit, appContext?.activeEnvironment]);

  // 🔐 Decrypt value when editing
  useEffect(() => {
    if (!isEdit || !existing?.value || !appContext?.sessionKey) {
      setDecrypting(false);
      return;
    }

    const decryptExistingValue = async () => {
      try {
        const decrypted = await decryptValue(existing.value, appContext.sessionKey);
        setValue(decrypted);
        
        // 🔥 Also load expiration when editing
        if (existing.expiresAt) {
          setExpires(existing.expiresAt.toString());
        }
      } catch (err: any) {
        console.error("Failed to decrypt value:", err);
        toast.error("Failed to decrypt secret value");
      } finally {
        setDecrypting(false);
      }
    };

    decryptExistingValue();
  }, [isEdit, existing?.value, existing?.expiresAt, appContext?.sessionKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!key.trim() || !value.trim()) {
      toast.error("Both key and value are required");
      return;
    }

    try {
      setLoading(true);

      // 🔥 if key changed → delete old key from any environment
      if (isEdit && baseKey !== key) {
        await api.deleteSecret(baseKey);
      }

      // 🔥 if environment changed during edit → delete from old environment first
      // But ignore "key not found" errors since it might already be moved
      if (isEdit && baseKey === key && existingEnv !== environment) {
        try {
          await api.deleteSecret(baseKey);
        } catch (err: any) {
          // Ignore "key not found" error - it's OK if the secret was already moved
          if (!err.message?.includes("not found")) {
            throw err;
          }
        }
      }

      // 🔥 add / update with metadata
      const metadata = {
        tags: tags.length > 0 ? tags : undefined,
        environment: environment,
        expires: expires || undefined,
      };

      
      await api.addSecret(key, value, metadata);

      toast.success(isEdit ? "Secret updated" : "Secret added");

      navigate("/", { state: { refresh: true } });

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Save failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">
          {isEdit ? "Edit Secret" : "Add Secret"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isEdit
            ? "Update the key-value pair and metadata below."
            : "Add a new key-value pair to your vault with optional metadata."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Key */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Key</label>
          <Input
            placeholder="e.g. DATABASE_URL"
            value={key}
            onChange={(e) =>
              setKey(
                e.target.value
                  .replace(/[^a-zA-Z0-9_-]/g, "")
              )
            }
            className="bg-secondary border-border font-mono text-sm"
            disabled={loading || isEdit}
            title={isEdit ? "Key cannot be changed during edit" : ""}
          />
        </div>

        {/* Value */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Value</label>
          <Input
            placeholder="e.g. postgres://..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-secondary border-border font-mono text-sm"
            disabled={loading || decrypting}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium"></label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {/* Environment */}
        <div className="space-y-2">
          <label className="text-sm font-medium"></label>
          <EnvironmentSelector 
            value={environment} 
            onChange={setEnvironment}
            environments={appContext?.environments?.map(e => e.name) || ["default"]}
          />
        </div>

        {/* Expiration */}
        <div className="space-y-2">
          <label className="text-sm font-medium"></label>
          <ExpirationPicker value={expires} onChange={setExpires} />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading || decrypting}>
            {decrypting
              ? "Decrypting..."
              : loading
              ? "Saving..."
              : isEdit
              ? "Update"
              : "Save"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}