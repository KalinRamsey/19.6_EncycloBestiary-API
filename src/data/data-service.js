const xss = require('xss')

const DataService = {
  getAllData(db) {
    return db
      .from('bestiary_data')
      .select('*')
  },
  getAllDataInBestiary(db, bestiary_id){
    return db
      .from('bestiary_data')
      .select('*')
      .where({bestiary_id})
  },
  getDataById(db, id){
    return DataService.getAllData(db)
      .where({id})
      .first()
  },
  insertData(db, newData){
    return db
      .insert(newData)
      .into('bestiary_data')
      .returning('*')
      .then(([data]) => data)
      .then(data =>
        DataService.getDataById(db, data.id)
      )
  },
  patchData(db, id, newDataFields){
    return db('bestiary_data')
      .where({ id })
      .update(newDataFields)
  },
  deleteData(db, id){
    return db('bestiary_data')
      .where({ id })
      .delete()
  },
  serializeData(data) {
    return {
      id: data.id,
      bestiary_id: data.bestiary_id,
      user_id: data.user_id,
      data_name: xss(data.data_name),
      data_description: xss(data.data_description)
    }
  }
}

module.exports = DataService