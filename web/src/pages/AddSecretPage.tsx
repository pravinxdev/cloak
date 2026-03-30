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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/services/api";

export default function AddSecretPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const existing = location.state?.secret;
  const isEdit = !!existing;

  const [key, setKey] = useState(existing?.key || "");
  const [value, setValue] = useState(existing?.value || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!key.trim() || !value.trim()) {
      toast.error("Both key and value are required");
      return;
    }

    try {
      setLoading(true);

      // 🔥 if key changed → delete old key
      if (isEdit && existing.key !== key) {
        await api.deleteSecret(existing.key);
      }

      // 🔥 add / update
      await api.addSecret(key, value);

      toast.success(isEdit ? "Secret updated" : "Secret added");

      navigate("/", { state: { refresh: true } });

    } catch (err: any) {
      console.error(err);

      // 🔥 message comes from api.ts
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
            ? "Update the key-value pair below."
            : "Add a new key-value pair to your vault."}
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
                  .toUpperCase()
                  .replace(/[^A-Z0-9_]/g, "")
              )
            }
            className="bg-secondary border-border font-mono text-sm"
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading
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