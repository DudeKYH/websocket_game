import { getGameAssets } from "../init/assets.js";
import { getStage, setStage } from "../models/stage.model.js";

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

  // 1스테이지 -> 2스테이지로 넘어가는 과정
  // 5 => 임의로 정한 레이턴시 오차범위
  // N 스테이지의 대한 처리는 과제로...
  if (elapsedTime < 10 || elapsedTime > 10.5) {
    return { status: "fail", message: "Invalid elapsed time" };
  }

  // tagetStage에 대한 검증 <- gameAssets에 존재하는가?
  const { stages } = getGameAssets();
  // some 내장 함수 : callbackFunc이 하나라도 일치할 시 true 반환
  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    return { status: "fail", message: "Target stage not found" };
  }

  // 현재 점수가 stage를 넘어가도 되는지를 검증 => 과제로 남겨놓았다...

  // 모든 검증이 통과되었다면 다음 스테이지로 넘어가자!
  setStage(userId, payload.targetStage, serverTime);

  return { status: "success" };
};
