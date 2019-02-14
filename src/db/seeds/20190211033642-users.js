'use strict';

const faker = require("faker");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync();

let users = [];

for(let i = 1 ; i <= 15 ; i++){
  let name = faker.name.findName();
  let uncryptedPassword = faker.internet.password(15, true);
  let hashedPassword = bcrypt.hashSync(uncryptedPassword, salt);

  users.push({
    email: faker.internet.email(name),
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}


module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert("Users", users, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete("Users", null, {});
  }
};
