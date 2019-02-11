'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "Posts",
      "userId",
      {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        allowNull: false,
        references: {
          model: "Users", //model means table name here
          key: "id",
          as: "userId"
        }
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Posts", "userId");
  }
};
