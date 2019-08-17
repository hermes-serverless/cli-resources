import axios, { AxiosInstance } from 'axios'
import { Environment } from '../Environment'
import { User } from '../globalTypes'
import { getAuthorizationHeader } from '../utils/authUtils'

export interface UpdatedUser {
  updatedUser: User
}

export interface DeletedUser {
  deletedUser: User
}

export class UserDatasource {
  private static client: AxiosInstance = axios.create()

  private static get baseURL() {
    return Environment.baseURL + '/user'
  }

  public static async updateUser(username: string, newUserInfo: User, token: string): Promise<UpdatedUser> {
    try {
      const clientRes = await this.client.put(this.baseURL + `/${username}`, newUserInfo, {
        headers: getAuthorizationHeader(token),
      })
      return clientRes.data
    } catch (err) {
      throw err
    }
  }

  public static async deleteUser(username: string, token: string): Promise<DeletedUser> {
    try {
      const clientRes = await this.client.delete(this.baseURL + `/${username}`, {
        headers: getAuthorizationHeader(token),
      })
      return clientRes.data
    } catch (err) {
      throw err
    }
  }
}
