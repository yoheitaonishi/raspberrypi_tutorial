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

    resize_canvas();

    // タッチエリアの設定
    var touchArea = $("#touchArea")[0];

    // タッチイベントのイベントリスナーの登録
    touchArea.addEventListener(touchStart, touchEvent, false);
    touchArea.addEventListener(touchMove, touchEvent, false);
    touchArea.addEventListener(touchEnd, touchEndEvent, false);

    // クリックイベントのイベントリスナーの登録
    touchArea.addEventListener("click", clickEvent, false);

    // Firefoxで画面の回転を検出
    var mqOrientation = window.matchMedia("(orientation: portrait)");
    mqOrientation.addListener(function() {
        resize_canvas();
    });

    // ウインドウサイズの変更を検出
    window.addEventListener('resize', function (event) {
        resize_canvas();
    });

    // GPIOの状態を監視しない
    webiopi().refreshGPIO(false);
}

// iOSで画面の回転を検出
window.onorientationchange = function()
{
    var iR = Math.abs( window.orientation );
    if ( iR == 0 || iR == 90 ){
        resize_canvas();
    }
}

// 前に送信したデューティー比を覚えておく
var rate25Prev = 0;
var rate24Prev = 0;
var rate23Prev = 0;
var rate22Prev = 0;

// デューティー比がth (0.0～1.0) 以上変化した時のみ値を送信
var th = 0.1;
// モーターの最大速度 (0.0～1.0)。モーターを保護する意味で1.0にはしない方が良い
var maxSpeed = 0.8;
// 命令送信ごとに増加するIDを作成（iOSのSafariでPOSTがキャッシュされることの対策）
var commandID = 0;

var mTouchWidth;
var mTouchHeight;
var mTouchOffsetTop;
var mTouchOffsetLeft;

function touchEvent(e){
    e.preventDefault();

    // タッチ中のイベントのみ捕捉(IE)
    if(support.pointer || support.mspointer){
        if(e.pointerType != 'touch' && e.pointerType != 2){
            return;
        }
    }
    var touch = (support.pointer || support.mspointer) ? e : e.touches[0];

    // エリア外のタッチを無視
    if(touch.pageX < mTouchOffsetLeft ||
       touch.pageX >= mTouchOffsetLeft + mTouchWidth ||
       touch.pageY < mTouchOffsetTop ||
       touch.pageY >= mTouchOffsetTop + mTouchHeight){

        return;
    }

    if(touch.pageX < mTouchOffsetLeft + mTouchWidth/3){ // 左旋回
        var rate = maxSpeed*(mTouchOffsetLeft + mTouchWidth/3-touch.pageX)/(mTouchWidth/3);

        // 前回送信時と値が大きく違うときのみ送信
        if(Math.abs(rate-rate24Prev)>th || Math.abs(rate-rate23Prev)>th){
            webiopi().callMacro("pwm4Write", [0, rate, rate, 0, commandID++]);
            rate25Prev = 0;
            rate24Prev = rate;
            rate23Prev = rate;
            rate22Prev = 0;
        }
    }else if(touch.pageX < mTouchOffsetLeft + 2*mTouchWidth/3){ // 前後移動
        // 左右の車輪の速さの違いの補正
        var modL = (1.2-0.8)*(touch.pageX - mTouchOffsetLeft - mTouchWidth/3)/(mTouchWidth/3) + 0.8;
        var modR = (0.8-1.2)*(touch.pageX - mTouchOffsetLeft - mTouchWidth/3)/(mTouchWidth/3) + 1.2;

        if(touch.pageY < mTouchOffsetTop + mTouchHeight/2){
            var rate = maxSpeed*(mTouchHeight/2 + mTouchOffsetTop - touch.pageY)/(mTouchHeight/2);
            modL *= rate;
            modR *= rate;

            if(modL > 1.0){ modL = 1.0; }
            if(modR > 1.0){ modR = 1.0; }

            // 前回送信時と値が大きく違うときのみ送信
            if(Math.abs(modL-rate25Prev)>th || Math.abs(modR-rate23Prev)>th){
                webiopi().callMacro("pwm4Write", [modL, 0, modR, 0, commandID++]);
                rate25Prev = modL;
                rate24Prev = 0;
                rate23Prev = modR;
                rate22Prev = 0;
            }
        }else{
            var rate = maxSpeed*(touch.pageY - mTouchOffsetTop - mTouchHeight/2)/(mTouchHeight/2);
            modL *= rate;
            modR *= rate;

            if(modL > 1.0){ modL = 1.0; }
            if(modR > 1.0){ modR = 1.0; }

            // 前回送信時と値が大きく違うときのみ送信
            if(Math.abs(modL-rate24Prev)>th || Math.abs(modR-rate22Prev)>th){
                webiopi().callMacro("pwm4Write", [0, modL, 0, modR, commandID++]);
                rate25Prev = 0;
                rate24Prev = modL;
                rate23Prev = 0;
                rate22Prev = modR;
            }
        }

    }else{ // 右旋回
        var rate = maxSpeed*(touch.pageX - mTouchOffsetLeft - 2*mTouchWidth/3)/(mTouchWidth/3);

        // 前回送信時と値が大きく違うときのみ送信
        if(Math.abs(rate-rate25Prev)>th || Math.abs(rate-rate22Prev)>th){
            webiopi().callMacro("pwm4Write", [rate, 0, 0, rate, commandID++]);
            rate25Prev = rate;
            rate24Prev = 0;
            rate23Prev = 0;
            rate22Prev = rate;
        }
    }

}

