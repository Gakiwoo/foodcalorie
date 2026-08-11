'use strict'
// Service 层：收藏业务
const favoriteRepo = require('./repositories/favoriteRepo')
const { ServiceError } = require('../../shared/utils/serviceError')
const { FAVORITE_EXISTS, FAVORITE_NOT_FOUND } = require('../../shared/utils/errors')

function listFavorites(userId, type) {
  return favoriteRepo.list(userId, type)
}

function addFavorite(userId, type, refId) {
  const { inserted, id } = favoriteRepo.add(userId, type, refId)
  if (!inserted) throw new ServiceError(409, FAVORITE_EXISTS)
  return { id, type, ref_id: refId, favorited: true }
}

function removeFavorite(userId, type, refId) {
  const changes = favoriteRepo.remove(userId, type, refId)
  if (changes === 0) throw new ServiceError(404, FAVORITE_NOT_FOUND)
  return { type, ref_id: refId, favorited: false }
}

module.exports = { listFavorites, addFavorite, removeFavorite }
