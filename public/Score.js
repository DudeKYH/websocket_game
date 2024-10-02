import { sendEvent } from "./Socket.js";
import { getClientGameAssets } from "./init/assets.js";

class Score {
  score = 0;
  stageChange = true;
  scorePerSecond = 0;
  goalScore = 0;
  stageId = 0;

  constructor(ctx, scaleRatio, highScore) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.highScore = highScore;
  }

  update(deltaTime) {
    this.score += deltaTime * 0.001 * this.scorePerSecond;
    // score가 점수
    if (Math.floor(this.score) >= this.goalScore && this.stageChange) {
      this.stageChange = false;
      sendEvent(11, {
        currentStage: this.stageId,
        targetStage: this.stageId + 1,
        score: this.score,
      });
    }
  }

  // 아이템을 획득시 getItem()함수가 호출
  getItem(itemId) {
    const { items } = getClientGameAssets();

    const item = items.data.find((item) => item.id === itemId);
    if (!item) {
      console.log(`${itemId} getItem Not Found`);
    }

    //  아이템 획득 시, 클라이언트의 Score는 아이템 점수만큼 증가
    this.score += item.score;

    // 서버에게 아이템 획득을 알려준다.
    sendEvent(12, { itemId });
  }

  reset() {
    this.score = 0;
    this.stageChange = true;
    this.scorePerSecond = 1;
    this.goalScore = 10;
    this.stageId = 1000;
  }

  setHighScore(highScore) {
    this.highScore = highScore;
    // const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));

    // if (this.score > highScore) {
    //   // localStorage : 브라우저에 key-value 값을 Storage에 저장할 수 있다.
    //   // 데이터는 Session 간에 공유된다. => 즉, 세션이 바뀌어도 데이터는 유지된다.

    //   // setItem(key, value) : storage에 key-value를 저장한다.
    //   localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    // }
  }

  getScore() {
    return this.score;
  }

  draw() {
    //const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const highScore = this.highScore;
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = "#525250";

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = Math.floor(this.highScore)
      .toString()
      .padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }

  setScorePerSecond(scorePerSecond) {
    this.scorePerSecond = scorePerSecond;
  }

  getScorePerSecond() {
    return this.scorePerSecond;
  }

  setGoalScore(goalScore) {
    this.goalScore = goalScore;
  }

  getGoalScore() {
    return this.goalScore;
  }

  setStageId(stageId) {
    this.stageId = stageId;
  }

  getStageId() {
    return this.stageId;
  }

  setScoreInfo(stageId) {
    const { stages } = getClientGameAssets();

    // 패킷으로부터 받은 stageId에 맞는 StageInfo 세팅
    try {
      const stage = stages.data.find((stage) => stage.id === stageId);
      if (!stage) {
        throw new Error(`${stageId} Stage not found`);
      }

      this.stageId = stage.id;
      //this.score = stageInfo.score;
      this.goalScore = stage.goalScore;
      this.scorePerSecond = stage.scorePerSecond;
      this.stageChange = true;
    } catch (err) {
      throw err;
    }
  }
}

export default Score;
