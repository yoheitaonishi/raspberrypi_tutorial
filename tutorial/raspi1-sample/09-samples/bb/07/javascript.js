// スライダの最小値、最大値、刻み幅、初期値
var sliderMin = 0;
var sliderMax = 20;
var sliderStep = 1;
var sliderValue0 = sliderMax/2;
var sliderValue1 = sliderMax/2;

// 命令送信ごとに増加するIDを作成（iOSのSafariでPOSTがキャッシュされることの対策）
var commandID=0;

function initialize_webiopi(){
    // webiopiの準備が終わってからstyles.cssを適用する
    applyCustomCss('styles.css');

    // GPIOの状態を監視しない
    webiopi().refreshGPIO(false);
}

// jQuery UIによるスライダの設定
$(function() {
    // スライダを動かしたときに呼ばれるイベントハンドラの設定
    var sliderHandler0 = function(e, ui){
        var ratio = ui.value/sliderMax;
        // サーボの回転の向きを逆にしたい場合次の行を無効に
        ratio = 1.0 - ratio;
        webiopi().callMacro("setHwPWM", [0, ratio, commandID++]);
    };
    var sliderHandler1 = function(e, ui){
        var ratio = ui.value/sliderMax;
        // サーボの回転の向きを逆にしたい場合次の行を無効に
        ratio = 1.0 - ratio;
        webiopi().callMacro("setHwPWM", [1, ratio, commandID++]);
    };

    // スライダへ設定を適用
    $( "#slider0_servo" ).slider({
        min: sliderMin,
        max: sliderMax,
        step: sliderStep,
        value: sliderValue0,
        change: sliderHandler0,
        slide: sliderHandler0
    });
    $( "#slider1_servo" ).slider({
        min: sliderMin,
        max: sliderMax,
        step: sliderStep,
        value: sliderValue1,
        change: sliderHandler1,
        slide: sliderHandler1
    });
});

function applyCustomCss(custom_css){
    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('link');
    style.rel = "stylesheet";
    style.type = 'text/css';
    style.href = custom_css;
    head.appendChild(style);
}
