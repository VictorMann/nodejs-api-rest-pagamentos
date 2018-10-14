var fs = require('fs');

// request: curl localhost:3000/upload/imagem -H "Content-Type: application/octet-stream" --data-binary @imagem.jpg -H "filename: image-teste.jpg"

// controller recebe arquivo
module.exports = function (app) {

    app.post('/upload/imagem', function (req, res) {

        let filename = req.headers.filename || 'unnamed.jpg';

        req.pipe(fs.createWriteStream(`files/${filename}`))
        .on('finish', function () {
            console.log('upload realizado');
            res.status(201).send('OK');
        });
    });
}