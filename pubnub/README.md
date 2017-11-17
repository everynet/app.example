# PubNub Application Server

The PubNub Application Server uses the PubNub service for communication with NS.  
Look at the following diagram, to simplify understanding the exchange data between the services:

![](/assets/pubnub.png)

Before use of this Application Server you should execute follow steps:
1. Create Keyset in your PubNub account.
2. Create PubNub Connection in Network Server web interface.
3. Configure the Application Server.

## Configuration
Open the file `./src/main.js` and edit the object `config`

The `config` contains the following params:


| Parameter    | Description                                                                                            |
|--------------|--------------------------------------------------------------------------------------------------------|
| publishKey   | The PubNub publish key                                                                                 |
| subscribeKey | The PubNub subscribe key                                                                               |
| channelUp    | Channel for messages from network server                                                               |
| channelDown  | Channel for messages to network server                                                                 |
| network      | Identifier of network (is used only to send data to device class C)                                    |
| device       | The device identifier, dev\_eui by LoraWAN specification (is used only to send data to device class C) |


## Getting started
The simplest way to run the AS  - open https://jsfiddle.net/erwert/6qzrgkor/

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
| start          | Starts webpack development server; served at `localhost:8000` |
| build          | Bundles the source in `./dist/js/` directory                  |
