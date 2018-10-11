// rotas para pagamentos
module.exports = function (app) {

    app.get('/pagamentos', function (req, res) {
        console.log('respondendo na rota pagamentos');
        res.send('Ok');
    });

    // recebendo pagamento
    app.post('/pagamentos/pagamento', function (req, res) {
        let pagamento = req.body;
        console.log('processando um requisicao de um novo pagamento');

        // aplicando validações
        req.assert('forma_de_pagamento', 'Forma de pagamento eh obrigatorio').notEmpty();
        req.assert('valor', 'Valor eh obrigatorio e deve ser um decimal').notEmpty().isFloat();

        var erros = req.validationErrors();

        if (erros) {
            console.log('Erros de validacao encontrados');
            res.status(400).send(erros);
            return;
        }

        pagamento.status = 'CRIADO';
        pagamento.data = new Date;

        var connection = app.persistencia.connectionFactory();
        var pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.salva(pagamento, function (errs, result) {
            console.log('pagamento criado: ' + result);
            res.json(pagamento);
        });
    });
}