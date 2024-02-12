const fs = require('fs');
const readline = require('readline');
const { transferableAbortSignal } = require('util');


// Read the contents of the mempool.csv file and catch any potential errors
const csvFilePath = 'mempool.csv';
const readStream = fs.createReadStream(csvFilePath,'utf8')
// const csvData = fs.readFileSync(csvFilePath, 'utf8');

//A readline interface to read data line by line

const readlineInterface = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
});

const transactions = [];

//Process data from the stream

readlineInterface.on('line',(line)=>{
//Parse each line and create tx objects
const [txid,fee,weight,parentTxIds] = line.split(',');
const parents = parentTxIds.split(',').filter(Boolean);
transactions.push({txid,fee: parseInt(fee),weight: parseInt(weight),parents});

});

readlineInterface.on('close',()=>{
    


// Sorting Txs by fee-to-weight ratio to maximize fee
// Transactions sorted in a descending order based on the fee-to-weight ratio
transactions.sort((a, b) => b.fee / b.weight - a.fee / a.weight);

// Initialize the dynamic programming (dp) array
const n = transactions.length;
const maxWeight = 4000000;
const dp = Array.from({ length: n + 1 }, () => Array(maxWeight + 1).fill(0));

// Fill in our dp using the knapsack technique
for (let i = 1; i <= n; i++) {
  const { fee, weight } = transactions[i - 1];
  for (let w = 0; w <= maxWeight; w++) {
    dp[i][w] = dp[i - 1][w];
    if (w >= weight) {
      dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weight] + fee);
    }
  }
}

// Backtrack to find the selected Tx Indices
const selectedTxIndices = [];
let w = maxWeight;
for (let i = n; i > 0; i--) {
  if (dp[i][w] !== dp[i - 1][w]) {
    selectedTxIndices.push(i - 1);
    w -= transactions[i - 1].weight;
  }
}

// Print out the selected Tx IDs in the defined order
const selectedTxIds = selectedTxIndices.map((idx) => transactions[idx].txid);
console.log(selectedTxIds.join('\n'));
});