/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from 'firebase-functions/v2/https';
import * as functions from 'firebase-functions';

const {logger} = functions;

const {initializeApp} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');

initializeApp();

const db = getFirestore();

import {ethers} from 'ethers';

const {deriveKey, encryptText, decryptText} = require('./utils/crypto');

const KEY = 'HELLO_WORLD';

export const auth = onRequest((req, res) => {
  const {method, url} = req;
  logger.log({method, url}, {structuredData: true});

  switch (method) {
    case 'GET':
      const {query} = req;

      const {address} = query;
      const oneMinAfter = Date.now() + 60000;
      const token = (Math.random() * 10 ** 18).toString(16);

      db.collection('auth')
        .doc(address)
        .set({
          address,
          timeOut: oneMinAfter,
          token,
        } as Auth)
        .then(() => {
          console.log('Document successfully written!');
        })
        .catch((error: any) => {
          console.error('Error writing document: ', error);
        });

      res.send({token});
      return;
  }
});

export const encryptedData = onRequest(async (req, res) => {
  const {method, body} = req;
  logger.log({method, body});

  switch (method) {
    case 'GET':
      const {query} = req;

      var {address, signedToken} = query;

      if (!(await verifySigner(address as string, signedToken as string))) {
        res.sendStatus(403);
        return;
      }

      logger.debug({address, signedToken});

      var doc = await db.collection('encrypted-data').doc(address).get();

      const docData = doc.data();

      if (!docData) {
        res.sendStatus(403);

        return;
      }

      var key = await deriveKey(KEY);

      var encryptedData = await decryptText(key, docData.encryptedData);

      logger.debug({encryptedData});

      res.send({encryptedData, emails: docData.emails});
      break;
    case 'POST':
      const data = body.data ? JSON.parse(body.data) : {};
      //@ts-ignore
      var {address, signedToken, encryptedData, emails} = data;

      if (!address || !signedToken || !encryptedData || !emails.length) return;

      logger.debug({address, signedToken, encryptedData, emails});

      if (!(await verifySigner(address as string, signedToken as string))) {
        res.sendStatus(403);
        return;
      }

      var key = await deriveKey(KEY);

      const serverEncryptedData = await encryptText(key, encryptedData);

      logger.debug({serverEncryptedData});

      await db
        .collection('encrypted-data')
        .doc(address)
        .set({address, encryptedData: serverEncryptedData, emails});

      res.sendStatus(201);
      break;
  }
});

type Auth = {
  token: string;
  address: string;
  timeOut: number;
};

async function verifySigner(address: string, signedToken: string) {
  var authDoc = await db.collection('auth').doc(address).get();

  const authData: Auth = authDoc.data();

  const signerAddress = await ethers.verifyMessage(
    authData.token,
    signedToken as string,
  );

  if (signerAddress !== address) {
    logger.error('Address verification failed');
    return;
  }

  if (Date.now() > authData.timeOut) {
    logger.error('Token expired');
    return;
  }

  return true;
}
