import { CLIENT_VERSION } from "./Constant.js";
import { itemController, score } from "./index.js";

const socket = io("http://localhost:3000", {
  query: {
    clientVersion: CLIENT_VERSION,
  },
});

let userId = null;
socket.on("response", (data) => {
  console.log(data);

  // 서버로부터 다음 스테이지 정보가 recv
  // 스테이지 세팅
  try {
    if (data.status === "success" && data.stageId) {
      if (!score) {
        throw new Error("Packet not include stageId!");
      }
      // 서버 점수로 동기화시킬건지는 고민...

      score.setScoreInfo(data.stageId);
      itemController.setSelectableItemNumber(data.stageId);
    }
    if (data.status === "success" && data.score) {
      console.log(`Game End Complete! Score : ${data.score}`);
    }
  } catch (err) {
    console.error("Err : ", err.message);
  }
});

socket.on("connection", (data) => {
  console.log("connection: ", data);
  userId = data.uuid;
});

// src/handlers/handlerMapping.js 참고
// handlerId : 보낼 패킷에 대한 식별자(게임 시작/끝, 스테이지 이동)
// payload : handlerId의 전달할 추가 정보
const sendEvent = (handlerId, payload) => {
  socket.emit("event", {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

export { sendEvent };
