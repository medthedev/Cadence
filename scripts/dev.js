// Run the Vite client and the local cloud sync server together.
const children = [
  Bun.spawn(['bun', 'run', 'vite'], { stdout: 'inherit', stderr: 'inherit' }),
  Bun.spawn(['bun', 'run', 'server/index.js'], { stdout: 'inherit', stderr: 'inherit' }),
]

let stopping = false
function stop() {
  if (stopping) return
  stopping = true
  for (const child of children) child.kill()
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)
for (const child of children) void child.exited.then(stop)

await Promise.all(children.map((child) => child.exited))
