const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')

const ecosystem = require('../ecosystem.config.cjs')

test('production PM2 config pins the supported Node.js 24 runtime', () => {
  assert.equal(ecosystem.apps.length, 1)
  const app = ecosystem.apps[0]
  assert.equal(app.name, 'foodcalorie-api')
  assert.equal(app.cwd, path.resolve(__dirname, '..'))
  assert.equal(app.script, 'src/server.js')
  assert.equal(app.interpreter, '/opt/node-v24/bin/node')
  assert.equal(app.env.NODE_ENV, 'production')
})
