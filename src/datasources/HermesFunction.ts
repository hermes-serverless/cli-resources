import {
  FunctionDeleteObj,
  FunctionGetObj,
  FunctionPostObj,
  FunctionPutObj,
} from '@hermes-serverless/api-types-db-manager/function'
import axios, { AxiosInstance } from 'axios'
import { Environment } from '../Environment'
import { HermesFunction } from '../globalTypes'
import { getAuthorizationHeader } from '../utils/authUtils'

export interface PartialFunctionID {
  functionName?: string
  functionVersion?: string
}

export interface FunctionID {
  functionName: string
  functionVersion: string
}

const createUrl = (username: string, partialFunctionID: PartialFunctionID) => {
  const { functionName, functionVersion } = partialFunctionID
  return (
    `/${username}/function` + (functionName ? `/${functionName}` + (functionVersion ? `/${functionVersion}` : '') : '')
  )
}

export class HermesFunctionDatasource {
  private static client: AxiosInstance = axios.create()

  private static get baseURL() {
    return Environment.baseURL + '/user'
  }

  public static async getFunction(
    username: string,
    partialFunctionID: PartialFunctionID,
    token: string
  ): Promise<FunctionGetObj> {
    try {
      const clientRes = await this.client.get(this.baseURL + createUrl(username, partialFunctionID), {
        headers: getAuthorizationHeader(token),
      })
      return clientRes.data
    } catch (err) {
      throw err
    }
  }

  public static async deleteFunction(
    username: string,
    partialFunctionID: PartialFunctionID,
    token: string
  ): Promise<FunctionDeleteObj> {
    try {
      const clientRes = await this.client.delete(this.baseURL + createUrl(username, partialFunctionID), {
        headers: getAuthorizationHeader(token),
      })
      return clientRes.data
    } catch (err) {
      throw err
    }
  }

  public static async deployFunction(
    username: string,
    hermesFunction: HermesFunction,
    token: string
  ): Promise<FunctionPostObj> {
    try {
      const clientRes = await this.client.post(this.baseURL + `/${username}/function`, hermesFunction, {
        headers: getAuthorizationHeader(token),
      })
      return clientRes.data
    } catch (err) {
      throw err
    }
  }

  public static async updateFunction(
    username: string,
    partialFunctionID: FunctionID,
    updatedHermesFunction: HermesFunction,
    token: string
  ): Promise<FunctionPutObj> {
    try {
      const clientRes = await this.client.put(
        this.baseURL + createUrl(username, partialFunctionID),
        updatedHermesFunction,
        {
          headers: getAuthorizationHeader(token),
        }
      )
      return clientRes.data
    } catch (err) {
      throw err
    }
  }
}
