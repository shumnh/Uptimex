# Solana Uptime Validator

## Overview
Solana Uptime Validator is a modern web application designed to monitor website uptime and performance using a decentralized network of validators. It leverages the Solana blockchain for secure validator authentication and potential reward distribution.

## Features
- **Website Monitoring:** Track uptime and latency for any website.
- **Decentralized Validators:** Multiple independent validators check websites for better reliability.
- **Solana Integration:** Uses Solana blockchain for secure identity and possible payouts.
- **User Dashboard:** Simple, modern interface to view website status and history.
- **Secure Authentication:** Uses Clerk for user login and JWT for API security.

## Tech Stack
### Frontend
- **React** – User interface library
- **Tailwind CSS** – Utility-first CSS framework for styling
- **Clerk** – User authentication and management
- **Radix UI** – Accessible UI components
- **Lucide React** – Icon library
- **Axios** – HTTP client for API requests

### Backend
- **Node.js** – JavaScript runtime for the server
- **Express** – Web framework for building APIs
- **CORS** – Middleware for cross-origin requests
- **JWT** – Secure authentication tokens
- **MongoDB** – NoSQL database for storing users, websites, validators, and checks

### Web3 / Blockchain
- **Solana** – Blockchain platform for validator identity and rewards
- **@solana/web3.js** – Solana JavaScript SDK for blockchain interactions
- **@solana/kit** – Solana wallet integration
- **tweetnacl** – Cryptographic functions for signing and verifying messages

## Getting Started
### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or remote)
- Solana wallet (for validators)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/solana-uptime-validator.git
   cd solana-uptime-validator
   ```

2. Install dependencies:
   ```sh
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `backend` directory with the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/solana-uptime-validator
     ```
   - Create a `.env` file in the `frontend` directory with your Clerk API keys.

4. Start the development servers:
   ```sh
   # Start backend server
   cd backend
   npm start

   # Start frontend server
   cd ../frontend
   npm start
   ```

## How It Works
1. **Users** sign up and add their websites to be monitored.
2. **Validators** (people or servers) sign up with their Solana wallet and check the status of these websites.
3. The system records each check (uptime, latency, etc.) and stores the results.
4. Users can see the status of their websites on a dashboard.
5. Validators may receive rewards for their work, managed through the Solana blockchain.

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
For any questions or feedback, please open an issue or contact us at [your-email@example.com](mailto:your-email@example.com).

---

**This project combines modern web technologies with blockchain to create a reliable, transparent, and user-friendly website monitoring platform.**
