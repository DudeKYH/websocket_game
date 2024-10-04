import * as Redis from "redis"

const redisClient = new Redis.createClient({
    url:"redis://default:S5VdCRk93IEBrltxKd1r04jqymke1bQR@redis-19263.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com:19263"
});

// 만료기간 : seconds 기준
const DEFAULT_EXPIRATION = 86400;

redisClient.connect();

redisClient.on("connect", () => {
    console.log("정상적으로 Redis 서버에 연결되었습니다.");
});

redisClient.on("error", (error) => {
    console.log("Redis 서버 연결에 실패하였습니다." + error);
});


export {redisClient, DEFAULT_EXPIRATION};
