// xmlObject.test.js
import { toXml } from 'xml2json';
import convertToXml from '../../src/utils/xmlObject';

jest.mock('xml2json');

describe('convertToXml', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock console.error
        global.console.error = jest.fn();
    });

    afterEach(() => {
        // Restore console.error
        global.console.error.mockRestore();
    });

    it('should convert JSON object to XML successfully', () => {
        const jsonObject = {
            valid: true,
            issuer: 'VISA',
            errorCodes: ['ERR001', 'ERR002']
        };

        const expectedXml = '<root><valid><isValid>true</isValid></valid><issuer><issuer>VISA</issuer></issuer><errorCodes><code>ERR001</code><code>ERR002</code></errorCodes></root>';
        toXml.mockReturnValue(expectedXml);

        const result = convertToXml(jsonObject);

        expect(toXml).toHaveBeenCalledWith({
            root: {
                valid: {
                    isValid: jsonObject.valid
                },
                issuer: {
                    issuer: jsonObject.issuer
                },
                errorCodes: {
                    code: jsonObject.errorCodes
                }
            }
        });
        expect(result).toBe(expectedXml);
    });

    it('should handle error during conversion', () => {
        const jsonObject = {
            valid: true,
            issuer: 'VISA',
            errorCodes: ['ERR001', 'ERR002']
        };

        const error = new Error('Conversion error');
        toXml.mockImplementation(() => { throw error; });

        expect(() => convertToXml(jsonObject)).toThrow('Conversion failed. Please check the JSON format.');
        expect(console.error).toHaveBeenCalledWith('Error converting JSON to XML:', error);
    });
});