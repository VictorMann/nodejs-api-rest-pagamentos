// rotas para pagamentos
module.exports = function (app) {

    app.get('/pagamentos', function (req, res) {
        console.log('respondendo na rota pagamentos');
        res.send('Ok');
    });

    // recebendo pagamento
    app.post('/pagamentos/pagamento', function (req, res) {
        let pagamento = req.body;
        console.log(pagamento);
        res.send('ok');
    });
}