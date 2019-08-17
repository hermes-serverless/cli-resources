import axios, { AxiosInstance } from 'axios'
import { Environment } from '../Environment'
import { AuthObj, User, UserForAuth, UsernameExistenceObj } from '../typings'
import { getAuthorizationHeader } from '../utils/authUtils'

export class AuthDatasource {
  private static client: AxiosInstance = axios.create()

  private static get baseURL() {
    return Environment.baseURL + '/auth'
  }

  public static async register(newUser: UserForAuth): Promise<AuthObj> {
    try {
      const clientRes = await this.client.post(this.baseURL + '/register', newUser)
      return clientRes.data
    } catch (err) {
      throw err
    }
  }

  public static async login(loginData: UserForAuth): Promise<AuthObj> {
    try {
      const clientRes = await this.client.post(this.baseURL + '/login', loginData)
      return clientRes.data
    } catch (err) {
      throw err
    }
  }

  public static async usernameExists(username: string): Promise<UsernameExistenceObj> {
    try {
      const clientRes = await this.client.post(this.baseURL + `/register/${username}`)
      return clientRes.data
    } catch (err) {
      throw err
    }
  }

  public static async getMe(token: string): Promise<User> {
    try {
      const clientRes = await this.client.get(this.baseURL + '/me', {
        headers: getAuthorizationHeader(token),
      })
      return clientRes.data
    } catch (err) {
      throw err
    }
  }
}
