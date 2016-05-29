/**
 * This defines the metadata needed by gachou-core.
 * An extractor should fill those properties if
 * it can extract them, but it can also omit them
 * and hope that another extractor will find them.
 *
 * Additional data should be extracted into the property
 * `custom.extractorName`
 *
 *
 * @typedef {object} FileMetadata
 *
 * @property {Date} [created] the creation date of the file
 * @property {string} [uuid] the generated UUID of the file
 * @property {string} [mimeType] the mime-type of the file
 * @property {string} [uriPath] the name of the file within the URL
 * @property {object<object>} [custom] custom per-extractor data
 */

/**
 * @typedef {object} MetadataQuery
 * @property {Date} before - only return files created before the given date
 * @property {Date} after - only return files created after the given date
 */

module.exports.MetadataExtractor =
  class {
    /**
     * Load Metadata from a file
     * @param {string} file
     * @returns {Promise<FileMetadata>} metadata
     */
    load (file) {}

    /**
     * Store metadata into a file
     * @param {string} file
     * @param {Promise<FileMetadata>} metadata
     */
    save (file, metadata) {}
}

module.exports.MetadataIndex =
  class {
    /**
     * Store a metadata object into the index
     * @param {FileMetadata} metadata
     * @returns {Promise} a promise that is fulfilled when the storage is complete
     */
    store (metadata) {}

    /**
     * Execute a query on the metadata and return the results
     * @param {MetadataQuery} queryObj - the query
     */
    query (queryObj) {}
}
