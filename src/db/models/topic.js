'use strict';
module.exports = (sequelize, DataTypes) => {
  var Topic = sequelize.define('Topic', {
    title: DataTypes.STRING,
    description: DataTypes.STRING
  }, {});
  Topic.associate = function(models) {
    // Banner association
    Topic.hasMany(models.Banner, {
      foreignKey: "topicId",
      as: "banners"
    });
    // Rule association
    Topic.hasMany(models.Rule, {
      foreignKey: "topicId",
      as: "rules"
    });
  };
  return Topic;
};
