import webiopi
import time
import wiringpi

def getServoDutyForWebIOPi(val):
    val_min = 0.0
    val_max = 1.0
    servo_min = 36   # 50Hz(周期20ms)、デューティ比3.5%: 3.5*1024/100=約36
    servo_max = 102  # 50Hz(周期20ms)、デューティ比10%: 10*1024/100=約102

    duty = int((servo_max-servo_min)*(val-val_min)/(val_max-val_min) + servo_min)
    return duty

wiringpi.wiringPiSetupGpio() # GPIO名で番号指定
wiringpi.pinMode(18, wiringpi.GPIO.PWM_OUTPUT)
wiringpi.pinMode(19, wiringpi.GPIO.PWM_OUTPUT)
wiringpi.pwmSetMode(wiringpi.GPIO.PWM_MODE_MS) # 周波数固定
wiringpi.pwmSetClock(375) # 50 Hz
wiringpi.pwmWrite(18, getServoDutyForWebIOPi(0.5))
wiringpi.pwmWrite(19, getServoDutyForWebIOPi(0.5))

# デバッグ出力を有効に
webiopi.setDebug()

# WebIOPiの起動時に呼ばれる関数
def setup():
    webiopi.debug("Script with macros - Setup")

# WebIOPiにより繰り返される関数
def loop():
    webiopi.sleep(5)

# WebIOPi終了時に呼ばれる関数
def destroy():
    webiopi.debug("Script with macros - Destroy")

# PWMにデューティー比をセットするためのマクロ
# commandIDは、iOSのSafariでPOSTがキャッシュされることへの対策
@webiopi.macro
def setHwPWM(servoID, duty, commandID):
    id = int(servoID)
    duty = getServoDutyForWebIOPi(float(duty))
    if id==0:
        wiringpi.pwmWrite(18, duty)
    elif id==1:
        wiringpi.pwmWrite(19, duty)
