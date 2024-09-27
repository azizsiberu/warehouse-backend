// path: models/Finishing.js
module.exports = (sequelize, DataTypes) => {
  const Finishing = sequelize.define(
    "Finishing",
    {
      id_finishing: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_finishing",
      },
      name: {
        type: DataTypes.STRING,
        field: "finishing",
      },
    },
    {
      tableName: "finishing",
      timestamps: false,
    }
  );
  return Finishing;
};
