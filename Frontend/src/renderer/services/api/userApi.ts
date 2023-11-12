import { IAddUser, ISignUp, IUser } from '../interfaces/usersInterface';
import { apiClient } from '../../index';
import { handleApiRequest } from '../apiRequestHandler';

export class UserApi implements IUser {
  token: string;

  constructor() {
    this.token = '';
  }

  public async addUser(body: IAddUser): Promise<any> {
    return Promise.resolve(undefined);
  }

  public async deleteUser(id: number): Promise<any> {
    return Promise.resolve(undefined);
  }

  public async getAllUsers(filters: { [p: string]: any }): Promise<any> {
    return Promise.resolve(undefined);
  }

  public async getUser(id: number): Promise<any> {
    return Promise.resolve(undefined);
  }

  public async resetPassword(
    oldPassword: string,
    newPassword: string,
    passwordConfirm: string,
  ): Promise<any> {
    return Promise.resolve(undefined);
  }

  public async signIn(email: string, password: string): Promise<any> {
    const url = '/user/login';
    const method = 'POST'; // Adjust the method based on your API requirements
    const body = {
      user_email: email,
      password,
    };

    const headers = {};

    const response = await handleApiRequest({ url, method, body, headers});
    if(response?.success === true){
      this.token = response?.data?.token;
    } else {
      return response;
    }
  }

  public async signUp(body: ISignUp): Promise<any> {
    return Promise.resolve(undefined);
  }

  public async updateUser(body: IAddUser, id: number): Promise<any> {
    return Promise.resolve(undefined);
  }
}
