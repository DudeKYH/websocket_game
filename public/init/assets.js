let gameAssets = {};

// 클라이언트는 asset 데이터를 담은 json 파일을 fetch 메서드를 통해 읽는다.
const fetchJsonFile = async (fileName) => {
  const response = await fetch(fileName);
  const jsonData = await response.json();
  return jsonData;
};

// json파일로 저장된 stage, item, item_unlock의 데이터들을 fetch로 읽어와서 gameAssets 변수에 저장한다.
export const loadClientGameAssets = async () => {
  try {
    const [stages, items, itemUnlocks] = await Promise.all([
      fetchJsonFile("./assets/stage.json"),
      fetchJsonFile("./assets/item.json"),
      fetchJsonFile("./assets/item_unlock.json"),
    ]);

    gameAssets = { stages, items, itemUnlocks };
    return gameAssets;
  } catch (err) {
    throw new Error("Failed to load game assets: " + err.message);
  }
};

export const getClientGameAssets = () => {
  return gameAssets;
};
