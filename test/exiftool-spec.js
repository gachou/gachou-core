/*!
 * gachou-core <https://github.com/gachou/gachou-core>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */

/* global describe */
/* global beforeEach */
/* global it */
// /* global xdescribe */
// /* global xit */

// Test cases for the upload-workflow

// require('trace')

var exiftool = require('../src/exiftool')
var path = require('path')
var chai = require('chai')
var expect = chai.expect
var qfs = require('q-io/fs')
chai.use(require('chai-as-promised'))

var tmpfolder = 'test-tmp'

// Exception handler that ignores ENOENT and re-throws everything else
const ignoreENOENT = (err) => {
  if (err.code !== 'ENOENT') {
    throw err
  }
}

beforeEach(() => {
  return qfs.removeTree(tmpfolder)
    .catch(ignoreENOENT)
    .then(() => qfs.makeTree(tmpfolder))
})

describe('the ExifTool#tags method()', function () {
  it('return a list of tags for a file', function () {
    var file = require.resolve('image-testdata/data/no-xmp-identifier.jpg')
    return expect(exiftool(file).tags(['Composite:Aperture', 'XMP:HierarchicalSubject'])).to.eventually.deep.equal({
      'XMP:HierarchicalSubject': 'Places|Darmstadt|Prinz-Georgs-Garten',
      'Composite:Aperture': 4.7
    })
  })
})

describe('the ExifTool#ensureId method()', function () {
  it('should store and return a new XMP:Identifier if non is present yet', function () {
    var file = require.resolve('image-testdata/data/no-xmp-identifier.jpg')
    var targetFile = path.join(tmpfolder, 'file.jpg')

    var tool = exiftool(targetFile)
    return qfs.copy(file, targetFile)
      .then(() => tool.ensureId())
      .then((id) => {
        expect(id).not.to.equal(null)
        // Tag must be stored
        return expect(tool.tags(['XMP:Identifier'])).to.eventually.deep.equal({
          'XMP:Identifier': id
        })
      }
    )
  })

  it('should return an existing identifier"', function () {
    var file = require.resolve('image-testdata/data/with-xmp-identifier.jpg')
    var targetFile = path.join(tmpfolder, 'file.jpg')

    var tool = exiftool(targetFile)
    return qfs.copy(file, targetFile)
      .then(() => tool.ensureId())
      .then((id) => {
        expect(id).equals('gachou-12345')
      })
  })
})

describe('the saveTags-method', function () {
  it('should store tags into the file that are in the same format as the output of `tags`', function () {
    var file = require.resolve('image-testdata/data/no-xmp-identifier.jpg')
    var targetFile = path.join(tmpfolder, 'no-xmp-identifier.jpg')

    var tool = exiftool(targetFile)
    var result = qfs.copy(file, targetFile)
      .then(() => tool.saveTags({
        'XMP:HierarchicalSubject': 'Lotus',
        'XMP:Identifier': 'abc'
      }))
      .then(() => tool.tags(['XMP:Identifier', 'XMP:HierarchicalSubject']))

    return expect(result).to.eventually.deep.equal({
      'XMP:HierarchicalSubject': 'Lotus',
      'XMP:Identifier': 'abc'
    })
  })
})

describe('the parseExifDate-method', function () {
  it('should parse a date without timezone as local time', () => {
    var date = exiftool.parseExifDate('2011:06:23 16:15:45')
    return expect(date.toString()).to.match(/Thu Jun 23 2011 16:15:45 .*/)
  })
})
