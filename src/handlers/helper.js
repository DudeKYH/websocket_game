import { CLIENT_VERSION, HIGH_SCORE } from "../constant.js";
import { createStage } from "../models/stage.model.js";
import { getUsers, removeUser } from "../models/user.model.js";
import handlerMappings from "./handlerMapping.js";

export const handleDisconnect = (socket, uuid) => {
  console.log(`info : ${socket}`);

  removeUser(uuid);

  console.log(`User disconnected: ${uuid} with socket ID ${socket.id} `);
  console.log("Current users: ", getUsers());
};

export const handleConnection = (socket, uuid) => {
  console.log(`New User Connected : ${uuid} with socket ID ${socket.id} `);
  console.log("Current Users: ", getUsers());

  createStage(uuid);

  socket.emit("connection", { uuid });
  // 연결한 클라이언트에게 최고 점수를 알려준다.
  socket.emit("response", { status: "success", highScore: HIGH_SCORE });
};

export const handlerEvent = (io, socket, data) => {
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit("response", {
      status: "fail",
      message: "Client version mismatch",
    });
    return;
  }

  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit("response", { status: "fail", message: "Handler not found" });
    return;
  }

  const response = handler(data.userId, data.payload);

  // 최고 점수가 갱신될 경우, 접속중인 모든 유저에게 알려준다.
  // io.emit() : 모든 클라이언트에게 전달한다.
  if (response.broadcast) {
    io.emit("response", response);
    return;
  }

  socket.emit("response", response);
};
