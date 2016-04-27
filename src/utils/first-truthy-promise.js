'use strict'

const Q = require('q')

/**
 * Applys the args to a list of functions in series and return
 * the first promise that resolves to a truthy value
 * @param {Array<function(*):Promise>} fns
 * @param {*} thisValue the `this`-value applied to the functions
 * @param {Array} args arguments applied to the function
 */
module.exports = function (fns, thisValue, args) {
  return fns.reduce(function (result, fn) {
    // If the (intermediate) result is truthy, always return this one.
    return result.then((result) => {
      return result || Q(fn.apply(thisValue, args))
    })
  }, Q(null))
}
