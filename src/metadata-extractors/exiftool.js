'use strict'

const exiftool = require('../utils/exiftool')

module.exports = {
  load: function (file) {
    return exiftool(file)
      .tags(['XMP:*', 'EXIF:*', 'IPTC:*', 'File:MIMEType'])
      .then((metadata) => {
        var exifMoment = exiftool.parseExifMoment(metadata['EXIF:CreateDate'])
        return {
          uuid: metadata['XMP:Identifier'],
          created: {
            date: exifMoment.toDate(),
            year: exifMoment.year(),
            month: exifMoment.format('MMMM'),
            day: exifMoment.format('D')
          },
          mimeType: metadata['File:MIMEType'],
          custom: {
            exiftool: metadata
          }
        }
      })
  },

  save: function (file, metadata) {
    return // TODO
  }
}
