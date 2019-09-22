import { AxiosError } from 'axios'
import chalk from 'chalk'
import { HermesFunctionDatasource } from '../datasources/HermesFunction'
import { Builder, BuilderOptions } from './Builder'
import { DataProvider } from './DataProvider'
import { DockerRunner } from './DockerRunner'

interface PusherOptions extends BuilderOptions {}

export class Pusher {
  private builder: Builder
  private fnData: DataProvider
  private logger: any
  private outputToStdout: boolean

  constructor(fnDir: string, username: string, dockerhubUsername: string, options?: PusherOptions) {
    const { logger, outputToStdout }: PusherOptions = options || {}
    this.outputToStdout = outputToStdout
    this.logger = logger || { log: () => {} }
    this.fnData = new DataProvider(fnDir, username, dockerhubUsername)
    this.builder = new Builder(fnDir, username, dockerhubUsername, {
      fnData: this.fnData,
      ...options,
    })
  }

  public addToHermes = async (update: boolean, token: string, target = 'development') => {
    const exists = await this.checkIfFunctionExists(token)

    if (exists) {
      this.logger.log(chalk.bold(`-> The function ${chalk.green(this.fnData.functionName)} already exists.`))
      if (!update) throw new Error('Function already exists and update flag is false')
      this.logger.log(chalk.bold(`-> Update function!`))
    }

    await this.build(target)
    await this.pushWatcherToDockerhub()
    if (exists && update) return await this.updateOnHermes(token)
    return await this.pushToHermes(token)
  }

  private build = (target: string) => {
    return this.builder.buildWatcher(target)
  }

  private pushToHermes = async (token: string) => {
    this.logger.log(chalk.bold.green('===== DEPLOY FUNCTION ON HERMES ======'))
    const fn = await HermesFunctionDatasource.deployFunction(this.fnData.username, this.fnData.functionObj, token)
    this.logger.log(chalk.bold.green('===== FUNCTION DEPLOYED ======'))
    return fn.newFunction
  }

  private updateOnHermes = async (token: string) => {
    this.logger.log(chalk.bold.green('===== UPDATE FUNCTION ON HERMES ======'))
    const fn = await HermesFunctionDatasource.updateFunction(
      this.fnData.username,
      this.fnData.functionID,
      this.fnData.functionObj,
      token
    )
    this.logger.log(chalk.bold.green('===== FUNCTION UPDATED ======'))
    return fn.updatedFunctions
  }

  private checkIfFunctionExists = async (token: string) => {
    try {
      await HermesFunctionDatasource.getFunction(this.fnData.username, this.fnData.functionID, token)
      return true
    } catch (err) {
      const axiosErr: AxiosError = err
      this.logger.log(axiosErr.response.data.error)
      return axiosErr.response.data.error !== 'NoSuchFunction'
    }
  }

  private pushWatcherToDockerhub = async () => {
    try {
      await DockerRunner.run(['push', this.fnData.watcherName], this.outputToStdout)
    } catch (err) {
      this.logger.error(
        chalk.bold.red(
          `ERROR: Check if you're logged in to ${chalk.blue(
            this.fnData.dockerhubUsername
          )} on docker. You can do it using docker logout and docker login again`
        )
      )
      throw err
    }
    this.logger.log(chalk.bold.green(`===== IMAGE ${this.fnData.watcherName} PUSHED TO DOCKERHUB ======\n`))
  }
}
