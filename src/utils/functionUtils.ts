import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { HermesFunctionProto } from '../globalTypes'

export const parseHermesConfig = (dir: string): HermesFunctionProto => {
  const hermesPath = path.join(dir, 'hermes.config.json')
  if (!fs.existsSync(hermesPath)) {
    console.log(chalk.bold.red("This directory doesn't have a hermes.config.json"))
    process.exit(1)
  }

  const hermesConf: HermesFunctionProto = JSON.parse(fs.readFileSync(hermesPath, { encoding: 'utf-8' }))

  const fields = ['functionName', 'functionVersion', 'gpuCapable', 'language', 'scope', 'handler']
  const err: any[] = []
  fields.forEach((field: string) => {
    if (hermesConf[field as keyof typeof hermesConf] == null) {
      err.push(chalk.bold.red(`Missing field ${field} on hermes.config.json`))
    }
  })

  if (err.length !== 0) {
    err.forEach(msg => console.log(msg))
    process.exit(1)
  }

  const versionReg = /^([0-9]+\.)([0-9]+\.)([0-9])$/
  if (!versionReg.test(hermesConf.functionVersion)) {
    console.log(chalk.bold.red(`Use [number].[number].[number] pattern for versioning`))
    process.exit(1)
  }

  const nameReg = /^[a-z0-9_]+[a-z0-9_\-]*$/
  if (!nameReg.test(hermesConf.functionName)) {
    console.log(
      chalk.bold.red(
        `Use only lowercase letters, numbers, hyphens and underlines for function name. Don't start function name with hyphen`
      )
    )
    process.exit(1)
  }

  return hermesConf
}
