export class Environment {
  private static hermesBaseURL = ''

  static get baseURL() {
    return this.hermesBaseURL
  }

  static set baseURL(url: string) {
    this.hermesBaseURL = url
  }
}
