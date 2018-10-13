// controller correios
module.exports = function (app) {

    app.post('/correios/calcula-prazo', function (req, res) {

        var dadosDaEntrega = req.body;

        var correiosSOAPClient = new app.servicos.correiosSOAPClient();

        correiosSOAPClient.calculaPrazo(dadosDaEntrega, function (err, result) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
                return;
            }
            
            console.log('prazo calculado');
            res.json(result);
        });
    });
}