import { IAddUser, ISignUp, IUser } from '../interfaces/usersInterface';
import { IApiResponse, handleApiRequest } from '../apiRequestHandler';

export class UserApi implements IUser {
  private token: string;
  userData: IAddUser;

  constructor() {
    this.token = '';
  }

  get getToken(): string {
    return this.token;
  }

  get getUserData(): IAddUser {
    return this.userData;
  }

  public async addUser(body: IAddUser): Promise<IApiResponse> {
    const url = '/users';
    const method = 'POST';
    const headers = { token: this.token };

    return await handleApiRequest({ url, method, body, headers });
  }

  public async deleteUser(id: number): Promise<IApiResponse> {
    const url = '/user/' + id;
    const method = 'DELETE';
    const body = {};
    const headers = { token: this.token };

    return await handleApiRequest({ url, method, body, headers });
  }

  public async getAllUsers(filters: {
    [p: string]: any;
  }): Promise<IApiResponse> {
    const url = '/users';
    const method = 'GET';
    const body = {};
    filters = { ...filters };
    const headers = { filters, token: this.token };

    return await handleApiRequest({ url, method, body, headers });
  }

  public async getUser(id: number): Promise<IApiResponse> {
    const url = '/user/' + id;
    const method = 'GET';
    const body = {};
    const headers = { token: this.token };

    return await handleApiRequest({ url, method, body, headers });
  }

  public async resetPassword(
    oldPassword: string,
    newPassword: string,
    passwordConfirm: string,
  ): Promise<IApiResponse> {
    const url = '/user/change_password';
    const method = 'PUT'; // Adjust the method based on your API requirements
    const body = {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: passwordConfirm,
    };
    const headers = { token: this.token };

    return await handleApiRequest({ url, method, body, headers });
  }

  public async signIn(email: string, password: string): Promise<IApiResponse> {
    const url = '/user/login';
    const method = 'POST';
    const body = {
      user_email: email,
      password,
    };

    const headers = {};

    const response = await handleApiRequest({ url, method, body, headers });
    if (response?.success === true) {
      this.token = response?.data?.headers?.token;
      this.userData = response?.data?.body;
      return {
        success: true,
        data: response?.data?.body,
      };
    } else {
      return response;
    }
  }

  public async signUp(body: ISignUp): Promise<IApiResponse> {
    const url = '/user/register';
    const method = 'POST';

    const headers = {};

    const response = await handleApiRequest({ url, method, body, headers });
    if (response?.success === true) {
      this.token = response?.data?.headers?.token;
      this.userData = response?.data?.body;
      return {
        success: true,
        data: response?.data?.body,
      };
    } else {
      return response;
    }
  }

  public async updateUser(body: IAddUser, id: number): Promise<IApiResponse> {
    const url = '/user/' + id;
    const method = 'PUT';
    const headers = { token: this.token };

    const response = await handleApiRequest({ url, method, body, headers });
    if (response.success && this.userData.user_id == id) {
      this.userData = response?.data?.body;
      console.log('update-user:', this.userData);
    }
    return response;
  }

  public async forgotPassword(userEmail: string): Promise<IApiResponse> {
    const url = '/user/forgot-password';
    const method = 'PUT';
    const headers = { token: this.token };
    const body = { user_email: userEmail };
    return await handleApiRequest({ url, method, body, headers });
  }

  public async resetPasswordToDefault(id: number): Promise<IApiResponse> {
    const url = '/user/' + id + '/reset-password';
    const method = 'PUT';
    const headers = { token: this.token };
    const body = {};
    return await handleApiRequest({ url, method, body, headers });
  }
}
