import express from "express";
import { createServer } from "http";
import { loadServerGameAssets } from "./init/assets.js";
import initSocket from "./init/socket.js";

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
    console.log(assets);
    console.log("Assets loaded successfully");
  } catch (err) {
    console.error("Failed to load game assets: ", err.message);
  }
});
