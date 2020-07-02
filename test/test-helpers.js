const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      email: 'test_user1@test.com',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      username: 'test-user-2',
      email: 'Test_user2@test.com',
      password: 'Password123!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      username: 'test-user-3',
      email: 'Test_user3@test.com',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      username: 'test-user-4',
      email: 'Test_user4@test.com',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeBestiariesArray(users) {
  return [
    {
      id: 1,
      bestiary_name: 'First test post!',
      user_id: users[0].id,
      bestiary_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 2,
      bestiary_name: 'Second test post!',
      user_id: users[1].id,
      bestiary_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 3,
      bestiary_name: 'Third test post!',
      user_id: users[2].id,
      bestiary_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 4,
      bestiary_name: 'Fourth test post!',
      user_id: users[3].id,
      bestiary_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
  ]
}

function makeDataArray(users, bestiaries) {
  return [
    {
      id: 1,
      data_name: 'First test comment!',
      bestiary_id: bestiaries[0].id,
      user_id: users[0].id,
      data_description:'Lorem ipsum dolor sit amet',
    },
    {
      id: 2,
      data_name: 'Second test comment!',
      bestiary_id: bestiaries[0].id,
      user_id: users[1].id,
      data_description:'Lorem ipsum dolor sit amet',
    },
    {
      id: 3,
      data_name: 'Third test comment!',
      bestiary_id: bestiaries[0].id,
      user_id: users[2].id,
      data_description:'Lorem ipsum dolor sit amet',
    },
    {
      id: 4,
      data_name: 'Fourth test comment!',
      bestiary_id: bestiaries[0].id,
      user_id: users[3].id,
      data_description:'Lorem ipsum dolor sit amet',
    },
    {
      id: 5,
      data_name: 'Fifth test comment!',
      bestiary_id: bestiaries[bestiaries.length - 1].id,
      user_id: users[0].id,
      data_description:'Lorem ipsum dolor sit amet',
    },
    {
      id: 6,
      data_name: 'Sixth test comment!',
      bestiary_id: bestiaries[bestiaries.length - 1].id,
      user_id: users[2].id,
      data_description:'Lorem ipsum dolor sit amet',
    },
    {
      id: 7,
      data_name: 'Seventh test comment!',
      bestiary_id: bestiaries[3].id,
      user_id: users[0].id,
      data_description:'Lorem ipsum dolor sit amet',
    },
  ];
}

function makeExpectedBestiary(users, bestiary, data=[]) {
  const user = users
    .find(user => user.id === bestiary.user_id)

  const number_of_data = data
    .filter(d => d.bestiary_id === bestiary.id)
    .length

  return {
    id: bestiary.id,
    user_id: bestiary.user_id,
    bestiary_name: bestiary.bestiary_name,
    bestiary_description: bestiary.bestiary_description,
    number_of_data,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      date_created: user.date_created.toISOString(),
      date_modified: user.date_modified || null,
    },
  }
}

function makeExpectedBestiaryData(users, dataId, data) {
  const expectedData = data
    .filter(d => d.bestiary_id === dataId)

  return expectedData.map(data => {
    const dataUser = users.find(user => user.id === data.user_id)
    return {
      id: data.id,
      data_name: data.data_name,
      user: {
        id: dataUser.id,
        username: dataUser.username,
        email: dataUser.email,
        date_created: dataUser.date_created.toISOString(),
        date_modified: dataUser.date_modified || null,
      }
    }
  })
}

function makeMaliciousBestiary(user) {
  const maliciousBestiary = {
    id: 911,
    bestiary_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    user_id: user.id,
    bestiary_description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  const expectedBestiary = {
    ...makeExpectedBestiary([user], maliciousBestiary),
    bestiary_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    bestiary_description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousBestiary,
    expectedBestiary,
  }
}

function makeBestiariesFixtures() {
  const testUsers = makeUsersArray()
  const testBestiaries = makeBestiariesArray(testUsers)
  const testData = makeDataArray(testUsers, testBestiaries)
  return { testUsers, testBestiaries, testData }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        users,
        bestiaries,
        bestiary_data
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE bestiaries_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE bestiary_data_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('bestiaries_id_seq', 0)`),
        trx.raw(`SELECT setval('users_id_seq', 0)`),
        trx.raw(`SELECT setval('bestiary_data_id_seq', 0)`),
      ])
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))

  return db.into('users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedBestiariesTables(db, users, bestiaries, data=[]) {
  // use a transaction to group the queries  auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('bestiaries').insert(bestiaries)
    // update the auto nce to match the rced id values
    await trx.raw(
      `SELECT setval('bestiaries_id_seq', ?)`,
      [bestiaries[bestiaries.length - 1].id],
    )
  // only  insert comments if there are some, also update the sequence counter
    if (data.length) {
      await trx.into('bestiary_data').insert(data)
      await trx.raw(
        `SELECT setval('bestiary_data_id_seq', ?)`,
        [data[data.length - 1].id],
      )
    }
  })
}

function seedMaliciousBestiary(db, user, bestiary) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('bestiaries')
        .insert([bestiary])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id} , secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeBestiariesArray,
  makeExpectedBestiary,
  makeExpectedBestiaryData,
  makeMaliciousBestiary,
  makeDataArray,

  makeBestiariesFixtures,
  cleanTables,
  seedBestiariesTables,
  seedMaliciousBestiary,
  makeAuthHeader,
  seedUsers,
}
