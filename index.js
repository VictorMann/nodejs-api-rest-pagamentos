var express = require("express");
var app = express();

// escutando na porta 3000
app.listen(3000, function () {
    console.log('servidor rodando na porta 3000');
});
// definindo uma rota teste
app.get('/test', function (req, res) {
    console.log('respondendo na rota teste');
    res.send('Ok');
});