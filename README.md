# 🚀 Solana Uptime Validator

## 🧠 What is This Project?
Solana Uptime Validator is a **decentralized website monitoring platform**. Think of it like UptimeRobot or Pingdom, but powered by blockchain (Web3) and a global network of independent checkers (validators).

---

## 🎯 Why Does It Exist?
- **Website owners** want to know if their sites are online and how fast they respond.
- Traditional tools use a single company's servers to check — you have to trust their data.
- This project uses **many independent validators** (real people or servers) to check sites, making the results more trustworthy, transparent, and resilient.
- Validators prove their identity and can be rewarded using the **Solana blockchain**.

---

## 👥 Who Uses This?

### 1. **Users (Website Owners)**
- Sign up and log in.
- Add their website URLs to be monitored.
- See uptime, downtime, and latency (speed) history on a dashboard.
- Trust the results because they're checked by many independent validators.

### 2. **Validators (Checkers)**
- Sign in using a **Solana wallet** (a secure digital identity).
- Get a list of websites to check.
- Run checks (is the site up? how fast is it?).
- Sign and submit results to the backend.
- (Optionally) Earn crypto rewards for honest, regular checks.

---

## 🏗️ How Does It Work?

1. **User adds a website** (e.g., https://example.com).
2. **Validators** from around the world check the site every few minutes:
    - Is it online?
    - How fast does it respond? (latency)
3. Each validator **signs their result** with their Solana wallet (proving it's really them).
4. The backend collects all results, verifies signatures, and stores them.
5. The user sees a dashboard with:
    - Uptime percentage
    - Average latency
    - Status logs and charts
6. (Optional) Validators get rewarded for good work, paid directly to their wallet.

---

## 🌐 Why Web3? How Is This Different from Web2?

| Feature | Web2 (Traditional) | Web3 (This Project) |
| --- | --- | --- |
| Who checks? | One company/server | Many independent validators |
| Trust model | Centralized | Decentralized, cryptographically verified |
| Proof of work | None | Every check is signed by a wallet |
| Rewards | None | Validators can earn tokens |
| Transparency | Limited | Public, verifiable, tamper-proof |
| Single point of failure | Yes | No — global network |

---

## 🧩 Key Technologies
- **Solana**: Blockchain for validator identity and rewards
- **Solana Wallets**: Secure digital identity for validators
- **React + Tailwind CSS**: Frontend dashboard
- **Node.js + Express**: Backend API
- **MongoDB**: Stores users, websites, checks, and validators
- **JWT + Clerk**: Secure authentication

---

## 📝 Example Workflow

1. Jane owns 3 websites. She registers them on the app.
2. Validators from around the world check her sites every 5 minutes.
3. Jane sees real-time and historical uptime/latency data on her dashboard.
4. Validators earn small crypto rewards for their work.

---

## 📚 Glossary (Key Terms)
- **Validator**: A person or server that checks websites and submits results.
- **Solana Wallet**: A digital identity used to sign results and receive rewards.
- **Latency**: How long it takes for a website to respond (measured in milliseconds).
- **Decentralized**: Not controlled by one company — many independent participants.
- **Signature**: A cryptographic proof that a result came from a specific wallet.
- **Web3**: Apps that use blockchain for trust, identity, and rewards.

---

## 🛠️ Getting Started (For Developers)

1. **Clone the repo**
2. **Install dependencies** in both backend and frontend
3. **Set up environment variables** (see `.env.example` files)
4. **Start backend and frontend servers**

---

**This project is building the next generation of website monitoring — decentralized, transparent, and powered by the community.**
