import { Router } from 'express';
import { ymd } from '../util/dates.js';
import { wrap } from '../util/wrap.js';
import { scoreFor } from '../services/scoreData.js';
import { WEIGHTS, RULES } from '../logic/formScore.js';

const router = Router();
// Returns the score plus the weights and rules, so the UI can show how it is worked out.
router.get('/', wrap(async (req, res) => {
  res.json({ ...(await scoreFor(req.user.id, ymd())), weights: WEIGHTS, rules: RULES });
}));
export default router;
