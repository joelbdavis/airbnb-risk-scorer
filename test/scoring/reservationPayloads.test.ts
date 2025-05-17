import fs from 'fs';
import path from 'path';
import { calculateRiskScore, RiskReport } from '../../src/scoring/riskScorer';

interface ExpectedValues {
  level: RiskReport['level'];
  score?: number;
  rationale?: string[];
  ruleNames?: string[];
}

describe('Risk scoring from testPayloads', () => {
  const payloadDir = path.join(__dirname, '../../testPayloads');

  const files = fs
    .readdirSync(payloadDir)
    .filter(
      (file) => file.endsWith('.json') && !file.endsWith('.expected.json')
    );

  files.forEach((filename) => {
    it(`calculates risk score for ${filename}`, () => {
      const base = path.basename(filename, '.json');
      const reservation = getReservationFromTestPayload(payloadDir, base);
      const expected = getExpected(payloadDir, filename, base);
      const riskReport = calculateRiskScore(reservation);

      expect(riskReport.level).toEqual(expected.level);
    });
  });
});

function getReservationFromTestPayload(payloadDir: string, base: string): any {
  const payloadPath = path.join(payloadDir, `${base}.json`);
  const wrapper = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  return wrapper.data || wrapper;
}

function getExpected(
  payloadDir: string,
  filename: string,
  base: string
): ExpectedValues {
  const expectedPath = path.join(payloadDir, `${base}.expected.json`);

  if (!fs.existsSync(expectedPath)) {
    throw new Error(`Missing expected file for ${filename}`);
  }

  const expected = JSON.parse(
    fs.readFileSync(expectedPath, 'utf8')
  ) as ExpectedValues;

  if (typeof expected.level !== 'string') {
    throw new Error(`Missing or invalid "level" in ${base}.expected.json`);
  }

  return expected;
}
