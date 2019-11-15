const querystring = require('querystring');
const {
  get,
  set
} = require('./src/db/redis');
const {
  access
} = require('./src/utils/log');
const handleUserRouter = require('./src/router/user');
const handleBlogRouter = require('./src/router/blog');

// 获取 cookie 的过期时间
const getCookieExpires = () => {
  const d = new Date()
  d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
  console.log('d.toGMTString() is ', d.toGMTString())
  return d.toGMTString()
}

// 用于处理post Data(post为异步函数)
const getPostData = (req, res) => {
  const promise = new Promise((resolve, reject) => {
    // 判断请求不是post请求，返回一个空对象
    if (req.method !== 'POST') {
      resolve({});
      return;
    }

    // 判断请求头部 content-type 字段值是否为 application/json
    if (req.headers['content-type'] !== 'application/json') {
      resolve({});
      return;
    }

    let postData = '';

    // 监听data事件，接受数据
    req.on('data', chunk => {
      postData += chunk.toString();
    });

    // end事件
    req.on('end', () => {
      if (!postData) {
        resolve({});
        return;
      }
      resolve(JSON.parse(postData));
    })

  })

  return promise;
}

// app 服务处理方法
const serverHandle = (req, res) => {
  // 记录 access log (访问日志)
  access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${new Date().toLocaleString()}`);

  // 设置返回格式 JSON
  res.setHeader('Content-type', 'application/json');

  // 处理url在req里写入path字段信息
  const url = req.url;
  req.path = url.split('?')[0];

  // 解析query
  req.query = querystring.parse(url.split('?')[1]);

  // 解析 cookie
  req.cookie = {}
  const cookieStr = req.headers.cookie || '' // k1=v1;k2=v2;k3=v3
  cookieStr.split(';').forEach(item => {
    if (!item) {
      return
    }
    const arr = item.split('=')
    const key = arr[0].trim()
    const val = arr[1].trim()
    req.cookie[key] = val
  })

  // 解析session (使用redis)
  let needSetCookie = false;
  let userId = req.cookie.userid;

  //第一次登陆时会执行此段代码，随机生成用户id
  if (!userId) {
    needSetCookie = true;
    userId = `${Date.now()}_${Math.random()}`;
    set(userId, {});
  }

  //获取 session
  req.sessionId = userId;

  get(req.sessionId).then(sessionData => {
      if (sessionData == null) {
        // 初始化 redis 中的 session 值
        set(req.sessionId, {});
        // 设置 session
        req.session = {};
      } else {
        // 设置 session
        req.session = sessionData;
      }

      // 将req传入 getPostData 方法判断是否为post请求，并异步处理
      return getPostData(req);
    })
    .then(postData => { // postData接收getPostData方法返回的最终处理结果
      req.body = postData; // (post 方法传参 内容写入请求body中，如果不是post方式，body设置为{})

      // 处理user路由
      // 返回的是一个值
      // const userData = handleUserRouter(req, res);
      // if (userData) {
      //   res.end(JSON.stringify(userData));
      //   return;
      // }

      // 返回的是一个promise对象
      const userResult = handleUserRouter(req, res);
      if (userResult) {
        userResult.then(userData => {
          if (needSetCookie) {
            res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`);
          }
          res.end(JSON.stringify(userData));
        })
        return;
      }

      // 处理blog路由
      // 返回的是一个值
      // const blogData = handleBlogRouter(req, res);
      // if (blogData) {
      //   res.end(JSON.stringify(blogData));
      //   return;
      // }

      // 返回的是一个promise对象
      const blogResult = handleBlogRouter(req, res);
      if (blogResult) {
        blogResult.then(blogData => {
          if (needSetCookie) {
            res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`);
          }
          res.end(JSON.stringify(blogData));
        })
        return;
      }

      // 未命中 返回404
      res.writeHead(404, {
        "Content-type": "text/plain"
      }); //会与res.setHeader合并，并优先于res.setHeader
      res.write("404 Not Found\n");
      res.end();
    })


}

module.exports = serverHandle;