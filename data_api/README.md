# Application Server

The Application Server uses the DataAPI interface for communication with NS.
Look at the following diagram, to simplify understanding the exchange data between the services:

![](/assets/as.png)

Before use of this Application Server you should execute follow steps:
1. Create Key in Network Server web interface.
2. Create Filter in Network Server web interface.
3. Configure the Application Server.

## Configuration
Open the file `./src/main.js` and edit the object `config`

The `config` contains the following params:


| Parameter    | Description                                                                                            |
|--------------|--------------------------------------------------------------------------------------------------------|
| UrlDataAPI   | Url of Data API                                                                                        |
| accessToken  | The access_token, which provides access to your network server                                         |
| filtedId     | The identifier of filter, with which you can limit the flow of messages from Data API                  |
| network      | Identifier of network (is used only to send data to device class C)                                    |
| device       | The device identifier, dev\_eui by LoraWAN specification (is used only to send data to device class C) |


## Getting started
The simplest way to run the AS  - open https://jsfiddle.net/erwert/u3ccf8vm/

First, clone the project:

```bash
$ git clone git@github.com:everynet/app.example.git <project-name>
$ cd <project-name>
```

Then, install the dependencies. It is recommended to use Yarn. You can still use npm as well.

```bash
$ yarn install # or npm install
```

To start the server execute the follow command:

```bash
$ yarn run start
```

Open in your favorite browser:

http://localhost:8080/


## Script usage

You can execute the scripts below by `yarn run <script>` or `npm run <script>`.

| Command        | Description                                                   |
|----------------|---------------------------------------------------------------|
| start          | Starts webpack development server; served at `localhost:8080` |
| build          | Bundles the source in `./dist/js/` directory                  |
