const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const model = sequelize.define("Session", {
        id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
        userId: { type: DataTypes.INTEGER, allowNull: false },
    });
    model.associate = (sequelize) => {
        sequelize.models.User.hasMany(sequelize.models.Session);
        sequelize.models.Session.belongsTo(sequelize.models.User, { foreignKey: "userId" });
    };
    return model;
};
