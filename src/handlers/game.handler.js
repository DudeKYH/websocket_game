import { getServerGameAssets } from "../init/assets.js";
import {
  clearStage,
  getStage,
  getStageScore,
  setStage,
} from "../models/stage.model.js";

/** 게임 시작에 대한 핸들러**/
export const gameStart = (uuid, payload) => {
  const { stages } = getServerGameAssets();

  // 유저의 스테이지 정보를 비워준다.
  clearStage(uuid);

  // stage 배열에서 0번째 -> 1 스테이지
  // 원래라면 클라의 시간을 저장하는 서버는 절대 없다! (클라를 신용할 수 없으므로)

  // 게임 시작 시, 해당 유저의 스테이지 테이블에 다음과 같은 정보를 저장한다.
  // - stageId : 스테이지 ID => 여기서는 (1001) 고정
  // - timestamp : 게임 시작한 클라이언트의 시간
  // - score : 게임 시작시, 서버에서 관리할 점수 (클라이언트와의 레이턴시로 약간의 오차가 있을 수 있다.)
  // - items : 스테이지간의 획득한 아이템 리스트 (setStgae 함수 내부에서 자동으로 초기화 해준뒤 세팅해준다)
  setStage(uuid, stages.data[0].id, payload.timestamp, 0);

  console.log("Stage: ", getStage(uuid));

  // 클라이언트에게 서버도 게임 시작을 인지했음을 알려준다.
  return {
    status: "success",
    message: "game Start Complete",
    stageId: stages.data[0].id,
  };
};

/** 게임 종료에 대한 핸들러**/
export const gameEnd = (uuid, payload) => {
  // 클라이언트는 게임 종료 시 score, timestamp를 payload에 담아 보내준다.
  const { timestamp: gameEndTime, score: clientScore } = payload;

  const userStages = getStage(uuid);
  if (!userStages.length) {
    return { status: "fail", message: "No stages found for user" };
  }

  // 각 스테이지의 지속 시간, 을 계산하여 총 점수 계산
  let totalScore = 0;

  const { stages } = getServerGameAssets();

  for (let i = 0; i < userStages.length; i++) {
    let stageEndTime;
    if (i === userStages.length - 1) {
      stageEndTime = gameEndTime;
    } else {
      stageEndTime = userStages[i + 1].timestamp;
    }

    const userStage = userStages[i];

    // stage의 scorePerSecond를 알아야 score를 계산할 수 있기 때문에 stageInfo를 gameAssets에서 찾는다.
    const stageInfo = stages.data.find((stage) => stage.id === userStage.id);
    if (!stageInfo) {
      return { status: "fail", messgae: `${userStage.id} Stage not found` };
    }

    const stageDuration = (stageEndTime - userStage.timestamp) / 1000;
    // 각 스테이지의 점수를 구한다.
    const stageScore = getStageScore(
      userStage,
      stageDuration,
      stageInfo.scorePerSecond,
    );

    // 총 점수에 각 스테이지 점수를 더해준다.
    totalScore += stageScore;
  }

  // 클라이언트와 서버의 총 점수 차이 출력 (디버깅을 위해)
  const totalScoreDifference = Math.abs(totalScore - clientScore);
  console.log(
    `Total Stage Server<->Client Score Difference : ${totalScoreDifference}`,
  );

  // 점수와 타임스탬프 검증
  // 오차범위 5
  if (totalScoreDifference > 5) {
    return { status: "fail", mesaage: "Score verification failed" };
  }

  // DB 저장한다고 가정을 한다면
  // setRsult (userId, score, timestamp) 와 같이 게임 로그를 남길 수도 있다.

  return { status: "success", message: "Game ended", score: clientScore };
};
