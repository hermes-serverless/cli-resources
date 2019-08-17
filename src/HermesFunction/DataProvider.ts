import { FunctionID } from '../datasources/HermesFunction'
import { HermesFunction, HermesFunctionProto } from '../globalTypes'
import { parseHermesConfig } from '../utils/functionUtils'
import { ImageNamer } from './ImageNamer'

export class DataProvider {
  private hermesConfig: HermesFunctionProto
  public functionNamer: ImageNamer

  constructor(public functionDir: string, public username: string, public dockerhubUsername: string) {
    this.functionDir = functionDir
    this.hermesConfig = parseHermesConfig(this.functionDir)
    this.functionNamer = new ImageNamer(this.hermesConfig, this.username, this.dockerhubUsername)
  }

  get config() {
    return this.hermesConfig
  }

  get functionID(): FunctionID {
    const { functionName, functionVersion } = this.hermesConfig
    return {
      functionName,
      functionVersion,
    }
  }

  get language() {
    return this.hermesConfig.language
  }

  get functionName() {
    return `${this.hermesConfig.functionName}:${this.hermesConfig.functionVersion}`
  }

  get builtFunctionObj() {
    return {
      dockerhubUsername: this.dockerhubUsername,
      username: this.username,
      hermesConfig: this.hermesConfig,
    }
  }

  get builtWatcherObj() {
    const hermesFunctionConfig = {
      ...this.hermesConfig,
      imageName: this.watcherName,
    }

    return {
      hermesFunctionConfig,
      username: this.username,
    }
  }

  get functionObj(): HermesFunction {
    return {
      ...this.hermesConfig,
      imageName: this.watcherName,
    }
  }

  get watcherBase() {
    return this.functionNamer.getWatcherBase()
  }

  get watcherName() {
    return this.functionNamer.getWatcherName()
  }

  get buildName() {
    return this.functionNamer.getBuildName()
  }
}
