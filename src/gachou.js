var express = require('express')
var multer = require('multer')
var normalizer = require('./normalizer')

module.exports = function (options) {
  return new Gachou(options).router()
}

function Gachou (options) {
  this.uploadDir = options.uploadDir
  this.mediaStorage = options.mediaStorage
}

Gachou.prototype.router = function () {
  var router = express.Router()
  var upload = multer({
    dest: this.uploadDir
  })

  // Deliver media-files from the storage
  router.get('/media', (req, res, next) => this.mediaStorage.get(req, res, next))

  // Upload-workflow for media-files:
  router.post('/upload', upload.single('file'), function (req, res, next) {
    normalizer(req.file, {
      originalName: req.file.originalName,
      created: req.body.created
    })
      .then(function generateId () {

      })
      .done(function (normalizedFile) {
        res.send(normalizedFile)
      }) // TODO continue here
  })
  return router
}
