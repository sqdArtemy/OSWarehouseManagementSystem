import { ApiResponse } from '../apiRequestHandler';

export interface IUser {
  signIn(
    email: string,
    password: string,
  ): Promise<ApiResponse>;
  signUp(body: ISignUp): Promise<{ [key: string]: any } | any>;
  addUser(
    body: IAddUser
  ): Promise<{ [key: string]: any } | any>;
  deleteUser(id: number): Promise<{ [key: string]: any } | any>;
  updateUser(
    body: IAddUser,
    id: number,
  ): Promise<{ [key: string]: any } | any>;
  getUser(id: number): Promise<{ [key: string]: any } | any>;
  getAllUsers(filters: {
    [key: string]: any;
  }): Promise<{ [key: string]: any } | any>;
  resetPassword(
    oldPassword: string,
    newPassword: string,
    passwordConfirm: string,
  ): Promise<{ [key: string]: any } | any>;
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
  user_name: string;
  user_surname: string;
  user_email: string;
  user_role: string;
  user_phone: string;
}

interface IGetUsersFilters {

}
