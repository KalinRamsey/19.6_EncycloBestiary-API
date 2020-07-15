const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Data Endpoints', function() {
  let db

  const {
    testUsers,
    testBestiaries,
    testData,
  } = helpers.makeBestiariesFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/data`, () => {
    beforeEach('insert bestiaries', () =>
      helpers.seedBestiariesTables(
        db,
        testUsers,
        testBestiaries,
        testData,
      )
    )

    it('creates a data point, responding with 201 and the new data', function() {
      const testBestiary = testBestiaries[0]
      const testUser = testUsers[0]
      const newData = {
        data_name: 'Test new data',
        data_description: 'Test new data description',
        bestiary_id: testBestiary.id,
        user_id: testUser.id
      }
      return supertest(app)
        .post('/api/data')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newData)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.data_name).to.eql(newData.data_name)
          expect(res.body.data_description).to.eql(newData.data_description)
          expect(res.body.user_id).to.eql(newData.user_id)
          expect(res.body.bestiary_id).to.eql(newData.bestiary_id)
          expect(res.headers.location).to.eql(`/api/data/${res.body.id}`)
        })
        .expect(res =>
          db
            .from('bestiary_data')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(res.body.data_name).to.eql(newData.data_name)
              expect(res.body.data_description).to.eql(newData.data_description)
              expect(res.body.user_id).to.eql(newData.user_id)
              expect(res.body.bestiary_id).to.eql(newData.bestiary_id)
            })
        )
    })

    const requiredFields = ['data_name', 'data_description', 'bestiary_id']

    requiredFields.forEach(field => {
      const testBestiary = testBestiaries[0]
      const testUser = testUsers[0]
      const newData = {
        data_name: 'Test new data',
        data_description: 'Test new data description',
        bestiary_id: testBestiary.id,
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () =>{
        delete newData[field]

        console.log(newData)

        return supertest(app)
          .post('/api/data')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newData)
          .expect(400, {
            error: `Missing '${field}' in request body`
          })
      })
    })
  })
})