import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

// 扫描 git 跟踪文件 + 未跟踪文件（排除 gitignore 命中的 .env 等）
const listed = spawnSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
const untracked = spawnSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' })
if (listed.status !== 0 || untracked.status !== 0) {
  process.stderr.write(listed.stderr || untracked.stderr)
  process.exit(listed.status || untracked.status || 1)
}
const files = [...listed.stdout.split('\0'), ...untracked.stdout.split('\0')].filter(Boolean)

// 豁免清单（收窄，不再一刀切豁免 test/ 目录）：
// - .env.example / package-lock.json：模板与依赖清单
// - archive/：历史归档参考区（只读，含旧版调试脚本）
const excluded = [
  /\.example$/,
  /package-lock\.json$/,
  /(?:^|\/)archive\//
]
const rules = [
  { name: 'private key', pattern: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/ },
  { name: 'unsafe SSH host-key policy', pattern: /AutoAddPolicy\s*\(/ },
  { name: 'hard-coded password (assignment or colon form)', pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"\r\n]{8,}['"]/i },
  { name: 'hard-coded API credential', pattern: /(?:api[_-]?key|client[_-]?secret)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i },
  { name: 'OpenAI/DeepSeek-style API key (sk-)', pattern: /\bsk-[A-Za-z0-9_-]{16,}\b/ },
  { name: 'AWS access key (AKIA)', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'GitHub token (ghp_ / github_pat_)', pattern: /\b(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}\b/ },
  { name: 'JWT_SECRET with real value', pattern: /JWT_SECRET\s*=\s*['"](?!please-set-same-secret|test-secret|security-test)[^'"\r\n]{16,}['"]/i },
  { name: 'known leaked test credential literal', pattern: /[T]est123456!/ }
]

const findings = []
for (const file of files) {
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
