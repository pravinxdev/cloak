# 🔧 PORT CONFLICT TROUBLESHOOTING GUIDE

**Purpose:** Help users when `cloakx web`, `cloakx login`, or running servers have port conflicts

---

## 🔍 What Are Port Conflicts?

When you run `cloakx web` or the backend server, they need to "listen" on specific network ports:

```
Port 3000   ← Web UI (React frontend)
Port 8080   ← Backend API (Express server)
```

If another application is already using these ports, you'll get an error:

```
❌ Cannot start server on port 3000: Port is already in use
```

---

## 🚨 How to Detect Active Ports

### Windows (PowerShell)
```powershell
# See what's listening on port 3000
netstat -ano | findstr :3000

# See what's listening on port 8080
netstat -ano | findstr :8080

# Output example:
# TCP    127.0.0.1:3000    0.0.0.0:0    LISTENING    5432

# The last number (5432) is the Process ID (PID)
```

### Mac/Linux
```bash
# See what's listening on port 3000
lsof -i :3000

# See what's listening on port 8080
lsof -i :8080

# Output example:
# COMMAND  PID     USER   FD  TYPE  DEVICE SIZE/OFF NODE NAME
# node    5432   pravin    8u  IPv4   0xabc...  0t0  TCP *:3000 (LISTEN)
```

---

## ✅ SOLUTIONS

### Solution 1: Kill the Process Using the Port (Fastest ⚡)

#### Windows
```powershell
# Kill what's using port 3000
taskkill /IM node.exe /F

# Kill what's using port 8080
taskkill /IM node.exe /F

# Kill by specific PID (from netstat output above)
taskkill /PID 5432 /F
```

#### Mac/Linux
```bash
# Kill what's using port 3000
killall node

# OR kill by specific PID
kill -9 5432

# Kill all npm processes
pkill -f "npm"
```

### Solution 2: Use Different Ports (If You Can't Kill the Process)

#### For Web UI
Edit `src/commands/web.ts`:
```typescript
// Line 1: Change this
let PORT = 3000;

// To this:
let PORT = 3001;  // or any available port 3001-3010
```

Then rebuild:
```bash
npm run build
cloakx web  # Will now use port 3001
```

#### For Backend API
Edit `server/index.ts`:
```typescript
// Change this
const PORT = 8080;

// To this:
const PORT = 8888;  // or any available port
```

Then rebuild:
```bash
npm run build
npm start  # Will use new port
```

### Solution 3: Auto-Port Discovery (Recommended for Development)

The updated `cloakx web` now has **automatic port fallback**!

```bash
cloakx web
# If 3000 is in use, it will automatically try:
# ✅ Port 3001
# ✅ Port 3002
# ✅ Port 3003
# ... up to Port 3010

# Output will show:
# ⚠️  Port 3000 is already in use. Searching for available port...
# ✅ Using port 3001 instead
# 📱 URL: http://localhost:3001
```

---

## 📊 COMMON PORT CONFLICTS

### What Usually Takes These Ports?

**Port 3000:**
- Previous Cloakx Web session still running
- Other Node.js/React development servers
- Grafana, Stripe CLI, or other dev tools

**Port 8080:**
- Previous Cloakx API server still running
- Jenkins, Docker containers, or other services

### Quick Identification

```bash
# Windows: Who's using these ports?
netstat -ano

# Mac/Linux
lsof -i :3000
lsof -i :8080

# Or more detailed:
ps aux | grep node
ps aux | grep npm
```

---

## 🎬 STEP-BY-STEP RESOLUTION

### Scenario 1: Previous Session Still Running

```bash
# You see this error:
# ❌ Cannot start server on port 3000: Port is already in use

# Solution:
# 1. Check if you have another terminal with running process
#    (Look for terminal window saying "🌐 Cloakx UI running")

# 2. Kill all Node processes
taskkill /IM node.exe /F    # Windows
killall node                # Mac/Linux

# 3. Try again
cloakx web
# ✅ Should work now
```

### Scenario 2: Running in Docker or VM

```bash
# If running in Docker/container, ports might already be bound

# Docker: Map to different ports
docker run -p 3001:3000 -p 8081:8080 cloakx:latest

# Or check what's running in container
docker ps
docker logs <container-id>
```

### Scenario 3: Other Application Using the Port

```bash
# Example: Stripe CLI running on port 3000

# Solution A: Stop the other application
# (Close Stripe CLI, Grafana, etc.)

# Solution B: Use different ports
cloakx web  # Will auto-find available port (3001+)

# Solution C: Change both ports
# Edit src/commands/web.ts and server/index.ts
# Set completely different ports (e.g., 4000, 9000)
```

