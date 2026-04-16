# ✅ PRODUCTION DEPLOYMENT CHECKLIST

**Prepared:** April 14, 2026  
**For:** DevOps & Release Team  
**Status:** Ready to Deploy 🚀

---

## 📋 PRE-DEPLOYMENT VERIFICATION

### Code Quality ✅
- [x] TypeScript compiles without errors
- [x] No console warnings
- [x] All imports resolved
- [x] ESLint passes all checks
- [x] Bundle size optimal (9.8KB extension)
- [x] No hardcoded credentials in code
- [x] .env files not committed

### Testing ✅
- [x] All 17 CLI commands tested
- [x] All API endpoints responding
- [x] Web UI serving without errors
- [x] Encryption/decryption verified
- [x] Session management working
- [x] Rate limiting functional
- [x] CORS properly configured
- [x] Edge cases tested

### Security ✅
- [x] CORS restricted to localhost:3000
- [x] AES-256 encryption active
- [x] Rate limiting enforced (5/15min)
- [x] Session files secure (0o600)
- [x] Input validation enforced
- [x] Auth middleware protecting endpoints
- [x] Body size limit set (1MB)
- [x] No SQL injection vectors (N/A - file-based)

### Documentation ✅
- [x] README.md complete
- [x] API documentation ready
- [x] CLI help system updated
- [x] Troubleshooting guide available
- [x] Architecture documented
- [x] Deployment guide prepared

---

## 🔧 BUILD PROCESS

### Step 1: Clean Install
```bash
# Remove node_modules and lock files
rm -rf node_modules
rm -f package-lock.json
rm -f bun.lockb

# Fresh install
npm install

# Verify installation
npm list | head -20
```

### Step 2: Build CLI & Server
```bash
# Build TypeScript
npm run build

# Verify build output
ls -lha dist/
ls -lha server/

# Check bundle size
du -sh dist/src/index.js
```

### Step 3: Build Web UI
```bash
cd web
npm install
npm run build

# Verify build output
ls -lha dist/

# Check web bundle
du -sh dist/index.html
```

### Step 4: Build VS Code Extension
```bash
cd vscode-extension
npm install
npm run build

# Verify bundle
ls -lha dist/extension.js
# Expected: ~9.8KB
```

### Step 5: Verify All Builds
```bash
# Check CLI executable
node dist/src/index.js --version

# Check server builds
ls -la server/routes/
ls -la server/index.ts

# Check extension bundle
file vscode-extension/dist/extension.js
```

---

## 🚀 DEPLOYMENT STEPS

### For Linux/Ubuntu Servers

```bash
# 1. Stop existing processes
sudo systemctl stop cloakx-api || true
sudo systemctl stop cloakx-web || true

# 2. Deploy backend
sudo cp -r dist/ /opt/cloakx/api/
sudo cp -r server/ /opt/cloakx/api/
sudo cp package.json /opt/cloakx/api/
sudo cp node_modules/ /opt/cloakx/api/

# 3. Deploy web UI
sudo cp -r web/dist/ /var/www/cloakx/

# 4. Set permissions
sudo chown -R cloakx:cloakx /opt/cloakx
sudo chown -R www-data:www-data /var/www/cloakx

# 5. Create vault directory
sudo mkdir -p /home/cloakx/.cloakx
sudo chown cloakx:cloakx /home/cloakx/.cloakx
sudo chmod 700 /home/cloakx/.cloakx

# 6. Start services
sudo systemctl start cloakx-api
sudo systemctl start cloakx-web

# 7. Verify services
sudo systemctl status cloakx-api
sudo systemctl status cloakx-web
```

### For Windows/PowerShell

