# -*- coding: utf-8-*-
import RPi.GPIO as GPIO
from time import sleep

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

GPIO.setup(25, GPIO.OUT)
GPIO.setup(24, GPIO.OUT)
p0 = GPIO.PWM(25, 50)
p1 = GPIO.PWM(24, 50)
p0.start(0)
p1.start(0)

adc_pin0 = 0

try:
    while True:
        inputVal0 = readadc(adc_pin0, SPICLK, SPIMOSI, SPIMISO, SPICS)-8000 # I can't understand why I need -4000
        print(inputVal0)
        if inputVal0 > 100 and inputVal0 < 2048:
            print(1)
            p1.ChangeDutyCycle(0)
            duty = (2048-inputVal0)*70/2048
            p0.ChangeDutyCycle(duty)
        elif inputVal0 >= 2048 and inputVal0 < 4000:
            print(2)
            p0.ChangeDutyCycle(0)
            duty = (inputVal0-2048)*70/2048
            p1.ChangeDutyCycle(duty)
        sleep(0.5)

except KeyboardInterrupt:
    pass

p0.stop()
p1.stop()
GPIO.cleanup()