---

## 🔧 CONFIGURATION OPTIONS

### Option 1: Permanent Port Configuration

Create `.env` file in project root:

```bash
# .env
WEB_PORT=3001
API_PORT=8081
```

Then update `src/commands/web.ts`:
```typescript
let PORT = process.env.WEB_PORT || 3000;
```

### Option 2: Command-Line Argument

Update `web` command to accept port:
```bash
cloakx web --port 3001
cloakx web --port 3002
```

### Option 3: Interactive Port Selection

```bash
# The system could ask:
# Port 3000 is in use
# Use alternative port? [Y/n]
# Trying port 3001... ✅ Available
```

---

## 📋 TROUBLESHOOTING CHECKLIST

If you're getting port conflicts:

- [ ] Check what process is using the port
  ```bash
  netstat -ano | findstr :3000  # Windows
  lsof -i :3000                   # Mac/Linux
  ```

- [ ] Try the automatic port fallback
  ```bash
  cloakx web  # Should use 3001+ if 3000 taken
  ```

- [ ] Kill conflicting process
  ```bash
  taskkill /IM node.exe /F    # Windows
  killall node                # Mac/Linux
  ```

- [ ] Check for hung processes
  ```bash
  ps aux | grep node
  ps aux | grep npm
  ```

- [ ] Restart computer (last resort)
  ```bash
  # If nothing else works, reboot to clear all ports
  shutdown -r now  # Mac/Linux
  shutdown /r /t 0  # Windows
  ```

- [ ] Use different ports
  ```bash
  # Edit src/commands/web.ts
  # Change: let PORT = 3000;
  # To:     let PORT = 4000;
  npm run build
  cloakx web
  ```

---

## 🚀 BEST PRACTICES

### 1. Always Shutdown Gracefully
```bash
# Instead of killing terminal, use Ctrl+C
Press Ctrl+C  # Allows clean server shutdown

# This prevents "port stuck in TIME_WAIT" state
```

### 2. Check Processes Before Starting
```bash
# Before running cloakx web:
netstat -ano | findstr ":3000 :8080"

# If nothing shows, safe to start
```

### 3. Use Process Manager for Production
```bash
# PM2 can handle port conflicts automatically
npm install -g pm2

pm2 start "cloakx web" --name cloakx-web
pm2 start "npm start" --name cloakx-api
```

### 4. Document Your Port Configuration
```bash
# Keep this file in your project:
echo "3000 = Web UI, 8080 = Backend API" > PORT_CONFIG.txt

# Or in your team's wiki
```

---

## 🆘 STILL HAVING ISSUES?

### Comprehensive Port Reset

```bash
# Nuclear option - kills everything and resets

# Windows PowerShell (Admin):
Get-Process node | Stop-Process -Force
Get-Process npm | Stop-Process -Force

# Mac/Linux
killall -9 node npm python

# Wait a bit for ports to clear
sleep 5  # or Start-Sleep -Seconds 5 on Windows

# Try again
cloakx web
```

### Advanced: Check Socket State

```bash
# Windows: See all connections
netstat -ano | more

# Mac/Linux: Detailed connection view
netstat -plant | grep -E "3000|8080"

# Look for TIME_WAIT state (will clear eventually)
# ESTABLISHED = currently in use
# TIME_WAIT = will be freed soon
```

### Check for Port Leaks

```bash
# Ports stuck in TIME_WAIT state?
# They'll free up automatically in 60-120 seconds

# Force faster cleanup on some systems:
# Windows (advanced):
netsh int ipv4 set dynamicport tcp start=1024 num=64512
netsh int ipv4 set dynamicport udp start=1024 num=64512
```

---

## 📞 GETTING HELP

If you still can't resolve the port conflict:

1. **Share this information:**
   ```bash
   # What OS are you using?
   # All open ports:
   netstat -ano  # Windows
   lsof -i       # Mac/Linux
   
   # Running processes:
   tasklist      # Windows
   ps aux        # Mac/Linux
   ```

2. **Check if it's a known issue:**
   - Search GitHub issues for "port conflict"
   - Check Docker/VM specific issues if applicable

3. **Try alternative approach:**
   - Use `cloakx run` with environment variables instead of web UI
   - Use API directly instead of web UI

---

**Remember:** Port conflicts are temporary and fixable! Reset, restart, and you'll be back up in seconds. 🎉
