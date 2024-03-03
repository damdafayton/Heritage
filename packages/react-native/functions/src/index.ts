/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as functions from "firebase-functions";

const {logger} = functions;

import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

initializeApp();

const db = getFirestore();

import {ethers} from "ethers";

const {deriveKey, encryptText, decryptText} = require("./utils/crypto");

const KEY = "HELLO_WORLD";

type Auth = {
  token: string;
  address: string;
  timeOut: number;
};

type EncryptedData = {
  address: string;
  encryptedData: string;
  emails: string[];
};

type User = {
  timestamp: number;
  address: string;
  token: string;
};

export const auth = onRequest(async (req, res) => {
  const {method, url} = req;
  logger.log({method, url}, {structuredData: true});

  switch (method) {
  case "GET": {
    const {query} = req;

    const {address} = query;
    if (typeof address !== "string") return;

    const oneMinAfter = Date.now() + 60000;
    const token = "HERITAGE" + getRandomHex() + getRandomHex();

    db.collection("auth")
      .doc(address)
      .set({
        address,
        timeOut: oneMinAfter,
        token,
      } as Auth)
      .then(() => {
        logger.log("Document successfully written!");
      })
      .catch((error: any) => {
        logger.error("Error writing document: ", error);
      });

    res.send({token});
    return;
  }
  }
});

export const encryptedData = onRequest(async (req, res) => {
  const {method, body} = req;
  logger.log({method, body});

  switch (method) {
  case "GET": {
    const {query} = req;

    const {address, signedToken} = query;
    if (!address || typeof address !== "string") return;

    if (
      !signedToken ||
        !(await verifySignedToken(address as string, signedToken as string))
    ) {
      res.sendStatus(401);
      return;
    }

    logger.debug({address, signedToken});

    const doc = await db.collection("encrypted-data").doc(address).get();

    const docData = doc.data() as EncryptedData;

    if (!docData) {
      res.sendStatus(403);

      return;
    }

    const key = await deriveKey(KEY);

    const encryptedData = await decryptText(key, docData.encryptedData);

    logger.debug({encryptedData});

    res.send({encryptedData, emails: docData.emails});
    return;
  }
  case "POST": {
    const data = body.data ? JSON.parse(body.data) : {};

    const {address, signedToken, encryptedData, emails} = data;

    if (
      typeof address !== "string" ||
        !signedToken ||
        !encryptedData ||
        !emails.length
    ) {
      return;
    }

    logger.debug({address, signedToken, encryptedData, emails});

    if (
      !(await verifySignerWithinTimeLimit(
          address as string,
          signedToken as string,
      ))
    ) {
      res.sendStatus(403);
      return;
    }

    const key = await deriveKey(KEY);

    const serverEncryptedData = await encryptText(key, encryptedData);

    logger.debug({serverEncryptedData});

    await db
      .collection("encrypted-data")
      .doc(address)
      .set({address, encryptedData: serverEncryptedData, emails});

    res.sendStatus(201);
    return;
  }
  }
});

export const user = onRequest(async (req, res) => {
  const {method, body, query} = req;
  logger.log({method, body, query});

  switch (method) {
  case "GET": {
    const {address, signedToken} = query;
    if (typeof address !== "string") return;

    if (!signedToken) {
      res.sendStatus(401);
      return;
    }

    if (
      !(await verifySignedToken(address as string, signedToken as string))
    ) {
      res.sendStatus(401);
      return;
    }

    const doc = await db.collection("user").doc(address).get();
    const docData = doc.data() as User;

    res.send({timestamp: docData.timestamp});
    return;
  }
  case "POST": {
    const data = body.data ? JSON.parse(body.data) : {};

    const {address, signedToken} = data;

    if (!address) return;

    let token;

    if (await verifySignedToken(address, signedToken)) {
      token = (await db.collection("user").doc(address).get()).data()?.token;
    } else if (await verifySignerWithinTimeLimit(address, signedToken)) {
      token = (await db.collection("auth").doc(address).get()).data()?.token;
    } else {
      res.sendStatus(401);
      return;
    }

    await db
      .collection("user")
      .doc(address)
      .set({
        timestamp: Date.now(),
        address,
        token,
      })
      .then(() => {
        logger.log("User document successfully written! Created new token.");
      })
      .catch((error: any) => {
        logger.error("Error writing document: ", error);
      });

    res.sendStatus(201);
    return;
  }
  }
});

export const ping = onRequest(async (req, res) => {
  const {method, query} = req;
  logger.log({method, query});

  switch (method) {
  case "GET": {
    const {address, signedToken} = query;
    if (typeof address !== "string") return;

    if (!signedToken) {
      res.sendStatus(401);
      return;
    }

    if (
      !(await verifySignedToken(address as string, signedToken as string))
    ) {
      res.sendStatus(401);
      return;
    }

    await db
      .collection("user")
      .doc(address)
      .set(
        {
          timestamp: Date.now(),
        },
        {merge: true},
      )
      .then(() => {
        logger.log("User document successfully written! Timestamp updated.");
      })
      .catch((error: any) => {
        logger.error("Error writing document: ", error);
      });

    res.sendStatus(201);
    return;
  }
  }
});

async function verifySignedToken(address: string, signedToken: string) {
  const doc = await db.collection("user").doc(address).get();

  const docData = doc.data() as User;

  if (!docData?.token) return;

  const signerAddress = await ethers.verifyMessage(
    docData.token,
    signedToken as string,
  );

  if (signerAddress !== address) {
    logger.error(
      `Address verification failed, ${signerAddress} !== ${address}`,
    );
    return;
  }

  return true;
}

// Time restricted
async function verifySignerWithinTimeLimit(
  address: string,
  signedToken: string,
) {
  const authDoc = await db.collection("auth").doc(address).get();

  const authData = authDoc.data() as Auth;

  if (!authData) return;

  const signerAddress = await ethers.verifyMessage(
    authData.token,
    signedToken as string,
  );

  if (signerAddress !== address) {
    logger.error(
      `Address verification failed, ${signerAddress} !== ${address}`,
    );
    return;
  }

  if (Date.now() > authData.timeOut) {
    logger.error("Token expired");
    return;
  }

  return true;
}

function getRandomHex() {
  return (Math.random() * 10 ** 17).toString(16);
}
