var soap = require('soap');

// função construtora
// @_url => webservice SOAP dos correios
function correiosSOAPClient () {
    // ?wsdl = web service descriptor language
    this._url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl';
}
// calcula prazo
correiosSOAPClient.prototype.calculaPrazo = function (args, callback) {
    soap.createClient(this._url, function (erro, cliente) {
        // erro ao criar o cliente
        if (erro) {
            console.log(erro);
            return;
        }
        
        console.log('cliente SOAP criado');
        cliente.CalcPrazo(args, callback);
    });
};

module.exports = function () {
    return correiosSOAPClient;
};