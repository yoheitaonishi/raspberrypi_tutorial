import time
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)

GPIO.setup(18, GPIO.IN, pull_up_down=GPIO.PUD_UP)

sw_status = 1

while True:
    try:
        sw_status= GPIO.input(18)
        print(sw_status)
        if sw_status == 0:
            print('Close')
        else:
            print('Open!')

        time.sleep(0.03)

    except:
        break

GPIO.cleanup()
print('end')
