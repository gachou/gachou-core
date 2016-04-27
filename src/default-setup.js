'use strict'

const Api = require('./internal-api')
const FileStorage = require('./storage/file-storage')
const path = require('path')

module.exports = function (basePath) {
  return new Api()
    .useStorage(new FileStorage(path.join(basePath, 'media-storage')))
    .useNormalizer(require('./normalizers/to-jpeg'))
    .useExtractor(require('./metadata-extractors/exiftool'))
    .useThumbnailer(require('./thumbnailers/sharp'))
    .useThumbSpec('200x200', {width: 200, height: 200})
}
