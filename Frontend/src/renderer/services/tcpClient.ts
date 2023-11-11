import * as net from 'net';
import { Socket } from 'node:net';
import { ISendData } from './sendDataInterface';

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
    this.client.connect(this.port, this.host, () => {
      console.log('Connected to server');
      const dataToSend = {
        role: 'frontend',
        message: 'Hello from the client!'
      };

      this.client.write(JSON.stringify(dataToSend));
    });

    this.client.on('close', () => {
      console.log('Connection closed');
    });
  }

  async send(data: ISendData){
    return new Promise((resolve, reject) => {
      this.client.write(JSON.stringify({
        body: data.body,
        headers: data.headers,
        url: data.url,
        method: data.method
      }));

      const timer = setTimeout(() => {
        this.client.end();
        reject(new Error('Request timed out'));
      }, 10000);

      this.client.on('data', data => {
        clearTimeout(timer);
        resolve(data.toString());
      });

      this.client.on('error', err => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
}

const testClient = new TcpClient('192.168.56.101', 8500);


(async () => {
  await testClient.connect();
  const message1 = await testClient.send({ body: {}, headers: {}, url: '/test', method: 'GET' });
  const message2 = await testClient.send({ body: { "1": 1 }, headers: {}, url: '/test', method: 'GET' });
  const message3 = await testClient.send({ body: { "2": 2 }, headers: {}, url: '/test', method: 'GET' });
  const message4 = await testClient.send({ body: { "5": 5 }, headers: { "6": 6 }, url: '/test', method: 'GET' });
  console.log(message1);
  console.log(message2);
  console.log(message3);
  console.log(message4);
})();
