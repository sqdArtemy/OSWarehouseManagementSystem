import { apiClient } from '../index';
import { ISendData } from './sendDataInterface';

export async function handleApiRequest(data: ISendData): Promise<{ [key: string]: any }> {
  try {
    const request = await apiClient.send({
      headers: data.headers,
      method: data.method,
      url: data.url,
      body: data.body,
    });

    const data = JSON.parse(String(request));
    if (Number(data.status_code) >= 400) {
      return {
        success: false,
        message: data.message,
      };
    } else {
      return {
        success: true,
        data: data,
      };
    }
  } catch (e) {
    return {
      success: false,
      message: 'Technical issue',
    };
  }
}
