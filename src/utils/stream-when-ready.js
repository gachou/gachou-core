var stream = require('stream')
var duplexMaker = require('duplex-maker')
var Q = require('q')

module.exports.writable = writable
module.exports.readable = readable
module.exports.duplex = duplex

/**
 * Convert a promise for a Writable into a Writable.
 *
 * @param {Promise<Writable>} promise
 */
function writable (promise) {
  var result = new stream.PassThrough()
  Q(promise).done(
    (stream) => result.pipe(stream),
    (err) => result.emit('error', err))
  return result
}

/**
 * Convert a promise for a Readble into a Readable.
 *
 * @param {Promise<Readable>} promise
 */
function readable (promise) {
  var result = new stream.PassThrough()
  Q(promise).done(
    (stream) => stream.pipe(result),
    (err) => result.emit('error', err))
  return result
}

/**
 * Convert a promise for a Duplex into a Duplex.

 * @param {Promise<Duplex>} promise
 */
function duplex (promise) {
  var input = new stream.PassThrough()
  var output = new stream.PassThrough()
  var result = duplexMaker(input, output)
  Q(promise).done(
    (stream) => input.pipe(stream).pipe(output),
    (err) => result.emit('error', err)
  )
  return result
}
