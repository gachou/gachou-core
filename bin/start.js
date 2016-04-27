/*!
 * gachou-core <https://github.com/gachou/gachou-core>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

require('trace')

var express = require('express')
var app = express()
var gachou = require('../src/gachou')
var path = require('path')

app.use('/static-test/', express.static(path.resolve(__dirname, '..', 'static-test')))
app.use('/', gachou({
  basePath: path.resolve(__dirname, '..', '..', 'gachou-data'),
  uploadDir: path.resolve(__dirname, '..', '..', 'gachou-data', 'uploads')
}))

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
