import dotenv from "dotenv";
import * as Redis from "redis";

dotenv.config();

const redisClient = new Redis.createClient({
  url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URL}:${process.env.REDIS_PORT}`,
});

await redisClient.connect();

redisClient.on("connect", () => {
  console.log("정상적으로 Redis 서버에 연결되었습니다.");
});

redisClient.on("error", (error) => {
  console.log("Redis 서버 연결에 실패하였습니다." + error);
});

export default redisClient;
