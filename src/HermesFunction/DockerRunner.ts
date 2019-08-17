import execa from 'execa'

export class DockerRunner {
  static run(args: string[], outputEnabled = false) {
    const dockerProc = execa('/usr/bin/docker', args)
    if (outputEnabled) dockerProc.all.pipe(process.stdout)
    return dockerProc
  }
}
