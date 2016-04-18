/*!
 * gachou-core <https://github.com/gachou/gachou-core>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

const express = require('express')

/**
 * Interface for the Media-Storage-API
 * @constructor
 */
module.exports = function (options) {
  var exStatic = express.static(options.root)
  return {
    get: function (req, res, next) {
      return exStatic(req, res, next)
    }
  }
}
