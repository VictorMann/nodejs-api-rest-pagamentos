var logger = require('../servicos/logger');

// rotas para pagamentos
module.exports = function (app) {

    const PAGAMENTO_CRIADO = 'CRIADO';
    const PAGAMENTO_CONFIRMADO = 'CONFIRMADO';
    const PAGAMENTO_CANCELADO = 'CANCELADO';
    
    app.get('/pagamentos', function (req, res) {
        console.log('respondendo na rota pagamentos');

        let connection = app.persistencia.connectionFactory();
        let pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.lista((erros, result) => {
            // caso haja um erro no banco
            if (erros) {
                console.log(erros);
                res.status(500).send(`ERROR: consulta lista de pagamentos`);
                return;
            }
            console.log('consulta lista de pagamentos');
            res.send(result);
        });
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

        pagamento.status = PAGAMENTO_CRIADO;
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
                
                // instancia servico CartoesCliente
                let clienteCartoes = new app.servicos.clienteCartoes();
                // invoca metodo autoriza
                clienteCartoes.autoriza(cartao, function (err, requ, resp, retorno) {
                    // caso haja um erro
                    if (err) {
                        console.log(err);
                        res.status(400).send(err);
                        return;
                    }

                    res.location(`/pagamentos/pagamento/${pagamento.id}`);
           
                    // *HATEOAS
                    let response = {
                        dados_do_pagamento: pagamento,
                        cartao: retorno,
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

                    // grava em cache do memcached
                    let memcachedClient = app.servicos.memcachedClient();
                    memcachedClient.set(`pagamento-${pagamento.id}`, response, 60000, function (erro) {
                        console.log(`add memcached chave: pagamento-${pagamento.id}`);
                    });

                   console.log(`pagamento com cartao criado`);
                    // 201 created
                    res.status(201).json(response);
                    
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

            // grava em cache do memcached
            let memcachedClient = app.servicos.memcachedClient();
            memcachedClient.set(`pagamento-${pagamento.id}`, response, 60000, function (erro) {
                console.log(`add memcached chave: pagamento-${pagamento.id}`);
            });

            console.log(`pagamento criado`);
            // 201 created
            res.status(201).json(response);
        });
    });

    // consulta um pagamento
    app.get('/pagamentos/pagamento/:id', function (req, res) {

        let id = req.params.id;

        let connection = app.persistencia.connectionFactory();
        let pagamentoDao = new app.persistencia.PagamentoDao(connection);

        // consulta o cache do memcached
        let memcachedClient = app.servicos.memcachedClient();
        memcachedClient.get(`pagamento-${id}`, function (erro, retorno) {

            // adcionando ao logger
            logger.log('info', `consultando pagamnento id:${id}`);

            // caso não encontrou busca no banco
            if (erro || !retorno) {
                console.log('MISS - chave nao encontrada');
                pagamentoDao.buscaPorId(id, function (err, result) {
                    // caso haja um erro no banco
                    if (err) {
                        console.log(err);
                        res.status(500).send(`ERROR: consulta do pagamento id:${id}`);
                        return;
                    }
                    console.log(`pagamento consultado id:${id}`);
                    res.send(result);
                });
            // se encontrou
            } else {
                console.log(`HIT - valor: ${JSON.stringify(retorno)}`);
                res.send(retorno);
            }
        });
    });

    // alteração
    app.put('/pagamentos/pagamento/:id', function (req, res) {

        let id = req.params.id;
        let pagamento = {};

        pagamento.id = id;
        pagamento.status = PAGAMENTO_CONFIRMADO;

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
        pagamento.status = PAGAMENTO_CANCELADO;

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