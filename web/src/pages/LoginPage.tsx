// import { useState } from "react";
// import { useApp } from "@/contexts/AppContext";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { KeyRound } from "lucide-react";

// export default function LoginPage() {
//   const { login } = useApp();
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(false);

//   // const handleSubmit = (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   if (!login(password)) {
//   //     setError(true);
//   //   }
//   // };
// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   try {
//     const res = await fetch('/api/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ password }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.error || 'Login failed');
//     }

//     // ✅ mark logged in
//     localStorage.setItem('cloakx_logged_in', 'true');

//     // ✅ update app state
//     login(password);

//   } catch (err) {
//     setError(true);

//     // ✅ popup message
//     alert('❌ Wrong password');
//   }
// };
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background p-4">
//       <div className="w-full max-w-sm animate-fade-in">
//         <div className="flex flex-col items-center mb-8">
//           <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
//             <KeyRound className="h-5 w-5 text-foreground" />
//           </div>
//           <h1 className="text-xl font-semibold tracking-tight">Cloakx</h1>
//           <p className="text-sm text-muted-foreground mt-1">Enter your vault password</p>
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <Input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => { setPassword(e.target.value); setError(false); }}
//             className="bg-secondary border-border"
//             autoFocus
//           />
//           {error && (
//             <p className="text-xs text-destructive">Invalid password</p>
//           )}
//           <Button type="submit" className="w-full">
//             Unlock
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";

export default function LoginPage() {
  const { login, fetchSessionKey } = useApp();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for cookies/session
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ persist login
      localStorage.setItem("cloakx_logged_in", "true");

      // ✅ update app state
      login();
      console.log('✅ Logged in, updating app state');

      // ✅ fetch session key for frontend decryption
      console.log('🔑 Fetching session key...');
      await fetchSessionKey();
      console.log('✅ Session key fetched and stored in context');

    } catch (err: any) {
      setError(err.message || "Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
            <KeyRound className="h-5 w-5 text-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Cloakx</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your vault password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className="bg-secondary border-border"
            autoFocus
          />

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Unlocking..." : "Unlock"}
          </Button>
        </form>
      </div>
    </div>
  );
}