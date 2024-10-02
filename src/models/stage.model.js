// 스테이지에 따라서 더 높은 점수 획득
// 1 스테이지, 0점 -> 1점씩
// 2 스테이지, 1000점 -> 2점씩

import { getServerGameAssets } from "../init/assets.js";
import { initItemList } from "../init/item.js";

// key : uuid, value : array -> stage 정보는 복수이기떄문에 배열
const stages = {};

// 스테이지 초기화
export const createStage = (uuid) => {
  stages[uuid] = [];
};

export const getStage = (uuid) => {
  return stages[uuid];
};

export const setStage = (uuid, id, timestamp, startScore) => {
  // getItems : 스테이지 간 획득 가능한 아이템 리스트
  const getItems = initItemList(id);

  // stage[uuid] 에 스테이지 정보를 추가해준다.
  return stages[uuid].push({ id, timestamp, startScore, getItems });
};

export const clearStage = (uuid) => {
  return (stages[uuid] = []);
};

export const getStageScore = (stage, stageDuration, scorePerSecond) => {
  // 우선, 서버에 저장한 스테이지 간 획득한 아이템들의 총 Score를 구한다.
  const { items } = getServerGameAssets();
  const itemsScore = stage.getItems.reduce((acc, cur) => {
    const itemInfo = items.data.find((item) => item.id === cur.itemId);
    return acc + itemInfo.score * cur.count;
  }, 0);

  console.log(`${stage.id} Stage itemsScore : ${itemsScore}`);

  // 스테이지 별로 초당 획득하는 Score가 다르다.
  const runningScore = stageDuration * scorePerSecond;

  // 최종 서버에서 계산한 스테이지 점수는 (획득한 아이템 점수) + (러닝으로 얻은 점수) 이다.
  const serverScore = itemsScore + runningScore;

  return serverScore;
};
