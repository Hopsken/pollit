import {
  getPollTemplate,
  // getStatsTemplate,
} from '../../templates'

function parsePollCmd(text) {
  try {
    return text.trim().slice(4)
      .trim()
      .match(/["“][^"“”]+["”]/g)
      .map(one => one.slice(1, -1))
  } catch(err) {
    throw new Error('格式错误，请输入 `help` 查看使用说明。')
  }
}

function parsePublishCmd(text) {
  text = text.trim()

  try {
    let [, pollId] = text.split(/\s+/)
    let rest = /^publish\s+\d+\s+["“]?(.+)["”]?$/.exec(text)[1]
    rest = rest.trim().replace(/["“”]/g, '')

    return [pollId, rest]
  } catch(err) {
    throw new Error('格式错误，输入 `publish 编号 "讨论组名"` 以发布投票到指定讨论组。')
  }
}

export const parseCmd = text => {
  let [cmd, ...rest] = text.trim().split(/\s+/)
  cmd = cmd.toLowerCase()

  try {
    if (cmd === 'poll') {

      if (rest[0] === '-a') {
        cmd = 'pollAnonymous'
      }

      rest = parsePollCmd(text)
    }

    if (cmd === 'publish') {
      rest = parsePublishCmd(text)
    }
  } catch(err) {
    throw new Error('格式错误，输入 `help` 查看使用说明。')
  }

  return [cmd, ...rest]
}


const choiceEmojis = {
  0: '0️⃣', 1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣',
  6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣', 10: '🔟', other: '#️⃣'
}

export const orderingChoice = (text, index) => {
  return `${ index <= 10 ? choiceEmojis[index] : index} ${text}`
}

export const formatChoices = (detail, anonymous) => {
  let res = ''

  ;(detail || []).forEach((option, index) => {
    const { text, users } = option

    res += orderingChoice(text, index + 1) + '\n'

    if (users && users.length) {
      if (anonymous) {
        res += `${users.length} 人\n`
      } else {
        res += `${users.length} 人：` + users.map(userId => `@<=${userId}=>`).join(' ') + '\n'
      }
    }
  })

  return res.trim()
}

export const getCurrentBotName = async (http) => {
  const currentBot = await http.user.me()

  return `@<=${currentBot.id}=>`
}

/*
 * 格式化投票详情
*/
export const formatPoll = getPollTemplate

/*
 * 格式化投票结果
*/
export const formatResultsAttachments = (stats, anonymous = false) => {
  const { detail, total } = stats
  const colors = ['#598AD6', '#36BD64', '#F23C41', '#F4BF70']

  const attachments = detail.map((option, index) => {
    const { text, users } = option
    let statsText = ''

    statsText += orderingChoice(text, index + 1) + '\n'

    if (Array.isArray(users)) {
      const percent = total !== 0 ? (users.length / total) * 100 : 0

      const progress = '◻️'.repeat(Math.round(percent/10))
      const numberOfPeople = users.length ? `(${users.length})` : ''

      statsText += `${progress} ${percent}% ${numberOfPeople} \n`
      if (!anonymous) {
        statsText += users.map(userId => `@<=${userId}=>`).join(' ') + '\n'
      }
    }

    return {
      color: colors[index % 4],
      text: statsText.trim()
    }
  })

  attachments.push({
    color: '#32325D',
    text: `总票数：**${total}**`
  })

  return attachments
}

// export const formatStats = ({
//   pollId,
//   title,
//   stats
// } = {}) => {
//   const { detail, total } = stats
//   const colors = ['#598AD6', '#36BD64', '#F23C41', '#F4BF70']

//   let statsText = ''
//   ;(detail || []).forEach((option, index) => {
//     const { text, users } = option

//     statsText += orderingChoice(text, index + 1) + '\n'

//     if (Array.isArray(users)) {
//       const percent = (users.length / total) * 100
//       const progress = '◻️'.repeat(Math.round(percent/10))
//       const numberOfPeople = users.length ? `(${users.length})` : ''

//       statsText += `${progress} ${percent}% ${numberOfPeople} \n`
//       statsText += users.map(userId => `@<=${userId}=>`).join(' ') + '\n'
//     }
//   })

//   return getStatsTemplate({
//     title,
//     number: pollId,
//     stats: statsText.trim(),
//   })
// }
