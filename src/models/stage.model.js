// 스테이지에 따라서 더 높은 점수 획득
// 1 스테이지, 0점 -> 1점씩
// 2 스테이지, 1000점 -> 2점씩

// key : uuid, value : array -> stage 정보는 복수이기떄문에 배열
const stages = {};

// 스테이지 초기화
export const createStage = (uuid) => {
  stages[uuid] = [];
};

export const getStage = (uuid) => {
  return stages[uuid];
};

export const setStage = (uuid, id, timestamp, items) => {
  return stages[uuid].push({ id, timestamp, items });
};

export const clearStage = (uuid) => {
  return (stages[uuid] = []);
};
