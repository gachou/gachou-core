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
var moment = require('moment')

// Wrapper for the exittool
module.exports = function (file) {
  return new ExifTool(file)
}

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
   *    XMP: { HierarchicalSubject: ['Places|Darmstadt|Prinz-Georgs-Garten'] },
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
    // -G: Print each tag with group-name (like "XMP:HierarchicalSubject")
    // -json: Print as JSON
    // -struct: Print arrays as array (even if they only have one element)
    return this.run(['-G', '-json', '-struct'].concat((tags || []).map((tag) => `-${tag}`)))
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
    var result = this.run(['-G', '-j=-', '-overwrite_original'])
    result.child.stdin.end(JSON.stringify(stdinObj))
    return result
  }

  /**
   * Makes sure that the XMP:Identifier is set in the file's metadata.
   * Returns an existing identifier if present. Generates and stores a new one
   * and returns it, if none exists at the moment.
   *
   * @returns {Promise<string>} a unique identifier
   */
  ensureId () {
    return this.tags(['XMP:Identifier'])
      .then((tags) => {
        // Make sure that the XMP:Identifier is set in the file's metadata.
        var id = tags['XMP:Identifier']
        if (id) {
          return id
        }
        // Create and store new id
        var newId = uuid.v4()
        return this.saveTags({ 'XMP:Identifier': newId })
          .then(() => newId)
      })
  }

  created () {
    return this.tags(['EXIF:CreateDate']).get('EXIF:CreateDate')
  }
}

var exifMomentFormat = 'YYYY:MM:DD hh:mm:ss'
module.exports.parseExifMoment = function (dateStr) {
  return moment(dateStr, exifMomentFormat)
}

module.exports.parseExifDate = function (dateStr) {
  return module.exports.parseExifMoment(dateStr).toDate()
}
