require("dotenv").config();
const { createClient } = require("redis");

const redisClient = createClient({
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

const connectRedis = async () => {
  redisClient.on("error", (err) => console.error(`Redis Client Error: ${err}`));
  await redisClient.connect();
};

module.exports = { redisClient, connectRedis };
