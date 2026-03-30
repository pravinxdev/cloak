import { Command } from "commander";
import express from "express";
import path from "path";
import { execSync } from "child_process";
import { loadVault, saveVault } from "../utils/vault";
import { encrypt, decrypt } from "../utils/crypto";
import { getSessionKey } from "../utils/session";
import authRouter from "../../server/routes/auth";
import open from "open";

export function webCommand() {
  const cmd = new Command("web");

  cmd.description("Start Cloakx Web UI");

  cmd.action(() => {
    const app = express();
    const PORT = 3000;

    try {
      console.log("⚙️ Building frontend...");
      execSync("npm run build", {
        cwd: path.join(process.cwd(), "web"),
        // stdio: "inherit",
        stdio: "ignore",
      });
      console.log("✅ Build completed");
    } catch (err) {
      console.error("❌ Frontend build failed");
      process.exit(1);
    }

    // ✅ Middleware
    app.use(express.json());

    // ✅ API routes
    app.use("/api", authRouter);

    // 🔐 Get secrets
    app.get("/api/secrets", (req, res) => {
      try {
        const key = getSessionKey();
        const vault = loadVault();

        const data = Object.keys(vault).map((k) => ({
          key: k,
          value: decrypt(vault[k], key),
        }));

        res.json(data);
      } catch {
        res.status(401).json({ error: "Not logged in" });
      }
    });

    // 🧨 Clear all secrets
    app.delete("/api/secrets", (req, res) => {
      try {
        getSessionKey();

        saveVault({}); // 🔥 clear everything

        res.json({ success: true });
      } catch {
        res.status(401).json({ error: "Not logged in" });
      }
    });

    // ➕ Add / update secret
    app.post("/api/secrets", (req, res) => {
      try {
        const keyBuf = getSessionKey();
        const { key, value } = req.body;

        if (!key || !value) {
          return res.status(400).json({ error: "Key and value required" });
        }

        const vault = loadVault();
        vault[key] = encrypt(value, keyBuf);
        saveVault(vault);

        res.json({ success: true });
      } catch {
        res.status(401).json({ error: "Not logged in" });
      }
    });

    // ❌ Delete secret
    app.delete("/api/secrets/:key", (req, res) => {
      try {
        getSessionKey();
      } catch {
        return res.status(401).json({ error: "Not logged in" });
      }

      const vault = loadVault();
      const keyName = req.params.key;

      if (!vault[keyName]) {
        return res.status(404).json({ error: "Key not found" });
      }

      delete vault[keyName];
      saveVault(vault);

      res.json({ success: true });
    });

    // ✅ Serve frontend (after APIs)
    const distPath = path.join(process.cwd(), "web", "dist");
    app.use(express.static(distPath));

    // 🔁 SPA fallback (important for React Router)
    app.use((req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    app.listen(PORT, () => {
      console.log(`🌐 Cloakx UI running at http://localhost:${PORT}`);
      open(`http://localhost:${PORT}`)
    });
  });

  return cmd;
}