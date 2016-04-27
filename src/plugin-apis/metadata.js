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
 * @property {object<object>} [custom] custom per-extractor data
 *
 *
 */

module.exports = MetadataExtractor

class MetadataExtractor {
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
