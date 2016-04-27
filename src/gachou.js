'use strict'

const express = require('express')
const multer = require('multer')
const setup = require('./default-setup')
const MediaFile = require('./model/MediaFile')
const fs = require('fs')
const async = require('async')
const qfs = require('q-io/fs')
const Q = require('q')

module.exports = function (options) {
  var api = setup(options.basePath)
  return new Gachou(api, options).router()
}

class Gachou {

  /**
   * @param {Api} api
   * @param {object} options
   * * @param {string} options.uploadDir
   */
  constructor (api, options) {
    this.api = api
    this.uploadDir = options.uploadDir
    this.thumbWorker = async.queue((task, callback) => {
      this.generateThumbnail(task.thumbSpecName, task.uriPath, task.mimeType)
        // Run callback in case of error or just to say that we are finished.
        .done(callback, callback)
    })
  }

  /**
   * Generate and store a thumbnail of a file
   * @param {string} thumbSpecName
   * @param {string} uriPath
   * @param {string} mimeType
   * @return {Promise} Promise for the finished and stored thumbnail
   */
  generateThumbnail (thumbSpecName, uriPath, mimeType) {
    return waitForWritable(
      this.api.readFile(uriPath)
        .pipe(this.api.thumbnailer(mimeType, thumbSpecName))
        .pipe(this.api.storeThumbnail(uriPath, thumbSpecName)))
  }

  router () {
    var router = express.Router()
    var upload = multer({
      dest: this.uploadDir
    })

    // Deliver media-files from the storage
    router.get('/media/:uriPath',
      (req, res, next) => this.api.readFile(req.params.uriPath).pipe(res))

    router.get('/thumbs/:thumbSpec/:uriPath',
      (req, res, next) => this.api.readThumbnail(req.params.uriPath, req.params.thumbSpec).pipe(res))

    // Upload-workflow for media-files:
    router.post('/upload', upload.single('file'), (req, res, next) => {
      return this.api.normalize(req.file.path, {
        created: req.body.created
      })
        .then((file) => MediaFile.from(file, this.api.extractMetadata(file)))
        .then((mediaFile) => {
          return waitForWritable(
            fs.createReadStream(mediaFile.file)
              .pipe(this.api.storeFile(mediaFile.uriPath))
          )
            .then(() => qfs.remove(mediaFile.file))
            .then(() => mediaFile)
        })
        .then((mediaFile) => {
          Object.keys(this.api.thumbspec)
            .forEach((specName) => this.thumbWorker.push({
              thumbSpecName: specName,
              uriPath: mediaFile.uriPath,
              mimeType: mediaFile.mimeType
            }))
          return mediaFile
        })
        .done(function (mediaFile) {
          res.send(mediaFile.uriPath)
        }) // TODO continue here
    })
    return router
  }
}

/**
 * Wait for a writable string to finish writing.
 * Return a promise for that event
 * @param stream
 * @returns {*|promise}
 */
function waitForWritable (stream) {
  const deferred = Q.defer()
  stream
    .on('error', (err) => deferred.reject(err))
    .on('finish', () => deferred.fulfill())
  return deferred.promise
}
