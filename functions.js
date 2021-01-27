const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const mm = require("music-metadata");
const MP3Cutter = require("mp3-cutter/lib/cutter");
const converter = require("media-converter");

const initObjects = () => {
  const data = new FormData();
  data.append("apikey", process.env.AUDIOTAG_KEY);

  var config = {
    method: "post",
    url: "https://audiotag.info/api",
    headers: {
      "Content-Type": "multipart/form-data",
      ...data.getHeaders(),
    },
    data: data,
  };

  return {
    data,
    config,
  };
};

const deleteTempFolder = (folder) => {
  return new Promise((resolve, reject) => {
    fs.rmdir(`./${folder}`, { recursive: true }, (err) => {
      if (err) reject(err);
      resolve(true);
    });
  });
};

const createTempFolder = () => {
  return new Promise((resolve, reject) => {
    fs.mkdtemp("tmp-", (err, folder) => {
      if (err) reject(err);
      resolve(folder);
    });
  });
};

const mediaConverter = (temp_folder, file_type) => {
  return new Promise((resolve, reject) => {
    converter(
      `./${temp_folder}/source.${file_type}`,
      `./${temp_folder}/source.mp3`,
      (err) => {
        if (err) reject(err);
        resolve(true);
      }
    );
  });
};

const readFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const callbackSequencer = (callback, time, ...args) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(callback(...args));
    }, time);
  });

const trimAudio = (...[ppath, tpath]) => {
  return new Promise(async (resolve, reject) => {
    console.log("metadata");
    console.log(ppath);
    const metadata = await mm.parseFile(`${ppath}`);
    console.log(metadata);
    const duration = metadata.format.duration;
    console.log(duration);
    if (duration > 20) {
      // x = (d-seq) / 2
      // x -> start_sec
      // d -> duration
      // seq -> sequence duration (20s)
      const seq = 20;
      const x = Math.floor((duration - seq) / 2);
      console.log("cutting");
      MP3Cutter.cut({
        src: `${ppath}`,
        target: `${tpath}`,
        start: x,
        end: x + seq,
      });
    }
    console.log("Trim audio ended...");
    resolve(true);
  });
};

const identifyAudio = async (...[name]) => {
  const { data, config } = initObjects();
  data.append("action", "identify");

  data.append("file", fs.createReadStream(`${name}.mp3`));

  return axios(config);
};

const queryResult = (...[token]) => {
  const { data, config } = initObjects();
  data.append("action", "get_result");
  data.append("token", token);

  return axios(config);
};

const queryCover = (match_name) => {
  // https://ws.audioscrobbler.com/2.0/?method=album.search&
  // album=imagine dragons believer&
  // api_key=726acf3b9ed4c44b6f42142b8245090b&format=json

  var config = {
    method: "get",
    url: "https://ws.audioscrobbler.com/2.0/",
    params: {
      method: "album.search",
      album: match_name,
      api_key: process.env.LASTFM_KEY,
      format: "json",
    },
  };
  return axios(config);
};

const bufferToFile = (path, buffer) => {
  return new Promise((resolve, reject) => {
    console.log("bufferToFile");
    fs.writeFile(`${path}`, buffer, (err) => {
      if (err) reject(err);
      console.log(`${path} buffer has been successfully wrote!`);
      console.log("Buffer write ended...");
      resolve(true);
    });
  });
};

/**
  * Action:Identify Sucess JSON
  {
    success: true,
    error: null,
    token: (...),
    start_time: 0,
    time_len: 241,
    job_status: "wait",
  };
  
  * Action:Get_Result Sucess JSON
  {
    (...),
    data: [
      {
        time: "0 - 236",
        confidence: 760,
        tracks: [
          ["Imagine Dragons -Shots", "Bravo Hits (CD Series)", "Vol. 89", 2015],
        ],
      },
      (...)
    ],
  }
  
  * {"tracks":["Imagine Dragons - Shots","Bravo Hits (CD Series)","Vol. 89",2015]}
  *           \-> [match_name, match_album, match_year]
  
  
  * Last.fm Cover Return JSON
  {
    results: {
      (...),
      albummatches: {
        album: [
          {
            name: "Believer",
            artist: "Imagine Dragons",
            url:
              "https://www.last.fm/music/Imagine+Dragons/Believer",
            image: [
              (...),
              {
                "#text":
                  "https://lastfm.freetls.fastly.net/i/u/300x300/fbb55dcc63f0a4369e29605c4ab5ddc0.png",
                size: "extralarge",
              },
            ],
            streamable: "0",
            mbid: "",
          },
        ],
      },
      (...)
    },
  }
  **/

module.exports = {
  initObjects: initObjects,
  callbackSequencer: callbackSequencer,
  trimAudio: trimAudio,
  queryCover: queryCover,
  queryResult: queryResult,
  identifyAudio: identifyAudio,
  bufferToFile: bufferToFile,
  readFile: readFile,
  createTempFolder: createTempFolder,
  deleteTempFolder: deleteTempFolder,
  mediaConverter: mediaConverter,
};
