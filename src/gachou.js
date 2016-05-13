'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const setup = require('./default-setup')
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

    router.use(bodyParser.json())

    // Deliver media-files from the storage
    router.get('/media/:uriPath',
      (req, res, next) => this.api.readFile(req.params.uriPath).pipe(res))

    router.get('/thumbs/:thumbSpec/:uriPath',
      (req, res, next) => this.api.readThumbnail(req.params.uriPath, req.params.thumbSpec).pipe(res))

    router.get('/query', (req, res, next) => {
      this.api.queryMetadata({
        after: req.query.after && new Date(req.query.after),
        before: req.query.before && new Date(req.query.before)
      })
        .then((result) => result.map((entry) => {
          return {
            uriPath: entry.uriPath,
            created: entry.created,
            tags: entry.custom.exiftool['XMP:HierarchicalSubject']
          }
        }))
        .done((result) => res.json(result), (err) => next(err))
    })

    router.post('/query', (req, res, next) => {
      Q.ninvoke(this.api.metadataIndex.db, 'find', req.body)
        .done(
          (result) => res.json(result),
          (err) => next(err))
    })

    // Upload-workflow for media-files:
    router.post('/upload', upload.single('file'), (req, res, next) => {
      return this.api.normalize(req.file.path, {
        created: req.body.created
      })
        .then((file) => Q.all([file, this.api.extractMetadata(file)]))
        .spread((file, metadata) => {
          return waitForWritable(
            fs.createReadStream(file)
              .pipe(this.api.storeFile(metadata.uriPath))
          )
            .then(() => qfs.remove(file))
            .then(() => metadata)
        })
        .then((metadata) => {
          // Store metadata
          return this.api.metadataIndex.store(metadata)
            .then(() => metadata)
        })
        .then((metadata) => {
          Object.keys(this.api.thumbspec).forEach((specName) => {
            this.thumbWorker.push({
              thumbSpecName: specName,
              uriPath: metadata.uriPath,
              mimeType: metadata.mimeType
            })
          })
          return metadata
        })
        .done(function (metadata) {
          res.send(JSON.stringify(metadata))
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
