import { v4 as uuidv4 } from "uuid";
import { addUser } from "../models/user.model.js";
import { handleConnection, handleDisconnect, handlerEvent } from "./helper.js";

const registerHandler = (io) => {
  io.on("connection", (socket) => {
    // 접속 시 이벤트
    const userUUID = uuidv4();
    addUser({ uuid: userUUID, socketId: socket.id });

    handleConnection(socket, userUUID);

    // 이벤트
    socket.on("event", (data) => handlerEvent(io, socket, data));

    // 접속 해제시 이벤트
    socket.on("disconnect", (socket) => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
