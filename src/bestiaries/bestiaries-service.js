const xss = require('xss')

const BestiaryService = {
  getAllBestiaries(db) {
    return db
      .select('*')
      .from('bestiaries')
  },
  getBestiaryById(db, id) {
    return db.from('bestiaries').select('*').where('id', id).first()
  },
  insertBestiary(db, newBestiary){
    return db
      .insert(newBestiary)
      .into('bestiaries')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  patchBestiary(db, id, newBestiaryFields) {
    return db('bestiaries')
      .where({ id })
      .update(newBestiaryFields)
  },
  deleteBestiary(db, id) {
    return db('bestiaries')
      .where({ id })
      .delete();
  },
  serializeBestiary(bestiary) {
    return {
      id: bestiary.id,
      user_id: bestiary.user_id,
      bestiary_name: xss(bestiary.bestiary_name),
      bestiary_description: xss(bestiary.bestiary_description)
    }
  }
};

module.exports = BestiaryService;