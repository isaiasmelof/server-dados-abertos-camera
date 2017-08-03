var express = require('express')
var deputadosRoutes = require('./app/routers/deputados.js')
var proposicoesRoutes = require('./app/routers/proposicoes.js')
var app = express()

app.use(deputadosRoutes)
app.use(proposicoesRoutes)

app.get('/',(req,res,err)=>{
    res.send('Server Up!')
})
app.listen(3000)