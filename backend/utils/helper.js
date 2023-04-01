const jwt = require("jsonwebtoken");
const { secretKeys } = require("../config");

const removeFields = (obj, keys, defaultFields = true) => {
  var fields = ["__v"];
  keys = typeof keys == "string" ? [keys] : keys || [];
  if (defaultFields) keys = keys.concat(fields);
  keys.forEach((key) => delete obj[key]);
  return obj;
};

const toObject = (obj) => JSON.parse(JSON.stringify(obj));

const toStringify = (obj) => JSON.stringify(obj);

const generateJwt = (obj) => jwt.sign(obj, secretKeys);

const errorMessages = (data) => {
  return {
    "string.empty": `${data} should not be empty !!`,
    "string.min": `${data} length between  5 to 20`,
    "string.max": `${data} length between  5 to 20`,
    "any.required": `${data} is required !!`,
    "string.email": `Enter Valid ${data} !!`,
    "string.pattern.base": `${data} length must be between 5 to 15 !!`,

    "number.min": `${data} length must be 10 digits !!`,
    "number.max": `${data} length must be 10 digits !!`
  };
};

const string_sort = function (str) {
  const tempArr = JSON.parse(JSON.stringify(str));
  var i = 0,
    j;
  while (i < tempArr.length) {
    j = i + 1;
    while (j < tempArr.length) {
      if (tempArr[j] < tempArr[i]) {
        var temp = tempArr[i];
        tempArr[i] = tempArr[j];
        tempArr[j] = temp;
      }
      j++;
    }
    i++;
  }
  return tempArr;
};

const identifyDrawCard = (card) => {
  return card.split("/src/assets/cards/")[1].split(".")[0][0];
};

const winnerCard = (tableCard) => {
  let temp = 0;
  const includeTemp = ["J", "Q", "K", "A"];
  const currDrawCardColor = identifyDrawCard(tableCard[0].card);

  tableCard.forEach((ele) => {
    const val = ele.card
      .replace(`/src/assets/cards/${currDrawCardColor}`, "")
      .replace(".svg", "");

    if (includeTemp.includes(val)) {
      if (includeTemp.includes(temp)) {
        if (includeTemp.indexOf(temp) < includeTemp.indexOf(val)) {
          temp = val;
        }
      } else {
        temp = val;
      }
    } else {
      if (temp < val) temp = Number(val);
    }
  });
  return temp;
};

const getWinner = (cardTable, hukam) => {
  let mindi = [];
  const data = cardTable.filter((ele) => {
    const res = identifyDrawCard(ele.card);
    if (ele.card.includes("10")) {
      const mindiCard = ele.card
        .split("/src/assets/cards/")[1]
        .split(".")[0][0];
      mindi.push(mindiCard);
    }
    return res === hukam;
  });

  if (data.length) {
    const winnerCardNumber = winnerCard(data);
    return {
      val: `/src/assets/cards/${hukam}${winnerCardNumber}.svg`,
      mindiArr: mindi
    };
  } else {
    mindi = [];
    const withoutHukam = cardTable.filter((ele) => {
      const res = identifyDrawCard(ele.card);
      if (ele.card.includes("10")) {
        const mindiCard = ele.card
          .split("/src/assets/cards/")[1]
          .split(".")[0][0];
        mindi.push(mindiCard);
      }
      return res === identifyDrawCard(cardTable[0].card);
    });

    const winnerCardNumber = winnerCard(withoutHukam);
    const winnerCardColor = identifyDrawCard(cardTable[0].card);
    return {
      val: `/src/assets/cards/${winnerCardColor}${winnerCardNumber}.svg`,
      mindiArr: mindi
    };
  }
};

module.exports = {
  errorMessages,
  removeFields,
  toObject,
  toStringify,
  generateJwt,
  string_sort,
  identifyDrawCard,
  winnerCard,
  getWinner
};
