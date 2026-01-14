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
   cd wallet-connection-dashboard
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

## Web3 Concepts Demonstrated

This project showcases several fundamental Web3 concepts that are essential for any blockchain developer:

### 1. Wallet Authentication (Web3 Auth)
Unlike traditional username/password authentication, Web3 apps authenticate users through their cryptocurrency wallets. This project demonstrates:
- Requesting wallet connection via `eth_requestAccounts`
- Obtaining the user's public address as their identifier
- No passwords needed - cryptographic signatures prove ownership

### 2. Provider Pattern (ethers.js)
The provider pattern is central to Web3 development:
- `BrowserProvider` wraps MetaMask's injected provider
- `Signer` represents the connected account for transactions
- Read-only operations use the provider directly
- Write operations require the signer

### 3. Chain ID Detection & Network Switching
Blockchain apps must ensure users are on the correct network:
- Reading `chainId` to determine current network
- Using `wallet_switchEthereumChain` to request network switch
- Using `wallet_addEthereumChain` to add networks not in wallet

### 4. Event-Driven Architecture
Web3 apps must react to wallet events in real-time:
- `accountsChanged` - User switches accounts
- `chainChanged` - User changes network
- `disconnect` - Wallet disconnects
- No page refresh needed - state updates immediately

### 5. Balance Reading (Blockchain Queries)
Reading data from the blockchain:
- Using `provider.getBalance()` to query account balance
- Formatting Wei to ETH using `formatEther()`
- Understanding gas-free read operations vs. paid write operations

### 6. Write Transactions & Gas
Sending ETH demonstrates write operations:
- Using `signer.sendTransaction()` to create blockchain state changes
- Converting ETH to Wei with `parseEther()` for precise amounts
- Understanding transaction lifecycle: signing -> broadcasting -> pending -> confirmed
- Gas is automatically estimated by ethers.js
- Transaction hash provides tracking before confirmation

### 7. Transaction State Management
Handling async blockchain operations in React:
- Multiple states: idle, sending (user signing), pending (on-chain), confirmed, failed
- Optimistic UI updates with rollback on failure
- Balance refresh after successful transactions

## Interview Talking Points

When discussing this project in interviews, highlight these key concepts:

1. **Wallet-Based Authentication**: "This project demonstrates Web3's passwordless authentication model where users prove identity through their wallet's cryptographic signature rather than credentials. The public address serves as the user identifier."

2. **Provider Architecture**: "I used ethers.js BrowserProvider to wrap MetaMask's injected ethereum object, following the EIP-1193 standard. This abstraction allows the same code to work with any compatible wallet."

3. **Network Awareness**: "The app actively monitors chain ID and guides users to the correct network. This is critical in production Web3 apps to prevent users from sending transactions on wrong chains."

4. **Event-Driven Updates**: "The dashboard subscribes to MetaMask events (accountsChanged, chainChanged) to provide real-time UI updates without page refreshes - essential for Web3 UX."

5. **Type Safety in Web3**: "I created comprehensive TypeScript interfaces for all Web3 interactions, including proper typing for MetaMask error codes and provider methods, reducing runtime errors."

6. **Error Handling Best Practices**: "The app handles all standard MetaMask error codes (4001 for user rejection, 4902 for unknown chain, etc.) with user-friendly messages, improving the onboarding experience."

7. **Write Transactions vs Read Operations**: "The app demonstrates both read operations (balance queries - free, no signature needed) and write operations (sending ETH - requires signature and gas). Write transactions modify blockchain state and cost gas, while reads are free RPC calls."

8. **Transaction Lifecycle Management**: "When sending ETH, I implemented a complete transaction state machine: idle -> sending (awaiting user signature in MetaMask) -> pending (transaction broadcast, waiting for block inclusion) -> confirmed/failed. This provides users with real-time feedback at every step."

9. **Gas Handling**: "The app uses ethers.js automatic gas estimation. In production, you might implement custom gas strategies, but for this demo, the default estimation works well. Gas is paid in ETH and compensates validators for including the transaction in a block."

## Key Files Explained

### `/lib/ethereum.ts`
Contains all Ethereum-related utility functions:
- `connectWallet()` - Initiates MetaMask connection
- `getBalance()` - Fetches and formats ETH balance
- `switchToSepolia()` - Handles network switching with fallback to add chain
- `setupWalletListeners()` - Sets up event listeners with cleanup
- `parseWeb3Error()` - Converts error codes to user-friendly messages
- `sendTransaction()` - Sends ETH to a recipient address
- `isValidAddress()` - Validates Ethereum address format
- `validateAmount()` - Validates ETH amount input
- `parseTransactionError()` - Handles transaction-specific errors

### `/types/web3.ts`
Comprehensive TypeScript definitions:
- `WalletState` - Complete wallet connection state interface
- `ChainId` enum - Supported network chain IDs
- `MetaMaskErrorCode` enum - Standard error codes
- `EthereumProvider` interface - Type-safe window.ethereum
- `TransactionState` - Transaction lifecycle state interface
- `TransactionStatus` - Union type for transaction states

### `/components/WalletConnectButton.tsx`
Smart button component that:
- Shows "Connect Wallet" when disconnected
- Shows truncated address + disconnect when connected
- Handles copy-to-clipboard with feedback
- Displays loading state during connection

### `/components/SendTransaction.tsx`
ETH transaction sender form that:
- Validates recipient address using ethers.js `isAddress()`
- Validates amount (positive number, max 18 decimals)
- Manages complete transaction lifecycle state
- Shows transaction hash with Etherscan link
- Handles all error scenarios (rejection, insufficient funds)

## Common Issues & Solutions

### MetaMask Not Detected
The app checks for `window.ethereum?.isMetaMask` and displays an installation prompt if not found.

### User Rejects Connection
Error code 4001 is caught and displays a friendly "Connection rejected" message.

### Wrong Network
The app displays a warning banner and provides a one-click switch to Sepolia.

### Balance Not Updating
Balance auto-refreshes on account/network changes via event listeners.

### Transaction Fails with "Insufficient Funds"
You need enough ETH to cover both the transfer amount AND gas fees. Get more Sepolia ETH from a faucet.

### Transaction Stuck on "Pending"
Transactions may take time during network congestion. Use the Etherscan link to monitor status. On Sepolia, confirmations usually happen within seconds.

## Future Enhancements

- [ ] Transaction history display
- [ ] ENS name resolution
- [ ] Multiple wallet support (WalletConnect)
- [ ] Token balance display (ERC-20)
- [ ] NFT gallery (ERC-721)

## License

MIT License - feel free to use this project for learning and portfolio purposes.

---

Built with love for the Web3 community
