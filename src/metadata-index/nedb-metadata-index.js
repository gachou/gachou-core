'use strict'

var DataStore = require('nedb')
var Q = require('q')

/**
 *
 * @param {string} dbFolder path to the tingodatabase
 * @returns {MetadataIndex}
 */
module.exports = function (dbFolder) {
  return new MetadataIndex(dbFolder)
}

class MetadataIndex {
  constructor (dbFile) {
    this.db = new DataStore({
      filename: dbFile,
      autoload: true
    })
  }

  /**
   * Store metadata of multiple files
   * @param {MediaMetadata} metadata athe metadata from multiple files
   * @returns {Promise}
   */
  store (metadata) {
    metadata._id = metadata.uuid
    return Q.ninvoke(this.db, 'update', { _id: metadata._id }, metadata, {
      upsert: true
    })
  }

  /**
   * Run a query on the metadata
   * @param {MetadataQuery} queryObj
   * @returns {Promise<FileMetadata[]>}
   */
  query (queryObj) {
    var query = {
      $and: []
    }
    if (queryObj.after) {
      query.$and.push({created: {$gt: queryObj.after}})
    }
    if (queryObj.before) {
      query.$and.push({created: {$lt: queryObj.before}})
    }

    return Q.ninvoke(this.db.find(query).sort({ created: 1 }), 'exec')
  }

}
