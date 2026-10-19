import { test } from 'node:test';
import assert from 'node:assert/strict';
import { atteinte, effortDe } from './effort.js';

const posture = { auriculaire: 'Q', annulaire: 'S', majeur: 'D', index: 'F', pouce: 'Espace', 'pouce droit': 'Mouse 4' };

test('effort : chaque touche revient au doigt le plus proche, la souris au pouce droit, la rangee du bas au pouce', () => {
  assert.equal(effortDe(posture, 'Mouse 4 + F'), 0);
  assert.deepEqual(atteinte(posture, 'G'), { doigt: 'index', effort: 1 });
  assert.deepEqual(atteinte(posture, 'Mouse 5'), { doigt: 'pouce droit', effort: 1 });
  assert.equal(effortDe(posture, 'Espace'), 0);
  assert.equal(atteinte(posture, 'Alt').doigt, 'pouce');
});

test('effort : un seul doigt pour deux touches tenues ensemble est injouable ; Echap puis une touche se jouent l un apres l autre', () => {
  assert.equal(effortDe(posture, 'Alt + Espace'), Infinity);
  assert.equal(effortDe(posture, 'Échap + A'), effortDe(posture, 'Échap') + effortDe(posture, 'A'));
});
