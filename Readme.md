# 总结

### 核心功能模块

- 处理 http 接口
- 连接数据库(mysql，redis)
- 实现登陆
- 日志
- 安全
- 上线

### 核心知识点

- http,nodejs 处理 http、处理路由，mysql
- cookie，session，redis，nginx 反向代理
- sql 注入，xss 攻击，加密
- 日志，stream，crontab，readline
- 线上知识点

### server 和前端的区别（5 个区别）

- 内存 cpu（优化 扩展）【优化使用 stream 来体现；扩展使用 redis 来体现】
- 日志记录
- 安全（包括登录验证）【比如删除博客验证是否是登陆用户】
- 集群和服务拆分（设计已支持）【比如 nodejs web server 单独一块，mysql 单独一块，redis 单独一块，nginx 单独一块，这就相当于把服务拆分了。一台机器多进程与多机器、多机房其实思想类似，相当于集群思想】
- 服务稳定性
