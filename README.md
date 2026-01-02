# BACKit-onCSPR 

**BACKit-onCSPR** is a social prediction market platform built on **Casper Network**. It allows users to create "calls" (predictions), back them with onchain stakes, and build a reputation based on accuracy.

## 🚀 Features

-   **Create Calls**: Make bold predictions about crypto, culture, or tech.
-   **Back & Counter**: Stake on "YES" or "NO" outcomes.
-   **Social Feed**:
    -   **For You**: Algorithmic feed of trending calls.
    -   **Following**: See calls from users you follow.
-   **User Profiles**: Track your reputation, follower counts, and betting history.
-   **Onchain Accountability**: All stakes and outcomes are recorded on Casper Network.

## 🛠 Tech Stack

-   **Frontend**: Next.js, Tailwind CSS, Casper Click (Wallet Integration)
-   **Backend**: NestJS, TypeORM, PostgreSQL, Casper JS SDK
-   **Smart Contracts**: Rust, Odra Framework
-   **Chain**: Casper (Testnet/Mainnet)

## 📦 Project Structure

-   `packages/frontend`: Next.js web application
-   `packages/backend`: NestJS API server
-   `packages/contracts-odra`: Smart contracts (Odra)

## 🏃‍♂️ Getting Started

### Prerequisites

-   Node.js (v18+)
-   Docker (for PostgreSQL)
-   Rust & Cargo (latest stable)
-   Odra CLI (`cargo install odra-cli`)

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/degenspot/BACKit-onCSPR.git
    cd BACKit-onCSPR
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Setup Environment Variables**
    -   Copy `.env.example` to `.env` in `packages/backend` and `packages/contracts-odra`.
    -   Copy `.env.local.example` to `.env.local` in `packages/frontend`.

4.  **Start Development**
    ```bash
    pnpm dev
    ```
    This starts the frontend and backend.

5.  **Smart Contracts**
    To test the contracts:
    ```bash
    cd packages/contracts-odra
    cargo odra test
    ```
    To deploy to Livenet (Testnet):
    ```bash
    cargo odra build
    # Follow Odra deployment instructions
    ```

## 📜 License

MIT
