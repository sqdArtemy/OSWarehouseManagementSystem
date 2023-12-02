import { ApiResponse } from '../apiRequestHandler';

export interface IUser {
  signIn(email: string, password: string): Promise<ApiResponse>;
  signUp(body: ISignUp): Promise<ApiResponse>;
  addUser(body: IAddUser): Promise<ApiResponse>;
  deleteUser(id: number): Promise<ApiResponse>;
  updateUser(body: IAddUser, id: number): Promise<ApiResponse>;
  getUser(id: number): Promise<ApiResponse>;
  getAllUsers(filters: { [key: string]: any }): Promise<ApiResponse>;
  resetPassword(
    oldPassword: string,
    newPassword: string,
    passwordConfirm: string,
  ): Promise<ApiResponse>;
}

export interface ISignUp {
  company_name: string;
  company_address: string;
  company_email: string;
  user_name: string;
  user_surname: string;
  user_email: string;
  user_role: string;
  user_phone: string;
  password: string;
  confirm_password: string;
}

export interface IAddUser {
  user_name?: string;
  user_surname?: string;
  user_email?: string;
  user_role?: string;
  user_phone?: string;
  user_id?: number;
  company_id?: number
}

interface IGetUsersFilters {}
