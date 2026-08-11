# 食刻 App · 页面清单

31 个功能页面（Vite 路由），全部由 MasterGo 画布设计并导出/同步。

## 主 Tab 与流程闭环

| 路由 | 页面 | 组件 | 画布节点 | 说明 |
|------|------|------|---------|------|
| `/` | 首页 | FoodCalorieHome | `5:022855` | 今日概览 + 拍照 CTA + 底部 Tab |
| `/records` | 记录页 | FoodCalorieRecords | `5:025802` | 日/周/月分段（61% 已摄入渐变环）|
| `/discover` | 发现页 | FoodCalorieDiscover | `12:09187` | 内容流（已删分类页签，搜索=添加记录）|
| `/me` | 我的页 | FoodCalorieMe | `12:10863` | 个人中心 + 功能入口 + 设置列表 |

## 记录闭环

| 路由 | 页面 | 组件 | 画布节点 |
|------|------|------|---------|
| `/camera` | 拍照识别页 | FoodCalorieCamera | `5:025542` |
| `/camerresult` | 识别结果确认页 | FoodCalorieCameraResult | `12:13437` |
| `/addfood` | 手动添加记录页 | FoodCalorieAddFood | `12:12141` |
| `/search` | 搜索结果页 | FoodCalorieSearch | `12:19005` |
| `/today` | 今日记录页 | FoodCalorieToday | `5:027553`（77% 渐变环）|
| `/records-week` | 本周记录页 | FoodCalorieRecordsWeek | `12:31842` |
| `/records-month` | 8月记录页 | FoodCalorieRecordsMonth | `12:33689` |
| `/detail` | 记录详情页 | FoodCalorieDetail | `5:087836`（删除确认弹窗）|
| `/editrecord` | 编辑记录页 | FoodCalorieEditRecord | `12:30809` |

## 发现内容闭环

| 路由 | 页面 | 组件 | 画布节点 |
|------|------|------|---------|
| `/article` | 文章详情页 | FoodCalorieArticle | `12:15888` |
| `/recipe` | 食谱详情页 | FoodCalorieRecipe | `12:17086` |
| `/challenge` | 夏季轻食挑战活动页 | FoodCalorieChallenge | `12:29559` |
| `/favorites` | 我的收藏页 | FoodCalorieFavorites | `12:20044` |

## 个人中心 / 设置

| 路由 | 页面 | 组件 | 画布节点 |
|------|------|------|---------|
| `/profile` | 个人信息页 | FoodCalorieProfile | `12:24752` |
| `/goal` | 目标设置页 | FoodCalorieGoal | `12:14572` |
| `/dietpref` | 饮食偏好页 | FoodCalorieDietPref | `12:26411` |
| `/unit` | 单位设置页 | FoodCalorieUnit | `12:27604` |
| `/precision` | 拍照识别精度页 | FoodCaloriePrecision | `12:28285` |
| `/burst` | 连拍模式页 | FoodCalorieBurst | `12:28950` |
| `/notification` | 通知设置页 | FoodCalorieNotification | `12:22019` |
| `/privacy` | 隐私设置页 | FoodCaloriePrivacy | `12:22841` |
| `/help` | 帮助反馈页 | FoodCalorieHelp | `12:25597` |
| `/about` | 关于我们页 | FoodCalorieAbout | `12:23711`（ICP：粤ICP备2025362354号）|
| `/dataexport` | 数据导出页 | FoodCalorieDataExport | `12:21042` |
| `/settings` | 设置页 | FoodCalorieSettings | `5:024266`（含「我的记录」入口）|

## 登录注册

| 路由 | 页面 | 组件 | 画布节点 |
|------|------|------|---------|
| `/login` | 登录页 | FoodCalorieLogin | `12:35840`（邮箱+密码，无验证码）|
| `/register` | 注册页 | FoodCalorieRegister | `12:36737`（邮箱+密码+确认，无验证码）|

## 技术备注

- 12 个页面（Favorites/Profile/Help/DietPref/Unit/Precision/Burst/Challenge/EditRecord/RecordsWeek/RecordsMonth/Login/Register）以 `?raw` 嵌入画布源 HTML，修改后需同步画布节点（`agent_sync_design` 要求根 `<main>` 带 `data-node-id`）。
- 跳转规则集中在 `frontend/App.jsx` 的 `NAV` 表；新增页面 = 注册路由 + 加 NAV 规则。
