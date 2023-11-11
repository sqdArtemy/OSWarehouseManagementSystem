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

  connect() {
    this.client.connect(this.port, this.host, () => {
      console.log('Connected to server');
      const dataToSend = {
        role: 'frontend',
        message: 'Hello from the client!'
      };

      this.client.write(JSON.stringify(dataToSend));
    });

    this.client.on('data', (data) => {
      console.log(data.toString());
    });

    this.client.on('close', () => {
      console.log('Connection closed');
    });
  }

  send(data: ISendData){
    this.client.write(JSON.stringify({
      body: data.body,
      headers: data.headers,
      url: data.url,
      method: data.method
    }));
  }
}

const testClient = new TcpClient('192.168.56.101', 8500);
testClient.connect();
testClient.send({body: { }, headers: { }, url: '/test', method: 'GET'});
