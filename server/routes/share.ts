import { Router } from 'express';
import {
  createSharePayload,
  receiveSharePayload,
  validateSharePasscode,
} from '../../src/commands/share';

const router = Router();

// POST /api/share/generate
router.post('/generate', (req, res) => {
  try {
    const { passcode, environment } = req.body;
    validateSharePasscode(passcode);

    const { token, count } = createSharePayload(passcode, environment);
    if (count === 0) {
      return res.status(404).json({ error: `No secrets found for environment '${environment || 'active'}'` });
    }

    res.json({ token, count, passcode, environment: environment || 'active' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create share token' });
  }
});

// POST /api/share/receive
router.post('/receive', (req, res) => {
  try {
    const { token, passcode } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token and passcode are required' });
    }
    validateSharePasscode(passcode);

    const { importedCount, environment } = receiveSharePayload(token, passcode);
    res.json({ importedCount, environment });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to decrypt share payload: Incorrect passcode or invalid token.' });
  }
});

export default router;
