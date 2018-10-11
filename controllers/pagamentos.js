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

        pagamentoDao.salva(pagamento, function (erros, result) {
            if (erros) {
                console.log('Erro ao inserir no banco: ' + erros);
                res.status(500).send(erros);
            } else {
                console.log('pagamento criado: ' + result);
                res.location('/pagamentos/pagamento/' + result.insertId);
                // 201 created
                res.status(201).json(pagamento);
            }
        });
    });

    // alteração
    app.put('/pagamentos/pagamento/:id', function (req, res) {

        let id = req.params.id;
        let pagamento = {};

        pagamento.id = id;
        pagamento.status = 'CONFIRMADO';

        let connection = app.persistencia.connectionFactory();
        let pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.atualiza(pagamento, function (erros) {
            if (erros) {
                console.log('nao foi possivel atualizar: ' + erros);
                res.status(500).send(erros);
            } else {
                console.log('pagamento atualizado id:' + pagamento.id);
                res.send(pagamento);
            }
        });
    });

    // cancela pagamento
    app.delete('/pagamentos/pagamento/:id', function (req, res) {

        let id = req.params.id;
        let pagamento = {};

        pagamento.id = id;
        pagamento.status = 'CANCELADO';

        let connection = app.persistencia.connectionFactory();
        let pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.atualiza(pagamento, function (erros) {
            if (erros) {
                console.log(`nao foi possivel cancelar pagamento id:${pagamento.id} | ERROR: ${JSON.stringify(erros)}`);
                res.status(500).send('nao foi possivel cancelar');
                return;
            }

            console.log(`pagamento cancelado id:${pagamento.id}`);
            // 404 Not Content (não existe mais)
            res.status(404).send(pagamento);
        });
    });
}