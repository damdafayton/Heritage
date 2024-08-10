/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import {
  getRandomHex,
  verifySignedToken,
  verifySignerWithinTimeLimit,
} from "./utils";

import {onRequest} from "firebase-functions/v2/https";
import * as functions from "firebase-functions";

const {logger} = functions;

import {getFirestore} from "firebase-admin/firestore";

export * from "./cron-triggers";
export * from "./user";

const db = getFirestore();

import {deriveKey, encryptText, decryptText} from "../../src/utils/cryptos";

import {
  appCheckPlugin,
  corsPlugin,
  onRequestWithGuards,
  setCORS,
  setCORSResponse,
} from "./middleware";
// import {pushToTriggerPing} from './cron-triggers';

const KEY = "HELLO_WORLD";

export const testAuth = onRequestWithGuards(
  corsPlugin,
  appCheckPlugin,
  async (req, res) => {
    // await pushToTriggerPing();
    res.send("Hello from Firebase!");
  },
);

export const auth = onRequestWithGuards(
  corsPlugin,
  appCheckPlugin,
  async (req, res) => {
    logger.log("node env:", process.env.NODE_ENV);

    const {method, url} = req;
    logger.log({method, url}, {structuredData: true});

    switch (method) {
    case "GET": {
      const {query} = req;

      const {address} = query;
      if (typeof address !== "string") return;

      const oneMinAfter = Date.now() + 60000;
      const token = "HERITAGE" + getRandomHex() + getRandomHex();

      await db
        .collection("auth")
        .doc(address)
        .set({
          address,
          timeOut: oneMinAfter,
          token,
        } as Auth)
        .then(() => {
          logger.log("AUTH document successfully written!");
        })
        .catch((error: any) => {
          logger.error("Error writing document: ", error);
        });

      res.send({token});
      return;
    }
    }
  },
);

export const encryptedData = onRequestWithGuards(
  corsPlugin,
  async (req, res) => {
    setCORS(res);

    // respond to CORS preflight requests
    if (req.method == "OPTIONS") {
      setCORSResponse(res);
      return;
    }

    const {method, body} = req;
    logger.log({method, body});

    switch (method) {
    case "GET": {
      const {query} = req;

      const {address, signedToken, inheritorEmail, inheritorKey} = query;

      if (inheritorKey) {
        // Inheritor is requesting encrypted data
        const doc = await db
          .collection("encrypted-data")
          .where("inheritorKey", "==", inheritorKey)
          ?.get();

        if (
          doc.empty ||
            !doc.docs[0].data()?.emails?.includes(inheritorEmail)
        ) {
          res.sendStatus(403);

          return;
        }

        const key = await deriveKey(KEY);

        const encryptedData = await decryptText(
          key,
          doc.docs[0].data().encryptedData,
        );

        res.send({encryptedData});

        return;
      } else {
        // Inheritee is updating
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
  },
);

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
        logger.log("USER document successfully updated with timestamp!");
      })
      .catch((error: any) => {
        logger.error("Error writing document: ", error);
      });

    res.sendStatus(201);
    return;
  }
  }
});
