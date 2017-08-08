var express = require('express')
var deputadosRoutes = require('./app/routers/deputados.js')
var proposicoesRoutes = require('./app/routers/proposicoes.js')
var app = express()

app.use(deputadosRoutes)
app.use(proposicoesRoutes)

app.get('/home ',(req,res,err)=>{
    res.send({'msg':' bem vindo ao meu server'})
})
app.listen(3000)