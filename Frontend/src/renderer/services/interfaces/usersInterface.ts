import { IApiResponse } from '../apiRequestHandler';

export interface IUser {
  signIn(email: string, password: string): Promise<IApiResponse>;
  signUp(body: ISignUp): Promise<IApiResponse>;
  addUser(body: IAddUser): Promise<IApiResponse>;
  deleteUser(id: number): Promise<IApiResponse>;
  updateUser(body: IAddUser, id: number): Promise<IApiResponse>;
  getUser(id: number): Promise<IApiResponse>;
  getAllUsers(filters: { [key: string]: any }): Promise<IApiResponse>;
  resetPassword(
    oldPassword: string,
    newPassword: string,
    passwordConfirm: string,
  ): Promise<IApiResponse>;
  forgotPassword(): Promise<IApiResponse>;
  resetPasswordToDefault(id: number): Promise<IApiResponse>;
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
  user_address: string;
}

export interface IAddUser {
  user_name?: string;
  user_surname?: string;
  user_email?: string;
  user_role?: string;
  user_phone?: string;
  user_id?: number;
  company_id?: number;
  user_address?: string;
}

interface IGetUsersFilters {}
