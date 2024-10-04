import { CLIENT_VERSION, setHighScore } from "./Constant.js";
import { itemController, score } from "./index.js";


const getUserId = () => {
  const localUserId = localStorage.getItem("userId");

  if(!localUserId) {
    return null;
  }

  return localUserId;
}

const setUserId = (uuid) => {
  localStorage.setItem("userId", uuid);
}

let userId = getUserId();

const socket = io("http://localhost:3000", {
  query: {
    clientVersion: CLIENT_VERSION,
  },
  auth: {
    userId: userId,
  }
});




socket.on("response", (data) => {
  console.log(data);

  // 서버로부터 다음 스테이지 정보가 recv
  // 스테이지 세팅
  try {
    if (data.status === "success") {
      if (data.broadcast) {
        if (data.highScore) {
          console.log("Broadcast HighScore : ", data.highScore);
          // HIGH_SCORE 변수 변경
          setHighScore(data.highScore);
          if (score) {
            // 현재 score의 highScore 멤버 변수 변경
            score.setHighScore(data.highScore);
          }
        }
      } else {
        // 스테이지 이벤트 패킷
        if (data.stageId) {
          if (!score) {
            throw new Error("Packet not include stageId!");
          }
          // 서버 점수로 동기화시킬건지는 고민...

          // 이동할 스테이지 정보 세팅
          score.setScoreInfo(data.stageId);
          // 스테이지 이동 시, 생성 가능한 아이템 세팅
          itemController.setSelectableItemNumber(data.stageId);
        }
        // 게임 엔드 이벤트 패킷
        if (data.score) {
          console.log(`Game End Complete! Score : ${data.score}`);
        }
        // 게임 접속 시 최고 점수 패킷
        if (data.highScore) {
          console.log("Connection HighScore : ", data.highScore);
          // HIGH_SCORE 변수 변경
          setHighScore(data.highScore);
          if (score) {
            // 현재 score의 highScore 멤버 변수 변경
            score.setHighScore(data.highScore);
          }
        }
      }
    }
    // 실패일 경우
    else {
      console.log(data);
    }
  } catch (err) {
    console.error("Error : ", err.message);
  }
});

socket.on("connection", (data) => {
  console.log("connection: ", data);

  setUserId(data.uuid);
  userId = getUserId();
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
