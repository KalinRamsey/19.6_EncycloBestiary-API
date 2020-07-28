const express = require('express');
const path = require('path');

const UsersService = require('./users-service');
const DataService = require('../data/data-service');
const BestiariesService = require('../bestiaries/bestiaries-service');
const { requireAuth } = require('../middleware/jwt-auth');

const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter
  .route('/')
  .get((req, res, next) => {
    UsersService.getAllUsers(req.app.get('db'))
      .then(users => {
        res.json(users.map(UsersService.serializeUser));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { password, username, email } = req.body;

    for (const field of ['email', 'username', 'password'])
      if (!req.body[field]){
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        });
      }

    const usernameError = UsersService.validateUsername(username);
    if (usernameError){
        return res.status(400).json({ error: usernameError });
    }

    const passwordError = UsersService.validatePassword(password);
    if (passwordError){
      return res.status(400).json({ error: passwordError });
    }

    UsersService.hasUserWithUserName(
      req.app.get('db'),
      username
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName){
          return res.status(400).json({ error: `Username already taken` });
        }

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              username,
              email,
              password: hashedPassword,
              about_me: `Read all about ${username}...`,
              date_created: `now()`,
            };

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user));
              });
          });
      })
      .catch(next);
  })

usersRouter
  .route('/:userId')
  .all(checkUserExists)
  .get((req, res) => {
    res.json(UsersService.serializeUser(res.user));
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { username, email, password, about_me } = req.body;
    const userPatch = { username, email, password, about_me };

    const numberOfValues = Object.values(userPatch);
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: `Request body must contain either 'username', 'email', 'password' or 'about_me'`
      });
    }

    UsersService.patchUser(
      req.app.get('db'),
      req.params.userId,
      userPatch
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .delete(requireAuth, (req, res, next) => {
    UsersService.deleteUser(
      req.app.get('db'),
      req.params.userId
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })

usersRouter
  .route('/:userId/bestiaries')
  .all(checkUserExists)
  .get((req, res, next) => {
    UsersService.getAllUserBestiaries(
      req.app.get('db'),
      req.params.userId
    )
      .then(bestiaries => {
        res.json(bestiaries.map(BestiariesService.serializeBestiary));
      })
      .catch(next);
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { bestiary_name, bestiary_description } = req.body;
    const newBestiary = { bestiary_name, bestiary_description };

    for (const [key, value] of Object.entries(newBestiary)){
      if (value == null){
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    newBestiary.user_id = req.params.userId;

    UsersService.insertBestiary(
      req.app.get('db'),
      newBestiary
    )
      .then(bestiary => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${bestiary.id}`))
          .json(BestiariesService.serializeBestiary(bestiary));
      })
      .catch(next);
  })

usersRouter
  .route('/:userId/data')
  .all(checkUserExists)
  .get((req, res, next) => {
    DataService.getAllData(
      req.app.get('db')
    )
      .then(data => {
        res.json(data.map(DataService.serializeData));
      })
      .catch(next);
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { bestiary_id, data_name, data_description } = req.body;
    const newData = { bestiary_id, data_name, data_description };

    for (const [key, value] of Object.entries(newData)){
      if (value == null){
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    newData.user_id = req.user.id;

    DataService.insertData(
      req.app.get('db'),
      newData
    )
      .then(data => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${data.id}`))
          .json(DataService.serializeData(data));
      })
      .catch(next);
  })


async function checkUserExists(req, res, next) {
  try {
    const user = await UsersService.getUserById(
      req.app.get('db'),
      req.params.userId
    )

    if (!user){
      return res.status(404).json({
        error: `User doesn't exist`
      });
    }

    res.user = user;
    next();
  } catch (error) {
    next(error);
  }
}


module.exports = usersRouter;