import { RunDeleteObj, RunGetObj } from '@hermes-serverless/api-types-db-manager/run'
import { RunStatus } from '@hermes-serverless/api-types-function-watcher'
import { StringStream } from '@hermes-serverless/stream-utils'
import axios, { AxiosInstance } from 'axios'
import request from 'request'
import { Readable } from 'stream'
import { Environment } from '../Environment'
import { getAuthorizationHeader } from '../utils/authUtils'
import { FunctionID, PartialFunctionID } from './HermesFunction'

interface PartialFunctionIDWithOwner extends PartialFunctionID {
  functionOwner: string
}

interface FunctionIDWithOwner extends FunctionID {
  functionOwner: string
}

const createFunctionRunsUrl = (username: string, partialFunctionID: PartialFunctionIDWithOwner) => {
  const { functionOwner, functionName, functionVersion } = partialFunctionID
  return (
    `/${username}/function-runs/${functionOwner}` +
    (functionName ? `/${functionName}` + (functionVersion ? `/${functionVersion}` : '') : '')
  )
}

const createRunsUrl = (username: string, { id }: { id?: string }) => {
  return `/${username}/runs` + (id ? `/${id}` : '')
}

export class RunDatasource {
  private static client: AxiosInstance = axios.create()

  private static get baseURL() {
    return Environment.baseURL + '/auth'
  }

  public static async getRuns(username: string, runID: { id?: string }, token: string): Promise<RunGetObj> {
    try {
      const clientRes = await this.client.get(this.baseURL + createRunsUrl(username, runID), {
        headers: getAuthorizationHeader(token),
      })
      return clientRes.data
    } catch (err) {
      throw err
    }
  }

  public static async deleteRun(username: string, runID: { id: string }, token: string): Promise<RunDeleteObj> {
    try {
      const clientRes = await this.client.delete(this.baseURL + createRunsUrl(username, runID), {
        headers: getAuthorizationHeader(token),
      })
      return clientRes.data
    } catch (err) {
      throw err
    }
  }

  public static async getFunctionRuns(
    username: string,
    functionID: PartialFunctionIDWithOwner,
    token: string
  ): Promise<RunGetObj> {
    try {
      const clientRes = await this.client.get(this.baseURL + createFunctionRunsUrl(username, functionID), {
        headers: getAuthorizationHeader(token),
      })
      return clientRes.data
    } catch (err) {
      throw err
    }
  }

  public static async deleteFunctionRuns(
    username: string,
    functionID: PartialFunctionIDWithOwner,
    token: string
  ): Promise<RunDeleteObj> {
    try {
      const clientRes = await this.client.delete(this.baseURL + createFunctionRunsUrl(username, functionID), {
        headers: getAuthorizationHeader(token),
      })
      return clientRes.data
    } catch (err) {
      throw err
    }
  }

  static async createAsyncRun(
    username: string,
    functionID: FunctionIDWithOwner,
    input: Readable | string,
    token: string
  ): Promise<any> {
    try {
      const { functionOwner, functionName, functionVersion } = functionID
      const res = await this.client.post(
        this.baseURL + `${username}/run/${functionOwner}/${functionName}/${functionVersion}`,
        input,
        {
          headers: {
            ...getAuthorizationHeader(token),
            'x-hermes-run-type': 'sync',
          },
        }
      )
      return res.data
    } catch (err) {
      throw err
    }
  }

  static async createSyncRun(
    username: string,
    functionID: FunctionIDWithOwner,
    input: Readable | string,
    token: string
  ): Promise<request.Request> {
    try {
      const { functionOwner, functionName, functionVersion } = functionID
      const res = request.post(
        this.baseURL + `${this.baseURL}/user/${username}/run/${functionOwner}/${functionName}/${functionVersion}`,
        {
          headers: {
            ...getAuthorizationHeader(token),
            'x-hermes-run-type': 'sync',
          },
        }
      )

      if (typeof input === 'string') {
        const stream = new StringStream(input)
        stream.pipe(res)
      } else input.pipe(res)

      return res
    } catch (err) {
      throw err
    }
  }

  static async getRunStatus(username: string, runID: string, token: string): Promise<RunStatus> {
    try {
      const res = await this.client.get(this.baseURL + `${username}/run/${runID}/status`, {
        headers: {
          ...getAuthorizationHeader(token),
        },
        responseType: 'stream',
      })
      return res.data
    } catch (err) {
      throw err
    }
  }
}