// タッチ終了時のイベントリスナー
function touchEndEvent(e){
    e.preventDefault();

    webiopi().callMacro("pwm4Write", [0, 0, 0, 0, commandID++]);
    rate25Prev = 0;
    rate24Prev = 0;
    rate23Prev = 0;
    rate22Prev = 0;
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

    // エリア外のクリックを無視
    if(e.pageX < mTouchOffsetLeft ||
       e.pageX >= mTouchOffsetLeft + mTouchWidth ||
       e.pageY < mTouchOffsetTop ||
       e.pageY >= mTouchOffsetTop + mTouchHeight){

        return;
    }

    if(e.pageX < mTouchOffsetLeft + mTouchWidth/3){ // 左旋回
        var rate = maxSpeed*(mTouchOffsetLeft + mTouchWidth/3 - e.pageX)/(mTouchWidth/3);

        webiopi().callMacro("pwm4Write", [0, rate, rate, 0, commandID++]);
        rate25Prev = 0;
        rate24Prev = rate;
        rate23Prev = rate;
        rate22Prev = 0;
    }else if(e.pageX < mTouchOffsetLeft + 2*mTouchWidth/3){ // 前後移動
        // 左右の車輪の速さの違いの補正
        var modL = (1.2-0.8)*(e.pageX - mTouchOffsetLeft - mTouchWidth/3)/(mTouchWidth/3) + 0.8;
        var modR = (0.8-1.2)*(e.pageX - mTouchOffsetLeft - mTouchWidth/3)/(mTouchWidth/3) + 1.2;

        if(e.pageY >= mTouchOffsetTop + 2*mTouchHeight/5 && e.pageY < mTouchOffsetTop + 3*mTouchHeight/5){
            webiopi().callMacro("pwm4Write", [0, 0, 0, 0, commandID++]);
            rate25Prev = 0;
            rate24Prev = 0;
            rate23Prev = 0;
            rate22Prev = 0;
        }else if(e.pageY < mTouchOffsetTop + mTouchHeight/2){
            var rate = maxSpeed*(mTouchOffsetTop + mTouchHeight/2 - e.pageY)/(mTouchHeight/2);
            modL *= rate;
            modR *= rate;

            if(modL > 1.0){ modL = 1.0; }
            if(modR > 1.0){ modR = 1.0; }

            webiopi().callMacro("pwm4Write", [modL, 0, modR, 0, commandID++]);
            rate25Prev = modL;
            rate24Prev = 0;
            rate23Prev = modR;
            rate22Prev = 0;
        }else{
            var rate = maxSpeed*(e.pageY - mTouchOffsetTop - mTouchHeight/2)/(mTouchHeight/2);
            modL *= rate;
            modR *= rate;

            if(modL > 1.0){ modL = 1.0; }
            if(modR > 1.0){ modR = 1.0; }

            webiopi().callMacro("pwm4Write", [0, modL, 0, modR, commandID++]);
            rate25Prev = 0;
            rate24Prev = modL;
            rate23Prev = 0;
            rate22Prev = modR;
        }

    }else{ // 右旋回
        var rate = maxSpeed*(e.pageX - mTouchOffsetLeft - 2*mTouchWidth/3)/(mTouchWidth/3);

        webiopi().callMacro("pwm4Write", [rate, 0, 0, rate, commandID++]);
        rate25Prev = rate;
        rate24Prev = 0;
        rate23Prev = 0;
        rate22Prev = rate;
    }

}

function resize_canvas(){

    if($(window).width() < $(window).height()){
        isPortrait = true;
    }else{
        isPortrait = false;
    }

    if(isPortrait){
        mTouchWidth = 0.95*$(window).width();
        mTouchHeight = mTouchWidth;
    }else{
        mTouchHeight = 0.95*$(window).height();
        mTouchWidth = mTouchHeight;
    }

    mTouchOffsetLeft = ($(window).width()-mTouchWidth)/2;
    mTouchOffsetTop = $("#touchArea").offset().top;

    $( "#touchImage" ).width(mTouchWidth);
    $( "#touchImage" ).height(mTouchHeight);
}

function applyCustomCss(custom_css){
    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('link');
    style.rel = "stylesheet";
    style.type = 'text/css';
    style.href = custom_css;
    head.appendChild(style);
}
