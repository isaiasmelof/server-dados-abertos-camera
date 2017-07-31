var express = require('express')
var deputadosRoutes = require('./app/routers/deputados.js')
var app = express()

app.use(deputadosRoutes)

app.listen(3000)