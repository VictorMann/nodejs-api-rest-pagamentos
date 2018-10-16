var cluster = require('cluster');
var os = require('os');

console.log('executando thread');

if (cluster.isMaster) {
    console.log('thread master');
    var cpus = os.cpus();

    cpus.forEach(() => {
        cluster.fork();
    });

} else {
    console.log('thread slave');
    require('./index');
}