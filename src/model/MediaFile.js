'use strict'

const exiftool = require('../utils/exiftool')
const md5 = require('md5')
const Q = require('q')

/**
 * @typedef {object} MediaMetadata
 * @property {string} id - the unique identifier (as stored in XMP:Identifier)
 * @property {string} urlId - the identifier for use in URLs and for retrieval from the MediaStorage
 * @property {Date} createDate - the creation date of the
 * @property {string[]} tags - a list of tags from XMP:HierarchicalSubject
 */

/**
 * @typedef {object} MetadataQuery
 * @property {Date} after - only files created after this date will be returned
 * @property {Date} before - only files created before this date will be returned
 */

class MediaFile {
  /**
   * @private Use MediaFile.load instead
   * @param file
   * @param metadata
   */
  constructor (file, metadata) {
    this.file = file
    this.metadata = metadata
  }

  /**
   *
   * @param file
   * @param metadata
   * @returns {Promise<MediaFile>}
     */
  static from (file, metadata) {
    return Q.all([file, metadata])
      .spread((file, metadata) => new MediaFile(file, metadata))
  }

  get id () {
    return this.metadata.uuid
  }

  get mimeType () {
    return this.metadata.mimeType
  }

  /**
   *
   * @returns {moment}
   */
  get createDate () {
    return this.metadata.created
  }

  /**
   * Return a path under which this file is downloaded from the MediaStorage.
   * This url is inserted into the web-page under the /media-path to download the original image
   * and under the `/thumbnails/{spec}`-path for thumbnails
   * @returns {*}
   */
  get uriPath () {
    var formattedDate = this.createDate.format('YYYY-MM-DD--HH-mm-ss')
    var unifier = md5(this.id).substring(0, 10)
    var extension = extensions[this.metadata.mimeType]
    return `${formattedDate}-${unifier}.${extension}`
  }

  store () {
    return exiftool(this.file).saveTags(this.metadata)
  }
}

var extensions = {
  'image/jpeg': 'jpg'
}

module.exports = MediaFile
