var memcached = require('memcached');

// retorna cliente memcached
function memcachedClient () {
    return new memcached('localhost:11211', {
        retries: 10,    // tentativas
        retry: 10000,   // tempo ate a proxima tentativa
        remove: true    // remove apos limite de tentativas
    });
}
module.exports = function () {
    return memcachedClient;
}