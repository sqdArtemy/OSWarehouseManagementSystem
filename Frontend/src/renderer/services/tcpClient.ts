import * as net from 'net';
import { Socket } from 'net';
import { IConnectionData, ISendData } from './sendDataInterface';

export class TcpClient {
  client: Socket;
  host: string;
  port: number;

  constructor(host: string, port: number) {
    this.client = new net.Socket();
    this.host = host;
    this.port = port;
  }

  async connect() {
    try {
      await new Promise((resolve, reject) => {
        this.client.connect(this.port, this.host, () => {
          console.log('Connected to server');
          resolve();
        });

        this.client.on('error', (error) => {
          reject(error);
        });

        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });

      const dataToSend = {
        role: 'frontend',
        message: 'Hello from the client!',
      };

      await this.send(dataToSend);

      const dataToConnect: ISendData = {
        method: 'POST',
        url: '/test',
        body: {},
        headers: {},
      };

      await sleep(500);
      await this.send(dataToConnect);
    } catch (error) {
      console.error('Error connecting:', error.message);
      throw error;
    }

    this.client.on('close', () => {
      console.log('Connection closed');
    });
  }

  async send(data: ISendData | IConnectionData) {
    return new Promise((resolve, reject) => {
      if ('body' in data) {
        data.headers.url = data.url + data.method;
        this.client.write(
          JSON.stringify({
            body: data.body,
            headers: data.headers,
            url: data.url,
            method: data.method,
          }),
        );

        const timer = setTimeout(() => {
          reject(new Error('Request timed out'));
        }, 10000);

        let accumulatedData = '';
        this.client.on('data', (response) => {
          clearTimeout(timer);

          accumulatedData += response.toString();

          if (accumulatedData.includes('\n')) {
            const messages = accumulatedData.split('\n');
            accumulatedData = messages.pop();
            messages.forEach((message) => {
              if (
                message === 'There is no connected backend side to the server'
              ) {
                reject('There is no connected backend side to the server');
              } else {
                if (message.includes(data.url + data.method)) resolve(message);
              }
            });
          }
        });

        this.client.on('error', (err) => {
          clearTimeout(timer);
          reject(err);
        });
      } else {
        this.client.write(
          JSON.stringify({
            role: data.role,
            message: data.message,
          }),
        );
        resolve();
      }
    });
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// const args = process.argv.slice(2);
// const serverAddress = args[0] ?? '127.0.0.1';  // Change this to your server's IP or hostname
// const serverPort = Number(args[1]) ?? 8000;
// export const apiClient = new TcpClient(serverAddress, serverPort);
//
// (async ()=> {
//   try {
//     await apiClient.connect();
//     const testMessage = await apiClient.send({ method: 'GET', url: '/test', headers: {}, body: {} });
//     console.log(testMessage);
//   } catch (e) {
//     console.log(e);
//   }
// })();
