import { version } from './package.json';
import handleError from 'handle-error-web';
import { getNextVizDataGen } from './generate-viz-data';
import { select } from 'd3-selection';

const yieldFreq = 5000;
const maxGens = 2;
var gensDone = 0;
const scale = 100 / maxGens;

var getNextVizData = getNextVizDataGen(yieldFreq);
var nodeSel = select('#node-root');

(async function go() {
  window.addEventListener('error', reportTopLevelError);
  renderVersion();
  putOutNextGeneration();
})();

function reportTopLevelError(event) {
  handleError(event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}

function putOutNextGeneration() {
  // done means done for just that generation.
  var { value, done } = getNextVizData.next();
  // console.log('value', value, 'done', done);

  if (done) {
    if (gensDone < maxGens) {
      getNextVizData = getNextVizDataGen(yieldFreq);
      requestAnimationFrame(putOutNextGeneration);
    }
    return;
  }

  var { nodes, edges } = value;
  gensDone = value.gen;
  if (nodes || edges) {
    // console.log('nodes', nodes, 'edges', edges);
    nodes.forEach(appendNode);
    renderNewEdges(edges);
    requestAnimationFrame(putOutNextGeneration);
  }
}

function appendNode(node) {
  const r = node.r * scale;
  const x = r * Math.cos(node.theta);
  const y = r * Math.sin(node.theta);

  // console.log(node.id, node.theta, x, y);
  var textSel = nodeSel.append('text');
  textSel.text(node.id).attr('x', x).attr('y', y);
}

function renderNewEdges(edges) {}
