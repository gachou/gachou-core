/*!
 * gachou-core <https://github.com/gachou/gachou-core>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

// inspired by https://gist.github.com/justmoon/15511f92e5216fa2624b
/**
 * Custom error class for internal gachou errors
 * @param {string} message the error message
 * @param {string} code the error code
 */
module.exports = function GachouError (message, code) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = message
  this.code = code
}

require('util').inherits(module.exports, Error)
