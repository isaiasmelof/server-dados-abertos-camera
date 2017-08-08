const express = require('express')
const router = express.Router()
const request = require('request')
const parser = require('xml2json')

//Parametros necessarios para fazer uma requisicao que recupera proposicoes em geral
const parametersResquestPreposicoes = ['sigla', 'numero','ano','datapresentacaoini','datapresentacaofim','partenomeautor','idtipoautor','siglapartidoautor','siglaufautor','generoautor','codestado','codorgaoestado','emtramitacao']

//Parametros necessarios para fazer uma requisicao que recupera proposicoes votadas em plenario
const parametersRequestPreposicoesVotadas = ['ano','tipo']

//Parametros necessarios para fazer uma requisicao que recupera as informacoes de voto de uma proposicao
const parametrosRequestVotacaoPreposicao = ['tipo','numero','ano']

//Core da url que recupera proposicoes em geral - esta deve ser concatenada com os parametros desejados.
const urlGetProposicoes = 'http://www.camara.leg.br/SitCamaraWS/Proposicoes.asmx/ListarProposicoes?'

//Core da url que recupera proposicoes votadas em plenario - esta deve ser concatenada com os parametros desejados.
const urlGetProposicoesVotadasEmPlenario = 'http://www.camara.leg.br/SitCamaraWS/Proposicoes.asmx/ListarProposicoesVotadasEmPlenario?'

//Core da url que recupera os votos de uma proposicao  - esta deve ser concatenada com os parametros desejados.
const urlGetVotosProposicao = 'http://www.camara.leg.br/SitCamaraWS/Proposicoes.asmx/ObterVotacaoProposicao?'

//Buscar proposicoes passando os parametros padrões disponiveis
router.get('/proposicoes',(req, res, err) => {
    res.set('Content-Type', 'application/json')
    var stringFiltros =  prepareUrlRequest(req.query, parametersResquestPreposicoes)
    if(stringFiltros) {
        getPreposicoes(urlGetProposicoes+stringFiltros, (body)=>{
            res.status(200)
            res.send(body)
        })
    }else{
        res.status(500)
        res.send({'error':'Paramêtros invalidos enviados para o servidor'})
    }
    
})

//Enviar juntamente na requisica os parametros necessarios na busca de proposicoes.
router.get('/proposicoesPorPalavraChave/:palavraChave',(req,res,err)=>{
    res.set('Content-Type', 'application/json')
    var stringFiltros =  prepareUrlRequest(req.query, parametersResquestPreposicoes)

    if(stringFiltros) {
        getPreposicoes(urlGetProposicoes+stringFiltros, (body)=>{
        
        var objJson = JSON.parse(body)
        var array = objJson.proposicoes.proposicao.filter((proposicao)=>{
            return proposicao.txtEmenta.includes(req.params.palavraChave)
        })
        res.status(200)
        res.send(array)
    })
    }else{
        res.status(500)
        res.send({'error':'Paramêtros invalidos enviados para o servidor'})
    }
})

router.get('/preposicoesVotadasEmPlenario',(req,res,err)=> {
    
    res.set('Content-Type', 'application/json')
    var stringFiltros =  prepareUrlRequest(req.query, parametersRequestPreposicoesVotadas)
    if (stringFiltros) {
        getPreposicoesVotadasEmPlenario(urlGetProposicoesVotadasEmPlenario+stringFiltros,(body)=> {
            res.status(200)
            res.send(body)
        })
    }else{
        res.status(500)
        res.send({'error':'Paramêtros invalidos enviados para o servidor'})
    }
})

router.get('/votosPreposicao', (req, res, err) => {
    res.set('Content-Type', 'application/json')
    var stringFiltros =  prepareUrlRequest(req.query, parametrosRequestVotacaoPreposicao)
    if(stringFiltros) {
        getPreposicoes(urlGetVotosProposicao+stringFiltros, (body)=>{
            res.status(200)
            res.send(body)
        })
    }else{
        res.status(500)
        res.send({'error':'Paramêtros invalidos enviados para o servidor'})
    }
})

function criarStringParametrosUrl (parametros, parametersResquest){
    let keys = []
    let parametrosRequesicao = ''
    let cont = 0
   
     //recupero a chave dos parametros recebidos
    for (var i in parametros) keys.push(i)

    for (var i in parametros) {
        if(parametersResquest.includes(keys[cont].toLocaleLowerCase())){
            parametrosRequesicao += keys[cont] + '=' + parametros[i] + '&'
            cont++
        } else {
            return undefined
        }
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

function prepareUrlRequest(parametros, parametersRequest){
    var stringFiltros =  criarStringParametrosUrl(parametros, parametersRequest)
    if(stringFiltros) {
        stringFiltros = completarUrl(stringFiltros, parametersRequest)
        return stringFiltros
    }else {
        return undefined
    }  
}

function getPreposicoes (url, getBody) {   
    request({uri: url,
            method: 'GET'}, function (error, response, body){
    
        getBody(parser.toJson(body))
   })
}

function getPreposicoesVotadasEmPlenario (url, getBody) {
    request({uri: url, 
            method: 'GET'}, function(error,response,body){
        getBody(parser.toJson(body))
    })
}

module.exports = router
