import dotenv from "dotenv";

dotenv.config();

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;

  if (value == null) {
    throw new Error(`키 ${key}는 undefined`);
  }
  return value;
}

export const config = {
  kakao: {
    client_id: required("KAKAO_CLIENT"),
    client_secret: required("KAKAO_SECRET"),
  },
  jwt: {
    secretkey: required("JWT_SECRET"),
    expiresInSec: parseInt(required("JWT_EXPIRES_SEC")),
  },
  bcrypt: {
    saltRounds: parseInt(required("BCRYPT_SALT_ROUNDS")),
  },
  host: {
    port: parseInt(required("HOST_PORT")),
  },
  db: {
    host: required("DB_HOST"),
    port: required("DB_PORT"),
    database: required("DB_DATABASE"),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
  },
  openai: {
    api: required("OPENAI_API_KEY"),
  },
};
