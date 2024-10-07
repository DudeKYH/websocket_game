import { v4 as uuidv4 } from "uuid";
import { addUser } from "../models/user.model.js";
import { handleConnection, handleDisconnect, handlerEvent } from "./helper.js";

const registerHandler = (io) => {
  io.on("connection", (socket) => {
    // 접속 시 이벤트
    let userUUID = null;

    // 접속한 유저가 이전의 uuid를 가지고 있는 경우,
    // 새로 uuid를 발급하지 않는다.

    if(!socket.handshake.auth.userId) {
      userUUID = uuidv4();
    }
    else {
      userUUID = socket.handshake.auth.userId;
    }
    addUser({ uuid: userUUID, socketId: socket.id });
    handleConnection(socket, userUUID);

    // 이벤트
    socket.on("event", (data) => handlerEvent(io, socket, data));

    // 접속 해제시 이벤트
    socket.on("disconnect", (socket) => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
