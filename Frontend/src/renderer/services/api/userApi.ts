import { IAddUser, ISignUp, IUser } from '../interfaces/usersInterface';

export class UserApi implements IUser {
  token: string;

  constructor() {
    this.token = '';
  }

  addUser(body: IAddUser): Promise<any> {
    return Promise.resolve(undefined);
  }

  deleteUser(id: number): Promise<any> {
    return Promise.resolve(undefined);
  }

  getAllUsers(filters: { [p: string]: any }): Promise<any> {
    return Promise.resolve(undefined);
  }

  getUser(id: number): Promise<any> {
    return Promise.resolve(undefined);
  }

  resetPassword(oldPassword: string, newPassword: string, passwordConfirm: string): Promise<any> {
    return Promise.resolve(undefined);
  }

  signIn(email: string, password: string): Promise<any> {
    return Promise.resolve(undefined);
  }

  signUp(body: ISignUp): Promise<any> {
    return Promise.resolve(undefined);
  }

  updateUser(body: IAddUser, id: number): Promise<any> {
    return Promise.resolve(undefined);
  }

}
