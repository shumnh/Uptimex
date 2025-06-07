# UptimeX 🌐

A decentralized website monitoring platform where people earn cryptocurrency for checking if websites are working properly.
[Live Demo](https://uptimex-six.vercel.app/)
You can try the project here: [https://uptimex-six.vercel.app/](https://uptimex-six.vercel.app/)

## What is UptimeX?

Imagine you own a website and want to make sure it's always online. Instead of trusting one company to monitor it, UptimeX uses a network of independent people (called "validators") around the world to check your website. When they confirm your site is working, they get paid in SOL cryptocurrency automatically.

**For Website Owners:**
- Add your websites to be monitored 24/7
- Get real-time alerts if your site goes down
- See detailed analytics and uptime reports
- Pay validators automatically with cryptocurrency

**For Validators:**
- Earn SOL tokens by checking websites
- Work from anywhere with just a computer and internet
- Get paid instantly for accurate monitoring
- No special skills needed - just click and check!

## 🛠 Technology Used

- **Frontend**: React (modern web interface)
- **Backend**: Node.js (server technology)
- **Database**: MongoDB (data storage)
- **Blockchain**: Solana (cryptocurrency payments)
- **Authentication**: Crypto wallet login (no passwords needed)

## 🚀 How to Run This Project

### What You Need First
- A computer with internet connection
- Node.js installed (download from nodejs.org)
- MongoDB database (can use free cloud version)
- A Solana wallet like Phantom (free browser extension)

### Step 1: Get the Code
```bash
# Download the project
git clone https://github.com/yourusername/UptimeX.git
cd UptimeX
```

### Step 2: Setup the Server (Backend)
```bash
# Go to backend folder
cd backend

# Install required packages
npm install

# Create configuration file
cp .env.example .env
```

**Edit the .env file with your settings:**
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/uptimex
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

**Start the server:**
```bash
npm start
```
✅ Server will run at: http://localhost:4000

### Step 3: Setup the Website (Frontend)
```bash
# Open new terminal, go to frontend folder
cd frontend

# Install required packages
npm install

# Start the website
npm run dev
```
✅ Website will open at: http://localhost:5173

### Step 4: Test Everything
1. Open http://localhost:5173 in your browser
2. Connect your Solana wallet (Phantom recommended)
3. Register as either a website owner or validator
4. Start monitoring websites and earning SOL!

## 🔒 Security & Trust

- **No Passwords**: Everything uses crypto wallet authentication
- **Decentralized**: No single point of failure
- **Transparent**: All payments and checks are recorded on blockchain
- **Fair**: Smart algorithms prevent cheating and ensure fair work distribution

## 🤝 Support

If you need help:
1. Check if Node.js and MongoDB are properly installed
2. Make sure your .env file has correct database connection
3. Ensure your Solana wallet is connected
4. Check that both frontend and backend are running

## 🎯 Perfect For

- **Website Owners**: E-commerce sites, blogs, business websites
- **Crypto Enthusiasts**: People wanting to earn SOL tokens
- **Developers**: Learning blockchain and decentralized applications
- **Businesses**: Reliable, transparent website monitoring

---

**Start monitoring your websites and earning cryptocurrency today!** 🚀
# Updated Sat Jun  7 15:34:12 +0545 2025
