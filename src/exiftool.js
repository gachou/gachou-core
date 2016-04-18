/*!
 * gachou-core <https://github.com/gachou/gachou-core>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

var Q = require('q')
var cp = require('child_process')
var uuid = require('uuid')

// Wrapper for the exittool
module.exports = function (file) {
  return new ExifTool(file)
}

module.exports.parseExifDate = parseExifDate

class ExifTool {

  /**
   *
   * @param {string} file the filename
   */
  constructor (file) {
    this.file = file
  }

  /**
   * Low level helper to run the exiftool
   * @param {string[]} args CLI arguments
   * @private
   * @returns {Promise<{stdout,stderr}>} a promise for the output. The child-process is available
   *  through the `.child`-property
   */
  run (args) {
    var deferred = Q.defer()
    var cmdArgs = args.concat([this.file])
    deferred.promise.child = cp.execFile('exiftool', cmdArgs, {
      encoding: 'utf-8'
    }, function (err, stdout, stderr) {
      if (err) {
        return deferred.reject(err)
      }
      deferred.fulfill({
        stdout: stdout,
        stderr: stderr
      })
    })

    return deferred.promise
  }

  /**
   * Returns a number of tags from the file, optionally filterd by a list of
   * tags provided as first argument. The result is a nested JavaScript-object
   * for example, if `['Composite:Aperture','XMP:HierarchicalSubject']` is provided
   * as `tags`, the  result is something like
   *
   * ```js
   * {
   *    XMP: { HierarchicalSubject: 'Places|Darmstadt|Prinz-Georgs-Garten' },
   *    Composite: { Aperture: 4.7 }
   * }
   * ```
   *
   * @param {string[]=} tags a list of interesting tags (like `Composite:Aperture`)
   *   a complete list of tags can be found at. Default is `[]` for: Get all possible tags
   *   http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/index.html
   * @returns {Promise<object>}
   */
  tags (tags) {
    return this.run(['-G', '-j'].concat((tags || []).map((tag) => `-${tag}`)))
      .then((output) => {
        var result = JSON.parse(output.stdout)[0]
        delete result['SourceFile']
        return result
      })
  }

  saveTags (tagObject) {
    var stdinObj = [
      {
        SourceFile: this.file
      }
    ]
    Object.keys(tagObject).forEach((key) => {
      stdinObj[0][key] = tagObject[key]
    })
    // Run exiftool so that it accepts a json input as stdin
    var result = this.run(['-G', '-j=-'])
    result.child.stdin.end(JSON.stringify(stdinObj))

    return result
  }

  ensureId () {
    return this.tags(['XMP:Identifier'])
      .then((tags) => {
        var id = tags['XMP:Identifier']
        if (id) {
          return id
        }
        // Create and store new id
        var newId = 'gc-' + uuid.v4()
        return this.saveTags({ 'XMP:Identifier': newId })
          .then(() => newId)
      })
  }
}

/**
 * Parses a string of the form `2011:06:23 16:15:45` into a JavaScript Date-object
 * @param {string} exifDate
 * @returns {Date} the corresponding date object in local time
 */
function parseExifDate (exifDate) {
  var utc = exifDate.replace(/(\d+):(\d+):(\d+) (\d+):(\d+):(\d+)/, '$1-$2-$3T$4:$5:$6Z')
  // Compute UTC and add timezone offset (in minutes) to get the local time
  return new Date(Date.parse(utc) + new Date().getTimezoneOffset() * 60000)
}
