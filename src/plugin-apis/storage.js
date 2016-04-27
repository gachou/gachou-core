'use strict'

module.exports =
  class {

    /**
     * Returns a Readable stream of the files contents,
     * optionally restricted to a byte range
     * @param {string} uriPath the name of the file that appears in the URL
     * @param {string} collectionName the name of the collection (`default`, `200x200`)
     * @returns {Promise<Writable>|Writable}
     */
    store (uriPath, collectionName) {}

    /**
     * Returns a Readable stream of the files contents,
     * optionally restricted to a byte range
     * @param {string} uriPath the name of the file that appears in the URL
     * @param {string} collectionName the name of the collection (`default`, `200x200`)
     * @param {object=} options
     * @param {number=} options.from
     * @param {number=} options.to
     * @returns {Promise<Readable>|Readable}
     */
    read (uriPath, collectionName, options) {}
}
