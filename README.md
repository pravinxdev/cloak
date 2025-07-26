# 🕶️ Cloakx CLI

**Cloakx** is a secure, lightweight, and developer-friendly CLI tool for managing encrypted key-value data locally. It's like your personal developer vault — simple, fast, and customizable!

> 🔐 Perfect for storing API keys, tokens, secrets, or any sensitive data from the terminal.

---

## ✨ Features

- 🔐 Login system using vault password
- 💾 Securely store and retrieve key-value pairs
- ✏️ Update existing secrets easily
- ❌ Delete secrets by key
- 📜 List all stored keys
- 📂 Configurable JSON-based local vault
- ⚙️ Fully extensible and modular design

---

## 📦 Installation

Install `cloakx` globally using npm:

```bash
npm install -g cloakx
```

---

## 🚀 Getting Started

Here are the basic commands you can use after installing `cloakx`.

### 🔐 Login

```bash
cloakx login
```
Enter your vault password. This creates a secure session.

---

### 📥 Add a Secret

```bash
cloakx add <key>
```
Add a new secret with a key name. You'll be prompted to enter the value.

---

### 🔍 Get a Secret

```bash
cloakx get <key>
```
Fetch the value stored under the specified key.

---

### 📝 Update a Secret

```bash
cloakx update <key>
```
Update an existing key with a new value.

---

### ❌ Delete a Secret

```bash
cloakx delete <key>
```
Remove a secret by its key.

---

### 📜 List All Keys

```bash
cloakx list
```
Show all saved keys in the vault.

---

### 🔓 Logout

```bash
cloakx logout
```
Destroy the current session and clear temporary credentials.

---

### ⚙️ Configuration (Optional)

- The vault and session files are stored locally:
  - Vault: `~/.cloakx/vault.json`
  - Session: `~/.cloakx/session.json`

---

## 🛠 Example Workflow

```bash
cloakx login
cloakx add github_token
cloakx get github_token
cloakx update github_token
cloakx list
cloakx delete github_token
cloakx logout
```

---

## 🔗 GitHub Repository

👉 [https://github.com/pravinxdev/cloak](https://github.com/pravinxdev/cloak)

Star ⭐ the repo, report issues, or contribute!

---

## 🤝 Contributing

We welcome all contributions — from code improvements to feature suggestions or even documentation edits!

### Steps to Contribute:

1. 🍴 Fork the repo
2. 🔧 Create your feature branch (`git checkout -b feature-name`)
3. ✅ Commit your changes (`git commit -m 'Add some feature'`)
4. 📤 Push to the branch (`git push origin feature-name`)
5. 📩 Open a pull request

---

## 📫 Contact

Want to collaborate, suggest ideas, or just say hi?

📧 Mail: [pravins.dev@gmail.com](mailto:pravins.dev@gmail.com)

---

## 📜 License

MIT License — free to use, modify, and share.
