const net = require('net');
const readline = require('readline');

const serverAddress = '127.0.0.1';  // Change this to your server's IP or hostname
const serverPort = 8000;            // Change this to your server's port

const client = new net.Socket();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

client.connect(serverPort, serverAddress, () => {
  console.log('Connected to server');

  const dataToSend = {
    role: 'frontend',
    message: 'Hello from the client!'
  };

  client.write(JSON.stringify(dataToSend));
  rl.setPrompt('> Enter a message to send (type "exit" to quit): \n');

  // Function to send user input to the server
  function sendInputToServer(input) {
    if (input === 'exit') {
      client.end();  // Close the client connection and exit
    } else {
      client.write(JSON.stringify({ message: input, headers: {} }));  // Send the user's input to the server
    }
    rl.prompt();  // Display the input prompt again
  }

  rl.prompt();  // Display the initial prompt

  rl.on('line', (input) => {
    sendInputToServer(input);
  });

  client.on('data', (data) => {
    console.log('\n> Received data from server:\n', data.toString());
  });

  client.on('close', () => {
    console.log('Connection to server closed');
    rl.close();  // Close the readline interface
  });

  client.on('error', (err) => {
    console.error('Error:', err);
  });
});
