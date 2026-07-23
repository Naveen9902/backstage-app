import { describe, it, expect } from 'vitest';

function calculatePayout(amountPaid: number) {
  // Assume platform takes 10% fee
  const fee = amountPaid * 0.10;
  const payout = amountPaid - fee;
  return { fee, payout };
}

describe('Payment Calculations', () => {
  it('should calculate 10% platform fee and correct worker payout', () => {
    const result = calculatePayout(100);
    expect(result.fee).toBe(10);
    expect(result.payout).toBe(90);
  });

  it('should handle zero amounts gracefully', () => {
    const result = calculatePayout(0);
    expect(result.fee).toBe(0);
    expect(result.payout).toBe(0);
  });
});
