// Constants for configuration (user must replace these values with their own)
const CURRENT_VERSION = "v1.0"; // Update this with each deployment to reset the LASTTIME
const TELEGRAM_BOT_TOKEN = "..."; // Replace with your Telegram bot token
const TELEGRAM_CHAT_ID = "..."; // Replace with your chat ID
const WALLET_ADDRESS = "..."; // Replace with the wallet address to monitor
//Sol Scan API URL (DO NOT CHANGE IT)
const SOLSCAN_API_URL =
  "https://pro-api.solscan.io/v2.0/account/transfer?address=" +
  WALLET_ADDRESS +
  "&token=So11111111111111111111111111111111111111111&page_size=100&sort_by=block_time&sort_order=desc&activity_type[]=ACTIVITY_SPL_TRANSFER&activity_type[]=ACTIVITY_SPL_CREATE_ACCOUNT";
// Replace with your SolScan API key
const API_KEY ="..."; // Replace with your Solscan API key
const BINDING_NAME = "..."; // KV binding name in Cloudflare Worker
let LAST_TIMESTAMP = 0; // Tracks the last timestamp (do not change this value directly)

const VALUE_LIST = [0.001807776, 0.03807776];

export default {
  async scheduled(event, env, ctx) {
    // Check if the version has changed
    const savedVersion = await env[BINDING_NAME].get("VERSION");
    if (savedVersion !== CURRENT_VERSION) {
      // Reset KV Store as needed
      LAST_TIMESTAMP = Math.floor(Date.now() / 1000) - 60; // Initialize with a recent timestamp
      await env[BINDING_NAME].put("LASTTIME", LAST_TIMESTAMP);
      await env[BINDING_NAME].put("VERSION", CURRENT_VERSION); // Store the new version
    }

    LAST_TIMESTAMP = await env[BINDING_NAME].get("LASTTIME");
    if (LAST_TIMESTAMP > 0) {
      LAST_TIMESTAMP -= 1;
    } else {
      LAST_TIMESTAMP = Math.floor(Date.now() / 1000) - 60; // Default to the current time minus 60 seconds
    }
    // Execute data fetching and processing asynchronously
    ctx.waitUntil(fetchAndSendData(LAST_TIMESTAMP, env));
  },
};

async function fetchAndSendData(lastTime, env) {
  let currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  let maxRun = 1; // Pagination counter for API requests
  let data = []; // To store fetched transaction data

  while (maxRun < 4) {
    // Fetch up to 3 pages of transactions
    let newUrl =
      SOLSCAN_API_URL +
      `&block_time[]=${lastTime}&block_time[]=${currentTime}&page=${maxRun}`;

    // Fetch data from SolScan API
    const solscanResponse = await fetch(newUrl, {
      method: "GET",
      headers: {
        token: `${API_KEY}`,
      },
    });

    if (!solscanResponse.ok) {
      console.log(solscanResponse.status);
      console.log("Error fetching data from Solscan");
      return;
    }
    const transactionData = await solscanResponse.json();

    data = [...data, ...transactionData.data]; // Append new data to the array

    if (transactionData.data.length < 99) {
      // Stop if fewer than 99 transactions are returned
      break;
    }
    maxRun++;
  }

  if (data.length > 1) {
    // Group transactions by their transaction hash
    let grouped = data.reduce((result, transfer, index, orgin) => {
      if (Object.hasOwn(result, transfer.trans_id)) {
        result[transfer.trans_id].push(transfer);
      } else {
        result[transfer.trans_id] = [];
        result[transfer.trans_id].push(transfer);
      }
      return result;
    }, {});

    // Process grouped transactions
    for (const hash in grouped) {
      if (Object.prototype.hasOwnProperty.call(grouped, hash)) {
        const transaction = grouped[hash];
        const haveCreateAccount =
          transaction.filter(
            (transfer) =>
              transfer.activity_type == "ACTIVITY_SPL_CREATE_ACCOUNT"
          ).length > 0;

        const transfers = transaction.filter(
          (transfer) => transfer.activity_type == "ACTIVITY_SPL_TRANSFER"
        );

        // Determine the transaction type
        let type = "";

        if (!haveCreateAccount) {
          type = "SELL";
        } else if (haveCreateAccount && transfers.length == 3) {
          type = "BUY";

          // Identify the main transfer in BUY transactions
          let amount0 = transfers[0].amount;
          let amount1 = transfers[1].amount;
          let amount2 = transfers[2].amount;

          let targetTransfer = false;

          if (FC(amount1) == amount2 || FC(amount2) == amount1) {
            targetTransfer = transfers[0];
          } else if (FC(amount0) == amount2 || FC(amount2) == amount0) {
            targetTransfer = transfers[1];
          } else if (FC(amount0) == amount1 || FC(amount1) == amount0) {
            targetTransfer = transfers[2];
          }


          let value =
            targetTransfer.amount / Math.pow(10, targetTransfer.token_decimals);
            console.log(`A۰ :${amount0} | A1 : ${amount1} | A2 : ${amount2}`)
            console.log("Falt transfer ?"+ (targetTransfer === false));
            console.log("HASH : " + hash);
            console.log("VALUE : " + value);
            console.log("TIME : " + transfers[0].block_time);
            console.log('``````````````````');

          if (!VALUE_LIST.includes(value)) {
            let message = `Find A BUY Transaction \n\n\u{1F4E2} CA ADDRESS : ${targetTransfer.to_address} \n\n\u{1F520} Transaction hash : <a href="https://solscan.io/tx/${hash}">${hash}</a>  \n\n\u{1F536} SOL AMOUNT : ${value}\n\nTime ${transfers[0].time}\n**`;

            // Send transaction alert to Telegram
            const telegramResponse = await sendToTelegram(message);

            if (!telegramResponse.ok) {
              console.log("Failed to send data to Telegram");
            }
          } else {
            console.log("find this but not send : " + hash);
          }
        } else {
          type = "SWAP";
        }
      }
    }

    // Update the last processed timestamp
    await env[BINDING_NAME].put("LASTTIME", data[0].block_time);
  } else {
    console.log("Have Error In Fetching Data From Sol Scan.");
  }
}
function FC(num1){
  return Math.trunc(num1/100);
}
// Send a formatted message to the Telegram bot
async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "HTML",
  });

  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });
}
