🚀 SPACE ID SDK Integration – Wallet ↔ Domain Reverse Lookup

This project demonstrates how to integrate the SPACE ID SDKs to perform reverse lookups between wallet addresses and domains.

🔹 From a domain name, fetch all associated crypto wallet addresses.
🔹 From a wallet address, retrieve the linked Web3 domains.

Although this project was later deprecated / scrapped, it serves as a valuable reference for experimenting with Web3 identity and reverse resolution using SPACE ID.

✨ Features

Domain → Wallets: Resolve all associated crypto addresses from a single domain.

Wallet → Domains: Find all domains linked to a given wallet address.

Cross-chain support: Works across multiple chains supported by SPACE ID.

SDK Integration: Clean example using SPACE ID SDKs in a Node.js/TypeScript setup.

🛠️ Tech Stack

Node.js / TypeScript – Backend logic and SDK integration

SPACE ID SDKs – Domain & wallet reverse resolution

Express.js (optional) – For building simple APIs around lookups

⚙️ Installation
Prerequisites

Node.js (v16 or later recommended)

npm or yarn

A SPACE ID API key (if required by SDK version)

Setup

Clone this repository:

git clone https://github.com/your-username/spaceid-reverse-lookup.git
cd spaceid-reverse-lookup


Install dependencies:
npm install

💡 Learnings

This was an experimental MVP and later deprecated, but the integration provided valuable insights into:

Practical use of Web3 identity standards

Challenges in reverse resolution across multiple chains

The potential of SPACE ID in simplifying user identity & cross-chain discovery

📜 License

This project is open-sourced under the MIT License.

npm run dev

