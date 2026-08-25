// E2E 测试凭据：强制从环境变量读取，仓库内零凭据（check-secrets 门禁可全量扫描）
//
// 使用：
//   FC_TEST_EMAIL=t_fc_test@x.com FC_TEST_PASSWORD=<真实密码> node verify_m7.cjs
// 生产测试账号密码轮换后（见 ops/README.md），只需更新服务器侧账号，无需改仓库。
const EMAIL = process.env.FC_TEST_EMAIL
const PWD = process.env.FC_TEST_PASSWORD

if (!EMAIL || !PWD) {
  console.error(
    '[test-credentials] 缺少 E2E 凭据：请设置 FC_TEST_EMAIL 与 FC_TEST_PASSWORD 环境变量（勿写入仓库）'
  )
  process.exit(1)
}

module.exports = { EMAIL, PWD }
