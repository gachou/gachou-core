/*!
 * gachou-core <https://github.com/gachou/gachou-core>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */
var sharp = require('sharp')
var qfs = require('q-io/fs')
var exiftool = require('../utils/exiftool')

/**
 * The default normalizer just leaves the file as it is
 * @param {string} inputFile the name of the input file
 * @param {object=} fsMetadata additional metadata that is not contained in the
 *  inputFile itself.
 * @param {string} mimeType the mimeType of the file
 * @para {date=} fsMetadata.created the creation date of the file (from fs.Stats).
 * @returns {Promise<string>|null} the name of the converted file or null if the file type is not supported
 */
module.exports = function (inputFile, fsMetadata, mimeType) {
  if (!mimeType.match(/image\/.*/)) {
    return null
  }
  var targetFile = `${inputFile}-norm.jpg`
  return sharp(inputFile)
    .rotate()
    .withMetadata()
    .toFile(targetFile)
    .then(() => qfs.remove(inputFile))
    .then(() => exiftool(targetFile).ensureId())
    .then(() => targetFile)
}
