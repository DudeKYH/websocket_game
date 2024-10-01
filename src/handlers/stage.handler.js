import { getServerGameAssets } from "../init/assets.js";
import { getStage, setStage } from "../models/stage.model.js";

const items = [];

export const moveStageHandler = (userId, payload) => {
  // 유저는 스테이지를 하나씩 올라갈 수 있다. (1->2, 2->3, ...)
  // 유저는 일정 점수가 되면 다음 스테이지로 넘어간다.

  // 유저의 현재 스테이지 정보
  let currentStages = getStage(userId);

  console.log(currentStages);

  if (!currentStages.length) {
    return { status: "fail", message: "No stages found for user" };
  }

  // 오름차순 -> 가장 큰 스테이지 ID를 확인 <- 유저의 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  // 클라이언트 vs 서버 스테이지 비교
  if (payload.currentStage !== currentStage.id) {
    return { status: "fail", message: "Current Stage mismatch" };
  }

  // 점수 검증
  const serverTime = Date.now(); // 현재 타임스탬프를 구한다.
  const elapsedTime = (serverTime - currentStage.timestamp) / 1000;
  const originalElapsedTime =
    Math.abs(currentStage.goalStage, currentStage.score) /
    currentStage.scorePerSecond;

  console.log(`elapsedTime: ${elapsedTime}`);

  // 1스테이지 -> 2스테이지로 넘어가는 과정
  // 5 => 임의로 정한 레이턴시 오차범위
  // N 스테이지의 대한 처리는 과제로...
  if (
    elapsedTime < originalElapsedTime - 0.5 ||
    elapsedTime > originalElapsedTime + 0.5
  ) {
    return { status: "fail", message: "Invalid elapsed time" };
  }

  // tagetStage에 대한 검증 <- gameAssets에 존재하는가?
  const { stages } = getServerGameAssets();

  // currentStage에 대한 검증 <- gameAssets에 존재하는가?
  const currnetStage = stages.data.find(
    (stage) => stage.id === currentStage.id,
  );
  if (!currnetStage) {
    return { status: "fail", messgae: "Current Stage not found" };
  }

  // 현재 점수가 stage를 넘어가도 되는지를 서버 측에서 검증
  // 클라의 score
  const clientScore = Math.round(payload.score) - currnetStage.score;
  // 서버의 score
  const serverScore = Math.round(elapsedTime * currnetStage.scorePerSecond);

  // 클라이언트와 서버간의 Score 유효성 검사 (오차 : ±5)
  if (serverScore < clientScore - 5 || serverScore > clientScore + 5) {
    console.log(`clientScore: ${clientScore} / serverScore: ${serverScore}`);
    return { status: "fail", messgae: "Invalid game score" };
  }

  console.log("score interval : ", serverScore - clientScore);

  // targetStage에 대한 검증 <- gameAssets에 존재하는가?
  const nextStage = stages.data.find(
    (stage) => stage.id === payload.targetStage,
  );
  // 위에서 다음 스테이지가 존재하는지 검사했는데 또 해야하나????
  if (!nextStage) {
    return { status: "fail", message: "Target stage not found" };
  }

  // 다음 스테이지를 User의 stages에 추가해준다.
  setStage(userId, nextStage.id, serverTime);

  // 클라이언트에게 다음 스테이지에 대한 정보를 담아 응답해준다.
  // 필요 정보 : 다음 stageId, stageScore, stageScorePerSecond
  return {
    status: "success",
    message: `Stage Clear => Next Stage ID : ${nextStage.id}`,
    stageId: nextStage.id,
  };
};

// 아이템을 먹었을 때의 handler
export const getItemHandler = (userId, payload) => {
  // 유저의 현재 스테이지 정보
  let currentStages = getStage(userId);

  console.log(currentStages);

  if (!currentStages.length) {
    return { status: "fail", message: "No stages found for user" };
  }

  // currentStage에 대한 검증 <- gameAssets에 존재하는가?
  const { stages } = getServerGameAssets();

  const currnetStage = stages.data.find(
    (stage) => stage.id === currentStages.id,
  );
  if (!currnetStage) {
    return { status: "fail", messgae: "Current Stage not found" };
  }

  const { items } = getServerGameAssets();

  // 획득한 item에 대한 검증 <- gameAssets에 존재하는가?
  const item = items.data.find((item) => item.id === payload.itemId);

  if (!item) {
    return { status: "fail", messgae: `[${payload.itemId}] item not found` };
  }

  // currentStage에서 생성 가능한 item인지 검증
  if (currentStage.itemId) item;
};
