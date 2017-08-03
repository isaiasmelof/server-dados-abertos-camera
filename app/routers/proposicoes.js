var express = require('express')
var router = express.Router()
var request = require('request')
var parser = require('xml2json')

var parametersResquest = ['sigla', 'numero','ano','datApresentacaoIni','datApresentacaoFim','parteNomeAutor','idTipoAutor','siglaPartidoAutor','siglaUFAutor','generoAutor','codEstado','codOrgaoEstado','emTramitacao']
const urlGetProposicoes = 'http://www.camara.leg.br/SitCamaraWS/Proposicoes.asmx/ListarProposicoes?'
router.get('/proposicoes',(req, res, err) => {
    res.set('Content-Type', 'application/json');
    //recupero os parametros enviados na requisicao
    var parametros = req.query
    var stringFiltros =  criarStringParametrosUrl(parametros)
    stringFiltros = completarUrl(stringFiltros, parametersResquest)
    request({uri: urlGetProposicoes+stringFiltros,
            method: 'GET'}, function (error, response, body){
        res.send(parser.toJson(body))
   })

})

function criarStringParametrosUrl (parametros){
    let keys = []
    let parametrosRequesicao = ''
    let cont = 0

    for (var i in parametros) keys.push(i)

    for (var i in parametros) {
        parametrosRequesicao += keys[cont] + '=' + parametros[i] + '&'
        cont++
    }
    
    return parametrosRequesicao.slice(0, -1)
}

function completarUrl(urlRequest, parametersResquest) {
    let retorno = urlRequest
    
    if (urlRequest.length > 0) {
        retorno += '&'
    }   
    for (var i in parametersResquest){
        if (!urlRequest.toLowerCase().includes(parametersResquest[i].toLowerCase())){
            retorno+=parametersResquest[i]+'=' + '&'
        }
    }
    return retorno.slice(0, -1)
}
module.exports = router
