'use strict'

var Loki = require('lokijs')
var Q = require('q')
var _ = require('lodash')

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
    this.db = new Loki(dbFile)
    this.collection = this.db.addCollection('EXIF:CreateDate')
  }

  /**
   * Store metadata of multiple files
   * @param {MediaMetadata[]} metadata athe metadata from multiple files
   */
  store (metadata) {
    // Find an existing objects with the same uuid
    var result = metadata.map((data) => {
      var newData = _.clone(data)
      delete newData.$loki
      var existing = this.collection.findOne({
        id: newData.id
      })
      if (existing) {
        // Update the existing object
        newData.$loki = existing.$loki
        return this.collection.update(newData)
      } else {
        return this.collection.insert(newData)
      }
    })
    return Q(result)
  }

  /**
   * Returns metadata of a file identified by its id
   * @param id the id to look for
   */
  byId (id) {
    return Q(this.collection.findOne({id: id}))
      .then(postProcess)
  }

  /**
   * Returns metadata of a file identified by its urlId
   * @param id the url id to look for
   */
  byUrlId (id) {
    return Q(this.collection.findOne({urlId: id}))
      .then(postProcess)
  }

  /**
   * Run a query on the metadata
   * @param queryObj
   * @returns {*}
   */
  query (queryObj) {
    var query = {
      $and: []
    }
    if (queryObj.after) {
      query.$and.push({createDate: {$gt: queryObj.after}})
    }
    if (queryObj.before) {
      query.$and.push({createDate: {$lt: queryObj.before}})
    }

    return Q(this.collection.find(query).map(postProcess))
  }

}

/**
 * Post-process a $loki-document (i.e. remove $loki and meta)
 * @param result
 * @returns {*}
 */
function postProcess (result) {
  delete result.meta
  delete result.$loki
  return result
}
