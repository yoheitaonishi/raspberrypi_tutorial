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


これはドアセンサーの種類が異なることに気がついた  
現状、pinの内容と、抵抗について理解できていない


## pinの内容

再度ラズパイのピンについて

![pin]('./images/pin.png')

https://note.mu/imaimai/n/n7cb16c98d2d4

> Day3.のセンサの選び方でも書いたとおりマイコンとセンサをつなぐプロトコルが各センサごとに決められていて、きちんと把握していないと正常に動作しない。両側で仕様書(ピンアサイン)を見て、把握する必要があります。

仕様書ちゃんとある？なんか秋月ないんだけど。

## 抵抗の計算方法

と思って色々と試してたらうまくいった  
ブレッドボードのジャンパー必要なところに指してたのに、ジャンパー使ってなかったからだった  
そのため、元記事と同じようにブレッドボード不要で、耐熱のでぐるぐる巻きにした方がよさそう

秋月のピンアサインにもあまり情報がなかったのは、何もしなくても動くということだったんだろうか...?
