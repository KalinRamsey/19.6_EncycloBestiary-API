const express = require('express');
const path = require('path');

const DataService = require('./data-service');
const { requireAuth } = require('../middleware/jwt-auth');

const dataRouter = express.Router();
const jsonParser = express.json();

dataRouter
  .route('/')
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

    for (const [key, value] of Object.entries(newData))
      if (value == null){
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
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
  });

dataRouter
  .route('/:dataId')
  .all(checkDataExists)
  .get((req, res) => {
    res.json(DataService.serializeData(res.data));
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { user_id, bestiary_id, data_name, data_description } = req.body;
    const dataPatch = { user_id, bestiary_id, data_name, data_description };

    const numberOfValues = Object.values(dataPatch);
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: `Request body must contain either 'data_name' or 'data_description'`
      });
    }

    DataService.patchData(
      req.app.get('db'),
      req.params.dataId,
      dataPatch
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .delete(requireAuth, (req, res, next) => {
    DataService.deleteData(
      req.app.get('db'),
      req.params.dataId
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })

async function checkDataExists(req, res, next) {
  try {
    const data = await DataService.getDataById(
      req.app.get('db'),
      req.params.dataId
    );

    if (!data){
      return res
        .status(404)
        .json({
          error: `Data doesn't exist`
        });
    }

    res.data = data;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = dataRouter;