import { boardStatus, runSolve } from './detect.js';

const COMMAND = 'crush-solver-command';
const RESULT = 'crush-solver-result';

function reply(id, payload) {
  window.dispatchEvent(new CustomEvent(RESULT, { detail: { id, ...payload } }));
}

window.addEventListener(COMMAND, async (event) => {
  const detail = event.detail || {};
  const id = detail.id;
  if (detail.type === 'GET_STATUS') {
    reply(id, boardStatus());
    return;
  }
  if (detail.type === 'SOLVE' || detail.type === 'CRUSH' || detail.type === 'AUTOFILL') {
    reply(id, await runSolve());
  }
});
