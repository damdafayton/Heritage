import {test, expect, describe} from '@jest/globals';

import {decryptText, deriveKey, encryptText} from '../crpyto';

describe('crypto util', () => {
  let cipherText;

  test('encryptText() derives 128bit key from a string', async () => {
    const derivedKey = await deriveKey('hello');

    cipherText = await encryptText(derivedKey, 'hello world', true);

    expect(cipherText).toBe(
      'a59c10564a419dff8c67ad0ca0ce48d6404306e1e58e995854d44ecff9765e6e96666b47dbeb8a',
    );
  });

  test('decryptText()', async () => {
    const derivedKey = await deriveKey('hello');

    const decryptedText = await decryptText(derivedKey, cipherText);

    expect(decryptedText).toBe('hello world');
  });
});
