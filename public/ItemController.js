import { getClientGameAssets } from "./init/assets.js";
import Item from "./Item.js";

class ItemController {
  INTERVAL_MIN = 5000;
  INTERVAL_MAX = 10000;

  nextInterval = null;
  items = [];
  selectableItemNumber = 1;

  constructor(ctx, itemImages, scaleRatio, speed) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.itemImages = itemImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;

    this.setNextItemTime();
  }

  setNextItemTime() {
    // 아이템은 5~10초 사이에 하나씩 생성된다.
    this.nextInterval = this.getRandomNumber(
      this.INTERVAL_MIN,
      this.INTERVAL_MAX,
    );
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  createItem() {
    const index = this.getRandomNumber(0, this.selectableItemNumber);
    const itemInfo = this.itemImages[index];
    const x = this.canvas.width * 1.5;
    const y = this.getRandomNumber(10, this.canvas.height - itemInfo.height);

    const item = new Item(
      this.ctx,
      itemInfo.id,
      x,
      y,
      itemInfo.width,
      itemInfo.height,
      itemInfo.image,
    );

    this.items.push(item);
  }

  update(gameSpeed, deltaTime) {
    if (this.nextInterval <= 0) {
      this.createItem();
      this.setNextItemTime();
    }

    this.nextInterval -= deltaTime;

    this.items.forEach((item) => {
      item.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
    });

    this.items = this.items.filter((item) => item.x > -item.width);
  }

  draw() {
    this.items.forEach((item) => item.draw());
  }

  collideWith(sprite) {
    const collidedItem = this.items.find((item) => item.collideWith(sprite));
    if (collidedItem) {
      this.ctx.clearRect(
        collidedItem.x,
        collidedItem.y,
        collidedItem.width,
        collidedItem.height,
      );
      return {
        itemId: collidedItem.id,
      };
    }
  }

  reset() {
    this.items = [];
  }

  setSelectableItemNumber(stageId) {
    const { itemUnlocks } = getClientGameAssets();

    // 스테이지ID에 맞는 생성 가능한 아이템 종류를 지정해준다.
    try {
      const itemUnlock = itemUnlocks.data.find(
        (itemUnlock) => itemUnlock.stage_id === stageId,
      );
      if (!itemUnlock) {
        throw new Error(`${stageId} itemUnlock not found`);
      }

      this.selectableItemNumber = itemUnlock.item_id;
    } catch (err) {
      throw err;
    }
  }

  getSelectableItemNumber(stageId) {
    return this.selectableItemNumber;
  }
}

export default ItemController;
