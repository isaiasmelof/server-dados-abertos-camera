var express = require('express')
var request = require('request')
var parser = require('xml2json');
var app = express()
app.get('/allDeputados',(req, res, err) => {
   request({uri: 'http://www.camara.leg.br/SitCamaraWS/Deputados.asmx/ObterDeputados',
            method: 'GET',
            timeout: 10000,
            followRedirect: true,
            maxRedirects: 10}, function (error, response, body){
        res.set('Content-Type', 'application/json');
        var xml = body
        var json = parser.toJson(xml);
        res.send(json)
   })
})
app.listen(3000)