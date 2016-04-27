const sharp = require('sharp')

/**
 * @param {string} mimeType
 * @param {string} thumbspec
 * @param
 */
module.exports = function (mimeType, thumbspec) {
  if (!mimeType.match(/image\/.*/)) {
    return null
  }
  return sharp()
    .resize(thumbspec.width, thumbspec.height)
    .min()
    .crop(sharp.strategy.entropy)
    .progressive()
}
