import { createRoot } from 'react-dom/client';
import App from './App';
import { TcpClient } from './services/tcpClient';
import dotenv from 'dotenv';
import { UserApi } from './services/api/userApi';
import { ProductApi } from './services/api/productApi';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

dotenv.config({ path: '.env' });
const serverAddress = process.env.IP_IPC ?? '172.19.126.80'; // Change this to your server's IP or hostname
const serverPort = process.env.PORT_IPC ?? 7777;
export const apiClient = new TcpClient(serverAddress, Number(serverPort));

(async () => {
  try {
    await apiClient.connect();
  } catch (e) {
    console.log(e);
  }
})();

export const userApi = new UserApi();
export const productApi = new ProductApi();
// // calling IPC exposed from preload script
// window.electron.ipcRenderer.once('ipc-example', (arg) => {
//   // eslint-disable-next-line no-console
//   console.log(arg);
// });
// window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
