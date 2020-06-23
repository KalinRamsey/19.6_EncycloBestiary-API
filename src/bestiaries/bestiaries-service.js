const BestiaryService = {
  getAllBestiaries(knex) {
    return knex.select('*').from('bestiaries');
  },
  insertBestiary(knex, newBestiary){
    return knex
      .insert(newBestiary)
      .into('bestiaries')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex.from('bestiaries').select('*').where('id', id).first()
  },
  deleteBestiary(knex, id) {
    return knex('bestiaries')
      .where({ id })
      .delete();
  },
  updateBestiary(knex, id, newBestiaryFields) {
    return knex('bestiaries')
      .where({ id })
      .update(newBestiaryFields)
  }
};

module.exports = BestiaryService;