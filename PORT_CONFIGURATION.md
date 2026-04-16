# 🔌 PORT CONFIGURATION

**Updated:** April 16, 2026  
**Strategy:** Using less commonly used ports to avoid conflicts

---

## 🎯 Current Port Assignment

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| **Frontend** | `1201` | HTTP | Web UI (React) |
| **Backend** | `2000` | HTTP | API Server (Express) |

---

## 📊 Why These Ports?

### ✅ Advantages of 1201 & 2000

1. **Rarely Used** - Not default ports for common services
   - Port 3000 → Used by many dev tools (Stripe, Grafana, npm)
   - Port 8080 → Used by proxies, containers, Jenkins
   - Port 1201 → **Minimal conflicts**
   - Port 2000 → **Minimal conflicts**

2. **Non-Privileged** - Can run without sudo/admin
   - Both ports are above 1024
   - No special permissions needed

3. **Development Friendly** - Easy to test multiple instances
   - Can run multiple Cloakx installations
   - Example: Port 1201, 1202, 1203...

4. **Documentation Clarity** - Clear role separation
   - Frontend explicitly on 1201
   - Backend explicitly on 2000

---

## 🌍 How Services Connect

### **Single Server Mode** (cloakx web)
```
Browser
   ↓ http://localhost:1201
   ↓
   Express Server (Port 1201)
   ├─ Serves: React UI
   ├─ Routes: /api/* (all API endpoints)
   └─ Routes: /* (SPA fallback)

Backend API on Port 2000 (ignored in this mode)
```

### **Separate Server Mode** (Optional)
```
Browser
   ↓ http://localhost:2000
   ↓
Express Backend Server (Port 2000)
   ├─ /api/login
   ├─ /api/secrets
   ├─ /api/vault
   └─ /api/export

(Frontend would be served separately)
```

---

## 🚀 Usage Examples

### Start Everything
```bash
cloakx web
# Output:
# 🌐 Cloakx Web UI is running!
#    📱 Frontend URL: http://localhost:1201
#    🔗 Backend API: http://localhost:2000
#    🎯 Both services integrated on this server
```

### If Port 1201 Is In Use
```bash
cloakx web
# ⚠️  Port 1201 is already in use. Searching for available port...
# ✅ Using port 1202 instead
# 📱 Frontend URL: http://localhost:1202
```

### Start Backend Separately (Optional)
```bash
npm start
# Output:
# 🚀 API running on http://localhost:2000
```

---

## 🔧 Changing Ports

### Update Frontend Port (1201)
**File:** `src/commands/web.ts`
```typescript
let PORT = 1201;  // Change this to desired port
```

### Update Backend Port (2000)
**File:** `server/index.ts`
```typescript
app.listen(2000, () => {  // Change port number
  console.log('🚀 API running on http://localhost:2000');
});
```

### Update Environment Ports
**File:** `.env` (create if needed)
```bash
# Frontend configuration
WEB_PORT=1201
WEB_HOST=localhost

# Backend configuration
API_PORT=2000
API_HOST=localhost
```

---

## 📋 Port Availability

### Check Current Ports

**Windows:**
```powershell
netstat -ano | findstr ":1201"
netstat -ano | findstr ":2000"
```

**Mac/Linux:**
```bash
lsof -i :1201
lsof -i :2000
```

### Free Up a Port (if needed)

**Windows:**
```powershell
taskkill /IM node.exe /F
```

**Mac/Linux:**
```bash
killall node
```

---

## 🎯 Port Range Strategy

### Primary Ports (Preferred)
```
1201 - Frontend
2000 - Backend
```

### Fallback Ports (If Primary In Use)
**Frontend Fallback Sequence:**
- 1201 ← Primary
- 1202 ← First alternative
- 1203 ← Second alternative
- 1204, 1205, 1206, 1207, 1208, 1209, 1210

**Backend:** Currently doesn't auto-fallback (stays at 2000)

---

## 🔒 Security Considerations

✅ **Secure:**
- Both ports are non-privileged (>1024)
- No special permissions needed
- Can't interfere with system services

⚠️ **Development Only:**
- Running on HTTP (not HTTPS)
- CORS allows localhost only
- Not suitable for production internet-facing
- Use reverse proxy (Nginx, Apache) for production

---

## 🚀 Running Multiple Instances

Want to run multiple Cloakx instances simultaneously?

**Instance 1 (Testing Environment 1):**
```bash
cd project-1
# Uses 1201, 2000
cloakx web
```

**Instance 2 (Testing Environment 2):**
```bash
cd project-2
# Auto-detects 1201 in use, uses 1202 instead
cloakx web
```

---

## 📊 Comparison with Previous Configuration

| Aspect | Old | New | Benefit |
|--------|-----|-----|---------|
| Frontend Port | 3000 | 1201 | Reduced conflicts |
| Backend Port | 8080 | 2000 | Reduced conflicts |
| Common Conflicts | Frequent | Rare | Smoother development |
| Multi-instance | Hard | Easy | Better testing |
| Privileges | Standard | Standard | Same complexity |

---

## ✅ Verification Checklist

- [ ] Frontend accessible at `http://localhost:1201`
- [ ] Backend API at `http://localhost:2000`
- [ ] Login works with vault password
- [ ] Secrets can be created/read/update/delete
- [ ] Web UI loads without CORS errors
- [ ] API responds to requests
- [ ] No port conflict warnings

---

## 🆘 Troubleshooting

**Q: Can't connect to http://localhost:1201**
```bash
# Check if service is running
netstat -ano | findstr ":1201"

# If nothing, restart
cloakx web

# If still fails, check logs
npm run dev  # Run with visible output
```

**Q: Getting "Port already in use" error**
```bash
# Kill old process
taskkill /F /IM node.exe  # Windows
killall node                # Mac/Linux

# Restart
cloakx web
```

**Q: Need to use different ports**
```bash
# Edit src/commands/web.ts
# Change: let PORT = 1201;
# To:     let PORT = 4000;

npm run build
cloakx web
```

---

**Summary:** Using ports 1201 & 2000 provides better stability and fewer conflicts! 🎉
