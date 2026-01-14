# Wallet Connection Dashboard

A production-quality Web3 wallet connection dashboard built with Next.js 15, TypeScript, ethers.js, and Tailwind CSS. This project demonstrates core Web3 concepts including wallet authentication, blockchain network detection, and real-time data fetching from the Ethereum blockchain.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![ethers.js](https://img.shields.io/badge/ethers.js-6.13-purple?style=flat-square)

## Features

### Wallet Connection
- **MetaMask Integration**: Connect and disconnect from MetaMask wallet
- **Address Display**: View truncated wallet address with one-click copy functionality
- **Persistent Sessions**: Automatically reconnects if previously connected

### Network Management
- **Chain Detection**: Real-time detection of current blockchain network
- **Network Switching**: One-click switch to Sepolia testnet
- **Visual Indicators**: Clear status badges showing correct/wrong network state
- **Auto-Add Network**: Automatically adds Sepolia if not configured in MetaMask

### Account Information
- **ETH Balance**: Live balance display formatted to 4 decimal places
- **Full Address View**: Complete wallet address with Etherscan link
- **Auto-Refresh**: Balance updates automatically on account or network changes

### ETH Transaction Sender
- **Send ETH**: Transfer ETH to any Ethereum address
- **Form Validation**: Real-time validation of recipient address and amount
- **Transaction Lifecycle**: Complete state management (idle -> sending -> pending -> confirmed/failed)
- **Transaction Tracking**: Display transaction hash with Etherscan link
- **Error Handling**: User rejection, insufficient funds, and network errors

### Event Handling
- **Account Changes**: Instantly reflects when user switches accounts in MetaMask
- **Network Changes**: Updates UI when user changes networks
- **Disconnection**: Handles wallet disconnection gracefully

### User Experience
- **Loading States**: Visual feedback during all async operations
- **Toast Notifications**: Success, error, warning, and info messages
- **Error Handling**: Comprehensive handling of all MetaMask error codes
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Beautiful dark theme optimized for Web3 aesthetics

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 |
| Web3 Library | ethers.js 6.13 |
| Wallet | MetaMask |
| Network | Ethereum Sepolia Testnet |
| State Management | React Hooks |

## Project Structure

```
wallet-connection-dashboard/
├── app/
│   ├── globals.css          # Global styles and Tailwind customizations
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── AccountInfo.tsx      # Account details display
│   ├── NetworkStatus.tsx    # Network status and switching
│   ├── SendTransaction.tsx  # ETH transaction sender form
│   ├── Toast.tsx            # Toast notification system
│   └── WalletConnectButton.tsx  # Connect/disconnect button
├── lib/
│   └── ethereum.ts          # Ethereum helper functions
├── types/
│   └── web3.ts              # TypeScript type definitions
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm
- MetaMask browser extension
- Some Sepolia ETH for testing (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. **Install MetaMask**: Ensure MetaMask browser extension is installed
2. **Connect Wallet**: Click "Connect Wallet" button and approve in MetaMask
3. **Switch Network**: If not on Sepolia, click "Switch to Sepolia" button
4. **View Account**: See your ETH balance and full wallet address
5. **Copy Address**: Click the copy icon next to your address
6. **Disconnect**: Click "Disconnect" to clear the session
