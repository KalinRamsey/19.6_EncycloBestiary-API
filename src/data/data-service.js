const BestiaryDataService = {
  getAllData(knex) {
    return knex.select('*').from('bestiary_data')
  },

  insertData(knex, newData) {
    return knex
      .insert(newData)
      .into('bestiary_data')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },

  getById(knex, id) {
    return knex
      .from('bestiary_data')
      .select('*')
      .where('id', id)
      .first()
  },

  deleteData(knex, id) {
    return knex('bestiary_data')
      .where({ id })
      .delete()
  },

  updateData(knex, id, newDataFields) {
    return knex('bestiary_data')
      .where({ id })
      .update(newDataFields)
  },
}

module.exports = BestiaryDataService