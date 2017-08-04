const express = require('express')
const router = express.Router()
const request = require('request')
const parser = require('xml2json')

//Parametros necessarios para fazer uma requisicao
const parametersResquest = ['sigla', 'numero','ano','datApresentacaoIni','datApresentacaoFim','parteNomeAutor','idTipoAutor','siglaPartidoAutor','siglaUFAutor','generoAutor','codEstado','codOrgaoEstado','emTramitacao']

//Core da url - esta deve ser concatenada com os parametros desejados.
const urlGetProposicoes = 'http://www.camara.leg.br/SitCamaraWS/Proposicoes.asmx/ListarProposicoes?'

//Buscar proposicoes passando os parametros padrões disponiveis
router.get('/proposicoes',(req, res, err) => {
    res.set('Content-Type', 'application/json')
    var stringFiltros =  prepareUrlRequest(req.query)
    getPreposicoes(urlGetProposicoes+stringFiltros, (body)=>{
        res.send(body)
    })
})


router.get('/proposicoesPorPalavraChave/:keyValue',(req,res,err)=>{
    res.set('Content-Type', 'application/json')
    var stringFiltros =  prepareUrlRequest(req.query)

    getPreposicoes(urlGetProposicoes+stringFiltros, (body)=>{
        var objJson = JSON.parse(body)
        var array = objJson.proposicoes.proposicao.filter((proposicao)=>{
            return proposicao.txtEmenta.includes(req.params.keyValue)
        })
        res.send(array)
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

function prepareUrlRequest(parametros){
    var stringFiltros =  criarStringParametrosUrl(parametros)
    stringFiltros = completarUrl(stringFiltros, parametersResquest)
    return stringFiltros
}

function getPreposicoes (url, getBody) {   
    request({uri: url,
            method: 'GET'}, function (error, response, body){
        getBody(parser.toJson(body))
   })
}

module.exports = router
