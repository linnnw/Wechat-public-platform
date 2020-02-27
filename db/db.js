var mysql = require('mysql');

let config = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'wx_Focus_on_users' //数据库名
};

module.exports = mysql.createPool(config);