#!/usr/bin/env python
# -*- coding: utf-8 -*-

from gevent import monkey; monkey.patch_all()  # NOQA

import json
import logging
import sys
import signal
import os

from base64 import b64encode

import gevent
import paho.mqtt.client as mqtt

from gevent.queue import Queue


import settings


class MQTTClient(object):
    def __init__(self, host, port, username, password,
                 topic_down, topic_up):
        self.topic_up = topic_up
        self.topic_down = topic_down

        self.downlink_request_queue = Queue()
        self.uplink_queue = Queue()
        self.downlink_queue = Queue()

        self.factory = {'downlink_request': self.downlink_request_queue,
                        'uplink': self.uplink_queue,
                        'downlink': self.downlink_queue}
        self.connected = False
        self.subscribed = False

        try:
            self.client = mqtt.Client(clean_session=True)
            self.client.on_message = self.on_message
            self.client.on_connect = self.on_connect
            self.client.on_subscribe = self.on_subscribe

            if username:
                self.client.username_pw_set(username, password)

            self.client.connect(host, int(port))
            self.client.subscribe(topic_down, qos=1)
            self.client.loop_start()
        except:
            del self.client
            logging.exception("MQTT Client connection faild")
            raise

    def on_connect(self, client, userdata, flags, rc):
        if rc == mqtt.MQTT_ERR_SUCCESS:
            self.connected = True
            logging.info('MQTT client was successfully connected')

    def on_subscribe(self, client, userdata, mid, granted_qos):
        self.subscribed = True
        logging.info('MQTT client was successfully subscribed to %s' % self.topic_down)

    def on_message(self, client, userdata, msg):
        message = msg.payload
        try:
            packet = json.loads(message)

            queue = self.factory.get(packet['type'])

            if queue:
                queue.put(packet)
        except:
            pass

    def pub(self, message):
        try:
            rc = self.client.publish(self.topic_up, message)[0]

            if rc == mqtt.MQTT_ERR_NO_CONN:
                logging.error('Message can\'t pushed. MQTT client disconnected')
            elif rc != mqtt.MQTT_ERR_SUCCESS:
                logging.error('Could not send message to channel %s' % self.topic_up)
            else:
                logging.info('Massage successful pushed to MQTT broker')
        except Exception as e:
            logging.exception(e)


def gen_payload():
    return os.urandom(6).encode('hex')


def make_downlink_response(downlink_request):
    # Make Payload
    payload = gen_payload()

    downlink_response = {'type': 'downlink_response',
                         'meta': downlink_request['meta'],
                         'params': {
                            'port': 10,
                            'counter_down': downlink_request['params']['counter_down'],
                            'payload': b64encode(payload)}}
    return json.dumps(downlink_response)


def handle_downlink_request(mqtt_client):
    while True:
        downlink_request = mqtt_client.downlink_request_queue.get()

        logging.info("Received downlink request message: {}".format(downlink_request))

        downlink_response = make_downlink_response(downlink_request)
        mqtt_client.pub(downlink_response)


def handle_downlink(mqtt_client):
    while True:
        downlink = mqtt_client.downlink_queue.get()
        logging.info("Received downlink message: {}".format(downlink))


def handle_uplink(mqtt_client):
    while True:
        uplink = mqtt_client.uplink_queue.get()
        logging.info("Received uplink message: {}".format(uplink))


if __name__ == '__main__':
    logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s', level=logging.INFO)

    def stop_all(*args):
        logging.info("Exiting...")
        sys.exit()

    gevent.signal(signal.SIGHUP, stop_all)
    gevent.signal(signal.SIGINT, stop_all)

    # NOTE: Entrypoint create the client
    mqtt_client = MQTTClient(host=settings.HOST,
                             port=settings.PORT,
                             username=settings.USERNAME,
                             password=settings.PASSWORD,
                             topic_down=settings.TOPIC_DOWN,
                             topic_up=settings.TOPIC_UP)

    # Run handlers
    gevent.spawn(handle_uplink, mqtt_client)
    gevent.spawn(handle_downlink, mqtt_client)
    gevent.spawn(handle_downlink_request, mqtt_client)

    while True:
        gevent.sleep(1)
