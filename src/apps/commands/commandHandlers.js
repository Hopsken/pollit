import {
  HELP_DOC,
  INTRODUCTION_TEMPLATE,
  NOTICE
} from '../../templates'
import {
  getPoll,
  createPoll,
  createAnswer,
  updatePollById,
  createBulkChoices,
  getStatsByPollId,
  getChoicesByPollId,
} from './sql'
import {
  formatPoll,
  formatChoices,
  orderingChoice,
  getCurrentBotName,
  formatResultsAttachments,
} from './utils'

export const personalCommandHandlers = {

  // 开始
  start(options, reply) {
    reply({
      text: INTRODUCTION_TEMPLATE
    })
  },

  // 帮助
  help(options, reply) {
    const [queryCmd] = options
    reply({
      text: HELP_DOC[queryCmd] || INTRODUCTION_TEMPLATE
    })
  },

  // 发起投票
  poll(options, reply, http, anonymous = false) {
    const message = this
    const [title, ...choices] = options

    if (!choices || choices.length === 0) {
      reply({
        text: NOTICE['EMPTY_CHOICE']
      })
      return
    }

    let pollId

    http.team.info()
      .then(info => createPoll({
        teamId: info.id,
        creatorId: message.uid,
        text: title,
        anonymous,
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
          tips: (
            anonymous
            ? NOTICE['CREATE_ANONY_POLL_SUCCESS']
            : NOTICE['CREATE_POLL_SUCCESS']
            ).replace('$0', pollId)
        })
      }))
      .catch(() => reply({
        text: NOTICE['ON_ERROR']
      }))
  },

  // 创建匿名投票
  pollAnonymous(options, reply, http) {
    try {
      personalCommandHandlers['poll'].call(this, options, reply, http, true)
    } catch {
      reply({
        text: NOTICE['ON_ERROR']
      })
    }
  },

  // 发布投票
  async publish(options, reply, http) {
    const message = this
    const [pollId, channelName] = options

    const currentPoll = await getPoll({id: pollId}).catch(() => null)

    // 未找到投票
    if (currentPoll == null) {
      reply({
        text: NOTICE['POLL_NOT_EXIST']
      })
      return
    }

    if (currentPoll['messageKey']) {
      reply({
        text: NOTICE['POLL_ALREADY_PUBLISHED']
      })
      return
    }

    // 非投票创建者
    if (message.uid !== currentPoll.creatorId) {
      reply({
        text: NOTICE['POLL_ERROR_ID']
      })
      return
    }

    const targetChannel = (await http.channel.list()).filter(channel => channel.name === channelName)[0]
    if (targetChannel == null) {
      reply({
        text: NOTICE['CHANNEL_NOT_EXIST']
      })
      return
    }

    const choices = await getChoicesByPollId(pollId)
    const botName = await getCurrentBotName(http)

    reply({
      vchannel_id: targetChannel.vchannel_id,
      text: (
        currentPoll.anonymous
        ? NOTICE['PUBLISH_ANONY_SUCCESS']
        : NOTICE['PUBLISH_PUBLIC_SUCCESS']
      ).replace('$0', currentPoll.creatorId)
      .replace('$1', botName)
      .replace('$2', pollId)
    })
    .then(() => reply({
      vchannel_id: targetChannel.vchannel_id,
      text: formatPoll({
        pollId,
        title: currentPoll.text,
        choices:  choices.map((one, index) => orderingChoice(one.text, index + 1)).join('\n'),
        tips: currentPoll.anonymous ? NOTICE['POLL_ANONY_TIP'] : ''
      })
    }))
    .then(message =>
      updatePollById(pollId, { messageKey: message.key, channelId: message.vchannel_id })
    )
    .then(() =>
      reply({
        vchannel_id: message.vchannel_id,
        text: NOTICE['PUBLISH_SUCCESS_TIP']
          .replace('$0', pollId)
          .replace('$1', currentPoll.text)
          .replace('$2', channelName)
      })
    )
    .catch(() => reply({
      text: NOTICE['ON_ERROR']
    }))
  },

  // 用户投票
  async vote(options, reply, http) {
    const message = this
    const [pollId, choiceIndex] = options

    const currentPoll = await getPoll({id: pollId}).catch(() => null)
    const currentUser = await http.user.info({ user_id: message.uid })

    if (!currentPoll || currentPoll.messageKey == null || currentPoll.teamId !== currentUser.team_id) {
      reply({
        text: NOTICE['POLL_NOT_EXIST']
      })

      return
    }

    if (currentPoll.closed) {
      reply({
        text: NOTICE['POLL_CLOSED']
      })

      return
    }

    const availableChoices = await getChoicesByPollId(pollId, ['text', 'id', 'index'])
    const userChoice = (availableChoices || []).filter(one => one.index == choiceIndex || one.text == choiceIndex)[0]

    if (!userChoice) {
      reply({
        text: NOTICE['CHOICE_NOT_EXIST']
      })
      return
    }

    createAnswer({
      pollId,
      userId: currentUser.id,
      username: currentUser.name,
      choiceId: userChoice['id']
    })
      .then(() => reply({
        text: NOTICE['VOTE_SUCCESS']
          .replace('$0', currentPoll.id)
          .replace('$1', currentPoll.text)
          .replace('$2', userChoice.text)
      }))
      .catch(() => {
        return Promise.reject(401)
      })
      .then(async () => {
        const { detail } = await getStatsByPollId(pollId)

        return http.message.update_text({
          vchannel_id: currentPoll.channelId,
          message_key: currentPoll.messageKey,
          text: formatPoll({
            pollId,
            title: currentPoll.text,
            choices: formatChoices(detail, currentPoll.anonymous),
            tips: currentPoll.anonymous ? NOTICE['POLL_ANONY_TIP'] : ''
          })
        })
      })
      .catch((err) => {
        if (err == 401) {
          reply({
            text: NOTICE['VOTED']
          })
        } else {
          reply({
            text: NOTICE['ON_ERROR']
          })
        }
      })
  },

  async result(options, reply) {
    const [pollId] = options
    const message = this

    if (!pollId) {
      reply({
        text: NOTICE['RESULT_TIP']
      })

      return
    }

    const stats = await getStatsByPollId(pollId)
    const poll = await getPoll({id: pollId}).catch(() => null)

    // 判断是否为本人发起的投票
    if (!poll || message.uid !== poll.creatorId) {
      reply({
        text: NOTICE['RESULT_NOT_CREATOR']
      })

      return
    }

    reply({
      text: `**No.${pollId} ${poll.text}**`,
      attachments: formatResultsAttachments(stats, poll.anonymous)
    })
    .catch(() => reply({
      text: NOTICE['ON_ERROR']
    }))
  },

  async close(options, reply) {
    const message = this
    const [pollId] = options

    const currentPoll = await getPoll({id: pollId}).catch(() => null)

    // 检测是否为本人发起的投票
    if (!currentPoll || currentPoll.creatorId !== message.uid) {
      reply({
        text: NOTICE['CLOSE_NOT_CREATOR']
      })
      return
    }

    // 检测是否已经关闭
    if (currentPoll.closed) {
      reply({
        text: NOTICE['CLOSED']
      })

      return
    }

    updatePollById(pollId, {closed: true})
    .then(() => reply({
      text: NOTICE['CLOSE_SUCCESS']
        .replace('$0', pollId)
        .replace('$1', currentPoll.text)
        .replace('$2', pollId)
    }))
    .catch(() => reply({
      text: NOTICE['ON_ERROR']
    }))
  }

}


