const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const model = sequelize.define("Note", {
        name: { type: DataTypes.STRING, allowNull: false },
        text: { type: DataTypes.STRING, allowNull: false },
        userId: { type: DataTypes.INTEGER, allowNull: false },
    });
    model.associate = (sequelize) => {
        sequelize.models.User.hasMany(sequelize.models.Note);
        sequelize.models.Note.belongsTo(sequelize.models.User, { foreignKey: "userId" });
    };
    return model;
};
