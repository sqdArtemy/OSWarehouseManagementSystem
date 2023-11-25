import { apiClient } from '../index';
import { ISendData } from './sendDataInterface';

export interface ApiResponse{
  success: boolean;
  message?: string;
  data?: { [key: string]: any };
}

export async function handleApiRequest(data: ISendData): Promise<ApiResponse> {
  try {
    const request = await apiClient.send({
      headers: data.headers,
      method: data.method,
      url: data.url,
      body: data.body,
    });

    const responseData = JSON.parse(String(request));
    if (Number(responseData.status_code) >= 400) {
      return {
        success: false,
        message: responseData.message,
      };
    } else {
      return {
        success: true,
        data: responseData,
      };
    }
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: 'Technical issue',
    };
  }
}
