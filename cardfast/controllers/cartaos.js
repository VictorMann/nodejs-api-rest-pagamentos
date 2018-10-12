module.exports = function (app) {

    app.post("/cartoes/autoriza", function (req, res) {

        console.log('processando pagamento com cartao');

        var cartao = req.body;

        req.assert("numero", "Numero eh obrigatorio e deve ter 16 caracteres.").notEmpty().len(16,16);
        req.assert("bandeira", "Bandeira do cartao eh obrigatoria.").notEmpty();
        req.assert("ano_de_expiracao", "Ano de expiracao eh obrigatorio e deve ter 4 caracteres.").notEmpty().len(4,4);
        req.assert("mes_de_expiracao", "Mes de expiracao eh obrigatorio e deve ter 2 caracteres").notEmpty().len(2,2);
        req.assert("cvv", "CVV eh obrigatorio e deve ter 3 caracteres").notEmpty().len(3,3);

        var errors = req.validationErrors();

        if (errors) {
            console.log("Erros de validacao encontrados");
            res.status(400).send(errors);
            return;
        }
        
        cartao.status = 'AUTORIZADO';

        let response = {
            dados_do_cartao: cartao,
        };

        res.status(201).json(response);
        return;
    });
}