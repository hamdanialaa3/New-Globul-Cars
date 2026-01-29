import { describe, it, expect, beforeEach } from '@jest/globals';
import { PaymentService } from '../payment-service';

describe('PaymentService', () => {
    let paymentService: PaymentService;

    beforeEach(() => {
        paymentService = PaymentService.getInstance();
    });

    describe('calculateCommission', () => {
        it('should correctly calculate commission and vendor earnings', () => {
            const amount = 1000;
            const rate = 10; // 10%

            const result = paymentService.calculateCommission(amount, rate);

            expect(result.subtotal).toBe(1000);
            expect(result.commission).toBe(100);
            expect(result.vendorEarnings).toBe(900);
        });

        it('should handle zero commission', () => {
            const amount = 500;
            const rate = 0;

            const result = paymentService.calculateCommission(amount, rate);

            expect(result.commission).toBe(0);
            expect(result.vendorEarnings).toBe(500);
        });

        it('should handle decimal amounts correctly', () => {
            const amount = 99.99;
            const rate = 5.5; // 5.5%

            const result = paymentService.calculateCommission(amount, rate);

            expect(result.subtotal).toBe(99.99);
            // 99.99 * 0.055 = 5.49945
            expect(result.commission).toBeCloseTo(5.49945);
            expect(result.vendorEarnings).toBeCloseTo(94.49055);
        });
    });

    describe('getStripePublicKey', () => {
        it('should return a key', () => {
            const key = paymentService.getStripePublicKey();
            expect(key).toBeDefined();
            expect(typeof key).toBe('string');
        });
    });
});
