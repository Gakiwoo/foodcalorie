'use strict'
// Service 层：食物库业务（搜索/分类列表）
// 当前逻辑为纯查询透传，保留 Service 层以保持架构一致性，
// 未来增加搜索历史、热门排序、用户自定义食物过滤等业务逻辑时在此扩展。
const foodRepo = require('./repositories/foodRepo')

function searchFoods({ keyword, category, page, pageSize }) {
  return foodRepo.search({ keyword, category, page, pageSize })
}

function listCategories() {
  return foodRepo.categories()
}

module.exports = { searchFoods, listCategories }
