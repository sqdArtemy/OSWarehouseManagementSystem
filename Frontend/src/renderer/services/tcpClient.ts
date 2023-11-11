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
    this.client.connect(this.port, this.host, async () => {
      console.log('Connected to server');
      const dataToSend = {
        role: 'frontend',
        message: 'Hello from the client!'
      };

      await this.send(dataToSend);
    });

    this.client.on('close', () => {
      console.log('Connection closed');
    });
  }

  async send(data: ISendData | IConnectionData){
    return new Promise((resolve, reject) => {

      if ('body' in data) {
        this.client.write(JSON.stringify({
          body: data.body,
          headers: data.headers,
          url: data.url,
          method: data.method
        }));
      } else {
        this.client.write(JSON.stringify({
          role: data.role,
          message: data.message
        }))
      }

      const timer = setTimeout(() => {
        this.client.end();
        reject(new Error('Request timed out'));
      }, 10000);

      this.client.on('data', data => {
        clearTimeout(timer);
        if(data.toString() === 'There is no connected backend side to the server'){
          reject('There is no connected backend side to the server');
        }
        resolve(data.toString());
      });

      this.client.on('error', err => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
}

const args = process.argv.slice(2);
const serverAddress = args[0] ?? '127.0.0.1';  // Change this to your server's IP or hostname
const serverPort = Number(args[1]) ?? 8000;
export const apiClient = new TcpClient(serverAddress, serverPort);

(async ()=> {
  try {
    await apiClient.connect();
    const testMessage = await apiClient.send({ method: 'GET', url: '/test', headers: {}, body: {} });
    console.log(testMessage);
  } catch (e) {
    console.log(e);
  }
})();