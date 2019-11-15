const redis = require('redis');
const {
  REDIS_CONF
} = require('../config/db');

const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host);

redisClient.on('error', err => {
  console.log(err);
})

function set(key, val) {
  if (typeof val === 'object') { // val是json对象
    val = JSON.stringify(val); // 转换为json字符串
  }
  redisClient.set(key, val, redis.print);
}

function get(key) {
  const promise = new Promise((resolve, reject) => {
    redisClient.get(key, (err, val) => {
      // 错误异常处理
      if (err) {
        reject(err);
        return;
      }

      if (val == null) {
        resolve(null);
        return;
      }

      // 此处并不是为了处理错误异常，是为了区分val最终数据格式是否是json格式
      try {
        resolve(JSON.parse(val)); // 如果是json字符串格式处理为json对象
      } catch (ex) {
        resolve(val); // 否则正常resolve返回
      }
    })
  });

  return promise;
}

module.exports = {
  set,
  get
}