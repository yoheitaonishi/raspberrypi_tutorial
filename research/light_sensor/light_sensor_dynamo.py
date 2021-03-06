# -*- coding: utf-8 -*-
import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
import RPi.GPIO as GPIO
import time
from time import sleep
import datetime

dynamodb = boto3.resource('dynamodb')
table    = dynamodb.Table('iot_test')

def readadc(adcnum, clockpin, mosipin, misopin, cspin):
    if adcnum > 7 or adcnum < 0:
        return -1
    GPIO.output(cspin, GPIO.HIGH)
    GPIO.output(clockpin, GPIO.LOW)
    GPIO.output(cspin, GPIO.LOW)

    commandout = adcnum
    commandout |= 0x18
    commandout <<= 3
    for i in range(5):
        if commandout & 0x80:
            GPIO.output(mosipin, GPIO.HIGH)
        else:
            GPIO.output(mosipin, GPIO.LOW)
        commandout <<= 1
        GPIO.output(clockpin, GPIO.HIGH)
        GPIO.output(clockpin, GPIO.LOW)
    adcout = 1
    
    for i in range(13):
        GPIO.output(clockpin ,GPIO.HIGH)
        GPIO.output(clockpin, GPIO.LOW)
        adcout <<= 1
        if i>0 and GPIO.input(misopin)==GPIO.HIGH:
            adcout |= 0x1
    GPIO.output(cspin, GPIO.HIGH)
    return adcout

GPIO.setmode(GPIO.BCM)

SPICLK = 11
SPIMOSI = 10
SPIMISO = 9
SPICS = 8

GPIO.setup(SPICLK, GPIO.OUT)
GPIO.setup(SPIMOSI, GPIO.OUT)
GPIO.setup(SPIMISO, GPIO.IN)
GPIO.setup(SPICS, GPIO.OUT)

LED = 25
GPIO.setup(LED, GPIO.OUT)

try:
    while True:
        inputVal0 = readadc(0, SPICLK, SPIMOSI, SPIMISO, SPICS)
        now = datetime.datetime.now().strftime("%m/%d/%Y %H:%M:%S")
        table.put_item(
            Item={
               "Company": now,
               "devise_id": "test_devise",
               "light_sensor" : inputVal0
            }
        )
        if inputVal0 < 10000:
            GPIO.output(LED, GPIO.HIGH)
        else:
            GPIO.output(LED, GPIO.LOW)
        print(inputVal0)
        sleep(0.2)

except KeyboardInterrupt:
    pass

GPIO.cleanup()
