// cardIssuer.test.js
import cardIssuer from '../../../src/api/services/cardIssuer';

describe('cardIssuer', () => {
    it('should return visa for a valid VISA card number', () => {
        const cardNumber = '4111111111111111';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('visa');
    });

    it('should return mastercard for a valid MasterCard number', () => {
        const cardNumber = '5500000000000004';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('mastercard');
    });

    it('should return discover for a valid Discover card number', () => {
        const cardNumber = '6011000000000004';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('discover');
    });

    it('should return amex for a valid American Express card number', () => {
        const cardNumber = '378282246310005';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('amex');
    });

    it('should return maestro for a valid Maestro card number', () => {
        const cardNumber = '6759649826438453';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('maestro');
    });

    it('should return jcb for a valid JCB card number', () => {
        const cardNumber = '3530111333300000';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('jcb');
    });

    it('should return diners for a valid Diners Club card number', () => {
        const cardNumber = '30569309025904';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('diners');
    });

    it('should return unionpay for a valid UnionPay card number', () => {
        const cardNumber = '6200000000000005';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('unionpay');
    });

    it('should return dankort for a valid Dankort card number', () => {
        const cardNumber = '5019717010103742';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('dankort');
    });

    it('should return interpayment for a valid InterPayment card number', () => {
        const cardNumber = '6362970000457013';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('interpayment');
    });

    it('should return electron for a valid Electron card number', () => {
        const cardNumber = '4175001000000000';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('electron');
    });

    it('should return unknown for an invalid card number', () => {
        const cardNumber = '1234567890123456';
        const result = cardIssuer(cardNumber);
        expect(result).toBe('unknown');
    });
});