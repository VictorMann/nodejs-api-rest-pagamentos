var app = require('./config/custom-express')();

// escutando na porta 3000
app.listen(3000, function () {
    console.log('servidor rodando na porta 3000');
});