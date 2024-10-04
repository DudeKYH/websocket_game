import express from "express";
import { createServer } from "http";
import { loadServerGameAssets } from "./init/assets.js";
import initSocket from "./init/socket.js";
import { redisClient } from "./redis/redis.js";

const app = express();
const server = createServer(app);

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
initSocket(server); // 소켓 추가

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // 이 곳에서 파일 읽음
  try {
    const assets = await loadServerGameAssets();
    console.log("Assets loaded successfully");

    const object = {
      loginCount: 0,
      highSCore: 25,
    };
    await redisClient.set('users:100', JSON.stringify(object));

    await redisClient.json.set("test:11", "$", {
      name: "DudeKYH",
      loginCount: "5",
      highScore: "15",
    })

  } catch (err) {
    console.error("Failed to load game assets: ", err.message);
  }
});
