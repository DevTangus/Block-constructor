const fs = require('fs');
const readline = require('readline');

const csvFilePath = 'mempool.csv';
const readStream = fs.createReadStream(csvFilePath, 'utf8');
const readlineInterface = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
});

const maxWeight = 4000000;
let currentWeight = 0;

readlineInterface.on('line', (line) => {
    const [txid, fee, weight, parentTxIds] = line.split(',');
    const parents = parentTxIds.split(',').filter(Boolean);
    const transaction = { txid, fee: parseInt(fee), weight: parseInt(weight), parents };

    // Process the transaction immediately
    if (currentWeight + transaction.weight <= maxWeight) {
        // Include the transaction in the block
        process.stdout.write(transaction.txid + '\n'); // Print without quotes and with newline
        currentWeight += transaction.weight;
    } else {
        // Transaction exceeds block weight limit, skip it or handle accordingly
    }
});

readlineInterface.on('close', () => {
    console.log('End of file reached.');
});
