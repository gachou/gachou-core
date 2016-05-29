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
 * @property {Date} [created] 
 * @property {string} [uuid] 
 * @property {string} [mimeType] 
 * @property {string} [uriPath] 
 * @property {object<object>} [custom] 
 */
export interface FileMetadata {
    /**
     * the creation date of the file
     */
    created?: Date

    /**
     * the generated UUID of the file
     */
    uuid?: string

    /**
     * the mime-type of the file
     */
    mimetype?: string

    /**
     * the name of the file within the URL
     */
    uriPath?: string

    /**
     * custom per-extractor data
     */
    custom: CustomMetadata
}

/**
 * Plugins should provide mixins to this type
 */
export interface CustomMetadata {
    
}

/**
 * @typedef {object} MetadataQuery
 * @property {Date} before - only return files created before the given date
 * @property {Date} after - only return files created after the given date
 */

export interface MetadataExtractor {
    /**
     * Load Metadata from a file
     * @param {string} file
     * @returns {Promise<FileMetadata>} metadata
     */
    load (file: string): Promise<FileMetadata>
               
    /**
     * Store metadata into a file
     * @param {string} file
     * @param {Promise<FileMetadata>} metadata
     */
    save (file: string , metadata: Promise<FileMetadata>): Promise<any>
}

export class MetadataIndex {
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
