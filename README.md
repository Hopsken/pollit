# 投票小助手 for BearyChat

![start](https://i.loli.net/2018/10/26/5bd32448d0da7.jpg)

有个新设计拿不定主意，想让大家帮忙瞧瞧？或者，想让大家投票决定下星期团建去哪儿？

借助『投票小助手』，在 [BearyChat](https://bearychat.com) 中你就能方便地创建和管理投票。

## 食用指南
1. 在 BearyChat 上添加一个自定义 Hubot 机器人，得到 Hubot Token。
2. 在 `src/token.js` 中配置 Hubot Token 与 MySQL 数据库信息。
3. 启动机器人。
  ```bash
  npm i
  npm run dev
  ```

## 如何发起一个投票
1. 私聊小助手，发送 `poll "问题" "选项 1" "选项 2" "选项 3" ...` 来创建一个投票。
   > 使用 `poll -a "问题" ...` 可以创建匿名投票。
2. 输入 `publish 编号 “讨论组名”` 发送到指定的讨论组。
3. 发布后，点击私聊『@投票小助手』。输入 `vote 编号 选项序号` 即可进行投票。
   **投票结果会实时更新。**

## 如何管理投票
1. 使用 `result 编号` 可以查看当前投票结果。
2. 使用 `close 编号` 可以关闭指定投票。
