export const NOTICE = {

  EMPTY_CHOICE: '您似乎没有填写选项哎。如需帮助，请输入`help`。',

  CREATE_POLL_SUCCESS: '成功生成投票，输入 \`publish $0 "讨论组名"\` 来发布到讨论组吧~',

  CREATE_ANONY_POLL_SUCCESS: '成功生成匿名投票，输入 \`publish $0 "讨论组名"\` 来发布到讨论组吧~',

  ON_ERROR: '抱歉，似乎出了点问题😔',

  POLL_NOT_EXIST: '啊，似乎没有这个投票呢，也许是输错了编号？',

  POLL_ALREADY_PUBLISHED: '您已经发布过这个投票啦，快去邀请大家参加吧~',

  POLL_ERROR_ID: '只有投票的创建者才能发布哦，您似乎不是这个投票的创建者。也许输错了编号？',

  CHANNEL_NOT_EXIST: '好像没有这个讨论组哎😔',

  PUBLISH_ANONY_SUCCESS: `@<=$0=> 发起了新的**🕶匿名投票**
> 快去私聊 $1 \`vote $2 选项\` 投上你的一票吧~`,

  PUBLISH_PUBLIC_SUCCESS: `@<=$0=> 发起了新投票，“引用”本次投票消息并回复你的选择进行投票吧~
> 你也可以通过私聊 $1 \`vote $2 选项\` 投上你的一票`,

  POLL_ANONY_TIP: '🕶 本次投票为**匿名投票**，你的名字将不会出现在结果中。',

  PUBLISH_SUCCESS_TIP: '成功发布投票 **No.$0 $1** 到 **$2**，快去通知大家参与投票吧~',

  POLL_CLOSED: '该投票已经被关闭啦，似乎来迟了一步呢',

  CHOICE_NOT_EXIST: '啊咧，好像没有这个选项哎',

  VOTE_SUCCESS: `成功投票：**No.$0 $1**，你的选择为：**$2**。`,

  VOTED: '已经投过票啦~',

  RESULT_TIP: '请输入 `result 编号` 查看投票结果😉',

  RESULT_NOT_CREATOR: '只能查看自己发起的投票的结果哦😉',

  CLOSE_NOT_CREATOR: '只能关闭自己发起的投票哦😘',

  CLOSED: '投票已经被关闭啦~',

  CLOSE_SUCCESS: '成功关闭投票 **No.$0 $1**，输入\`result $2\`查看结果吧~'
}
