/* 
 * cursorSpeed.js
 * 
 * Structures and controls for handling cursor speed settings.
 */

/*
 * RawCursorSpeed - holds the values set to and received from the hub.
 * Data is stored in rawCursor speed.  displayCursorSpeed is populated
 * from raw when the cursor speed dialog is opened, and copied back
 * to raw when cursor speed is saved.
 */
var RawCursorSpeed = {
    delay1: 59,
    jump1:  5,
    delay2: 59,
    jump2:  8,
    delay3: 35,
    jump3:  8,
    interval1: 500,
    interval2: 500,

    informStreamingDataOut: function(oStream) {
        RawCursorSpeed.toStream(oStream);
    },
    
    toStream: function(oStream) {
        oStream.putByte(MOUSE_SPEED_DATA);
        oStream.putNum(20, 2);
        oStream.putID(this.delay1, 2);
        oStream.putID(this.jump1, 2);
        oStream.putID(this.delay2, 2);
        oStream.putID(this.jump2, 2);
        oStream.putID(this.delay3, 2);
        oStream.putID(this.jump3, 2);
        oStream.putNum(this.interval1, 2);
        oStream.putNum(this.interval2, 2);
    },

    informStreamingDataIn: function(inStream) {
        RawCursorSpeed.fromStream(inStream);
    },
    
    fromStream: function(inStream) {
        this.delay1 = inStream.getID(2);
        this.jump1 = inStream.getID(2);
        this.delay2 = inStream.getID(2);
        this.jump2 = inStream.getID(2);
        this.delay3 = inStream.getID(2);
        this.jump3 = inStream.getID(2);
        this.interval1 = inStream.getNum(2);
        this.interval2 = inStream.getNum(2);
    }
};

TFunc.onSendingCursorSpeed = RawCursorSpeed.informStreamingDataOut;
TFunc.onLoadingCursorSpeed = RawCursorSpeed.informStreamingDataIn;

/*
 * displayMouseSpeed - holds the values displayed to the user.
 * This displayss the speed on a logarithmic scale.
 * Initialized with default values.
 */
var DisplayCursorSpeed = {
    firstSpeed:     420,
    secondSpeed:    480,
    thirdSpeed:     540,
    firstInterval:  500,
    secondInterval: 500,

    loadFromRaw: function() {
        this.firstSpeed = convertFromRaw(RawCursorSpeed.delay1, RawCursorSpeed.jump1);
        this.secondSpeed = convertFromRaw(RawCursorSpeed.delay2, RawCursorSpeed.jump2);
        this.thirdSpeed = convertFromRaw(RawCursorSpeed.delay3, RawCursorSpeed.jump3);
        this.firstInterval = RawCursorSpeed.interval1;
        this.secondInterval = RawCursorSpeed.interval2;
    },

    putToRaw: function() {
        var delay, jump;
        [delay, jump] = convertToRaw(this.firstSpeed);
        RawCursorSpeed.delay1 = delay;
        RawCursorSpeed.jump1 = jump;
        [delay, jump] = convertToRaw(this.secondSpeed);
        RawCursorSpeed.delay2 = delay;
        RawCursorSpeed.jump2 = jump;
        [delay, jump] = convertToRaw(this.thirdSpeed);
        RawCursorSpeed.delay3 = delay;
        RawCursorSpeed.jump3 = jump;
        RawCursorSpeed.interval1 = this.firstInterval;
        RawCursorSpeed.interval2 = this.secondInterval;
    }
};

/*
 Convert the logarithmic value for pixels/second from the Widget
 to number-of-milliseconds between mouse moves
 and size of mouse jump.
 Aim for a speed with a mouse jump of less than 10,
 but for the highest speeds we get a delay of 24 
 and a jump of 15.
*/
function convertFromRaw(delay, jump) {
    delay += 1;
    var speed = (jump * 1000.0) / delay;
    return Math.round( Math.log(speed) * 100 );
}

function convertToRaw(logSpeed) {
    var delay;
    var jump;
    var speed = Math.exp(logSpeed/100.0);
    for(delay = 60; delay > 23; delay -= 12) {
        jump = Math.round( (speed * delay)/1000.0 + 0.5);
        if (jump < 10) {
            break;
        }
    }
    /*
    Reduce the delay by one.
    The actual delay will be the first 'tick' where
    the elapsed time is greater than the delay.
    We reduce delay by one to ensure we don't overshoot the 'tick'.
   */
    delay -= 1;
    return [delay, jump];
}

function limitNumericRange(event) {
    if (this.value < 50) this.value = 50;
    if (this.value > 10000) this.value = 10000;
}

function showCursorSpeed() {
    DisplayCursorSpeed.loadFromRaw();
    var cs = document.getElementById("cursorSpeed");
    cs.style.display = "block";
    document.getElementById("csinterval1").onchange = limitNumericRange;
    document.getElementById("csinterval2").onchange = limitNumericRange;

    document.getElementById("csspeed1").value = DisplayCursorSpeed.firstSpeed;
    document.getElementById("csspeed2").value = DisplayCursorSpeed.secondSpeed;
    document.getElementById("csspeed3").value = DisplayCursorSpeed.thirdSpeed;
    document.getElementById("csinterval1").value = DisplayCursorSpeed.firstInterval;
    document.getElementById("csinterval2").value = DisplayCursorSpeed.secondInterval;
}


function hideCursorSpeed() {
    var cs = document.getElementById("cursorSpeed");
    cs.style.display = "none";    
}

// Called by Save button
function saveCursorSpeed() {
    DisplayCursorSpeed.firstSpeed =
            parseInt( document.getElementById("csspeed1").value );
    DisplayCursorSpeed.secondSpeed =
            parseInt( document.getElementById("csspeed2").value );
    DisplayCursorSpeed.thirdSpeed =
            parseInt( document.getElementById("csspeed3").value );
    DisplayCursorSpeed.firstInterval =
            parseInt( document.getElementById("csinterval1").value );
    DisplayCursorSpeed.secondInterval =
            parseInt( document.getElementById("csinterval2").value );
    DisplayCursorSpeed.putToRaw();
    hideCursorSpeed();
}

// Called by the Cancel button.
function cancelCursorSpeed() {
    hideCursorSpeed();
}