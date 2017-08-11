var express = require('express')
var deputadosRoutes = require('./app/routers/deputados.js')
var proposicoesRoutes = require('./app/routers/proposicoes.js')
var app = express()

app.use(deputadosRoutes)
app.use(proposicoesRoutes)

app.set('port', (process.env.PORT || 5000))
app.get('/home ',(req,res,err)=>{
    res.send({'msg':' bem vindo ao meu server'})
})



app.listen(app.get('port'), function(){
    console.log('App is running server is listening on port',app.get('port'))
})