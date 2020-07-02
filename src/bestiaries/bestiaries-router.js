const path = require('path');
const express = require('express')

const DataService = require('../data/data-service')
const BestiariesService = require('./bestiaries-service')
const { requireAuth } = require('../middleware/jwt-auth')

const bestiariesRouter = express.Router()
const jsonParser = express.json()

bestiariesRouter
  .route('/')
  .get((req, res, next) => {
    BestiariesService.getAllBestiaries(
      req.app.get('db')
    )
      .then(bestiary => {
        res.json(bestiary.map(BestiariesService.serializeBestiary))
      })
      .catch(next)
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { bestiary_name, bestiary_description } = req.body
    const newBestiary = { bestiary_name, bestiary_description }

    for (const [key, value] of Object.entries(newBestiary))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

    newBestiary.user_id = req.user.id

    BestiariesService.insertBestiary(
      req.app.get('db'),
      newBestiary
    )
      .then(bestiary => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${bestiary.id}`))
          .json(BestiariesService.serializeBestiary(bestiary))
      })
      .catch(next)
  })


bestiariesRouter
  .route('/:bestiaryId')
  .all(checkBestiaryExists)
  .get((req, res) => {
    res.json(BestiariesService.serializeBestiary(res.bestiary))
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { bestiary_name, bestiary_description } = req.body
    const bestiaryPatch = { bestiary_name, bestiary_description }

    const numberOfValues = Object.values(bestiaryPatch)
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: `Request body must contain either 'bestiary_name' or 'bestiary_description'`
      })
    }

    BestiariesService.patchBestiary(
      req.app.get('db'),
      req.params.bestiaryId,
      bestiaryPatch
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .delete(requireAuth, (req, res, next) => {
    BestiariesService.deleteBestiary(
      req.app.get('db'),
      req.params.bestiaryId
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

bestiariesRouter
  .route('/:bestiaryId/data')
  .all(checkBestiaryExists)
  .get((req, res, next) => {
    DataService.getAllDataInBestiary(
      req.app.get('db'),
      req.params.bestiaryId
    )
      .then(data => {
        res.json(data.map(DataService.serializeData))
      })
      .catch(next)
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { user_id, data_name, data_description } = req.body
    const newData = { user_id, data_name, data_description }

    for (const [key, value] of Object.entries(newData))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

    newData.bestiary_id = req.params.bestiaryId

    DataService.insertData(
      req.app.get('db'),
      newData
    )
      .then(data => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${data.id}`))
          .json(DataService.serializeData(data))
      })
      .catch(next)
  })


async function checkBestiaryExists(req, res, next) {
  try {
    const bestiary = await BestiariesService.getBestiaryById(
      req.app.get('db'),
      req.params.bestiaryId
    )

    if (!bestiary)
      return res.status(404).json({
        error: `Bestiary doesn't exist`
      })

    res.bestiary = bestiary
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = bestiariesRouter