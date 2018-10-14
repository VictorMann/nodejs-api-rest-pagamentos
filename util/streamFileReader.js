var fs = require('fs');

// cria um fluxo de leitura, não travando a execução
// da aplicação
// pipe() envia a saida do metodo anterior (buffer) como param
// do metodo que ele recebe, nesse caso estamos passando apenas o nome
// do arquivo
fs.createReadStream('imagem.jpg')
.pipe(fs.createWriteStream('imagem-com-stream.jpg'))
.on('finish', function () {
    console.log('arquivo escrito com stream');
});