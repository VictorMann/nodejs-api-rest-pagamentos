var cluster = require('cluster');
var os = require('os');

console.log('executando thread');

if (cluster.isMaster) {
    console.log('thread master');
    var cpus = os.cpus();

    cpus.forEach(() => {
        cluster.fork();
    });

    // evento 
    cluster.on('listening', worker => {
        console.log(`cluster conectado ${worker.process.pid}`);
    });

    // evento
    cluster.on("disconnect", worker => {
        console.log("cluster %d desconectado", worker.process.pid);
    });
    // evento
    // para matar processo no window
    // tasklist -> ver lista de processos
    // tskill <code_process>
    cluster.on('exit', worker => {
        console.log('cluster %d desconectado', worker.process.pid);
        cluster.fork();
    });

} else {
    console.log('thread slave');
    require('./index');
}