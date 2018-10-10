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