import { CLIENT_VERSION } from "../constant.js";
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
    socket.emit("response", { status: "fail", messgae: "Handler not found" });
    return;
  }

  const response = handler(data.userId, data.payload);

  if (response.broadcast) {
    io.emit("response", "broadcast");
    return;
  }

  socket.emit("response", response);
};
