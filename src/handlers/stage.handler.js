import { getServerGameAssets } from "../init/assets.js";
import { getStage, getStageScore, setStage } from "../models/stage.model.js";

const items = [];

/** 스테이지 이동에 대한 핸들러 **/
export const moveStageHandler = (userId, payload) => {
  // 유저는 스테이지를 하나씩 올라갈 수 있다. (1->2, 2->3, ...)
  // 유저는 일정 점수가 되면 다음 스테이지로 넘어간다.

  // 클라이언트가 보낸 Payload
  // - currentStage : 현재 스테이지 ID
  // - targetStage : 다음 스테이지 ID
  // - score : 현재 클라이언트의 점수

  // 유저의 현재 스테이지 정보를 가져온다.
  let currentStages = getStage(userId);

  if (!currentStages.length) {
    return { status: "fail", message: "No stages found for user" };
  }

  // 오름차순 정렬 -> 유저의 현재 스테이지는  가장 큰 스테이지 ID일 것이다.
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  // 클라이언트 vs 서버 스테이지 ID 비교
  if (payload.currentStage !== currentStage.id) {
    return { status: "fail", message: "Current Stage mismatch" };
  }

  // // 클라이언트의 Score가 현재 Score보다 낮다면 에러 처리
  // if(payload.score < currentStage.id) {
  //   return { status: "fail", message: "" };
  // }

  const { stages } = getServerGameAssets();

  // currentStage에 대한 검증 <- gameAssets의 stage에 존재하는가?
  const currentStageInfo = stages.data.find(
    (stage) => stage.id === currentStage.id,
  );
  if (!currentStageInfo) {
    return { status: "fail", messgae: "Current Stage not found" };
  }

  // 클라이언트 vs 서버 스테이지 Score 검증

  // 먼저 해당 스테이지의 클라이언트 Score를 구한다 (클라이언트 Score - 현재 스테이지를 시작할 때 서버 Score)
  // 이렇게 한 이유
  // - 예를 들어, 스테이지 1->2로 넘어갈 Score의 조건이 50일 경우,
  //    만약 클라이언트가 45점에서 아이템을 먹어 55점이 될 경우,
  //    다음 스테이지의 시작 점수는 55점이므로, assets의 stage.score 데이터가 아닌 서버가 저장한 스테이지 시작 점수로 계산했다.
  const clientScore = payload.score - currentStage.startScore;

  // 다음 서버에서 계산한 해당 스테이지의 Score를 구한다.
  const serverNowTime = Date.now(); // 현재 타임스탬프를 구한다.
  const serverDuration = (serverNowTime - currentStage.timestamp) / 1000;
  const serverScore = getStageScore(
    currentStage,
    serverDuration,
    currentStageInfo.scorePerSecond,
  );

  const scoreDifference = Math.abs(serverScore - clientScore);

  // 클라이언트와 서버간의 Score 유효성 검사 (Score 오차 범위: ±5)
  // - 클라와 서버간의 레이턴시로 완벽하게 Score가 일치할 수 없으므로 일정 범위의 오차를 두어 검사한다.
  if (scoreDifference > 5) {
    return { status: "fail", messgae: "Invalid game score" };
  }

  // Score에 대한 검사를 모두 통과했으면, 다음 스테이지로 이동하자.

  // targetStage에 대한 검증 <- gameAssets의 stage에 존재하는가?
  const targetStageInfo = stages.data.find(
    (stage) => stage.id === payload.targetStage,
  );
  if (!targetStageInfo) {
    return { status: "fail", message: `Target stage not found` };
  }

  // 무조건 targetStage와 currentStgae의 ID 차이는 1이어야 한다
  if (targetStageInfo.id - currentStageInfo.id !== 1) {
    console.log(
      "Target<->Current stage difference : ",
      targetStageInfo.id - currentStageInfo.id,
    );
    return { status: "fail", message: "Invalid Target stage" };
  }

  // 다음 스테이지 정보를 서버에서 관리 중인 유저의 stages에 추가해준다.
  setStage(userId, targetStageInfo.id, serverNowTime, payload.score);

  // 클라이언트에게 다음 스테이지 ID를 알려준다.
  return {
    status: "success",
    message: `Stage Clear => Next Stage ID : ${targetStageInfo.id}`,
    stageId: targetStageInfo.id,
  };
};

/** 아이템 획득에 대한 핸들러 **/
export const getItemHandler = (userId, payload) => {
  // 유저의 현재 스테이지 정보를 가져온다
  let currentStages = getStage(userId);

  if (!currentStages.length) {
    return { status: "fail", message: "No stages found for user" };
  }

  // 오름차순 -> 가장 큰 스테이지 ID를 확인 <- 유저의 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  const { stages, items, itemUnlocks } = getServerGameAssets();

  // currentStage에서에 대한 검증 <- gameAssets의 stages에 존재하는가?
  const currnetStageInfo = stages.data.find(
    (stage) => stage.id === currentStage.id,
  );
  if (!currnetStageInfo) {
    return {
      status: "fail",
      messgae: `[${currentStage.id}] Current Stage not found`,
    };
  }

  // 획득한 item에 대한 검증 <- gameAssets의 items에 존재하는가?
  const itemInfo = items.data.find((item) => item.id === payload.itemId);
  if (!itemInfo) {
    return { status: "fail", messgae: `[${payload.itemId}] item not found` };
  }

  // currentStage에서 생성 가능한 item인지 검증 <- gameAssets의 itemUnlocks에 존재하는가?
  const itemUnlockInfo = itemUnlocks.data.find(
    (itemUnlock) => itemUnlock.stage_id === currentStage.id,
  );
  if (payload.itemId > itemUnlockInfo.item_id) {
    return {
      status: "fail",
      message: `[${payload.itemId}] item can't exist currentStage`,
    };
  }

  // 이제 아이템을 먹었다는 정보를 stage의 itemList에 저장해두자.
  const item = currentStage.getItems.find(
    (item) => item.itemId === payload.itemId,
  );
  item.count += 1;

  return {
    status: "success",
    message: `[${payload.itemId}] item get`,
  };
};
