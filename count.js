var assert = require('assert');

var suits = ['♣', '♦', '♥', '♠'];

var standardDeck = [];
for (let rank = 1; rank < 14; ++rank) {
  for (let suit of suits) {
    standardDeck.push({ rank, suit });
  }
}

var countedHandsByString = {};
const total = standardDeck.reduce((sum, startCard) => sum + count(standardDeck, [startCard]), 0);
console.log('Counted hands:\n', Object.keys(countedHandsByString).join('\n'));
console.log('total:', total);

function count(deck, hand, countTree) {
  hand.sort(compareCards);

  if (hand.length === 5) {
    const handString = hand.map(cardToString).join('');
    if (!(handString in countedHandsByString)) {
      countedHandsByString[handString] = handString;
      return 1;
    } else {
      return 0;
    }
  }

  var cardsInRange = getCardsInRange(hand, deck);
  return cardsInRange.reduce(
    (sum, card) => sum + count(copyWithout(deck, card), addToCopy(hand, card)),
    0
  );
}

function getCardsInRange(hand, deck) {
  const ranks = hand.map(card => card.rank);
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
    if (hand.find(handCard => handCard.rank === card.rank)) {
      return false;
    }
    return true;
  }
}

function addToCopy(array, card) {
  const index = getCardIndex(array, card);
  assert(index === -1);
  var copy = array.slice();
  copy.push(card);
  return copy;
}

function copyWithout(array, card) {
  var copy = array.slice();
  const index = getCardIndex(copy, card);
  assert(index !== -1);
  copy.splice(index, 1);
  return copy;
}

function getCardIndex(array, card) {
  return array.findIndex(arrayCard => arrayCard.rank === card.rank & arrayCard.suit === card.suit);
}

function compareCards(a, b) {
  if (a.rank < b.rank) {
    return -1;
  }
  if (a.rank > b.rank) {
    return 1;
  }
  if (suits.indexOf(a.suit) < suits.indexOf(b.suit)) {
    return -1;
  }
  return 1;
}

function cardToString({ rank, suit }) {
  return rank + suit;
}

