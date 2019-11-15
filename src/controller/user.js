const {
  exec,
  escape
} = require('../db/mysql');

const {
  genPassword
} = require('../utils/crypto');

const login = (username, password) => {
  username = escape(username);

  password=genPassword(password); // 密码加密
  password = escape(password);

  const sql = `select username,realname from user where username=${username} and password=${password}`;

  return exec(sql).then(rows => {
    return rows[0] || {};
  })
}

module.exports = {
  login
}