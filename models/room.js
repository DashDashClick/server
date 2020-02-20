'use strict';
module.exports = (sequelize, DataTypes) => {
  class Room extends sequelize.Sequelize.Model {
    static associate(models) {
      // associations can be defined here
    }
  }

  Room.init({
    name: DataTypes.STRING
  }, { sequelize });
  return Room;
};