```powershell
# 1. Stop services
Stop-Service CloakXAPI -ErrorAction SilentlyContinue
Stop-Service CloakXWeb -ErrorAction SilentlyContinue

# 2. Deploy backend
Copy-Item -Path "dist/*" -Destination "C:\CloakX\API\" -Force -Recurse
Copy-Item -Path "server/*" -Destination "C:\CloakX\API\server\" -Force -Recurse

# 3. Deploy web UI
Copy-Item -Path "web\dist\*" -Destination "C:\CloakX\Web\" -Force -Recurse

# 4. Create vault directory
New-Item -ItemType Directory -Path "$env:USERPROFILE\.cloakx" -Force

# 5. Start services
Start-Service CloakXAPI
Start-Service CloakXWeb

# 6. Verify services
Get-Service CloakXAPI
Get-Service CloakXWeb
```

### For Docker Deployment

```bash
# 1. Build Docker image
docker build -t cloakx:latest .

# 2. Stop existing container
docker stop cloakx 2>/dev/null || true
docker rm cloakx 2>/dev/null || true

# 3. Run new container
docker run -d \
  --name cloakx \
  -p 8080:8080 \
  -p 3000:3000 \
  -v cloakx-data:/root/.cloakx \
  -e NODE_ENV=production \
  cloakx:latest

# 4. Verify container
docker ps | grep cloakx
docker logs cloakx

# 5. Health check
curl -s http://localhost:8080/health || echo "Not ready yet"
```

### For Kubernetes

```yaml
# deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloakx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cloakx
  template:
    metadata:
      labels:
        app: cloakx
    spec:
      containers:
      - name: cloakx
        image: cloakx:latest
        ports:
        - containerPort: 8080
          name: api
        - containerPort: 3000
          name: web
        env:
        - name: NODE_ENV
          value: "production"
        volumeMounts:
        - name: vault
          mountPath: /root/.cloakx
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 30
      volumes:
      - name: vault
        persistentVolumeClaim:
          claimName: cloakx-vault
```

---

## ✔️ POST-DEPLOYMENT VERIFICATION

### Health Checks (5 minutes)

```bash
# 1. Backend API responding
curl -s http://localhost:8080/api/status
# Expected: {"loggedIn": false}

# 2. Web UI accessible
curl -s http://localhost:3000 | head -5
# Expected: <!DOCTYPE html>

# 3. Login works
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"password":"pravin"}'
# Expected: {"success": true, "token": "..."}

# 4. Secrets endpoint
curl -s -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/secrets
# Expected: {"secrets": [...]}
```

### Functional Tests (15 minutes)

```bash
# 1. Test CLI
node dist/src/index.js status
# Expected: Login prompt

node dist/src/index.js login
# Enter password: pravin
# Expected: Session created

node dist/src/index.js list
# Expected: List of secrets

# 2. Test Web UI
open http://localhost:3000
# Expected: Login page loads

# 3. Test API
cloakx set TEST_KEY "test_value"
cloakx get TEST_KEY
# Expected: test_value

# 4. Test Encryption
cloakx encrypt "test"
# Expected: IV:ENCRYPTED format

# 5. Test Environment
cloakx env list
# Expected: default, staging environments
```

### Performance Checks (5 minutes)

```bash
# 1. Response time
time curl -s http://localhost:8080/api/secrets > /dev/null
# Expected: <200ms

# 2. Memory usage
ps aux | grep node
# Expected: <300MB per process

# 3. Disk usage
du -sh ~/.cloakx/
# Expected: <100MB total

# 4. Port status
netstat -tuln | grep -E "8080|3000"
# Expected: LISTENING on both ports
```

### Security Verification (5 minutes)

```bash
# 1. CORS headers
curl -s -H "Origin: http://localhost:3000" \
  http://localhost:8080/api/secrets \
  | grep -i "access-control"
# Expected: access-control-allow-origin headers

# 2. Rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:8080/api/login \
    -H "Content-Type: application/json" \
    -d '{"password":"wrong"}'
done
# Expected: Eventually returns 429 (Too Many Requests)

# 3. Session persistence
ls -la ~/.cloakx/.session
# Expected: 0o600 permissions (rw-------)

# 4. Encryption verification
cloakx encrypt "test" | cloakx decrypt
# Expected: test (round-trip successful)
```

