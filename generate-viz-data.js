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
var nextGen = [];
var gen = 0;
var iters = 0;
var genRSeparation = 0.4;

export function* getNextVizDataGen(yieldFreq) {
  var nodes = [];
  var edges = [];
  console.log('gen', gen);

  for (let handIndex = 0; handIndex < prevGen.length; ++handIndex) {
    let hand = prevGen[handIndex];
    let nextHands = getNextHands(hand, standardDeck);
    for (
      let nextHandIndex = 0;
      nextHandIndex < nextHands.length;
      ++nextHandIndex
    ) {
      let nextHand = nextHands[nextHandIndex];
      const handString = handToString(hand);
      let node = {
        id: handString,
        gen,
        r: 1 + gen * genRSeparation,
        theta: handIndex * ((2 * Math.PI) / prevGen.length),
      };
      if (!writtenHands.has(handString)) {
        nodes.push(node);
        writtenHands.add(handString);
      }
      let edge = { s: handString, e: handToString(nextHand) };
      edges.push(edge);
      nextGen.push(nextHand);
      iters += 1;
      if (iters % yieldFreq === 0) {
        // console.log('Yielding.');
        yield { nodes: nodes.slice(), edges: edges.slice() };
        nodes.length = 0;
        edges.length = 0;
      }
    }
  }
  prevGen = nextGen;
  yield { nodes, edges, gen };
  gen += 1;
  console.log('Returning.');
  return;
}

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
