import { Sequelize } from 'sequelize'
import 'dotenv/config'

// Prefer a full URL if provided; otherwise construct from discrete vars (Railway style)
const url = process.env.DB_URL || process.env.MYSQL_URL || process.env.DATABASE_URL

const shouldUseSsl = [process.env.DB_SSL, process.env.MYSQL_SSL, process.env.DATABASE_SSL]
  .some((v) => String(v).toLowerCase() === 'true')

const commonOptions = {
  dialect: 'mysql',
  logging: false,
  dialectOptions: shouldUseSsl
    ? {
        ssl: {
          require: true,
          // Many managed MySQL providers (e.g. PlanetScale) need this relaxed setting
          rejectUnauthorized: false,
        },
      }
    : undefined,
}

let sequelize

if (url) {
  sequelize = new Sequelize(url, commonOptions)
} else {
  const host = process.env.MYSQLHOST || process.env.DB_HOST
  const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306)
  const database = process.env.MYSQLDATABASE || process.env.DB_NAME
  const username = process.env.MYSQLUSER || process.env.DB_USER
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD

  sequelize = new Sequelize(database, username, password, {
    host,
    port,
    ...commonOptions,
  })
}

export default sequelize