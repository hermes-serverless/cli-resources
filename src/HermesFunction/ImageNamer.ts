import { HermesFunctionProto } from '../globalTypes'

export class ImageNamer {
  private config: HermesFunctionProto
  private username: string
  private dockerhubUsername: string

  constructor(hermesConf: HermesFunctionProto, username: string, dockerhubUsername: string) {
    this.username = username
    this.config = hermesConf
    this.dockerhubUsername = dockerhubUsername
  }

  private getBaseName = () => {
    return this.config.functionName + ':' + this.config.functionVersion
  }

  public getWatcherBase = () => {
    return `hermeshub/watcher-base-${this.config.language}`
  }

  public getWatcherName = () => {
    return `${this.dockerhubUsername}/watcher-${this.getBaseName()}`
  }

  public getBuildName = () => {
    return `${this.dockerhubUsername}/build-${this.getBaseName()}`
  }
}
