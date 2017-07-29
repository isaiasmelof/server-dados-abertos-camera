var express = require('express')
var request = require('request')
var parser = require('xml2json');
var app = express()

//Rota que recupera todos os deputados
app.get('/allDeputados',(req, res, err) => {
   request({uri: 'http://www.camara.leg.br/SitCamaraWS/Deputados.asmx/ObterDeputados',
            method: 'GET'}, function (error, response, body){
        res.set('Content-Type', 'application/json');
        res.send(parser.toJson(body))
   })
})
/* Rota que recupera deputado(s) que atedem a um determinado filtro enviado no parametro da requisicao. Os filtros aceitos são:
    
    uf: representa a unidade federativa do deputado.
    partido: sigla a que representa o partido no qual o deputado é filiado.
    nome: parte do nome que está contida no nome do deputado desejado. (contains)

    Os parametros podem ser passados conforme é desejado, e são avaliados em um 'and'.
   
    Ex: Caso seja enviado os parametros uf e partido, o deputado só será retornado como resultado caso o partido e a uf estejam igual ao filtro. 
    Caso seja enviado apenas a uf, somente este criterio será avaliado.
*/
app.get('/deputados',(req, res, err)=> {
    request({uri: 'http://www.camara.leg.br/SitCamaraWS/Deputados.asmx/ObterDeputados',
            method: 'GET'}, function (error, response, body){
        res.set('Content-Type', 'application/json');
        var parametros = req.query

        var objJson = JSON.parse(parser.toJson(body))

        var newArray = objJson.deputados.deputado.filter((deputado) => {
            return filtrarDeputado(deputado, parametros)
        })
        res.status(200).json(newArray)
    })    
})

/**
 * Avalia se um deputado atende aos parametros de filtro enviado.
 * @param {*} deputado - Representa um deputado no qual será avaliado se este atende os filtros desejados.
 * @param {*} parametros - Parametros com criterios de filtro que serão testados. (uf, partido ou nome)
 * @return true - caso o deputado atenda aos filtros. 
 *         false - caso não atenda.
 */
function filtrarDeputado(deputado /* Objeto do Deputado */, parametros /* Query */) {
    var retorno = true

    if(parametros.partido) {
        console.log(deputado.partido)
        retorno = retorno && (parametros.partido == deputado.partido)
    }

    if(parametros.nome){
         retorno = retorno && (deputado.nome.includes(parametros.nome))
    }
    
    if(parametros.uf){
        retorno = retorno && (deputado.uf == parametros.uf)
    }
    return retorno
}
app.listen(3000);