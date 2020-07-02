const bcrypt = require('bcryptjs')
const xss = require('xss')

const BestiaryService = require('../bestiaries/bestiaries-service')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
  hasUserWithUserName(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then(user => !!user)
  },
  getAllUsers(db){
    return db
      .from('users')
      .select('*')
  },
  getUserById(db, id){
    return UsersService.getAllUsers(db)
      .where({id})
      .first()
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user)
  },
  patchUser(db, id, newUserFields){
    return db('users')
      .where({ id })
      .update(newUserFields)
  },
  deleteUser(db, id){
    return db('users')
      .where({ id })
      .delete()
  },
  validateUsername(username) {
    if (username.startsWith(' ') || username.endsWith(' ')){
      return 'Username must not start or end with empty spaces'
    }
    return null
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters'
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters'
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces'
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character'
    }
    return null
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },
  getAllUserBestiaries(db, user_id) {
    return db.select('*').from('bestiaries').where({user_id});
  },
  addBestiary(db, newBestiary) {
    return db
      .insert(newBestiary)
      .into('bestiaries')
      .returning('*')
      .then(([bestiary]) => bestiary)
      .then(bestiary =>
        BestiaryService.getBestiaryById(db, bestiary.id)
      )
  },
  serializeUser(user) {
    return {
      id: user.id,
      email: xss(user.email),
      username: xss(user.username),
      password: xss(user.password),
      about_me: xss(user.about_me),
      date_created: new Date(user.date_created),
    }
  },
}

module.exports = UsersService