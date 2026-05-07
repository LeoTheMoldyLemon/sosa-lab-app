const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

module.exports = async () => {
    const sequelize = new Sequelize({
        dialect: "sqlite",
        define: { timestamps: false },
        storage: ":memory:",
        logging: true,
    });
    const models = [];
    for (const modelFile of fs.readdirSync(path.join(__dirname, "model"))) {
        const modelCreate = require("./" + path.join("model", modelFile));
        const model = modelCreate(sequelize);
        await model.sync();
        models.push(model);
    }
    await sequelize.sync();
    for (const model of models) {
        if (model.associate) model.associate(sequelize);
        await model.sync();
    }
    await sequelize.sync();
    return sequelize;
};
