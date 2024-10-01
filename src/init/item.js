// Stage 진행 시, 클라이언트가 획득한 item을 저장할 list를 초기화해준다.
export const initItemList = (itemId) => {
  const itemList = {};
  for (let i = 1; i <= itemId; i++) {
    itemList[i] = 0;
  }

  return itemList;
};
