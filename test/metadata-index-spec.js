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

require('trace')

var metadataIndex = require('../src/metadata-index/nedb-metadata-index')
// var path = require('path')
var chai = require('chai')
var expect = chai.expect
var qfs = require('q-io/fs')
chai.use(require('chai-as-promised'))
var _ = require('lodash')

var tmpfolder = 'test-tmp'

// Exception handler that ignores ENOENT and re-throws everything else
const ignoreENOENT = (err) => {
  if (err.code !== 'ENOENT') {
    throw err
  }
}

/**
 * @type MetadataIndex
 */
var mdIndex

/**
 *
 * @type {FileMetadata[]}
 */
var testData = [{
  id: '123',
  urlId: 'abc.jpg',
  created: new Date('2013-04-06T10:00:00Z'),
  uriPath: 'xyz.jpg'
},
  {
    id: '124',
    urlId: 'bcd.jpg',
    created: new Date('2014-04-06T10:00:00Z'),
    uriPath: 'vwx.jpg'
  },
  {
    id: '125',
    urlId: 'cde.jpg',
    createDate: new Date('2015-04-06T10:00:00Z'),
    uriPath: 'uvw.jpg'

  }
]

beforeEach(() => {
  return qfs.removeTree(tmpfolder)
    .catch(ignoreENOENT)
    .then(() => qfs.makeTree(tmpfolder))
    .then(() => {
      mdIndex = metadataIndex(tmpfolder)
    })
})

describe('the store-method should store documents in the database', function () {
  beforeEach(() => {
    console.log(testData)
    return _.cloneDeep(testData).forEach((td) => mdIndex.store(td))
  })

  describe('and the byId-method', function () {
    it('should retrieve them', function () {
      return expect(mdIndex.byId('123').then(postProcess)).to.eventually.deep.equal({
        id: '123',
        urlId: 'abc.jpg',
        created: new Date('2013-04-06T10:00:00Z'),
        uriPath: 'xyz.jpg'
      })
    })
  })

  describe('and the byUrlId-method', function () {
    it('should retrieve them via urlId', function () {
      return expect(mdIndex.byUrlId('abc.jpg').then(postProcess)).to.eventually.deep.equal({
        id: '123',
        urlId: 'abc.jpg',
        created: new Date('2013-04-06T10:00:00Z'),
        uriPath: 'xyz.jpg'
      })
    })
  })

  describe('and the query-method', function () {
    it('should return all documents on an empty query"', function () {
      return expect(mdIndex.query({})
        .then((r) => r.map(postProcess))).to.eventually.deep.equal(testData)
    })

    it('should return them based on "after" and "before" filters', function () {
      return expect(mdIndex.query({
        after: new Date('2013-11-06T11:00:00Z'),
        before: new Date('2015-01-06T11:00:00Z')
      }).then((r) => r.map(postProcess))).to.eventually.deep.equal([{
        id: '124',
        urlId: 'bcd.jpg',
        created: new Date('2014-04-06T10:00:00Z'),
        uriPath: 'vwx.jpg'
      }])
    })
  })
})

/**
 * Post-process a $loki-document (i.e. remove $loki and meta)
 * @param result
 * @returns {*}
 */
function postProcess (result) {
  return result
}
