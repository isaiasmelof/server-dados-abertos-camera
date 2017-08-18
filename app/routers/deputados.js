const express = require('express')
const router = express.Router()
const request = require('request')
const parser = require('xml2json')





//URL utilizada para recuperar os dados de deputados
const urlAllDeputados = 'http://www.camara.leg.br/SitCamaraWS/Deputados.asmx/ObterDeputados'

//Objeto JSON guardado em memoria no qual é armazenado a lista de deputados
var deputados 

//Objeto Json com o id de cadastro do Parlamentar e a sua respectiva url para sua fota.
var jsonIdCadastroUrlFotoDeputados


//Caso o objeto esteja nulo, é realizado a carga dos dados imediatamente
if (!deputados || !jsonIdCadastroUrlFotoDeputados) {
    getDeputados(urlAllDeputados, (body) => {
        if (body) {
            deputados = body
            jsonIdCadastroUrlFotoDeputados = getDicIdDeputadosUrlFoto()
        }
    })
}

/**
 *  Rota que recupera todos os deputados.
 *  @return JSON com os dados dos deputados em atividade.
 */
router.get('/allDeputados',(req, res, err) => {
    res.set('Content-Type', 'application/json')
    res.status(200).send(deputados)
})
/* Rota que recupera deputado(s) que atedem a um determinado filtro enviado no parametro da requisicao. Os filtros aceitos são:
    
    uf: representa a unidade federativa do deputado.
    partido: sigla a que representa o partido no qual o deputado é filiado.
    nome: parte do nome que está contida no nome do deputado desejado. (contains)
    ideCadastro: id unico de cadastro para o deputado 
    git ad  
    Os parametros podem ser passados conforme é desejado, e são avaliados em um 'and'.
   
    Ex: Caso seja enviado os parametros uf e partido, o deputado só será retornado como resultado caso o partido e a uf estejam igual ao filtro. 
    Caso seja enviado apenas a uf, somente este criterio será avaliado.

    Caso não seja encontrado nenhum deputado, é enviado um JSON com a chave 'erro' explicando o motivo do erro.
*/
router.get('/deputados',(req, res, err)=> {
    res.set('Content-Type', 'application/json')
    var parametros = req.query

    //verifica se o usuario informou os parametros de filtro
    if(!parametros.partido && !parametros.uf && !parametros.nome && !parametros.ideCadastro && !parametros.index) {
        res.status(400).json({'error':'Nenhum dos parametros (uf, partido, nome) foi informado.'})
    }
    
    //transformando para um objeto JSON
    var objJson = JSON.parse(deputados)
    
    if(parametros.index) {
        var i = parametros.index
        var dep = objJson.deputados.deputado[i]
        if (dep) {
            return res.send(dep)
        }else{
            return res.send({'error':'Não possivel recuperar os dados com o indice especificado'})
        }
    }

    var newArray = objJson.deputados.deputado.filter((deputado) => {
        return filtrarDeputado(deputado, parametros)
    })

    if(newArray.length > 0){
        return res.json(newArray)
    } else {
        return res.json({'erro':'Não possível recuperar dados de Deputados com os parâmetros enviados.'})
    }
    
})

/**
 * Rota que retorna um mapeamento com o id e a foto dos parlamentares.
 */
router.get('/urlFotosDeputados', (req,res,err)=>{
    res.set('Content-Type', 'application/json')

    if (req.query.ideCadastro){
            var newArray = jsonIdCadastroUrlFotoDeputados.dados.filter((element) => {
            return element.ideCadastro == req.query.ideCadastro
        })
        res.send(newArray)
    }
    res.send(jsonIdCadastroUrlFotoDeputados)
    
})


function getDicIdDeputadosUrlFoto() {
    var retorno = []
    var objJson = JSON.parse(deputados)

    objJson.deputados.deputado.forEach(function(element) {
        retorno.push({'ideCadastro': element.ideCadastro, 'urlFoto' : element.urlFoto})
    })
    return {'dados': retorno}
}

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
        retorno = retorno && (parametros.partido.toLowerCase() == deputado.partido.toLowerCase())
    }

    if(parametros.nome){
         retorno = retorno && (deputado.nome.toLowerCase().includes(parametros.nome.toLowerCase()))
    }
    
    if(parametros.uf){
        retorno = retorno && (deputado.uf.toLowerCase() == parametros.uf.toLowerCase())
    }

    if(parametros.ideCadastro){
        retorno = retorno && (deputado.ideCadastro == parametros.ideCadastro)
    }

    return retorno
}


function getDeputados(url, completion) {
    request({uri: 'http://www.camara.leg.br/SitCamaraWS/Deputados.asmx/ObterDeputados',
            method: 'GET'}, function (error, response, body){
        try{
            completion(parser.toJson(body))
        }catch (err) {
            completion({'error':err.message})
        }
   })
}

// Executa a cada 24h uma requisicao para o servidor da camera dos deputados a fim de atualizar a lista de deputados
setInterval(() =>{
    getDeputados(urlAllDeputados, (body) => {
        if (body) {
            deputados = body
            jsonIdCadastroUrlFotoDeputados = getDicIdDeputadosUrlFoto()
        }
    })
}, 86400000)

module.exports = router
