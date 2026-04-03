import { Command } from "commander";
import express from "express";
import path from "path";
import { execSync } from "child_process";
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

    // ✅ Serve frontend (after APIs)
    const distPath = path.join(process.cwd(), "web", "dist");
    app.use(express.static(distPath));

    // 🔁 SPA fallback (important for React Router)
    app.use((req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    app.listen(PORT, () => {
      console.log(`🌐 Cloakx UI running at http://localhost:${PORT}`);
      open(`http://localhost:${PORT}`);
    });
  });

  return cmd;
}