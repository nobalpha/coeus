//Project Name: Coeus
//TODO DB stats ile şık bir site tasarımı
//TODO: Caching belki... (Done)
//TODO: Error sanitaization
//TODO: Definetly a README file explaining every single detail
//TODO: EJS file render
//TODO: Siteden kayıt etme fonksiyonu veya drag'n'drop ya da yükleme özelliği
//TODO: Type conversion to MP3 (Done)
//TODO: Temp folder creation (Done)

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const md5 = require("md5");
const mongo = require("mongodb");
const FileType = require("file-type");

const {
  initObjects,
  callbackSequencer,
  trimAudio,
  queryCover,
  queryResult,
  identifyAudio,
  bufferToFile,
  readFile,
  createTempFolder,
  deleteTempFolder,
  mediaConverter,
} = require("./functions");

// Database setup

const db_uri = "mongodb://localhost:27017/cache";
const client = new mongo.MongoClient(db_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const launchServer = () => {};

const upload = multer();

const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/data", upload.single("filename"), async (req, resp) => {
  // console.log(req.file);

  console.log("Firing API");

  const file = req.file;

  file.type = (await FileType.fromBuffer(file.buffer)).ext;
  console.log(file.type);

  const temp_folder = await createTempFolder();
  console.log(await temp_folder);

  await bufferToFile(`./${temp_folder}/source.${file.type}`, file.buffer);

  await mediaConverter(temp_folder, file.type);

  await callbackSequencer(
    trimAudio,
    8000, // need to wait a little for conversion [there is a little bug in the media-converter; it resolves the promise without the completion of the conversion]
    `./${temp_folder}/source.mp3`,
    `./${temp_folder}/target.mp3`
  );

  // await trimAudio(`./${temp_folder}/source.mp3`, `./${temp_folder}/target.mp3`);

  const hashed = md5(await readFile(`./${temp_folder}/target.mp3`));
  console.log(`MD5 HASH : ${hashed}`);

  await client.connect();

  const cache_db = client.db("Coeus").collection("cache");

  let result = await cache_db
    .find({
      buffer: hashed,
    })
    .toArray();

  console.log(result);

  if (!result.length) {
    console.log("Couldn't find any cached records...");

    // identifyAudio(path.join(__dirname, "source.mp3"))
    const identify_res = await callbackSequencer(
      identifyAudio,
      2000,
      `./${temp_folder}/target`
    );

    const result_res = await callbackSequencer(
      queryResult,
      2000,
      identify_res.data.token
    );

    console.log(result_res.data);

    if (result_res.data.result !== "not found") {
      const match = result_res.data.data[0].tracks[0];

      [
        match_name,
        //match_album,
        //match_year,
      ] = match;

      console.log(`Found the corresponding music: ${match_name}`);
      cache_db.insertOne(
        {
          buffer: hashed,
          name: match_name,
        },
        (err, res) => {
          if (err) throw err;
          console.log(`1 document insterted : ${res}`);
        }
      );
    } else {
      console.log("Track not found.");
      resp.send("<h1>Track not found.</h1>");
    }
  } else {
    console.log(`Found something : ${result}`);
    match_name = result[0].name;
  }

  if (match_name) {
    const cover_res = await queryCover(match_name);

    const banner =
      cover_res.data.results.albummatches.album[0].image[3]["#text"];
    if (banner) resp.send(`<img src="${banner}">`);
  } else {
    resp.send("<h1>Track not found.</h1>");
  }
  await deleteTempFolder(temp_folder);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

//TODO: Function export
