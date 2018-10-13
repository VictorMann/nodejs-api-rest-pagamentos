var soap = require('soap');

// webservice SOAP dos correios 
// wsdl = web service descriptor language
soap.createClient(
    'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl',
    function (erro, cliente) {

        console.log('cliente SOAP criado');

        cliente.CalcPrazo(
            {
                'nCdServico': '40010',
                'sCepOrigem': '04101300',
                'sCepDestino': '65000600'
            },
            function (err, resultado) {
                console.log( JSON.stringify(resultado) );
            }
        );
    }
)