import Sequelize from 'sequelize'

import { sequelize } from './client'

export const Poll = sequelize.define('poll', {

  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  teamId: {
    type: Sequelize.STRING,
    allowNull: false
  },

  creatorId: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  channelId: {
    type: Sequelize.STRING,
    allowNull: true,
  },

  messageKey: {
    type: Sequelize.STRING,
    allowNull: true
  },

  text: {
    type: Sequelize.TEXT,
    allowNull: false
  },

  anonymous: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },

  closed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },

  // 是否允许多选，1 为单选，0 为无限制
  multi: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
    allowNull: false
  },

}, {
  timestamps: true
})

export const Answer = sequelize.define('answer', {

  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  pollId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  choiceId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  userId: {
    type: Sequelize.STRING,
    allowNull: false,
  },

}, {
  timestamps: true
})

export const Choice = sequelize.define('choice', {

  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  pollId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  index: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },

  text: {
    type: Sequelize.STRING,
    allowNull: false,
  }

}, {
  timestamps: true
})


// 同步字段更新
if (process.env.NODE_ENV === 'dev') {
  Poll.sync({ alter: true })
  Answer.sync({ alter: true })
  Choice.sync({ alter: true })
}
