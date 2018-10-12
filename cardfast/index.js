var app = require('./config/custom-express')();

// escutando na porta 3000
app.listen(3001, function () {
    console.log('servidor de cartoes porta 3001');
});