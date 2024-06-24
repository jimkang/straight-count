import { version } from './package.json';
import handleError from 'handle-error-web';
import request from 'basic-browser-request';
// import ep from 'errorback-promise';

import parse from 'no-throw-json-parse';

var lineWithEndRegex = /(.*\n)/;

var edges = [];
var nodes = [];

(async function go() {
  window.addEventListener('error', reportTopLevelError);
  renderVersion();
  streamData({
    url: 'nodes.ndjson',
    onObject: onNode,
    done: () => console.log('nodes.ndjson stream done.'),
  });
  streamData({
    url: 'edges.ndjson',
    onObject: onEdge,
    done: () => console.log('edges.ndjson stream done.'),
  });
})();

function reportTopLevelError(event) {
  handleError(event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}

function streamData({ url, onObject, done }) {
  var bufferString = '';

  var reqOpts = {
    url,
    method: 'GET',
    onData: writeToStream,
  };
  request(reqOpts, reqDone);

  function writeToStream(text) {
    bufferString += text;
    if (!bufferString.includes('\n')) {
      return;
    }
    let pieces = bufferString.split(lineWithEndRegex);
    for (let i = 0; i < pieces.length; ++i) {
      let piece = pieces[i];
      if (piece.length < 1) {
        continue;
      }

      if (piece.endsWith('\n')) {
        parseLine(piece);
      } else {
        bufferString = piece;
        break;
      }
    }
  }

  function emitObject(obj) {
    if (obj.abbreviatedOid) {
      onCommit(obj);
    } else {
      onRepo(obj);
    }
  }

  function parseLine(piece) {
    let parsed = parse(piece);
    if (parsed !== undefined) {
      onObject(parsed);
    }
  }

  function reqDone(error) {
    if (error) {
      done(error);
      return;
    }

    if (bufferString.length > 0) {
      parseLine(bufferString);
    }

    done();
  }
}
