export interface User {
  username: string
}

export interface UserForAuth extends User {
  password: string
}

export interface AuthObj {
  auth: boolean
  token: string
}

export interface UsernameExistenceObj {
  username: string
  exists: boolean
}

export interface HermesFunctionProto {
  functionName: string
  language: string
  gpuCapable: boolean
  functionVersion: string
  scope: string
}

export interface HermesFunction extends HermesFunctionProto {
  imageName: string
}

export interface Run {
  id: string
  startTime: Date
  endTime: Date
  status: string
  elapsedTime?: string
  function: HermesFunction
}

export interface HermesFunctionWithOwner extends HermesFunction {
  owner: { username: string }
}

export interface CompleteRunInfo extends Run {
  function: HermesFunctionWithOwner
}

export interface BuiltFunction {
  username: string
  dockerhubUsername: string
  hermesConfig: HermesFunctionProto
}

export interface BuiltWatcher {
  username: string
  hermesFunctionConfig: HermesFunction
}
