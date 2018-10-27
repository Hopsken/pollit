import {
  INTRODUCTION_TEMPLATE,
} from '../../templates'
import {
  createPoll,
  getPollById,
  updatePollById,
  createBulkChoices,
  getChoicesByPollId,
  getStatsByPollId,
  createOrUpdateAnswer
} from './sql'
import {
  formatPoll,
  formatChoices,
  orderingChoice,
  getCurrentBotName,
  formatResultsAttachments,
} from './utils'

const commandHandlers = {

  // 开始
  start(options, reply) {
    reply({
      text: INTRODUCTION_TEMPLATE
    })
  },

  // 帮助
  help(options, reply) {
    reply({
      text: INTRODUCTION_TEMPLATE
    })
  },

  // 发起投票
  poll(options, reply, http) {
    const message = this
    const [title, ...choices] = options

    let pollId

    http.team.info()
      .then(info => createPoll({
        teamId: info.id,
        creatorId: message.uid,
        text: title
      }))
      .then(poll => {
        pollId = poll.get({ plain: true })['id']
      })
      .then(() => createBulkChoices(choices, pollId))
      .then(() => reply({
        text: formatPoll({
          pollId,
          title,
          choices: choices.map((one, index) => orderingChoice(one, index + 1)).join('\n'),
          tips: `成功生成投票，输入 \`publish ${pollId} "讨论组名"\` 来发布到讨论组吧~`
        })
      }))
  },

  // 发布投票
  async publish(options, reply, http) {
    const message = this
    const [pollId, channelName] = options

    const currentPoll = await getPollById(pollId, ['text', 'creatorId', 'messageKey'])

    // 未找到投票
    if (currentPoll == null) {
      reply({
        text: '啊，似乎没有这个投票呢。'
      })
      return
    }

    if (currentPoll['messageKey']) {
      reply({
        text: '您已经发布过这个投票啦，快去邀请大家参加吧~'
      })
      return
    }

    // 非投票创建者
    if (message.uid !== currentPoll.creatorId) {
      reply({
        text: '只有投票的创建者才能发布哦，您似乎不是这个投票的创建者。也许输错了编号？'
      })
      return
    }

    const targetChannel = (await http.channel.list()).filter(channel => channel.name === channelName)[0]
    if (targetChannel == null) {
      reply({
        text: '好像没有这个讨论组哎😔'
      })
      return
    }

    const choices = await getChoicesByPollId(pollId)
    const botName = await getCurrentBotName(http)

    reply({
      vchannel_id: targetChannel.vchannel_id,
      attachments: [],
      text: formatPoll({
        pollId,
        title: currentPoll['text'],
        choices:  choices.map((one, index) => orderingChoice(one.text, index + 1)).join('\n'),
        tips: `快来私聊 ${botName} \`vote ${pollId} 选项序号\` 投票吧~ `
      })
    })
      .then(message =>
        updatePollById(pollId, { messageKey: message.key, channelId: message.vchannel_id })
      )
      .then(() =>
        reply({
          vchannel_id: message.vchannel_id,
          text: `成功发布投票 **No.${pollId} ${currentPoll['text']}** 到 **${channelName}**，快去通知大家参与投票吧~`
        })
      )
  },

  // 用户投票
  async vote(options, reply, http) {
    const message = this
    const [pollId, choiceIndex] = options

    const currentPoll = await getPollById(pollId, ['messageKey', 'teamId', 'text', 'id', 'channelId'])
    const currentUser = await http.user.info({ user_id: message.uid })

    if (!currentPoll || currentPoll.messageKey == null ||currentPoll.teamId !== currentUser.team_id) {
      reply({
        text: '似乎没有这个投票哎，也许是输错了编号？'
      })
      return
    }

    const availableChoices = await getChoicesByPollId(pollId, ['text', 'id', 'index'])
    const userChoice = (availableChoices || []).filter(one => one.index == choiceIndex)[0]

    if (!userChoice) {
      reply({
        text: '啊咧，好像没有这个选项哎'
      })
      return
    }

    createOrUpdateAnswer({
      pollId,
      userId: currentUser.id,
      username: currentUser.name,
      choiceId: userChoice['id']
    })
      .then(() => reply({
        text: `成功投票：**No.${currentPoll.id} ${currentPoll.text}**，你的选择为：**${userChoice['text']}**。

      > 如果想要更改选择，再次执行 \`vote ${currentPoll.id} 新选择\` 即可。`
      }))
      .then(async () => {
        const { detail } = await getStatsByPollId(pollId)
        const botName = await getCurrentBotName(http)

        return http.message.update_text({
          vchannel_id: currentPoll.channelId,
          message_key: currentPoll.messageKey,
          text: formatPoll({
            pollId,
            title: currentPoll.text,
            choices: formatChoices(detail),
            tips: `快来私聊 ${botName} \`vote ${pollId} 选项序号\` 投票吧~ `
          })
        })
      })
  },

  async result(options, reply) {
    const [pollId] = options
    const message = this

    if (!pollId) {
      reply({
        text: '请输入 `result 编号` 查看投票结果😉'
      })

      return
    }

    const stats = await getStatsByPollId(pollId)
    const poll = await getPollById(pollId, ['text', 'creatorId'])

    // 判断是否为本人发起的投票
    if (!poll || message.uid !== poll.creatorId) {
      reply({
        text: '只能查看自己发起的投票的结果哦😉'
      })

      return
    }

    reply({
      text: `**No.${pollId} ${poll['text']}**`,
      attachments: formatResultsAttachments(stats)
    })
  }

}

export default commandHandlers
