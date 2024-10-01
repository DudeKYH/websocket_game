import { sendEvent } from "./Socket.js";

class Score {
  score = 0;
  HIGH_SCORE_KEY = "highScore";
  stageChange = true;
  scorePerSecond = 1;
  goalScore = 10;
  stageId = 1001;

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  update(deltaTime) {
    this.score += deltaTime * 0.001 * this.scorePerSecond;
    // score가 점수
    if (Math.floor(this.score) === this.goalScore && this.stageChange) {
      this.stageChange = false;
      sendEvent(11, {
        currentStage: this.stageId,
        targetStage: this.stageId + 1,
        score: this.score,
      });
    }
  }

  getItem(itemId) {
    this.score += 0;

    // sendEvent(12, {
    //   itemId: itemId,
    // });
  }

  reset() {
    this.score = 0;
    this.stageChange = true;
    this.scorePerSecond = 1;
    this.goalScore = 10;
    this.stageId = 1000;
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));

    if (this.score > highScore) {
      // localStorage : 브라우저에 key-value 값을 Storage에 저장할 수 있다.
      // 데이터는 Session 간에 공유된다. => 즉, 세션이 바뀌어도 데이터는 유지된다.

      // setItem(key, value) : storage에 key-value를 저장한다.
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = "#525250";

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

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

  setScoreInfo(stageInfo) {
    this.stageId = stageInfo.stageId;
    //this.score = stageInfo.score;
    this.goalScore = stageInfo.goalScore;
    this.scorePerSecond = stageInfo.scorePerSecond;
    this.stageChange = true;

    console.log(this);
  }
}

export default Score;
