import { test } from 'node:test';
import assert from 'node:assert/strict';
import { retour } from './historique.js';
import { choisirTouche, etapePosture } from '../../posture/domain/posture.js';

test('V6 : Retour arriere revient a l etape precedente', () => {
  const h = ['Q', 'S', 'D'].reduce((acc, t) => choisirTouche(acc, t).historique, []);
  assert.equal(etapePosture(h), 'index');
  assert.equal(etapePosture(retour(h)), 'majeur');
  assert.deepEqual(retour([]), []);
});
