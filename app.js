var express = require('express')
var deputadosRoutes = require('./app/routers/deputados.js')
var app = express()

app.use(deputadosRoutes)
app.get('/',(req,res,err)=>{
    res.send('Server Up!')
})
app.listen(3000)