let restify = require('restify');

let cliente = restify.createJsonClient({
    url: 'http://localhost:3001'
});

cliente.post('/cartoes/autoriza', function (err, req, res, retorno) {
    console.log('consumindo servico de cartoes');
    console.log(retorno);
});