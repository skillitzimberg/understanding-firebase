import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as puppeteer from 'puppeteer';
import { Bot } from './bot';
import { caseData } from './data';

admin.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Cloud Firestore using the Firebase Admin SDK.
  const writeResult = await admin
    .firestore()
    .collection('efile_operations')
    .add({ original: original });
  // Send back a message that we've succesfully written the message
  res.json({ result: `Operation with ID: ${writeResult.id} added.` });
});

export const onNewEfile = functions.firestore
  .document('/efile_operations/{documentId}')
  .onCreate(async (snap, context) => {
    try {
      await runBot();
    } catch (e) {
      console.log(`runEFile error caught: ${e}`);
    }
  });

async function runBot() {
  console.log('Starting bot');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: false,
    // handleSIGINT: false,
    // handleSIGTERM: false,
    // handleSIGHUP: false,
    slowMo: 50,
    // devtools: true
  });
  const page = await browser.newPage();
  const bot: Bot = new Bot(browser, page);
  try {
    const draftId = await bot.run(caseData);
    console.log(`Draft ID: ${draftId}`);

    await browser.close();
  } catch (e) {
    console.log(`runBot error caught: ${e}`);

    await browser.close();
  }
}
