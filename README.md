# Coeus : A simple postman for audio recognition

Coeus, which is a Titan of inquisitve minds and intellect, he can really know anything!

## Getting Started

For the sake of simplicity of the project, you just need to have a working computer, a reliable internet connection and fingers to tape!

### Prerequisites

You just need to have the Node.js Engine which you can download from here: https://nodejs.org/en/

Also, to be able to work with the APIs, you need to register yourself to get their authentication keys which is really easy!

AudioTag: https://audiotag.info/
LastFm: https://www.last.fm/home

## Setting up the API

### Configuring

For the configuration process, you need to create a .env file for API tokens or keys.

- In Windows
  - CMD
    ```cmd
    cd coeus
    echo NULL > .env
    ```
  - Powershell
    ```powershell
    cd coeus
    New-Item -Path '\\fs\Shared\NewFolder\newfile.txt' -ItemType File
    ```
- In Linux Distros or Mac
  - Bash
    ```bash
    cd coeus
    touch .env
    ```

In the .env file, you need to define two constants.

```.env
AUDIOTAG_KEY=[YOUR_API_KEY]
LASTFM_KEY=[YOUR_API_KEY]
```

### Installing

To install all the required dependencies, you just need to run this command.

```npm
npm install
```

Voilà!

## Deployment

### Starting as a Client Server

To serve it as a final product server, run this command:

```npm
npm start
```

### Starting as a Development Server

To debug it lively, you are going to need **nodemon** which will be already installed in your dependencies. But to start it, run this:

```npm
npm run dev
```

## Built With

- [Axios](https://github.com/axios/axios) - The HTTP Postman
- [Express](https://expressjs.com/) - The API manager
- [MongoDB](https://www.mongodb.com/) - Used to store the cache matchs
- [AudioTag](https://audiotag.info/) - The backbone of the project, the audio recognizer API
- [LastFM](https://www.last.fm/home) - The API for getting the cover image of a track

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

- **Roni Kolukısayan**

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

I'm not sure what to write here, lol!
