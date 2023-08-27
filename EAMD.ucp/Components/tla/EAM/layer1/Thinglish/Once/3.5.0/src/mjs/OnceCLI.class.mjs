// Import required modules
import readline from 'readline';
import worker_threads from 'worker_threads';

class OnceCLI {
  constructor() {
    // Initialize readline interface
    this.rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
    });

    // Initialize worker
    const { Worker, isMainThread, parentPort, workerData } = worker_threads;
    if (isMainThread) {
      this.worker = new Worker("./src/mjs/OnceCLI.class.mjs", {
        workerData: {}
      });
 
 this.worker.on('message', (message) => {
 // Output the colored input from the worker
 this.outputColoredText(message);
 });
 
 // Handle input events
 this.rl.on('line', (input) => {
 // Send input to the worker for processing
 this.worker.postMessage(input);
 });
 
 // Handle the space key press for input completion
 this.rl.on('keypress', (key, data) => {
 if (data.name === 'space') {
 // Send a special character to indicate input completion
 this.worker.postMessage('\x04');
 }
 });
 
 // Start the input process
 this.rl.prompt();
 } else {
 // Worker thread logic
 parentPort.on('message', (message) => {
 // Check for input completion
 if (message === '\x04') {
 // Process input completion
 this.processInputCompletion();
 } else {
 // Send the input back to the main thread
 parentPort.postMessage(message);
 }
 });
 }
 }
 
 outputColoredText(text) {
 // You can implement colored output logic here
 // For example, you can use a library like chalk to colorize the text.
 console.log(text);
 this.rl.prompt();
 }
 
 processInputCompletion() {
 // Implement input completion logic here
 // For example, you can process the completed input and take action accordingly.
 console.log('Input completed.');
 this.rl.prompt();
 }
 }
 
 // Create an instance of OnceCLI
 new OnceCLI();
 
