# 📋 CloakX Roadmap & Feature User Stories

This document contains detailed user stories, technical specs, and acceptance criteria for planned CloakX features. Use this document to pick up features task-by-task.

---

## Table of Contents
1. [US-001: Git Pre-Commit Secret Scanner (`cloakx hook`)](#us-001-git-pre-commit-secret-scanner-cloakx-hook)
2. [US-002: Vault Health & Expiration Auditor (`cloakx audit`)](#us-002-vault-health--expiration-auditor-cloakx-audit)
3. [US-003: Encrypted Secret Bundle Sharing (`cloakx share`)](#us-003-encrypted-secret-bundle-sharing-cloakx-share)
4. [US-004: Interactive Shell Env Injector (`cloakx shell`)](#us-004-interactive-shell-env-injector-cloakx-shell)
5. [US-005: Web UI Env Diff & Merge Tool](#us-005-web-ui-env-diff--merge-tool)
6. [US-006: VS Code In-Editor Secret Masking & Hover Peek](#us-006-vs-code-in-editor-secret-masking--hover-peek)
7. [US-007: Cloud Backup & Multi-Device Sync Engine (Encrypted E2EE)](#us-007-cloud-backup--multi-device-sync-engine-encrypted-e2ee)

---

## US-001: Git Pre-Commit Secret Scanner (`cloakx hook`)

### Priority: High | Complexity: Medium | Category: Security & Developer Workflow

#### **User Story**
> **As a** developer working on local code repositories,  
> **I want to** install a Git pre-commit hook via CloakX,  
> **So that** hardcoded secret patterns or unencrypted `.env` files are blocked from being committed to Git before pushed to remotes.

#### **Description**
Developers frequently leak sensitive API keys or commit plaintext `.env` files by mistake. `cloakx hook install` will register a lightweight `.git/hooks/pre-commit` script that scans staged git files for known secret patterns (e.g. AWS access keys, OpenAI tokens, RSA private keys, connection strings) and warns/blocks the commit.

#### **Acceptance Criteria**
- [ ] `cloakx hook install` installs a pre-commit script into `.git/hooks/pre-commit`.
- [ ] `cloakx hook uninstall` removes or unregisters the hook cleanly.
- [ ] `cloakx hook run` runs the scanner manually on staged files or all files (`--all`).
- [ ] Scans staged files against built-in regex rules (AWS, GitHub tokens, OpenAI, JWT, RSA keys, `.env` file additions).
- [ ] Exits with code `1` if a secret is found, printing line numbers and secret key names (values masked with `***`).
- [ ] Supports `--ignore` / `.cloakxignore` file to bypass intentional test fixtures or false positives.

#### **CLI Mockup**
```bash
$ cloakx hook install
✔ Pre-commit hook installed in .git/hooks/pre-commit

$ git commit -m "add payment handler"
🔍 [CloakX Guard] Scanning staged files...
✖ ERROR: High-entropy secret detected!
  File: src/config.js:14
  Pattern: Stripe Secret Key (sk_live_***)
Commit aborted! Encrypt secrets into CloakX vault before committing.
```

---

## US-002: Vault Health & Expiration Auditor (`cloakx audit`)

### Priority: Medium | Complexity: Low-Medium | Category: Security & Operations

#### **User Story**
> **As a** DevOps engineer / Lead developer,  
> **I want to** audit my vault for weak passwords, expired keys, duplicate values, and stale entries,  
> **So that** I can maintain high security hygiene and rotate secrets before services break.

#### **Description**
As vaults grow over time, secrets become stale, expire without notice, or contain duplicate/weak values. `cloakx audit` provides a comprehensive security score and list of actionable recommendations for the active vault.

#### **Acceptance Criteria**
- [ ] `cloakx audit` evaluates all keys and metadata in the active vault.
- [ ] Reports secrets that have reached or are within 7 days of their `--expires` date.
- [ ] Flags duplicate secret values shared across different keys (e.g. same DB password used in dev and production).
- [ ] Flags weak low-entropy passwords/tokens stored in the vault.
- [ ] Reports unused or unaccessed secrets (if metadata tracking is enabled).
- [ ] Supports `--fix` interactive mode to update/rotate or delete flagged keys.

#### **CLI Mockup**
```bash
$ cloakx audit
🔍 Auditing vault: production (18 secrets)

⚠️ WARNINGS (3):
  [EXPIRED]     STRIPE_TEST_KEY expired 2 days ago (2026-08-18)
  [EXPIRING]    SSL_CERT_KEY expires in 4 days
  [DUPLICATE]   STAGING_DB_PASS and DEV_DB_PASS have identical values

Security Score: 78/100
Run `cloakx update <KEY>` to rotate expiring secrets.
```

---

## US-003: Encrypted Secret Bundle Sharing (`cloakx share`)

### Priority: High | Complexity: Medium-High | Category: Team Collaboration
v
#### **User Story**
> **As a** team member onboarding a new developer,  
> **I want to** generate a one-time password-protected encrypted secret payload,  
> **So that** I can securely share environment secrets over Slack/Email without exposing plaintext.

#### **Description**
Teams currently pass `.env` files over Slack, email, or WhatsApp. `cloakx share` packages selected secrets into a zero-knowledge encrypted `.cloakpay` file or one-time raw string payload encrypted with a short passphrase or ephemeral asymmetric key pair.

#### **Acceptance Criteria**
- [ ] `cloakx share --env staging` prompts for a temporary passkey or generates an auto-passcode.
- [ ] Outputs a single self-contained encrypted token string or `.cloakpay` payload file.
- [ ] The recipient imports it using `cloakx receive <token>` or `cloakx import payload.cloakpay` with the passphrase.
- [ ] Option `--ttl 24h` / `--max-reads 1` to enforce self-destructing payload limits.
- [ ] The core server or transmitter never sees plaintext; decryption occurs strictly on the target client machine.

#### **CLI Mockup**
```bash
$ cloakx share --env staging --expires 1h
✔ Encrypted 8 secrets from 'staging' environment.
Passcode: 839-204-11A

Shareable Payload:
clkx_pay_v1_8f91a27b9c0e... (copy to clipboard)

# Recipient runs:
$ cloakx receive clkx_pay_v1_8f91a27b9c0e...
Enter passcode: 839-204-11A
✔ Decrypted 8 secrets into vault 'staging'!
```

---

## US-004: Interactive Shell Env Injector (`cloakx shell`)

### Priority: Medium | Complexity: Medium | Category: Developer Experience

#### **User Story**
> **As a** developer running terminal-heavy workflows,  
> **I want to** open a child subshell pre-loaded with vault environment variables,  
> **So that** every command I type automatically has access to secrets without prefixing every command with `cloakx run`.

#### **Description**
Currently, developers must run `cloakx run -- node app.js` for single commands. `cloakx shell` starts an isolated sub-shell session (Bash, Zsh, or PowerShell) where all secrets from an environment are pre-set in `$env` / `export`. Typing `exit` destroys the session and clears all env variables from memory.

#### **Acceptance Criteria**
- [ ] `cloakx shell [environment]` spawns a new OS child shell (PowerShell on Windows, bash/zsh on Unix).
- [ ] Injects all secrets from active vault / specified environment into process environment.
- [ ] Prompts terminal header indicator (e.g. `(cloakx:production) PS C:\app>`).
- [ ] Wipes environment variables upon subshell exit.
- [ ] Does not write secrets to shell history files (`.bash_history`, PowerShell PSReadLine history).

#### **CLI Mockup**
```bash
$ cloakx shell staging
✔ Vault 'default' (staging env) unlocked. Spawning subshell...
(cloakx:staging) $ node server.js
(cloakx:staging) $ psql $DATABASE_URL
(cloakx:staging) $ exit
✔ CloakX shell session closed. Secrets purged from environment.
```

---

## US-005: Web UI Env Diff & Merge Tool

### Priority: Medium | Complexity: Medium | Category: Web UI & UX

#### **User Story**
> **As a** developer managing multiple environments,  
> **I want to** visually compare and diff secrets between environments (e.g. `development` vs `production`) in the Web Dashboard,  
> **So that** I can spot missing keys, mismatched configurations, or outdated secrets instantly.

#### **Description**
When managing `dev`, `staging`, and `prod`, it is easy to forget to add a newly created API key to production. A side-by-side Visual Diff & Sync matrix in the Web UI allows users to see missing keys and copy/sync individual keys across environments with one click.

#### **Acceptance Criteria**
- [ ] Add a new **"Env Diff Matrix"** view under Web Dashboard (`cloakx web`).
- [ ] Dropdown selectors to pick Source Environment (e.g. `development`) and Target Environment (e.g. `production`).
- [ ] Highlights:
  - 🟢 **Missing in Target**: Key exists in Source but not in Target.
  - 🟡 **Value Mismatch**: Key exists in both, but values differ (values masked by default with toggle).
  - 🔴 **Orphan Keys**: Key exists in Target but removed from Source.
- [ ] Action buttons: `[Sync Key to Target]`, `[Copy All Missing]`, `[Merge]`.

#### **UI Layout Sketch**
```
+-----------------------------------------------------------------------+
|  Environment Diff:  [ Development ▼ ]  vs  [ Production ▼ ]           |
+-----------------------------------------------------------------------+
| Key                 | Dev Status        | Prod Status    | Action     |
+---------------------+-------------------+----------------+------------+
| STRIPE_PUBLIC_KEY   | pk_test_123...    | pk_live_999... | [Mismatch] |
| NEW_FEATURE_FLAG    | true              | ❌ (Missing)   | [+ Copy]   |
| LEGACY_API_URL      | ❌ (Removed)      | http://old...  | [Delete]   |
+-----------------------------------------------------------------------+
```

---

## US-006: VS Code In-Editor Secret Masking & Hover Peek

### Priority: Medium | Complexity: Medium | Category: IDE Extensions

#### **User Story**
> **As a** developer editing code in VS Code,  
> **I want to** hover over `process.env.SECRET_KEY` in JS/TS/Python code to view its CloakX vault value and mask status,  
> **So that** I don't have to switch to terminal or dashboard to verify environment variable names and values.

#### **Description**
Enhance the existing VS Code extension (`vscode-extension/`) with a rich Hover Provider and CodeLens integration. When hovering over `process.env.KEY_NAME` or `os.environ["KEY_NAME"]`, the extension queries the local CloakX vault background server and presents key status, environment tag, and expiration info.

#### **Acceptance Criteria**
- [ ] VS Code Hover Provider intercepts `process.env.*`, `import.meta.env.*`, and `os.environ[...]`.
- [ ] Renders Markdown hover tooltip showing:
  - Vault Key Name & Active Environment
  - Masked Value (`••••••••••••` with click to reveal)
  - Expiration Date & Tags
  - Quick action link: `[Edit in CloakX]`
- [ ] CodeLens action above `.env` or `config.js` files: `🔒 CloakX: 12 Secrets Active`.
- [ ] Full security isolation (never leaks values to telemetry or language servers).

#### **VS Code Tooltip Mockup**
```
+-------------------------------------------------------------+
| 🛡️ CloakX Vault Secret: OPENAI_API_KEY                     |
| Environment: production                                     |
| Value: sk-proj-•••••••••••••••••••• [👁️ Reveal] [📋 Copy]   |
| Expiration: None | Tags: #ai, #api                           |
|                                                             |
| [Open in CloakX Web Dashboard]                             |
+-------------------------------------------------------------+
```

---

## US-007: Cloud Backup & Multi-Device Sync Engine (Encrypted E2EE)

### Priority: Low-Medium | Complexity: High | Category: Infrastructure & Enterprise

#### **User Story**
> **As a** developer using multiple workstations (Macbook + Desktop),  
> **I want** my encrypted CloakX vaults to sync automatically across devices via an E2EE cloud relay,  
> **So that** my secrets are always backed up and accessible wherever I log in.

#### **Description**
Build the optional E2EE (End-to-End Encrypted) backend sync engine. Vaults are client-side encrypted using master keys prior to transmission to a lightweight sync server (Supabase / Cloudflare Workers / Node relay).

#### **Acceptance Criteria**
- [ ] Zero-Knowledge architecture: Server only stores encrypted binary blobs.
- [ ] `cloakx sync --remote` or `cloakx cloud login`.
- [ ] Conflict resolution: Last-Write-Wins or interactive merge prompt when remote vault timestamp differs.
- [ ] Webhook triggers or WebSocket updates for instant real-time sync across active desktop clients.
- [ ] Opt-in by default; completely transparent to local-first users.

---

## 📌 Implementation Checklist & Tracking

| ID | Feature Name | Priority | Status | Target Release |
|---|---|---|---|---|
| **US-001** | Git Pre-Commit Secret Scanner (`cloakx hook`) | High | ⏳ Pending | v1.1.0 |
| **US-002** | Vault Health & Expiration Auditor (`cloakx audit`) | Medium | ⏳ Pending | v1.1.0 |
| **US-003** | Encrypted Secret Bundle Sharing (`cloakx share`) | High | ⏳ Pending | v1.2.0 |
| **US-004** | Interactive Shell Env Injector (`cloakx shell`) | Medium | ⏳ Pending | v1.2.0 |
| **US-005** | Web UI Env Diff & Merge Tool | Medium | ⏳ Pending | v1.3.0 |
| **US-006** | VS Code In-Editor Secret Masking & Hover Peek | Medium | ⏳ Pending | v1.3.0 |
| **US-007** | Cloud Backup & E2EE Multi-Device Sync | Low-Med | ⏳ Pending | v2.0.0 |
