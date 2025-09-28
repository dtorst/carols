import { Sequelize } from 'sequelize'
import 'dotenv/config'

// Prefer a full URL if provided; otherwise construct from discrete vars (Railway style)
const url = process.env.DB_URL || process.env.MYSQL_URL || process.env.DATABASE_URL

const shouldUseSsl = [process.env.DB_SSL, process.env.MYSQL_SSL, process.env.DATABASE_SSL]
  .some((v) => String(v).toLowerCase() === 'true')
const sslCa = process.env.MYSQL_SSL_CA || process.env.DB_SSL_CA || process.env.DATABASE_SSL_CA

const commonOptions = {
  dialect: 'mysql',
  logging: false,
  dialectOptions: shouldUseSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
          ...(sslCa ? { ca: sslCa } : {}),
        },
      }
    : undefined,
}

let sequelize

if (url) {
  if (process.env.DEBUG_DB_CONFIG === 'true') {
    try {
      const u = new URL(url)
      // mysql://user:pass@host:port/dbname
      // Avoid logging credentials
      console.log(
        `DB: connecting via URL host=${u.hostname} port=${u.port || '3306'} db=${u.pathname?.slice(1) || ''} ssl=${shouldUseSsl}`
      )
    } catch {}
  }
  sequelize = new Sequelize(url, commonOptions)
} else {
  const host = process.env.MYSQLHOST || process.env.DB_HOST
  const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306)
  const database = process.env.MYSQLDATABASE || process.env.DB_NAME
  const username = process.env.MYSQLUSER || process.env.DB_USER
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD

  if (!host || !database || !username) {
    console.error(
      'DB: missing required env vars. Provide DB_URL/MYSQL_URL/DATABASE_URL or MYSQLHOST, MYSQLDATABASE, MYSQLUSER (and MYSQLPASSWORD).'
    )
    console.error({
      have: {
        MYSQLHOST: !!process.env.MYSQLHOST,
        MYSQLDATABASE: !!process.env.MYSQLDATABASE,
        MYSQLUSER: !!process.env.MYSQLUSER,
        MYSQLPASSWORD: process.env.MYSQLPASSWORD ? true : false,
      },
    })
    throw new Error('Database configuration incomplete')
  }

  if (process.env.DEBUG_DB_CONFIG === 'true') {
    console.log(
      `DB: connecting via vars host=${host} port=${port} db=${database} ssl=${shouldUseSsl}`
    )
  }

  sequelize = new Sequelize(database, username, password, {
    host,
    port,
    ...commonOptions,
  })
}

export default sequelize