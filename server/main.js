const fs = require("fs");
const config = require("./config.json");

const {GoogleAuth} = require('google-auth-library');
// const APIKey = `AIzaSyDRSAKlkkvQOf0_Ilb7hI-_LFz_zFZejmI`;
// const auth = new GoogleAuth({
//   scopes: 'https://www.googleapis.com/auth/drive',
//   apiKey: APIKey,
// });

// async function downloadFile(url) {
//   try {
//     const service = google.drive({version: 'v3', auth});
//     const fileId = url.match(/\/d\/(.*?)\/view/)?.[1];
//     const file = await service.files.get({
//       fileId,
//       alt: 'media',
//     });
//     return file;
//   } catch (err) {
//     console.log(err);
//   }
// }


const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const axios = require("axios");
const db_url = `mongodb+srv://SonofBandera:${config.db_password}@spotimine.qjiypyg.mongodb.net/?retryWrites=true&w=majority&appName=Spotimine`;
let database;
let songs;


const client = new MongoClient(db_url, {
  serverApi: {
    version: ServerApiVersion.v1, 
    strict: true,
    deprecationErrors: true,
  }
})

async function connect() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("logged in")
    database = client.db("Spotimine");
    songs = database.collection("music");
  } catch (err) {
    console.log(err);
  }
}
connect();

app.use("/songs", express.static(`${__dirname}/../spotimine/songs`));
app.use("/src", express.static(`${__dirname}/../spotimine/src`));
app.use(express.static(`${__dirname}/../spotimine/dist`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post("/track", async (req, res) => {
  try {
    let { song_name, from_album, song_path, artist, date_created, song_link, image_link} = req.body
    if (!date_created) {
        date_created = "2001-09-11"
    }
    const result = await songs.insertOne(req.body)
    res.send(result)
  } catch (err) {
    console.log(err)
  }
   
});

app.get("/track", async (req, res) => {
  try {
    if (req.query.text == "*") {
      const results = await songs.find().toArray()
      res.send(results)
      return
    }
    const results = await songs.find({ song_name: { $regex: `^${req.query.text[0]}`, $options: `i` } }).toArray();

    // const promiseArr = queryResults.map( (el, id) => {
    //   return downloadFile(el.song_link);
    // });
    // const results = await Promise.all(promiseArr);
    // console.log(results[0].response.data)
    res.send(results)
  } catch (err) {
    console.log(err)
  }    
});

app.get("/add_tracks", (req, res) => {
    let page = fs.readFileSync("../spotimine/dist/index.html", "utf-8");
    res.setHeader("Content-Type", "text/html");
    res.send(page);
})


app.listen(config.port, () => {
    console.log("the server is up and running");
});

