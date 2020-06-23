const path = require('path')
const express = require('express')
const xss = require('xss')
const DataService = require('./data-service')

const dataRouter = express.Router()
const jsonParser = express.json()

const serializeData = data => ({
  id: data.id,
  bestiary_id: xss(data.bestiary_id),
  data_name: data.data_name,
  data_description: data.data_description,
})

dataRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    DataService.getAllData(knexInstance)
      .then(data => {
        res.json(data.map(serializeData))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { data_name, data_description } = req.body
    const newData = { data_name, data_description }

    for (const [key, value] of Object.entries(newData))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    newData.bestiary_id = bestiary_id;

    DataService.insertData(
      req.app.get('db'),
      newData
    )
      .then(data => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${data.id}`))
          .json(serializeData(data))
      })
      .catch(next)
  })

dataRouter
  .route('/:data_id')
  .all((req, res, next) => {
    DataService.getById(
      req.app.get('db'),
      req.params.data_id
    )
      .then(data => {
        if (!data) {
          return res.status(404).json({
            error: { message: `Data doesn't exist` }
          })
        }
        res.data = data
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeData(res.data))
  })
  .delete((req, res, next) => {
    DataService.deleteData(
      req.app.get('db'),
      req.params.data_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { data_name, data_description } = req.body
    const dataToUpdate = { data_name, data_description }

    const numberOfValues = Object.values(dataToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'data_name' or 'data_description'`
        }
      })

    DataService.updateData(
      req.app.get('db'),
      req.params.data_id,
      dataToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = dataRouter