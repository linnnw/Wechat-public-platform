module.exports = app => {
    const express = require('express');
    const crypto = require('crypto');
    const MSG = require('./message.js')
    const request = require('request');
    const fs = require('fs'); // 引入fs更新本地文件
    let configJson = require('../data/config.json')
    const path = require('path');
    const router = express.Router();
    const fxp = require('fast-xml-parser');
    let pool = require('../db/db');
    const TOKEN = 'yichaoyun';


    // 获取token
    function getToken() {
        if (configJson.token.access_token == '' || configJson.token.expires_in < new Date().getTime()) {
            console.log('重新获取access_token');
            // console.log(path.join(__dirname, '..'))
            request(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${configJson.appID}&secret=${configJson.appScrect}`, (error, response, body) => {
                let token_expires = JSON.parse(body)
                // console.log('token_expires :', token_expires);
                configJson.token.access_token = token_expires.access_token;
                configJson.token.expires_in = (token_expires.expires_in * 1000) + new Date().getTime();
                console.log(configJson)
                fs.writeFile(path.join(__dirname, '..', 'data', 'config.json'), JSON.stringify(configJson), (err) => {
                    if (err) throw err;
                    return configJson;
                });
                // console.log(configJson)
            });
        } else {
            return configJson;
        }
    }


    // 获取关注的用户
    function getUser(json) {
        /**
         * 获取用户数据 从头开始获取一次最多获取10000条 可多次获取
         * https://api.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN&next_openid=NEXT_OPENID   next_openid是第一个拉取的OPENID，不填默认从头开始拉取
         */
        request({
            url: `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${json.token.access_token}`,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
            },
        }, function (error, response, body) {
            let arr = [];
            arr = [...body.data.openid]
            console.log('arr :', arr);
            return arr
        });
    }


    // 获取当前时间
    function showTime() {
        var now = new Date();
        var nowTime = now.toLocaleString();
        var date = nowTime.substring(0, 10);//截取日期 
        var time = nowTime.substring(10, 20); //截取时间 
        var week = now.getDay(); //星期 
        var hour = now.getHours(); //小时 
        //判断星期几 
        var weeks = ["日", "一", "二", "三", "四", "五", "六"];
        var getWeek = "星期" + weeks[week];
        var sc;
        //判断是AM or PM 
        if (hour >= 0 && hour < 5) {
            sc = '凌晨';
        }
        else if (hour > 5 && hour <= 7) {
            sc = '早上';
        }
        else if (hour > 7 && hour <= 11) {
            sc = '上午';
        }
        else if (hour > 11 && hour <= 13) {
            sc = '中午';
        }
        else if (hour > 13 && hour <= 18) {
            sc = '下午';
        }
        else if (hour > 18 && hour <= 23) {
            sc = '晚上';
        }
        return date + " " + getWeek + " " + " " + sc + " " + time;
    }



    // 关注时把个人信息添加到数据库
    let openids = 'select openid from wx_focus_on_users';
    let updateSubscribe_gz = 'UPDATE wx_focus_on_users SET subscribe = 1 WHERE openid = ?';
    let updateSubscribe_qg = 'UPDATE wx_focus_on_users SET subscribe = 0 WHERE openid = ?'
    let addUser = 'insert into wx_focus_on_users' +
        '(subscribe,openid,nickname,sex,city,country,province,language,headimgurl,subscribe_time,unionid,remark,groupid,tagid_list,subscribe_scene,qr_scene,qr_scene_str)' +
        'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    // 当用户关注或者发送消息给微信公众号时触发
    router.post('/', (req, res) => {
        let xmlData = req.rawBody;
        let xml2json = fxp.parse(xmlData)
        // console.log(xmlData);
        // console.log(typeof xml2json)
        // xml2json = JSON.parse(xml2json);
        // console.log(xml2json);
        // console.log(configJson)

        let json = getToken();
        let returnData = {};
        console.log('xml2json.xml.Event :', xml2json.xml.Event);
        console.log('xml2json.xml.MsgType :', xml2json.xml.MsgType);
        if (xml2json.xml.MsgType == MSG.MESSAGE_TEXT) {
            returnData = {
                xml: {
                    ToUserName: xml2json.xml.FromUserName,
                    FromUserName: xml2json.xml.ToUserName,
                    CreateTime: new Date().getTime(),
                    MsgType: 'text',
                    Content: '你输入的是：' + xml2json.xml.Content,
                }
            }
        } else if (xml2json.xml.MsgType == MSG.MESSAGE_EVENT && xml2json.xml.Event == MSG.MESSAGE_EVENT_SUBSCRIBE) {
            returnData = {
                xml: {
                    ToUserName: xml2json.xml.FromUserName,
                    FromUserName: xml2json.xml.ToUserName,
                    CreateTime: new Date().getTime(),
                    MsgType: 'text',
                    Content: '您好，感谢关注 ^_^',
                }
            }

            request(`https://api.weixin.qq.com/cgi-bin/user/info?access_token=${json.token.access_token}&openid=${xml2json.xml.FromUserName}&lang=zh_CN`, (error, response, body) => {
                let bd = JSON.parse(body);
                let userData = [bd.subscribe, bd.openid, bd.nickname, bd.sex, bd.city, bd.country, bd.province, bd.language,
                bd.headimgurl, bd.subscribe_time, bd.unionid, bd.remark, bd.groupid, bd.tagid_list.toString(), bd.subscribe_scene, bd.qr_scene, bd.qr_scene_str];

                // 查询openid
                pool.getConnection((err, connection) => {
                    if (err) {
                        console.error(err)
                    } else {
                        // console.log('成功');
                        connection.query(openids, (err, rows) => {
                            if (err) {
                                console.error(err)
                            } else {
                                let openidarr = [];
                                // console.log('rows[0].openid :', rows[0].openid);
                                for (let i = 0; i < rows.length; i++) {
                                    openidarr.push(rows[i].openid)
                                }

                                if (openidarr.includes(bd.openid)) {
                                    console.log('再次关注公众号');
                                    pool.getConnection((err, connection) => {
                                        if (err) {
                                            console.error(err)
                                        } else {
                                            // console.log('成功');
                                            connection.query(updateSubscribe_gz, bd.openid, (err, rows) => {
                                                if (err) {
                                                    console.error(err)
                                                } else {
                                                    console.log('关注成功');
                                                }
                                                connection.release();
                                            })
                                        }
                                    })
                                } else {
                                    console.log('初次关注公众号');
                                    // 插入用户数据
                                    pool.getConnection((err, connection) => {
                                        if (err) {
                                            console.error(err)
                                        } else {
                                            // console.log('成功');
                                            connection.query(addUser, userData, (err, rows) => {
                                                if (err) {
                                                    console.error(err)
                                                } else {
                                                    console.log('ok');
                                                }
                                                connection.release();
                                            })
                                        }
                                    })
                                }

                            }
                            connection.release();
                        })
                    }
                })


            });


        } else if (xml2json.xml.MsgType == MSG.MESSAGE_EVENT && xml2json.xml.Event == MSG.MESSAGE_EVENT_UNSUBSCRIBE) {
            console.log('取关')
            pool.getConnection((err, connection) => {
                if (err) {
                    console.error(err)
                } else {
                    // console.log('成功');
                    connection.query(updateSubscribe_qg, xml2json.xml.FromUserName, (err, rows) => {
                        if (err) {
                            console.error(err)
                        } else {
                            console.log('取关成功');
                        }
                        connection.release();
                    })
                }
            })
        }
        returnData = new fxp.j2xParser().parse(returnData);

        getUser(json);

        res.send(returnData);
    })
    /**
     * 判断是否为空的方法
     * @param {*} val 要判断是否为空的参数
     */
    function isEmpty(val) {
        return val == '' || val == null || val == undefined || JSON.stringify(val) == '{}';
    }

    /**
     * 发送模板消息
     */
    // 查看用户是否关注
    let is_attention = 'select * from wx_focus_on_users where openid = ? AND subscribe = 1'
    router.post('/sendMsg', (req, res) => {
        let opid = 'xxxx';   // openid
        let jsons = getToken();
        if (!isEmpty(jsons)) {
            request(`https://api.weixin.qq.com/cgi-bin/user/info?access_token=${jsons.token.access_token}&openid=${opid}&lang=zh_CN`, (error, response, body) => {
                let bd = JSON.parse(body);
                console.log('bd.subscribe :', bd.subscribe);
                if (bd.subscribe == 1) {
                    let requestData = {
                        "touser": opid,
                        "template_id": "jsGHi1mEDpMReqCpqG7pxTCJm6hcjYYK5XMm5CccDKM",
                        "data": {
                            "first": {
                                "value": "预警",
                                "color": "#173177"
                            },
                            "device": {
                                "value": "打印机",
                                "color": "#173177"
                            },
                            "time": {
                                "value": showTime(),
                                "color": "#173177"
                            },
                            "remark": {
                                "value": showTime(),
                                "color": "#173177"
                            }
                        }
                    }

                    request({
                        url: `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${jsons.token.access_token}`,
                        method: "POST",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                        },
                        body: requestData
                    }, function (error, response, body) {
                        res.send({
                            status: 200,
                            msg: '发送成功'
                        });
                    });

                } else {
                    res.send({
                        status: 500,
                        msg: '该用户未关注公众号'
                    })
                }
            })

        } else {
            res.send({
                status: 500,
                msg: 'jsons为空'
            })
        }






        // 第二张方式
        // let jsons = getToken();
        // // 查询openid
        // pool.getConnection((err, connection) => {
        //     if (err) {
        //         console.error(err)
        //     } else {
        //         // console.log('成功');
        //         connection.query(is_attention, 'oRwTXwcpvq9ClShYvA8QN9i3-ruE', (err, rows) => {
        //             if (err) {
        //                 console.error(err);
        //                 connection.release();
        //             } else {
        //                 console.log('rows :', rows.length);
        //                 if (rows.length > 0) {
        //                     //     // if (!isEmpty(req.body)) {

        //                     // let touser = req.body.openid;
        //                     // let msgData = req.body.msgData;

        //                     let requestData = {
        //                         "touser": 'oRwTXwcpvq9ClShYvA8QN9i3-ruE',
        //                         "template_id": "jsGHi1mEDpMReqCpqG7pxTCJm6hcjYYK5XMm5CccDKM",
        //                         "data": {
        //                             "first": {
        //                                 "value": "预警",
        //                                 "color": "#173177"
        //                             },
        //                             "device": {
        //                                 "value": "打印机",
        //                                 "color": "#173177"
        //                             },
        //                             "time": {
        //                                 "value": showTime(),
        //                                 "color": "#173177"
        //                             },
        //                             "remark": {
        //                                 "value": showTime(),
        //                                 "color": "#173177"
        //                             }
        //                         }
        //                     }
        //                     if (!isEmpty(jsons)) {
        //                         request({
        //                             url: `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${jsons.token.access_token}`,
        //                             method: "POST",
        //                             json: true,
        //                             headers: {
        //                                 "content-type": "application/json",
        //                             },
        //                             body: requestData
        //                         }, function (error, response, body) {
        //                             connection.release();
        //                             res.send({
        //                                 status: 200,
        //                                 msg: '发送成功'
        //                             });
        //                         });
        //                     } else {
        //                         connection.release();
        //                         res.send({
        //                             status: 500,
        //                             msg: 'jsons为空'
        //                         });
        //                     }


        //                 } else {
        //                     connection.release();
        //                     res.send({
        //                         status: 500,
        //                         msg: '该用户未关注'
        //                     })
        //                 }

        //             }
        //         })
        //     }
        // })


    })

    router.get('/', (req, res) => {
        //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
        var signature = req.query.signature,//微信加密签名
            timestamp = req.query.timestamp,//时间戳
            nonce = req.query.nonce,//随机数
            echostr = req.query.echostr;//随机字符串

        //2.将token、timestamp、nonce三个参数进行字典序排序
        var array = [TOKEN, timestamp, nonce];
        array.sort();

        //3.将三个参数字符串拼接成一个字符串进行sha1加密
        var tempStr = array.join('');
        const hashCode = crypto.createHash('sha1'); //创建加密类型 
        var resultCode = hashCode.update(tempStr, 'utf8').digest('hex'); //对传入的字符串进行加密

        //4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
        if (resultCode === signature) {
            res.send(echostr);
            // console.log(echostr);
        } else {
            res.send('mismatch');
            //console.log('mismatch');
        }

    })


    app.use('/yc', router);

}
