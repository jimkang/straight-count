var fs = require('fs');

var suits = ['♣️', '♦️', '♥️', '♠️'];
// var suits = ['C', 'D', 'H', 'S'];

var rankNames = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K',
};

var standardDeck = [];
for (let rank = 1; rank < 14; ++rank) {
  for (let suit of suits) {
    standardDeck.push({ rank, suit });
  }
}

var writtenHands = new Set();
var prevGen = standardDeck.map((card) => [card]);

var edgesStream = fs.createWriteStream('edges.ndjson');
var nodesStream = fs.createWriteStream('nodes.ndjson');

for (let gen = 0; gen < 2; ++gen) {
  let nextGen = [];
  for (let hand of prevGen) {
    let nextHands = getNextHands(hand, standardDeck);
    for (let nextHand of nextHands) {
      const handString = handToString(hand);
      // TODO: Position
      let node = { id: handString, gen };
      if (!writtenHands.has(handString)) {
        nodesStream.write(JSON.stringify(node) + '\n');
        writtenHands.add(handString);
      }
      let edge = { s: handString, e: handToString(nextHand) };
      edgesStream.write(JSON.stringify(edge) + '\n');
      nextGen.push(nextHand);
    }
  }
  prevGen = nextGen;
}

edgesStream.close();
nodesStream.close();

function getNextHands(hand, deck) {
  var cardsInRange = getCardsInRange(hand, deck).filter(notInHand);
  return cardsInRange.map((card) => hand.concat(card));

  function notInHand(card) {
    return !hand.some((handCard) => handCard.rank === card.rank);
  }
}

function getCardsInRange(hand, deck) {
  const ranks = hand.map((card) => card.rank);
  const handMin = ranks[0];
  const handMax = ranks[ranks.length - 1];
  // 14 is the "high ace".
  const rangeMax = Math.min(handMin + 4, 14);
  const rangeMin = Math.max(handMax - 4, 1);
  return deck.filter(aceAwareCheckCard);

  function aceAwareCheckCard(card) {
    if (card.rank === 1) {
      return checkCard(card) || checkCard({ rank: 14, suit: card.suit });
    }
    return checkCard(card);
  }

  function checkCard(card) {
    if (card.rank > rangeMax) {
      return false;
    }
    if (card.rank < rangeMin) {
      return false;
    }
    // Cards with the same rank as one already in the hand cannot be part of the
    // straight.
    if (hand.find((handCard) => handCard.rank === card.rank)) {
      return false;
    }
    return true;
  }
}

function getCardIndex(array, card) {
  return array.findIndex(
    (arrayCard) =>
      (arrayCard.rank === card.rank) & (arrayCard.suit === card.suit)
  );
}

function cardToString({ rank, suit }) {
  var rankString = rank;
  if (rank in rankNames) {
    rankString = rankNames[rank];
  }
  return rankString + suit;
}

function handToString(hand) {
  return hand.map(cardToString).join('');
}
