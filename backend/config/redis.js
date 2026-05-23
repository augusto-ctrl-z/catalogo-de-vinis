/*const redis = require('redis');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('connect', () => console.log('✅ Redis conectado'));
redisClient.on('error', (err) => console.error('❌ Redis erro:', err));

module.exports = redisClient;*/

const redis = require('redis');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('connect', () => 
    console.log('✅ Redis conectado')
);

redisClient.on('error', (err) => 
    console.error('❌ Redis erro:', err)
);

(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;