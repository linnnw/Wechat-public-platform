/*
 Navicat Premium Data Transfer

 Source Server         : 106.54.122.223_3306
 Source Server Type    : MySQL
 Source Server Version : 50729
 Source Host           : 106.54.122.223:3306
 Source Schema         : wx_Focus_on_users

 Target Server Type    : MySQL
 Target Server Version : 50729
 File Encoding         : 65001

 Date: 27/02/2020 13:57:49
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for wx_focus_on_users
-- ----------------------------
DROP TABLE IF EXISTS `wx_focus_on_users`;
CREATE TABLE `wx_focus_on_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `subscribe` tinyint(1) NOT NULL COMMENT '用户是否订阅该公众号标识，值为0时，代表此用户没有关注该公众号，拉取不到其余信息。',
  `openid` varchar(150) NOT NULL COMMENT '用户的标识，对当前公众号唯一',
  `nickname` varchar(50) NOT NULL COMMENT '用户的昵称\n用户的昵称\n',
  `sex` tinyint(1) NOT NULL COMMENT '用户的性别，值为1时是男性，值为2时是女性，值为0时是未知',
  `city` varchar(50) DEFAULT NULL COMMENT '用户所在城市',
  `country` varchar(50) DEFAULT NULL COMMENT '用户所在国家',
  `province` varchar(50) DEFAULT NULL COMMENT '用户所在省份',
  `language` varchar(15) DEFAULT NULL COMMENT '用户的语言，简体中文为zh_CN',
  `headimgurl` varchar(255) DEFAULT NULL COMMENT '用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空。若用户更换头像，原有头像URL将失效。',
  `subscribe_time` int(20) DEFAULT NULL COMMENT '用户关注时间，为时间戳。如果用户曾多次关注，则取最后关注时间',
  `unionid` varchar(150) DEFAULT NULL COMMENT '只有在用户将公众号绑定到微信开放平台帐号后，才会出现该字段。',
  `remark` varchar(255) DEFAULT NULL COMMENT '公众号运营者对粉丝的备注，公众号运营者可在微信公众平台用户管理界面对粉丝添加备注',
  `groupid` int(100) DEFAULT NULL COMMENT '用户所在的分组ID（兼容旧的用户分组接口）',
  `tagid_list` varchar(255) DEFAULT NULL COMMENT '用户被打上的标签ID列表',
  `subscribe_scene` varchar(30) DEFAULT NULL COMMENT '返回用户关注的渠道来源，ADD_SCENE_SEARCH 公众号搜索，ADD_SCENE_ACCOUNT_MIGRATION 公众号迁移，ADD_SCENE_PROFILE_CARD 名片分享，ADD_SCENE_QR_CODE 扫描二维码，ADD_SCENE_PROFILE_LINK 图文页内名称点击，ADD_SCENE_PROFILE_ITEM 图文页右上角菜单，ADD_SCENE_PAID 支付后关注，ADD_SCENE_OTHERS 其他',
  `qr_scene` varchar(255) DEFAULT NULL COMMENT '二维码扫码场景（开发者自定义）',
  `qr_scene_str` varchar(255) DEFAULT NULL COMMENT '二维码扫码场景描述（开发者自定义）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT='subscribe                        用户是否订阅该公众号标识，值为0时，代表此用户没有关注该公众号，拉取不到其余信息。\nopenid\n用户的标识，对当前公众号唯一\nnickname\n用户的昵称\nsex\n用户的性别，值为1时是男性，值为2时是女性，值为0时是未知\ncity\n用户所在城市\ncountry\n用户所在国家\nprovince\n用户所在省份\nlanguage\n用户的语言，简体中文为zh_CN\nheadimgurl\n用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空。若用户更换头像，原有头像URL将失效。\nsubscribe_time\n用户关注时间，为时间戳。如果用户曾多次关注，则取最后关注时间\nunionid\n只有在用户将公众号绑定到微信开放平台帐号后，才会出现该字段。\nremark\n公众号运营者对粉丝的备注，公众号运营者可在微信公众平台用户管理界面对粉丝添加备注\ngroupid\n用户所在的分组ID（兼容旧的用户分组接口）\ntagid_list\n用户被打上的标签ID列表\nsubscribe_scene\n返回用户关注的渠道来源，ADD_SCENE_SEARCH 公众号搜索，ADD_SCENE_ACCOUNT_MIGRATION 公众号迁移，ADD_SCENE_PROFILE_CARD 名片分享，ADD_SCENE_QR_CODE 扫描二维码，ADD_SCENE_PROFILE_LINK 图文页内名称点击，ADD_SCENE_PROFILE_ITEM 图文页右上角菜单，ADD_SCENE_PAID 支付后关注，ADD_SCENE_OTHERS 其他\nqr_scene\n二维码扫码场景（开发者自定义）\nqr_scene_str\n二维码扫码场景描述（开发者自定义）\n';

SET FOREIGN_KEY_CHECKS = 1;
