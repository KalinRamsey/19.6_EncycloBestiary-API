const path = require('path');
const express = require('express')
const xss = require('xss')
const BestiariesService = require('./bestiaries-service')

const bestiariesRouter = express.Router()
const jsonParser = express.json()

const serializeBestiary = bestiary => ({
  id: bestiary.id,
  user_id: bestiary.user_id,
  bestiary_name: xss(bestiary.bestiary_name),
  bestiary_description: xss(bestiary.bestiary_description)
})

bestiariesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    BestiariesService.getAllBestiaries(knexInstance)
      .then(bestiaries => {
        res.json(bestiaries.map(serializeBestiary))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { bestiary_name, bestiary_description } = req.body
    const newBestiary = { bestiary_name, bestiary_description }

    for (const [key, value] of Object.entries(newArticle))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    newBestiary.user_id = user_id

    BestiariesService.insertBestiary(
      req.app.get('db'),
      newBestiary
    )
      .then(bestiary => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${bestiary.id}`))
          .json(serializeBestiary(bestiary))
      })
      .catch(next)
  })

bestiariesRouter
  .route('/:bestiary_id')
  .all((req, res, next) => {
    BestiariesService.getById(
      req.app.get('db'),
      req.params.bestiary_id
    )
      .then(bestiary => {
        if (!bestiary) {
          return res.status(404).json({
            error: { message: `Bestiary doesn't exist` }
          })
        }
        res.bestiary = bestiary
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeBestiary(res.bestiary))
  })
  .delete((req, res, next) => {
    BestiariesService.deleteBestiary(
      req.app.get('db'),
      req.params.bestiary_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { bestiary_name, bestiary_description } = req.body;
    const bestiaryToUpdate = { bestiary_name, bestiary_description }

    const numberOfValues = Object.values(bestiaryToUpdate).filter(Boolean).length;
    if (numberOfValues === 0){
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'bestiary_name', or 'bestiary_description'`
        }
      })
    }

    BestiariesService.updateBestiary(
      req.app.get('db'),
      req.params.bestiary_id,
      bestiaryToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = bestiariesRouter