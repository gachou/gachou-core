/*!
 * gachou-core <https://github.com/gachou/gachou-core>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */
var Q = require('q')

/**
 * The default normalizer just leaves the file as it is
 * @param {string} inputFile the name of the input file
 * @param {object=} metadata additional metadata that is not contained in the
 *  inputFile itself.
 * @returns {Promise<string>} the name of the converted file
 */
module.exports = function (inputFile, metadata) {
  return Q(inputFile)
}
