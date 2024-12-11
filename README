# Solana Alert Bot

## Overview
This Node.js project, **Solana Alert**, monitors Solana blockchain transactions for specific conditions and sends real-time alerts to a Telegram bot. It leverages the SolScan API for fetching transaction data and Cloudflare Workers for efficient scheduling and state management.

---

## Features
- Monitors a specified wallet address on the Solana blockchain.
- Fetches transaction data via SolScan API.
- Groups and processes transactions to detect specific patterns (e.g., BUY, SELL, SWAP types).
- Sends alerts to a Telegram bot when conditions are met.
- Uses Cloudflare Workers KV storage for efficient state management.

---

## Prerequisites
1. **Node.js** installed on your system.
2. **Cloudflare Workers account** for deployment.
3. A **Telegram bot** and **chat ID** for receiving alerts.
4. A **SolScan API key**.

---

## Configuration
Update the following constants in the code with your values:

```javascript
const TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"; // Your Telegram bot token
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID"; // Telegram chat ID
const WALLET_ADDRESS = "YOUR_WALLET_ADDRESS"; // Wallet address to monitor
const API_KEY = "YOUR_SOLSCAN_API_KEY"; // SolScan API key
const BINDING_NAME = "YOUR_KV_BINDING_NAME"; // Cloudflare Workers KV binding name
```

---

## Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mehransalehi/solana-alert.git
   cd solana-alert
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Deploy to Cloudflare Workers:**
   - Configure your KV binding in the `wrangler.toml` file.
   - Deploy the worker using:
     ```bash
     wrangler publish
     ```

4. **Run locally for testing (optional):**
   ```bash
   node index.js
   ```

---

## How It Works
1. The bot fetches transaction data from the SolScan API, using the provided wallet address and API key.
2. Transactions are grouped and processed to detect specific patterns:
   - **BUY**: Identified by a specific transfer pattern.
   - **SELL**: When no new account creation is detected.
   - **SWAP**: Other transfer types.
3. Alerts are sent to the configured Telegram bot for transactions meeting the specified conditions.
4. State is managed using Cloudflare Workers KV to track the last processed timestamp.

---

## API References
- **SolScan API:** [https://solscan.io](https://solscan.io)
- **Telegram Bot API:** [https://core.telegram.org/bots/api](https://core.telegram.org/bots/api)

---

## Notes
- Make sure to update `CURRENT_VERSION` with each deployment to reset the state.
- Adjust `VALUE_LIST` to match your specific alerting conditions.
- Avoid exposing sensitive keys (Telegram token, API key) in your code or public repositories.

---

## License
This project is licensed under the [MIT License](LICENSE).

---

## Contributing
Feel free to fork the repository and submit pull requests to improve this project.

