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

require('trace')

var MediaFile = require('../src/model/MediaFile')
var chai = require('chai')
var expect = chai.expect
var qfs = require('q-io/fs')
chai.use(require('chai-as-promised'))
const imageTestdata = require('image-testdata')

var tmpFolder = 'test-tmp'

// Exception handler that ignores ENOENT and re-throws everything else
const ignoreENOENT = (err) => {
  if (err.code !== 'ENOENT') {
    throw err
  }
}

beforeEach(() => {
  return qfs.removeTree(tmpFolder)
    .catch(ignoreENOENT)
    .then(() => qfs.makeTree(tmpFolder))
})

describe('the MediaFile#load method()', function () {
  it('should return a MediaFile object for the give file', function () {
    return imageTestdata('no-xmp-identifier.jpg', tmpFolder)
      .then((file) => {
        return expect(MediaFile.load(file).get('file')).to.eventually.equal(file)
      })
  })

  it('should always return a MediaFile with an id', function () {
    return imageTestdata('no-xmp-identifier.jpg', tmpFolder)
      .then((file) => {
        return expect(MediaFile.load(file).get('id')).to.eventually.be.ok
      })
  })

  it('should make sure that the id is stored to the file loaded the next time', function () {
    return imageTestdata('no-xmp-identifier.jpg', tmpFolder)
      .then((file) => {
        MediaFile.load(file).get('id').then((id) => {
          return expect(MediaFile.load(file).get('id')).to.eventually.equal(id)
        })
      })
  })

  it('should reuse an existing identifire', function () {
    return imageTestdata('with-xmp-identifier.jpg', tmpFolder)
      .then((file) => {
        return expect(MediaFile.load(file).get('id')).to.eventually.equal('gachou-12345')
      })
  })

  describe('the urlId-method', function () {
    it('should return an urlId based on the createDate and the id', () => {
      return imageTestdata('with-xmp-identifier.jpg', tmpFolder)
        .then((file) => {
          return expect(MediaFile.load(file).get('uriPath')).to.eventually.equal('2011-06-23--16-15-45-d81454bf3e.jpg')
        })
    })
  })
})
