import { redisClient, DEFAULT_EXPIRATION } from "../redis/redis";

export const setUserInfo = async (key, value) => {
    await redisClient.set(`users:${key}`, value);
}

export const setStageInfo = async (key, value) => {
    await redisClient.set(`users:${key}`, value);
}

export const getUserInfo = async (key) => {
    return await redisClient.get(`users:${key}`);
}

export const getStageInfo = async (key) => {
    return await redisClient.get(`stages:${key}`);
}

export const setHighScore = async (highScore) => {
    await redisClient.set("highScore", highScore);
}

export const getHighScore = async () => {
    return await redisClient.get("highScore");
}