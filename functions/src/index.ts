import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://joker-7ee5e.firebaseio.com"
});

const db = admin.firestore();

export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({ value: 'Hello from firebase functions !!!!!' });
});

export const getMovies = functions.https.onRequest( async (request, response) => {
  const movieRef = db.collection('joker');
  const docsSnap = await movieRef.get();
  const movies = docsSnap.docs.map( doc => doc.data() );
  response.json(movies);
});

// express server creation
const app = express();
app.use( cors({ origin: true }));

app.get('/movies', async (req, res) => {
  const movieRef = db.collection('joker');
  const docsSnap = await movieRef.get();
  const movies = docsSnap.docs.map( doc => doc.data() );
  res.json(movies);
});

app.post('/movies/:id', async (req, res) => {
  const id = req.params.id;
  let movieRef = db.collection('joker').doc(id);
  let movieSnap = await movieRef.get();

  if (!movieSnap.exists) {
    res.status(404).json({
      ok: false,
      message: `Movie with id: ${id} does not exist`
    });
  } else {
    const before = movieSnap.data() || {votes: 0};
    await movieRef.update({
      votes: before.votes + 1
    });
    
    res.json({
      ok: true,
      message: `Thanks for voting for: ${before.name}`
    })
  }

});

export const api = functions.https.onRequest(app);