export const channelCommandHandlers = {

  async refer(reply, http) {
    const message = this

    if (!message['text']) {
      return
    }

    const currentPoll = await getPoll({ messageKey: message.refer_key })

    // 检测是否存在该投票
    if (!currentPoll) return

    const availableChoices = await getChoicesByPollId(currentPoll.id)
    const userChoice = (availableChoices || []).filter(one => one.index == message.text.trim() || one.text == message.text.trim())[0]

    if (!availableChoices || !userChoice) return

    if (currentPoll.anonymous) {
      reply({text: '这是匿名投票啊。哦豁，完蛋🤦‍♀️'})
      return
    }

    createAnswer({
      pollId: currentPoll.id,
      userId: message.uid,
      username: `@<=${message.uid}=>`,
      choiceId: userChoice.id
    })
    .then(async () => {
      const { detail } = await getStatsByPollId(currentPoll.id)

      return http.message.update_text({
        vchannel_id: message.vchannel_id,
        message_key: message.refer_key,
        text: formatPoll({
          pollId: currentPoll.id,
          title: currentPoll.text,
          choices: formatChoices(detail, currentPoll.anonymous),
          tips: currentPoll.anonymous ? NOTICE['POLL_ANONY_TIP'] : ''
        })
      })
    })
    .catch(() => null)

  }

}
