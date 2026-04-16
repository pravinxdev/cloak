import { Command } from "commander";
import express from "express";
import path from "path";
import { execSync } from "child_process";
import cors from "cors";
import authRouter from "../../server/routes/auth";
import secretsRouter from "../../server/routes/secrets";
import vaultRouter from "../../server/routes/vault";
import { getSessionKey } from "../utils/session";
import open from "open";
import { createServer } from "http";
import net from "net";

// 🔧 Helper function to check if port is available
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// 🔧 Helper function to find available port
async function findAvailablePort(startPort: number, endPort: number): Promise<number | null> {
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null;
}

export function webCommand() {
  const cmd = new Command("web");

  cmd.description("Start Cloakx Web UI");

  cmd.action(async () => {
    const app = express();
    let PORT = 1201;  // Frontend port (less commonly used)

    // 🔍 Determine where to serve frontend from
    const fs = require("fs");
    let distPath: string | null = null;

    // 1. Check if public folder exists (production npm package)
    const publicPath = path.join(__dirname, "..", "..", "public");
    if (fs.existsSync(publicPath)) {
      distPath = publicPath;
      console.log("✅ Using pre-built web assets (production mode)");
    }

    // 2. Check if web/dist exists (development with built web)
    const webDistPath = path.join(process.cwd(), "web", "dist");
    if (!distPath && fs.existsSync(webDistPath)) {
      distPath = webDistPath;
      console.log("✅ Using web/dist (development mode)");
    }

    // 3. If neither exists and web folder is available, build it
    if (!distPath) {
      const webPath = path.join(process.cwd(), "web");
      if (fs.existsSync(path.join(webPath, "package.json"))) {
        console.log("📦 Installing web dependencies...");
        try {
          execSync("npm install", {
            cwd: webPath,
            stdio: "inherit",
          });
          console.log("✅ Dependencies installed");
        } catch (err) {
          console.error("⚠️  Warning: Could not install web dependencies");
        }

        try {
          console.log("⚙️ Building frontend...");
          execSync("npm run build", {
            cwd: webPath,
            stdio: "inherit",
          });
          console.log("✅ Build completed");
          distPath = webDistPath;
        } catch (err) {
          console.error("❌ Frontend build failed");
          process.exit(1);
        }
      } else {
        console.error("❌ Web frontend not found");
        console.error("   This likely means cloakx was not installed correctly.");
        console.error("   Try reinstalling: npm install -g cloakx@latest");
        process.exit(1);
      }
    }

    if (!distPath) {
      console.error("❌ Could not determine web frontend location");
      process.exit(1);
    }

    // 🔧 Check if port is available
    const portAvailable = await isPortAvailable(PORT);
    if (!portAvailable) {
      console.warn(`⚠️  Port ${PORT} is already in use. Searching for available port...`);
      const availablePort = await findAvailablePort(1202, 1210);
      if (availablePort) {
        PORT = availablePort;
        console.log(`✅ Using port ${PORT} instead`);
      } else {
        console.error(`❌ Could not find available port between 1202-1210`);
        console.error(`   Make sure no other services are running on ports 1201-1210`);
        console.error(`   Or kill existing processes: pkill -f "node\|npm" on Unix`);
        console.error(`   Or on Windows: taskkill /IM node.exe /F`);
        process.exit(1);
      }
    }

    // ✅ Middleware
    app.use(cors({
      origin: ["http://127.0.0.1:1201"],
      credentials: true,
    }));
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ limit: "1mb" }));

    // 🔐 Authentication middleware for protected routes
    function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
      try {
        getSessionKey();
        next();
      } catch (err: any) {
        res.status(401).json({ error: err.message || "Unauthorized" });
      }
    }

    // ✅ API routes
    // Auth routes (no auth required)
    app.use("/api", authRouter as any);

    // Protected routes (require auth)
    app.use("/api/secrets", requireAuth, secretsRouter as any);
    app.use("/api", requireAuth, vaultRouter as any);

    // ✅ Serve frontend (after APIs)
    app.use(express.static(distPath));

    // 🔁 SPA fallback (important for React Router)
    app.use((req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    // 🛠️ Error handling for middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error("❌ Server error:", err.message);
      res.status(500).json({ error: "Internal server error" });
    });

    const server = app.listen(PORT, () => {
      console.log(`\n🌐 Cloakx Web UI is running!`);
      console.log(`   📱 Frontend URL: http://127.0.0.1:${PORT}`);
      console.log(`   🔗 Backend API: http://127.0.0.1:2000`);
      console.log(`   🎯 Both services integrated on this server`);
      console.log(`   Press Ctrl+C to stop\n`);
      
      // Auto-open browser
      open(`http://127.0.0.1:${PORT}`);
    });

    // 🛑 Graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Stopping Cloakx Web UI...");
      server.close(() => {
        console.log("✅ Server stopped");
        process.exit(0);
      });
      // Force exit after 5 seconds
      setTimeout(() => {
        console.error("⚠️  Force closing server...");
        process.exit(1);
      }, 5000);
    });

    // 🔴 Handle server errors
    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n❌ Cannot start server on port ${PORT}: Port is already in use`);
        console.error(`   Some process is already listening on port ${PORT}:0`);
        console.error(`\n   Try one of these solutions:`);
        console.error(`   • Close the application using this port`);
        console.error(`   • Kill the process on Windows: taskkill /IM node.exe /F`);
        console.error(`   • Kill the process on Mac/Linux: pkill -f node`);
        console.error(`   • Use a different port: modify PORT variable in src/commands/web.ts`);
      } else if (err.code === "EACCES") {
        console.error(`\n❌ Permission denied: Cannot listen on port ${PORT}`);
        console.error(`   Try using a port above 1024 or run with elevated privileges`);
      } else {
        console.error(`\n❌ Server error: ${err.message}`);
      }
      process.exit(1);
    });
  });

  return cmd;
}