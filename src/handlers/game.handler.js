import { getServerGameAssets } from "../init/assets.js";
import { initItemList } from "../init/item.js";
import { clearStage, getStage, setStage } from "../models/stage.model.js";

export const gameStart = (uuid, payload) => {
  const { stages } = getServerGameAssets();

  clearStage(uuid);
  // stage 배열에서 0번째 -> 1 스테이지
  // 원래라면 클라의 시간을 저장하는 서버는 절대 없다! (클라를 신용할 수 없으므로)

  const { itemUnlocks } = getServerGameAssets();
  const itemUnlock = itemUnlocks.data.find(
    (itemUnlock) => itemUnlock.stage_id === stages.data[0].id,
  );
  const items = initItemList(itemUnlock.item_id);

  setStage(uuid, stages.data[0].id, payload.timestamp, items);

  console.log("Stage: ", getStage(uuid));
  return {
    status: "success",
    message: "game Start Complete",
    stageId: stages.data[0].id,
  };
};

export const gameEnd = () => {
  // 클라이언트는 게임 종료 시 타임스탬프와 총 점수
  const { tiemstamp: gameEndTime, score } = payload;
  const stages = getStage(uuid);

  if (!stages.length) {
    return { status: "fail", message: "No stages found for user" };
  }

  // 각 스테이지의 지속 시간을 계산하여 총 점수 계산
  // 추후에 아이템, 초당 점수까지 합쳐서 점수 계산하도록 변경해야 한다!
  // 추후에 아이템, 초당 점수까지 합쳐서 점수 계산하도록 변경해야 한다!
  // 추후에 아이템, 초당 점수까지 합쳐서 점수 계산하도록 변경해야 한다!
  // 추후에 아이템, 초당 점수까지 합쳐서 점수 계산하도록 변경해야 한다!
  let totalScore = 0;

  stages.forEach((stage, index) => {
    let stageEndTime;
    if (index === stages.length - 1) {
      stageEndTime = gameEndTime;
    } else {
      stageEndTime = stages[index + 1].timestamp;
    }

    const stageDuration = (stageEndTime - stage.timestamp) / 1000;
    totalScore += stageDuration; // 1초당 1점
  });

  // 점수와 타임스탬프 검증
  // 오차범위 5
  if (Math.abs(score - totalScore) > 5) {
    return { status: "fail", mesaage: "Score verification failed" };
  }

  // DB 저장한다고 가정을 한다면
  // setRsult (userId, score, timestamp) 와 같이 게임 로그를 남길 수도 있다.

  return { status: success, message: "Game ended", score };
};
