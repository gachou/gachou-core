/*!
 * gachou-core <https://github.com/gachou/gachou-core>
 *
 * Copyright (c) 2016 Nils Knappmeier.
 * Released under the MIT license.
 */
'use strict'

var express = require('express')
var defaultMediaStorage = require('../src/media-storage')
var app = express()
var gachou = require('../src/gachou')
var path = require('path')

app.use(function (req, res, next) {
  console.log(req.path)
  console.log(path.resolve(__dirname, '..', 'static-test'))
  next()
})
app.use('/static-test/', express.static(path.resolve(__dirname, '..', 'static-test')))

app.use('/', gachou({
  uploadDir: path.resolve(__dirname, '..', '..', 'upload'),
  mediaStorage: defaultMediaStorage({
    root: path.resolve(__dirname, '..', '..', 'data')
  })
}))

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
