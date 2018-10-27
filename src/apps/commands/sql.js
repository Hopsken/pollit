import * as db from '../../scheme'
import { sequelize } from '../../client'

/*
  * 生成新投票
*/
export const createPoll = ({
  teamId,
  creatorId,
  text
} = {}) =>
  db.Poll.create({
    teamId,
    creatorId,
    text
  })

/*
  * 根据 ID 更新投票
*/
export const updatePollById = (pollId, attributes) => {
  return db.Poll.update(
    attributes,
    { where: { id: pollId } }
  )
}

/*
  * 根据 ID 查找投票
*/
export const getPollById = async (pollId, keys = ['text']) => {
  const poll = await db.Poll.findOne({
    attributes: keys,
    where: {
      id: pollId
    }
  })

  return new Promise((resolve, reject) => {
    if (poll) {
      resolve(poll.get({ plain: true }))
    } else {
      reject(null)
    }
  }
  )
}


/*
  * 创建或更新用户 Answer
*/
export const createOrUpdateAnswer = ({
  pollId, userId, choiceId, username
} = {}) => {
  return db.Answer.findOne({
    where: {
      pollId,
      userId
    }
  })
    .then(ans => {
      if (ans) {
        return ans.update({
          choiceId, username
        })
      } else {
        return db.Answer.create({
          pollId,
          userId,
          choiceId,
          username
        })
      }
    })
}


/*
  * 批量创建 Choices 选项
*/
export const createBulkChoices = (
  choices,
  pollId
) =>
  db.Choice.bulkCreate(choices.map((one, index) => ({
    pollId,
    index: index + 1,
    text: one
  })))

/*
  * 根据 pollId 查找选项
*/
export const getChoicesByPollId = async (pollId, keys = ['text']) => {
  const choices = await db.Choice.findAll({
    attributes: keys,
    where: {
      pollId
    },
    order: [
      ['index', 'ASC']
    ]
  })

  return new Promise((resolve, reject) => {
    const plainChoices = (choices || []).map(one => one.get({ plain: true }))

    if (plainChoices) {
      resolve(plainChoices)
    } else {
      reject(null)
    }
  })
}

/*
 * 查询指定 pollId 的投票情况
*/
export const getStatsByPollId = pollId => {
  return sequelize.query('SELECT answers.userId, choices.index FROM answers, choices \
   WHERE answers.choiceId = choices.id AND answers.pollId = :pollId',
  {
    replacements: { pollId },
    type: sequelize.QueryTypes.SELECT
  }
  )
}