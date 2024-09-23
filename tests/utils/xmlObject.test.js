// src/utils/xmlObject.test.js

import convertToXml from '../../src/utils/xmlObject';

describe('convertToXml Utility Function', () => {
  test('should convert valid JSON object to XML format', () => {
    const jsonObject = {
      valid: true,
      errorCodes: ['Error1', 'Error2']
    };

    const expectedXml = '<root><valid>true</valid><errorCodes><code>Error1</code><code>Error2</code></errorCodes></root>';
    const xmlResult = convertToXml(jsonObject);

    expect(xmlResult).toBe(expectedXml);
  });

  test('should throw an error when JSON format is incorrect', () => {
    const invalidJsonObject = undefined; // Invalid input

    expect(() => convertToXml(invalidJsonObject)).toThrow('Conversion failed. Please check the JSON format.');
  });

  test('should handle empty errorCodes array', () => {
    const jsonObject = {
      valid: true,
      errorCodes: []
    };

    const expectedXml = '<root><valid>true</valid><errorCodes /></root>';
    const xmlResult = convertToXml(jsonObject);

    expect(xmlResult).toBe(expectedXml);
  });

  test('should handle null or undefined errorCodes', () => {
    const jsonObject = {
      valid: true,
      errorCodes: null
    };

    const expectedXml = '<root><valid>true</valid><errorCodes /></root>';
    const xmlResult = convertToXml(jsonObject);

    expect(xmlResult).toBe(expectedXml);
  });
});