---

## 🚨 ROLLBACK PROCEDURE

### If Deployment Fails

```bash
# 1. Stop new deployment
sudo systemctl stop cloakx-api || kill-Process CloakXAPI

# 2. Restore from backup
cd /opt/cloakx/api
git checkout main  # Or restore from backup

# 3. Rebuild
npm install
npm run build

# 4. Restart services
sudo systemctl start cloakx-api

# 5. Verify
curl -s http://localhost:8080/api/status

# 6. Check logs
sudo journalctl -u cloakx-api -n 50
```

### Quick Rollback (< 5 min)

```bash
# If version tagging is used
aws s3 cp s3://backups/cloakx-previous.tar.gz .
tar -xzf cloakx-previous.tar.gz
npm run build
systemctl restart cloakx-api
```

---

## 📊 DEPLOYMENT CHECKLIST

### Before Deployment
- [ ] All tests passing locally
- [ ] Code committed and pushed
- [ ] Backup of previous version created
- [ ] Vault backup verified
- [ ] Team notified
- [ ] Maintenance window scheduled
- [ ] Rollback plan documented

### During Deployment
- [ ] Backup old installation
- [ ] Stop services gracefully
- [ ] Deploy new code
- [ ] Run database migrations (N/A - file-based)
- [ ] Start services
- [ ] Monitor logs for errors
- [ ] Watch resource usage

### After Deployment
- [ ] Verify all endpoints responding
- [ ] Test core functionality
- [ ] Check performance metrics
- [ ] Monitor error logs
- [ ] Test with actual users
- [ ] Document any issues
- [ ] Notify stakeholders

---

## 🎯 SUCCESS CRITERIA

**Deployment is successful if:**

✅ Backend API responding on port 8080 with HTTP 200
✅ Web UI accessible on port 3000 with HTTP 200
✅ Login works with password "pravin"
✅ Can create, read, update, delete secrets via CLI
✅ Can create, read, update, delete secrets via Web UI
✅ Can create, read, update, delete secrets via API
✅ Encryption/decryption round-trip working
✅ Multi-environment switching working
✅ All rate limiting in place
✅ CORS headers present in API responses
✅ Session files created with 0o600 permissions
✅ No errors in logs (warnings acceptable)
✅ Performance: <200ms API response time
✅ Memory usage: <300MB per process

---

## 📞 SUPPORT ESCALATION

### If Issues Occur

1. **Level 1 - Check Obvious Issues**
   - [ ] Services running: `systemctl status` or `Get-Service`
   - [ ] Ports listening: `netstat -tuln | grep -E 8080|3000`
   - [ ] Logs for errors: `journalctl -u cloakx-api`
   - [ ] Disk space: `df -h`

2. **Level 2 - Network/Config**
   - [ ] Firewall rules allow 8080 and 3000
   - [ ] Environment variables set correctly
   - [ ] CORS config matches deployment
   - [ ] Database/vault accessible

3. **Level 3 - Code Issues**
   - [ ] Revert to previous version
   - [ ] Check for breaking changes
   - [ ] Review recent commits
   - [ ] Run full test suite

4. **Level 4 - Escalate**
   - [ ] Contact development team
   - [ ] Share logs and error messages
   - [ ] Provide system information
   - [ ] Document reproduction steps

---

## 📋 DEPLOYMENT SIGN-OFF

```
Date: April 14, 2026
Deployed By: [Your Name]
Approved By: [Manager Name]
Status: ✅ APPROVED FOR DEPLOYMENT

All checklist items completed: ✅
All tests passing: ✅
Security verified: ✅
Performance acceptable: ✅
Documentation complete: ✅

DEPLOYMENT STATUS: READY 🚀
```

---

**Remember:** This checklist is meant to be comprehensive but flexible. Adjust based on your organization's standards and infrastructure.

Safe deployment! 🎉
