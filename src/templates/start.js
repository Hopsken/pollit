// eslint-disable-next-line
export const INTRODUCTION_TEMPLATE = `欢迎使用投票小助手👋 我可以帮你直接在 BearyChat 中创建和管理投票💁‍

你可以通过如下方式发起一个投票：
> \`poll “今晚去吃啥？” “烧烤” “炸鸡”\` 来创建一个投票，使用 \`poll -a ...\` 创建匿名投票。
> 使用 \`multi\` 命令可以创建支持多选的投票。

> \`publish 编号 讨论组名\` 来发布到指定讨论组。

> \`vote 编号 选项序号\` 来投上自己的一票，**投票结果将会实时更新**。

管理投票：
> \`close 编号\` 关闭指定投票。
> \`result 编号\` 查看投票结果。

> [🔗帮助文档](https://pollit.hopsken.com) 你也可以随时输入\`help 指令\` 查看某个指令的说明。`
