const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Bestiaries Endpoints', function() {
  let db;

  const {
    testUsers,
    testBestiaries,
    testData,
  } = helpers.makeBestiariesFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe(`GET /api/bestiaries`, () => {
    context(`Given no bestiaries`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/bestiaries')
          .expect(200, []);
      });
    });

    context('Given there are bestiaries in the database', () => {
      beforeEach('insert bestiaries', () =>
        helpers.seedBestiariesTables(
          db,
          testUsers,
          testBestiaries,
          testData,
        )
      );

      it('responds with 200 and all of the bestiaries', () => {
        const expectedBestiaries = testBestiaries.map(bestiary =>
          helpers.makeExpectedBestiary(
            testUsers,
            bestiary,
            testData,
          )
        );
        return supertest(app)
          .get('/api/bestiaries')
          .expect(200, expectedBestiaries);
      });
    });

    context(`Given an XSS attack bestiary`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousBestiary,
        expectedBestiary,
      } = helpers.makeMaliciousBestiary(testUser);

      beforeEach('insert malicious bestiary', () => {
        return helpers.seedMaliciousBestiary(
          db,
          testUser,
          maliciousBestiary,
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/bestiaries`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedBestiary.title)
            expect(res.body[0].content).to.eql(expectedBestiary.content)
          });
      });
    });
  });

  describe(`GET /api/bestiaries/:bestiary_id`, () => {
    context(`Given no bestiaries`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      );

      it(`responds with 404`, () => {
        const bestiaryId = 123456;
        return supertest(app)
          .get(`/api/bestiaries/${bestiaryId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Bestiary doesn't exist` });
      });
    });

    context('Given there are bestiaries in the database', () => {
      beforeEach('insert bestiaries', () =>
        helpers.seedBestiariesTables(
          db,
          testUsers,
          testBestiaries,
          testData,
        )
      );

      it('responds with 200 and the specified bestiary', () => {
        const bestiaryId = 2;
        const expectedBestiary = helpers.makeExpectedBestiary(
          testUsers,
          testBestiaries[bestiaryId - 1],
          testData,
        );

        return supertest(app)
          .get(`/api/bestiaries/${bestiaryId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedBestiary);
      });
    });

    context(`Given an XSS attack bestiary`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousBestiary,
        expectedBestiary,
      } = helpers.makeMaliciousBestiary(testUser);

      beforeEach('insert malicious bestiary', () => {
        return helpers.seedMaliciousBestiary(
          db,
          testUser,
          maliciousBestiary,
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/bestiaries/${maliciousBestiary.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedBestiary.title)
            expect(res.body.content).to.eql(expectedBestiary.content)
          });
      });
    });
  });

  describe(`GET /api/bestiaries/:bestiary_id/data`, () => {
    context(`Given no bestiaries`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      );

      it(`responds with 404`, () => {
        const bestiaryId = 123456;
        return supertest(app)
          .get(`/api/bestiaries/${bestiaryId}/data`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Bestiary doesn't exist` });
      });
    });

    context('Given there are data for bestiary in the database', () => {
      beforeEach('insert bestiaries', () =>
        helpers.seedBestiariesTables(
          db,
          testUsers,
          testBestiaries,
          testData,
        )
      );

      it('responds with 200 and the specified data', () => {
        const bestiaryId = 1;
        const expectedData = helpers.makeExpectedBestiaryData(
          testUsers, bestiaryId, testData
        );

        return supertest(app)
          .get(`/api/bestiaries/${bestiaryId}/data`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedData);
      });
    });
  });
});