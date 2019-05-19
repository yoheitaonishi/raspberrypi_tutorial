## 抵抗は不要説

http://jellyware.jp/kurage/raspi/daiso_sensorlight.html

これだとラズパイに直接つなぐことができる

> ラズパイのプルアップ抵抗値は50kΩくらいとのことです

はじめからプルアップ抵抗が存在しているので、不要なのか...?

https://hnw.hatenablog.com/entry/20150607

ラズパイのプルアップ抵抗についてはこちらがすごい有り難み

一度この内容で動かしてみる。

```
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
```

ブレッドボードを介して`GND`と`PWM0(18)`とドアセンサーをつないだだけだが、うまく動作しなかった。
結果としてはずっとOpenとなる
