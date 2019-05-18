// タッチのサポート状況のチェック用変数
var support = {
    pointer: window.navigator.pointerEnabled,
    mspointer: window.navigator.msPointerEnabled,
    touch: 'ontouchstart' in window
};

// タッチの場合わけ。pointer系：IE11以降、MSPointer系：IE10、touch系：android、iPhone、iPad
var touchStart = support.pointer ? 'pointerdown' : 
                 support.mspointer ? 'MSPointerDown' : 'touchstart';
var touchMove =  support.pointer ? 'pointermove' : 
                 support.mspointer ? 'MSPointerMove' : 'touchmove';
var touchEnd =   support.pointer ? 'pointerup' : 
                 support.mspointer ? 'MSPointerUp' : 'touchend';

function initialize_webiopi(){
    // webiopiの準備が終わってからstyles.cssを適用する
    applyCustomCss('styles.css');

    // タッチエリアの設定
    var touchArea = $("#touchArea")[0];

    // タッチイベントのイベントリスナーの登録
    touchArea.addEventListener(touchStart, touchEvent, false);
    touchArea.addEventListener(touchMove, touchEvent, false);
    touchArea.addEventListener(touchEnd, touchEndEvent, false);

    // クリックイベントのイベントリスナーの登録
    touchArea.addEventListener("click", clickEvent, false);

    // GPIOの状態を監視しない
    webiopi().refreshGPIO(false);
}

// 前に送信したデューティー比を覚えておく
var rate25Prev = 0;
var rate24Prev = 0;

// デューティー比がth (0.0～1.0) 以上変化した時のみ値を送信
var th = 0.1;

// 命令送信ごとに増加するIDを作成（iOSのSafariでPOSTがキャッシュされることの対策）
var commandID=0;

// タッチ開始時とタッチ中のイベントリスナー
function touchEvent(e){
    e.preventDefault();

    // タッチ中のイベントのみ捕捉(IE)
    if(support.pointer || support.mspointer){
        if(e.pointerType != 'touch' && e.pointerType != 2){
            return;
        }
    }
    var touch = (support.pointer || support.mspointer) ? e : e.touches[0];
    var width = document.getElementById("touchArea").offsetWidth;

    if(touch.pageX<width/2){
        var rate = 0.7*(width/2-touch.pageX)/(width/2);
        if(Math.abs(rate-rate24Prev)>th){
            webiopi().callMacro("pwm2Write", [0, rate, commandID++]);
            rate25Prev = 0;
            rate24Prev = rate;
        }
    }else{
        var rate = 0.7*(touch.pageX-width/2)/(width/2);
        if(Math.abs(rate-rate25Prev)>th){
            webiopi().callMacro("pwm2Write", [rate, 0, commandID++]);
            rate25Prev = rate;
            rate24Prev = 0;
        }
    }
}

// タッチ終了時のイベントリスナー
function touchEndEvent(e){
    e.preventDefault();

    webiopi().callMacro("pwm2Write", [0, 0, commandID++]);
    rate25Prev = 0;
    rate24Prev = 0;
}

// クリック時のイベントリスナー（主にPC用）
function clickEvent(e){
    e.preventDefault();

    // タッチによるクリックは無視(IE)
    if(support.pointer || support.mspointer){
        if(e.pointerType == 'touch' || e.pointerType == 2){
            return;
        }
    }
    var width = document.getElementById("touchArea").offsetWidth;

    if(e.pageX>=2*width/5 && e.pageX<3*width/5){
        webiopi().callMacro("pwm2Write", [0, 0, commandID++]);
        rate25Prev = 0;
        rate24Prev = 0;
    }else if(e.pageX<width/2){
        var rate = 0.7*(width/2-e.pageX)/(width/2);
        webiopi().callMacro("pwm2Write", [0, rate, commandID++]);
        rate25Prev = 0;
        rate24Prev = rate;
    }else{
        var rate = 0.7*(e.pageX-width/2)/(width/2);
        webiopi().callMacro("pwm2Write", [rate, 0, commandID++]);
        rate25Prev = rate;
        rate24Prev = 0;
    }
}

function applyCustomCss(custom_css){
    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('link');
    style.rel = "stylesheet";
    style.type = 'text/css';
    style.href = custom_css;
    head.appendChild(style);
}
