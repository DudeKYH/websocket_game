const arr = [];

arr.push({ itemId: 1, count: 5, score: 10 });
arr.push({ itemId: 2, count: 10, score: 20 });

const itemsScore = arr.reduce((acc, cur) => {
  console.log("1 : ", cur.count, cur.itemId, cur.score);

  return acc + cur.count * cur.score;
}, 0);

console.log("2 : ", itemsScore);
