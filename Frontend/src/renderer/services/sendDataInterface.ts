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

export interface ISuccessResponse {
  headers: {[key: string]: any},
  status_code: number | string,
  data: {[key: string]: any}
}

export interface IErrorResponse {
  headers: {[key: string]: any},
  status_code: number | string,
  message: string
}
