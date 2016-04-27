/*!
 * gachou-core <https://github.com/gachou/gachou-core>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */

/* global describe */
// /* global beforeEach */
/* global it */
// /* global xdescribe */
// /* global xit */

// Test cases for the upload-workflow

require('trace')

var chai = require('chai')
var expect = chai.expect
chai.use(require('chai-as-promised'))
var ftp = require('../src/utils/first-truthy-promise')
var Q = require('q')

describe('the first-truthy-promise method', function () {
  it('should return the first value if it is truthy', () => {
    const p = ftp([
      (a) => Q(a),
      (a) => Q(null)
    ], this, [1])
    expect(p).to.eventually.equal(1)
  })

  it('should return the second value if the first is falsy', () => {
    const p = ftp([
      (a) => Q(null),
      (a) => Q(a)
    ], this, [1])
    expect(p).to.eventually.equal(1)
  })

  it('should return the second value if the first is falsy', () => {
    const p = ftp([
      (a) => Q(null),
      (a) => Q(a),
      (a) => Q(a + 1)
    ], this, [1])
    expect(p).to.eventually.equal(1)
  })

  it('it should not evaulate the third function if the second value is truthy', () => {
    const p = ftp([
      (a) => Q(null),
      (a) => Q(a),
      () => {
        throw new Error('test error')
      }
    ], this, [1])
    expect(p).to.eventually.equal(1)
  })
})
