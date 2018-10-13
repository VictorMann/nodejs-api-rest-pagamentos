// rotas para pagamentos
module.exports = function (app) {

    app.get('/pagamentos', function (req, res) {
        console.log('respondendo na rota pagamentos');
        res.send('Ok');
    });

    // recebendo pagamento
    app.post('/pagamentos/pagamento', function (req, res) {
        // obtendo apenas o json de pagamento
        let pagamento = req.body['pagamento'];

        console.log('processando um requisicao de um novo pagamento');

        // aplicando validações
        req.assert('pagamento.forma_de_pagamento', 'Forma de pagamento eh obrigatorio').notEmpty();
        req.assert('pagamento.valor', 'Valor eh obrigatorio e deve ser um decimal').notEmpty().isFloat();

        let erros = req.validationErrors();

        if (erros) {
            console.log('Erros de validacao encontrados');
            res.status(400).send(erros);
            return;
        }

        pagamento.status = 'CRIADO';
        pagamento.data = new Date;

        let connection = app.persistencia.connectionFactory();
        let pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.salva(pagamento, function (erros, result) {
            if (erros) {
                console.log(`nao foi possivel salvar o pagamento ERRO: ${JSON.stringify(erros)}`);
                res.status(500).send('Houve um erro no servidor ao adicionar');
                return;
            }

            // obtem o id do pagamento recem criado no banco
            pagamento.id = result.insertId;
            // define header location

            if (pagamento.forma_de_pagamento == 'cartao') {
                // obtem dados do cartao
                let cartao = req.body['cartao'];
                console.log(cartao);
                // instancia servico CartoesCliente
                let clienteCartoes = new app.servicos.clienteCartoes();
                // invoca metodo autoriza
                clienteCartoes.autoriza(cartao, function (err, requ, resp, retorno) {
                    console.log(retorno);
                    // 201 created
                    res.status(201).send(retorno);
                });

                return;
            }


            res.location(`/pagamentos/pagamento/${pagamento.id}`);
           
            // *HATEOAS
           let response = {
                dados_do_pagamento: pagamento,
                links: [
                    {
                        href: `http:localhost:3000/pagamentos/pagamento/${pagamento.id}`,
                        rel: 'confirmar',
                        method: 'PUT'
                    },
                    {
                        href: `http:localhost:3000/pagamentos/pagamento/${pagamento.id}`,
                        rel: 'cancelar',
                        method: 'DELETE'
                    }
                ]
           };
           
            // 201 created
            res.status(201).json(response);
            
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
            // 204 Not Content (não existe mais)
            res.status(204).send(pagamento);
        });
    });
}