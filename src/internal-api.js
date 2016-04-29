'use strict'

const firstTruthyPromise = require('./utils/first-truthy-promise')
const Q = require('q')
const _ = require('lodash')
const streamWhenReady = require('./utils/stream-when-ready')
const moment = require('moment')
const md5 = require('md5')

var mmm = require('mmmagic')
const magicFile = [
  require.resolve('media-mime-detect/misc/magic'),
  require.resolve('mmmagic/magic/magic.mgc')
].join(':')
const magic = new mmm.Magic(magicFile, mmm.MAGIC_MIME_TYPE)
const qMagic = Q.nbind(magic.detectFile, magic)

/**
 * The internal api
 */
module.exports =
  class Api {
    constructor () {
      this.normalizers = []
      this.metadataExtractors = []
      /**
       * @type {Storage}
       */
      this.storage = null
      this.metadataIndex = null
      this.thumbnailers = []
      this.thumbspec = {}
    }

    /**
     * Register a normalizer function. A normalizer takes a file as argument
     * and returns the promise for another file. The "other" file should
     * be a representation of the original file in a canonical file format
     * for this kind of media.
     * It should also store an 'id' into the file if none is present yet.
     *
     * @param {function(file:string, fsMetadata: { created: Date }, mimeType: string):Promise<string>} normalizer
     */
    useNormalizer (normalizer) {
      this.normalizers.push(normalizer)
      return this
    }

    useExtractor (extractor) {
      this.metadataExtractors.push(extractor)
      return this
    }

    /**
     *
     * @param {MediaStorage} storage
     */
    useStorage (storage) {
      this.storage = storage
      return this
    }

    /**
     * Register a thumbnailer.
     * A thumbnailer is a function that returns a Duplex-stream for any mime-type
     * that it supports and null for all other mime-types
     * @param {function(mimeType: string, thumbspec: object):Duplex} thumbnailer
     */
    useThumbnailer (thumbnailer) {
      this.thumbnailers.push(thumbnailer)
      return this
    }

    /**
     *
     * @param {string} name
     * @param {{width:number, height: number}} thumbspec
     * @returns {Api}
       */
    useThumbSpec (name, thumbspec) {
      this.thumbspec[name] = thumbspec
      return this
    }

    useMetadataIndex (metadataIndex) {
      this.metadataIndex = metadataIndex
      return this
    }

    /**
     * Call the normalizers in order to create a normalized file for an input file.
     * The first non-null result(-promise) will be returned. Makes sure that an
     * id is stored in the files metadata
     * @param {string} file
     * @param {object} fsMetadata
     * @param {Date} fsMetadata.created
     *
     */
    normalize (file, fsMetadata) {
      return qMagic(file).then((mimeType) => firstTruthyPromise(this.normalizers, this, [file, fsMetadata, mimeType]))
    }

    /**
     *
     * @param uriPath
     * @return {stream.Writable} a writable stream to pipe the file contents into
     */
    storeFile (uriPath) {
      return streamWhenReady.writable(this.storage.store(uriPath, 'default'))
    }

    /**
     * Returns a Readable stream of the files contents,
     * optionally restricted to a byte range
     * @param {string} uriPath
     * @param {object=} options
     * @param {number=} options.from
     * @param {number=} options.to
     */
    readFile (uriPath, options) {
      return streamWhenReady.readable(this.storage.read(uriPath, 'default', options))
    }

    /**
     * Create a writable stream for storing a thumbnail
     * @param {string} uriPath
     * @param {string} thumbSpecName the name of the spec
     * @return {stream.Writable}
     */
    storeThumbnail (uriPath, thumbSpecName) {
      return streamWhenReady.writable(this.storage.store(uriPath, thumbSpecName))
    }

    /**
     * Create a readable stream for retrieving a thumbnail
     * @param {string} uriPath
     * @param {string} thumbSpecName the name of the spec
     * @param {object=} options
     * @param {number=} options.from
     * @param {number=} options.to
     * @return {stream.Readable}
     */
    readThumbnail (uriPath, thumbSpecName, options) {
      return streamWhenReady.readable(this.storage.read(uriPath, thumbSpecName, options))
    }

    extractMetadata (file) {
      // Execute all extractors
      return Q.all(this.metadataExtractors.map((extractor) => extractor.load(file)))
        // Collect and merge results
        .then((metadata) => metadata.reduce(_.merge, {}))
        .then(addUriPath)
        .then((metadata) => {
          console.log('Metadata', metadata)
          return metadata
        })
    }

    storeMetadata (metadata) {
      return this.metadataIndex.store(metadata)
    }

    /**
     *
     * @param {object} queryObj
     * @param {Date=} queryObj.after
     * @param {Date=} queryObj.before
     */
    queryMetadata (queryObj) {
      return this.metadataIndex.query(queryObj)
    }
    /**
     * Create a Duplex stream that builds a thumbnail of a file.
     * @param {string} mimeType a MIMEType
     * @param {string} thumbSpecName the name of the spec
     * @returns {Duplex} the thumbnailer
     */
    thumbnailer (mimeType, thumbSpecName) {
      return streamWhenReady.duplex(
        firstTruthyPromise(this.thumbnailers, this, [mimeType, this.thumbspec[thumbSpecName]])
      )
    }
}

/**
 *
 * @param {FileMetadata} metadata
 * @returns {FileMetadata}
 */
function addUriPath (metadata) {
  var formattedDate = moment(metadata.created).format('YYYY-MM-DD--HH-mm-ss')
  var unifier = md5(metadata.uuid).substring(0, 10)
  var extension = extensions[metadata.mimeType]
  metadata.uriPath = `${formattedDate}-${unifier}.${extension}`
  return metadata
}

var extensions = {
  'image/jpeg': 'jpg'
}
