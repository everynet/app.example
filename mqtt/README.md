# Application Server

The Application Server uses the MQTT interface for communication with NS.
Look at the following diagram, to simplify understanding the exchange data between the services:

![](/assets/mqtt.png)

Before use of this Application Server you should execute follow steps:
1. Create Filter in Network Server web interface.
2. Create Connection with type: MQTT in Network Server web interface.
3. Configure the Application Server.

## Configuration
Open the file `settings.py` and edit fields

The `settings.py` contains the following params:


| Parameter    | Description                                                                                            |
|--------------|--------------------------------------------------------------------------------------------------------|
| HOST   | The host of your MQTT Broker                                                    |
| PORT  | The port of your MQTT Broker                                                     |
| USERNAME     | Username, If you use authorization then set this field, else set to: None |
| PASSWORD     | Password, If you use authorization then set this field, else set to: None |
| TOPIC\_DOWN  | The topic name for messages from Network Server |
| TOPIC\_UP  | The topic name for messages to Network Server|


## Getting started
First, install dependencies:
1. `python2.7`
2. `pip`

Second step, clone the project:

```bash
$ git clone git@github.com:everynet/app.example.git <project-name>
$ cd <project-name>
```

Then, install the dependencies.

```bash
$ pip install -r requirements.txt
```

To start the server execute the follow command:

```bash
$ python server.py
```

## Usage
After you running the script: `server.py` you should see in stdout message from NS and message to NS.
This example of Application Server processing the following message types: `uplink`, `downlink_request`, `downlink`.
Also this example sends to Network Server `downlink_response` for each `downlink_request`.

If you want to add some logic to this example you can override the methods: `handle_downlink_request`, `handle_uplink`, `handle_downlink` in the file: `server.py`.
