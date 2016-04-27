'use strict'

const exiftool = require('../utils/exiftool')

module.exports = {
  load: function (file) {
    return exiftool(file)
      .tags(['XMP:*', 'EXIF:*', 'IPTC:*', 'File:MIMEType'])
      .then((metadata) => {
        return {
          uuid: metadata['XMP:Identifier'],
          created: exiftool.parseExifDate(metadata['EXIF:CreateDate']),
          mimeType: metadata['File:MIMEType'],
          custom: {
            exiftool: metadata
          }
        }
      })
  },

  save: function (file, metadata) {
    return
  }
}
