import { gameEnd, gameStart } from "./game.handler.js";
import { getItemHandler, moveStageHandler } from "./stage.handler.js";

// 1의 자리 : 클라이언트의 요청 핸들러 ID
// 10의 자리 : 서버의 응답 핸들러 ID
const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
  12: getItemHandler,
};

export default handlerMappings;
