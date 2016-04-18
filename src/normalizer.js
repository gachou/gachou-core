/*!
 * gachou-core <https://github.com/gachou/gachou-core>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'
var mmm = require('mmmagic')
var Q = require('q')

module.exports = normalize

const magicFile = [
  require.resolve('media-mime-detect/misc/magic'),
  require.resolve('mmmagic/magic/magic.mgc')
].join(':')

const magic = new mmm.Magic(magicFile, mmm.MAGIC_MIME_TYPE)
const qMagic = Q.nbind(magic.detectFile, magic)

/**
 * List of default normalizer-plugins by mime-type
 * @type {object<function(string,object=):Promise<String>>}
 */
var defaultNormalizers = {
  'image/jpeg': require('./normalizers/default')
}

/**
 * Detect the mime-type of the file and convert the file to a standard-format
 * based on this information. The mime-type is detected via magic-bytes (using
 * `media-mime-detect`
 * @param {string} inputFile the path to the input file
 * @param {object=} metadata additional metadata that is not contained in the
 *  inputFile itself.
 * @para {date=} metadata.created the creation date of the file (from fs.Stats).
 * @returns {Promise<string>} the name of the converted file
 */
function normalize (inputFile, metadata) {
  return qMagic(inputFile, metadata)
    .then(function (mimeType) {
      if (defaultNormalizers[mimeType]) {
        return defaultNormalizers[mimeType](inputFile, metadata)
      } else {
        throw new Error('')
      }
    })
}
