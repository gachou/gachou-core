'use strict'

const fs = require('fs')
const qfs = require('q-io/fs')
const path = require('path')

/**
 * @extends MediaStorage
 */
module.exports =
  class {
    /**
     * @param {string} root the base path for storing files storage
     */
    constructor (root) {
      this.root = root
    }

    store (uriPath, collectionName) {
      var targetPath = this.expand(uriPath, collectionName)
      return qfs.makeTree(path.dirname(targetPath))
        .then(() => fs.createWriteStream(targetPath, {
          // Fail if file already exists. We don't want to overwrite existing
          // data. Instead, the filename should be unique (and the file indefinitely cachable)
          'flags': 'wx'
        }))
    }

    read (uriPath, collectionName, options) {
      return fs.createReadStream(this.expand(uriPath, collectionName))
    }

    expand (uriPath, collectionName) {
      collectionName = collectionName || 'original'
      return uriPath.replace(/^(\d+)-(\d+)-.*/, (name, year, month) => {
        return path.join(this.root, collectionName, year, month, name)
      })
    }

}
