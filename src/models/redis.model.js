import redisClient from "../init/redis.js";

export const setUserInfo = async (uuid) => {
  await redisClient.incr(`users:${uuid}`);
};

export const getUserInfo = async (uuid) => {
  return await redisClient.get(`users:${uuid}`);
};

export const addStageRecord = async (uuid, score, stageInfo) => {
  const date = new Date(stageInfo.timestamp);
  const stageRecordJson = {
    score: score,
    stageId: stageInfo.id,
    date: date,
  };

  await redisClient.RPUSH(`stages:${uuid}`, JSON.stringify(stageRecordJson));
};

export const getStageInfo = async (key) => {
  return await redisClient.get(`stages:${key}`);
};

export const addHighScoreRecord = async (uuid, highScore) => {
  await redisClient.ZADD("highScore", {
    score: highScore,
    value: uuid,
  });
};

export const getUserRank = async (uuid) => {
  const userRank = await redisClient.ZREVRANK("highScore", uuid);

  if (userRank === null) return null;

  const userScore = await redisClient.ZSCORE("highScore", uuid);

  return { rank: userRank + 1, score: userScore };
};

export const getHighScore = async () => {
  const currentHighScore = await redisClient.ZRANGE_WITHSCORES(
    "highScore",
    -1,
    -1,
  );

  if (currentHighScore.length === 0) {
    return 0;
  }
  return currentHighScore[0].score;
};
