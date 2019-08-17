import axios from 'axios'
import chalk from 'chalk'
import { BuiltFunction, BuiltWatcher } from '../globalTypes'
import { DataProvider } from './DataProvider'
import { DockerRunner } from './DockerRunner'

export interface BuilderOptions {
  fnData?: DataProvider
  logger?: any
  outputToStdout?: boolean
}

const getDockerfileURL = (language: string) => {
  return `https://raw.githubusercontent.com/hermes-tcc/project-building-base-images/master/${language}.Dockerfile`
}

const getFunctionWatcherURL = () => {
  return 'github.com/hermes-tcc/function-watcher'
}

export class Builder {
  private fnData: DataProvider
  private logger: any
  private outputToStdout: boolean

  constructor(fnDir: string, username: string, dockerhubUsername: string, opts?: BuilderOptions) {
    const { fnData, logger, outputToStdout }: BuilderOptions = opts || {}
    this.outputToStdout = outputToStdout
    this.logger = logger || { log: () => {} }
    this.fnData = fnData ? fnData : new DataProvider(fnDir, username, dockerhubUsername)
  }

  public buildFunction = async (): Promise<BuiltFunction> => {
    const { data: dockerfile } = await axios.get(getDockerfileURL(this.fnData.language))

    this.logger.log(chalk.bold.green('===== BUILD HERMES FUNCTION ======'))

    const dockerProc = DockerRunner.run(
      ['build', '-f', '-', '-t', this.fnData.buildName, this.fnData.functionDir],
      this.outputToStdout
    )
    dockerProc.stdin.end(dockerfile)
    await dockerProc

    this.logger.log(chalk.bold.green('===== HERMES FUNCTION BUILT ======\n'))
    return this.fnData.builtFunctionObj
  }

  public buildWatcher = async (target = 'development'): Promise<BuiltWatcher> => {
    await this.buildFunction()

    this.logger.log(chalk.bold.green('===== BUILD WATCHER ======'))
    await DockerRunner.run(
      [
        'build',
        '-t',
        this.fnData.watcherName,
        `--target=${target}`,
        '--build-arg',
        `FN_IMAGE=${this.fnData.buildName}`,
        '--build-arg',
        `FN_LANGUAGE=${this.fnData.language}`,
        getFunctionWatcherURL(),
      ],
      this.outputToStdout
    )

    this.logger.log(chalk.bold.green('===== WATCHER BUILT ======\n'))
    return this.fnData.builtWatcherObj
  }
}
