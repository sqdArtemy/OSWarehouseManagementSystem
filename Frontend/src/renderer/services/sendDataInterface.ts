export interface ISendData {
  body: {[key: string]: any},
  headers: {[key: string]: any},
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH',
  url: string
}

export interface IConnectionData {
  role: string,
  message: string
}
