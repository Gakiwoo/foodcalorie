import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const listed = spawnSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
if (listed.status !== 0) {
  process.stderr.write(listed.stderr)
  process.exit(listed.status || 1)
}

const excluded = [
  /(?:^|\/)test\//,
  /\.example$/,
  /package-lock\.json$/
]
const rules = [
  { name: 'private key', pattern: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/ },
  { name: 'unsafe SSH host-key policy', pattern: /AutoAddPolicy\s*\(/ },
  { name: 'hard-coded password', pattern: /(?:password|passwd)\s*=\s*['"][^'"\r\n]{8,}['"]/i },
  { name: 'hard-coded API credential', pattern: /(?:api[_-]?key|client[_-]?secret)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i }
]

const findings = []
for (const file of listed.stdout.split('\0').filter(Boolean)) {
  if (!existsSync(file) || excluded.some((pattern) => pattern.test(file))) continue
  const content = readFileSync(file)
  if (content.includes(0)) continue
  const text = content.toString('utf8')
  for (const rule of rules) {
    if (rule.pattern.test(text)) findings.push(`${file}: ${rule.name}`)
  }
}

if (findings.length > 0) {
  console.error('Potential secrets detected:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log('Secret scan passed.')
