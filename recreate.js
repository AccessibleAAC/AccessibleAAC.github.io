/* 
 * recreate.js
 * 
 * Code to read triggers and recreate configurations based on those triggers.
 */

class TriggerSet {
    constructor(sensor) {
        this.sensor = sensor;
        this.list = Triggers.getSubSet(sensor);
        if (this.list.length() === 0) {
            this.hash = 0;
            this.resolved = true;
        } else {
            this.hash = this.list.getHash();
            this.resolved = false;
        }
    }
    
    getPort() {
        return this.sensor.port;
    }
    
    isResolved() {
        this.resolved = true;
    }
};

var Recreate = {
    Sen_1A: null,
    Sen_1B: null,
    Sen_2A: null,
    Sen_2B: null,
    Sen_3A: null,
    Sen_3B: null,
    
    Sen_USB: null,
    
    Sen_ACCEL_X: null,
    Sen_ACCEL_Y: null,
    Sen_ACCEL_Z: null,
    
    Sen_GYRO_X: null,
    Sen_GYRO_Y: null,
    Sen_GYRO_Z: null,
    
    Sen_GYRO_ANY: null,   
    
    AllPorts: [],
    AllSensors: [],

    doAll: function() {
        TFunc.getTriggers()
        .then( () => {
            Recreate.rebuildAll();
            Connection.sendCommand(RUN_SENSACT);
        });  
    },
    
    rebuildAll: function() {
        SolutionList.removeAll();

        // Get all trigger sets
        this.createTriggerSets();
        
        // Check for Gyro solution
        this.lookForGyroMouse();
        
        // Check for three-sensor solution matches
        this.lookForJoystickPlus();
        
        // Check for two-sensor solution matches
        if (!(this.Sen_1A.resolved || this.Sen_1B.resolved)) {
            this.lookForTwoPortMatch(this.Sen_1A, this.Sen_1B);            
        }
        if (!(this.Sen_2A.resolved || this.Sen_2B.resolved)) {
            this.lookForTwoPortMatch(this.Sen_2A, this.Sen_2B);            
        }
        if (!(this.Sen_3A.resolved || this.Sen_3B.resolved)) {
            this.lookForTwoPortMatch(this.Sen_3A, this.Sen_3B);            
        }
        
        // Check for one-sensor solution matches
        for(var tset of this.AllPorts) {
            if (!tset.resolved) {
                this.lookForOnePortMatch(tset);
            }
        }
        
        // Deal with remaining unknowns
        for(var tset of this.AllSensors) {
            if (!tset.resolved) {
                // console.log(tset.sensor.name + " unresolved.");
                var solution = SolutionList.add(Reg.SolUnknown);
                solution.loadTriggers(tset.list);
                Chooser.addTab(solution);
            }
        }
    },
    
    createTriggerSets: function() {
        // Load all trigger sub-sets.
        this.Sen_1A = new TriggerSet(SENSOR_1A);
        this.Sen_1B = new TriggerSet(SENSOR_1B);
        this.Sen_2A = new TriggerSet(SENSOR_2A);
        this.Sen_2B = new TriggerSet(SENSOR_2B);
        this.Sen_3A = new TriggerSet(SENSOR_3A);
        this.Sen_3B = new TriggerSet(SENSOR_3B);
        
        this.Sen_USB = new TriggerSet(SENSOR_USB);

        this.Sen_ACCEL_X = new TriggerSet(SENSOR_ACCEL_X);
        this.Sen_ACCEL_Y = new TriggerSet(SENSOR_ACCEL_Y);
        this.Sen_ACCEL_Z = new TriggerSet(SENSOR_ACCEL_Z);

        this.Sen_GYRO_X = new TriggerSet(SENSOR_GYRO_X);
        this.Sen_GYRO_Y = new TriggerSet(SENSOR_GYRO_Y);
        this.Sen_GYRO_Z = new TriggerSet(SENSOR_GYRO_Z);

        this.Sen_GYRO_ANY = new TriggerSet(SENSOR_GYRO_ANY);
        
        // Create useful lists
        this.AllPorts = [];
        this.AllPorts.push(this.Sen_1A);
        this.AllPorts.push(this.Sen_1B);
        this.AllPorts.push(this.Sen_2A);
        this.AllPorts.push(this.Sen_2B);
        this.AllPorts.push(this.Sen_3A);
        this.AllPorts.push(this.Sen_3B);
        
        this.AllSensors = [];
        this.AllSensors.push(this.Sen_1A);
        this.AllSensors.push(this.Sen_1B);
        this.AllSensors.push(this.Sen_2A);
        this.AllSensors.push(this.Sen_2B);
        this.AllSensors.push(this.Sen_3A);
        this.AllSensors.push(this.Sen_3B);
        this.AllSensors.push(this.Sen_USB);
        this.AllSensors.push(this.Sen_ACCEL_X);
        this.AllSensors.push(this.Sen_ACCEL_Y);
        this.AllSensors.push(this.Sen_ACCEL_Z);
        this.AllSensors.push(this.Sen_GYRO_X);
        this.AllSensors.push(this.Sen_GYRO_Y);
        this.AllSensors.push(this.Sen_GYRO_Z);
        this.AllSensors.push(this.Sen_GYRO_ANY);        
    },
    
    lookForGyroMouse: function() {
        var connectionType;
        var headSide;
        var leftClick;
        var rightClick;
        var tiltSwitch = false;
        var tiltIsNegative;
    
        if(this.Sen_GYRO_Z.hash === 0 || this.Sen_GYRO_Y.hash === 0) {
            return;  // No gyro
        }
        
        if (this.Sen_GYRO_Y.hash === 1224533181) {
            connectionType = "Wired";
            rightClick = false;
        } else if (this.Sen_GYRO_Y.hash === 281328007) {
            connectionType = "Wired";
            rightClick = true;
        } else if (this.Sen_GYRO_Y.hash === 1607716157) {
            connectionType = "Bluetooth";
            rightClick = false;
        } else if (this.Sen_GYRO_Y.hash === -1321531257) {
            connectionType = "Bluetooth";
            rightClick = true;
        } else {
            return;  // No recognized hash.
        }
        
        if (connectionType === "Wired") {
            if (this.Sen_GYRO_Z.hash === 482435197) {
                headSide = "Left";
                leftClick = false;
            } else if (this.Sen_GYRO_Z.hash === 1154980486) {
                headSide = "Left";
                leftClick = true;
            } else if (this.Sen_GYRO_Z.hash === -1209041283) {
                headSide = "Right";
                leftClick = false;
            } else if (this.Sen_GYRO_Z.hash === 651394595) {
                headSide = "Right";
                leftClick = true;
            } else {
                return; // Not recognized
            }
        } else {  // Same stuff - but for bluetooth.
            if (this.Sen_GYRO_Z.hash === 865618173) {
                headSide = "Left";
                leftClick = false;
            } else if (this.Sen_GYRO_Z.hash === -447878778) {
                headSide = "Left";
                leftClick = true;
            } else if (this.Sen_GYRO_Z.hash === -825858307) {
                headSide = "Right";
                leftClick = false;
            } else if (this.Sen_GYRO_Z.hash === -951464669) {
                headSide = "Right";
                leftClick = true;
            } else {
                return; // Not recognized
            }            
        }
        
        if (this.Sen_ACCEL_Z.hash === -212167185) {
            tiltSwitch = true;
            tiltIsNegative = false;
        } else if (this.Sen_ACCEL_Z.hash === -495752465) {
            tiltSwitch = true;
            tiltIsNegative = true;          
        } // ELSE, maybe ACCEL_Z is being used for something else.
        
        this.gyroMouse(connectionType, headSide, leftClick, rightClick, tiltSwitch, tiltIsNegative);
    },
    
    lookForJoystickPlus: function() {
        // First try to find the single button that toggles cursor mvmt v.s. scrolling
        
        var singleButtonTSet = null;
        var singleButtonAudio = false;
        
        for(let tset of this.AllPorts) {
            if (tset.hash === 2029472800) {  // Audio OFF
                singleButtonTSet = tset;
                singleButtonAudio = false;
                break;
            } else if (tset.hash === 288656854) { // Audio ON
                singleButtonTSet = tset;
                singleButtonAudio = true;
                break;
            }
        }
        if (singleButtonTSet === null) return; // No Match
        
        // Now ... look for the joystick 
        singleBtnPort = singleButtonTSet.getPort();
        var found;
        if (this.Sen_1A.getPort() !== singleBtnPort) {
            found = this.seekJoystickLocation(this.Sen_1A, this.Sen_1B, singleButtonTSet, singleButtonAudio);
            if (found) return;
        }
        if (this.Sen_2A.getPort() !== singleBtnPort) {
            found = this.seekJoystickLocation(this.Sen_2A, this.Sen_2B, singleButtonTSet, singleButtonAudio);
            if (found) return;
        }
        if (this.Sen_3A.getPort() !== singleBtnPort) {
            found = this.seekJoystickLocation(this.Sen_3A, this.Sen_3B, singleButtonTSet, singleButtonAudio);
            if (found) return;
        }
    },
    
    joystickPlusHashTable: [
        //HashA,         HashB,      parameters
        [ 1582011234, -1799561888, {connection: "Wired", clicks: false, audio: false}],
        [ -552848382, -1799561888, {connection: "Wired", clicks:  true, audio: false}],
        [ 2108447451, -1799561888, {connection: "Wired", clicks:  true, audio:  true}],
        [  -36678174,     9781856, {connection: "Bluetooth", clicks: false, audio: false}],
        [ 1069178754,     9781856, {connection: "Bluetooth", clicks:  true, audio: false}],
        [ 2057300059,     9781856, {connection: "Bluetooth", clicks:  true, audio:  true}]
    ],
    
     seekJoystickLocation: function(triggerSetA, triggerSetB, singleBtnTset, singleButtonAudio) {
        var hashA = triggerSetA.hash;
        var hashB = triggerSetB.hash;
        for(let match of this.joystickPlusHashTable) {
            if (match[0] === hashA && match[1] === hashB) {
                parameters = match[2];
                parameters.singleButtonSensor = singleBtnTset.sensor;
                parameters.singleButtonAudio = singleButtonAudio;
                buildIt2(triggerSetA, triggerSetB, Reg.SolJoystickMouse2, parameters);
                singleBtnTset.isResolved();
                return true;
            }
        }
        return false;
    },

    twoPortHashTable: [
        //HashA, HashB, build-func,    solution-reg,    parameters
        [1491643326, 1712345086, buildIt2, Reg.SolTwoBtnMouse, {connection: "Wired"}],
        [ 478663742,  699365502, buildIt2, Reg.SolTwoBtnMouse, {connection: "Bluetooth"}],
        
        [1582011234, 1553382080, buildIt2, Reg.SolJoystickMouse1, {connection: "Wired", clicks: false, audio: false}],
        [-552848382, 1553382080, buildIt2, Reg.SolJoystickMouse1, {connection: "Wired", clicks:  true, audio: false}],
        [2108447451, 1553382080, buildIt2, Reg.SolJoystickMouse1, {connection: "Wired", clicks:  true, audio:  true}],
        [ -36678174,  -65307328, buildIt2, Reg.SolJoystickMouse1, {connection: "Bluetooth", clicks: false, audio: false}],
        [1069178754,  -65307328, buildIt2, Reg.SolJoystickMouse1, {connection: "Bluetooth", clicks:  true, audio: false}],
        [2057300059,  -65307328, buildIt2, Reg.SolJoystickMouse1, {connection: "Bluetooth", clicks:  true, audio:  true}],
        
        [    987944,     987947, buildIt2, Reg.SolLeftRightClick, {connection: "Wired", audio:  false}],
        [1853996003, 1856766566, buildIt2, Reg.SolLeftRightClick, {connection: "Wired", audio:  true}],
        [    991788,     991791, buildIt2, Reg.SolLeftRightClick, {connection: "Bluetooth", audio:  false}],
        [1109043431, 1111813994, buildIt2, Reg.SolLeftRightClick, {connection: "Bluetooth", audio:  true}],

        [    987959,     987960, buildIt2, Reg.SolScrollButtons, {connection: "Wired", audio:  false}],
        [1867848818, 1868772339, buildIt2, Reg.SolScrollButtons, {connection: "Wired", audio:  true}],
        [    991803,     991804, buildIt2, Reg.SolScrollButtons, {connection: "Bluetooth", audio:  false}],
        [1122896246, 1123819767, buildIt2, Reg.SolScrollButtons, {connection: "Bluetooth", audio:  true}],
        
        [1639269540, -573099553, buildIt2, Reg.SolScrollJoystick, {connection: "Wired", clicks: true, audio: false}],
        [  20580132,  934778463, buildIt2, Reg.SolScrollJoystick, {connection: "Bluetooth", clicks: true, audio: false}],
        [-474578727, -573099553, buildIt2, Reg.SolScrollJoystick, {connection: "Wired", clicks: true, audio: true}],
        [-1114586279, 934778463, buildIt2, Reg.SolScrollJoystick, {connection: "Bluetooth", clicks: true, audio: true}],
        
    ],
    
    lookForTwoPortMatch: function(triggerSetA, triggerSetB) {
        var hashA = triggerSetA.hash;
        var hashB = triggerSetB.hash;
        for(let match of this.twoPortHashTable) {
            if (match[0] === hashA && match[1] === hashB) {
                match[2](triggerSetA, triggerSetB, match[3], match[4]);
                return;
            }
        }
    },
    
    
    onePortHashTable: [
        // Hash-value,  build-func,    solution-reg,    parameters
        [-1561617021,  oneBtnMouseEx, Reg.SolOneBtnMouse, {connection: "Wired"}],
        [  891305351,  oneBtnMouseEx, Reg.SolOneBtnMouse, {connection: "Bluetooth"}],
        
        [      987944, buildIt, Reg.SolLeftClick, {connection: "Wired",     audio: false}],
        [  1853996003, buildIt, Reg.SolLeftClick, {connection: "Wired",     audio: true }],
        [      991788, buildIt, Reg.SolLeftClick, {connection: "Bluetooth", audio: false}],
        [  1109043431, buildIt, Reg.SolLeftClick, {connection: "Bluetooth", audio: true }],
        
        [      987947, buildIt, Reg.SolRightClick, {connection: "Wired",     audio: false}],
        [  1856766566, buildIt, Reg.SolRightClick, {connection: "Wired",     audio: true }],
        [      991791, buildIt, Reg.SolRightClick, {connection: "Bluetooth", audio: false}],
        [  1111813994, buildIt, Reg.SolRightClick, {connection: "Bluetooth", audio: true }],
        
        [ -1873354147, buildIt, Reg.SolLeftPressReleaseToggle, {connection: "Wired",     audio: false}],
        [     5512509, buildIt, Reg.SolLeftPressReleaseToggle, {connection: "Wired",     audio: true }],
        [  -365476131, buildIt, Reg.SolLeftPressReleaseToggle, {connection: "Bluetooth", audio: false}],
        [  1920230333, buildIt, Reg.SolLeftPressReleaseToggle, {connection: "Bluetooth", audio: true }],

        [ -1738641404, buildIt, Reg.SolLeftEmulation, {connection: "Wired"}],
        [   937636484, buildIt, Reg.SolLeftEmulation, {connection: "Bluetooth"}],

        [  -711621658, buildIt, Reg.SolThreeFuncMouseButton, {connection: "Wired"}],
        [   650116714, buildIt, Reg.SolThreeFuncMouseButton, {connection: "Bluetooth"}],

        [  -598153412, buildIt, Reg.SolScrollToggle, {connection: "Wired"}],
        [ -1611132996, buildIt, Reg.SolScrollToggle, {connection: "Bluetooth"}],
        
        [ -1446077293, buildIt, Reg.SolUpDownArrowToggle, {connection: "Wired"}],
        [   563349845, buildIt, Reg.SolUpDownArrowToggle, {connection: "Bluetooth"}],
        
        // Simple Scrolling Joystick - without click options so the A-side does nothing.
        [  -573099553, buildIt, Reg.SolScrollJoystick, {connection: "Wired", clicks: false, audio: false}],
        [   934778463, buildIt, Reg.SolScrollJoystick, {connection: "Bluetooth", clicks: false, audio: false}],
        
        // Keyboard extra is needed to distinguish text, special and modifier options.
        [       31838, keyboardExtra, Reg.SolKeyboardText, {connection: "Wired",     length: 1}],
        [  -661677636, keyboardExtra, Reg.SolKeyboardText, {connection: "Wired",     length: 2}],
        [  1869928474, keyboardExtra, Reg.SolKeyboardText, {connection: "Wired",     length: 3}],
        [  2058860408, keyboardExtra, Reg.SolKeyboardText, {connection: "Wired",     length: 4}],
        [  1621080022, keyboardExtra, Reg.SolKeyboardText, {connection: "Wired",     length: 5}],
        [   397695284, keyboardExtra, Reg.SolKeyboardText, {connection: "Wired",     length: 6}],
        
        [       31807, keyboardExtra, Reg.SolKeyboardText, {connection: "Bluetooth", length: 1}],
        [  -690306818, keyboardExtra, Reg.SolKeyboardText, {connection: "Bluetooth", length: 2}],
        [  2037812797, keyboardExtra, Reg.SolKeyboardText, {connection: "Bluetooth", length: 3}],
        [ -1562663940, keyboardExtra, Reg.SolKeyboardText, {connection: "Bluetooth", length: 4}],
        [ -1003371973, keyboardExtra, Reg.SolKeyboardText, {connection: "Bluetooth", length: 5}],
        [  -188700422, keyboardExtra, Reg.SolKeyboardText, {connection: "Bluetooth", length: 6}],
        
        // Keylock - could be Shift-lock or Control-lock
        [ -2105499416, keyLockExtra, Reg.SolKeyboardShift, {audio: false}],
        [  1920131486, keyLockExtra, Reg.SolKeyboardShift, {audio: true}]
    ],
    
    lookForOnePortMatch: function(triggerSet) {
        var theHash = triggerSet.hash;
        for(let match of this.onePortHashTable) {
            if (match[0] === theHash) {
                match[1](triggerSet, match[2], match[3]);
                return;
            }
        }
    },
    
    gyroMouse: function(connectionType, headSide, leftClick, rightClick, tiltSwitch, tiltIsNegative) {
        var parameters = {};
        parameters.connection = connectionType;
        parameters.headSide = headSide;
        parameters.leftClick = leftClick;
        parameters.rightClick = rightClick;
        parameters.tiltSwitch = tiltSwitch;
        parameters.tiltIsNegative = tiltIsNegative;

        // Get threshold values and compute back to bais and sensitivity.
        var yt1 = this.Sen_GYRO_Y.list.get(0).triggerValue;
        var yt2 = this.Sen_GYRO_Y.list.get(2).triggerValue;
        var zt1 = this.Sen_GYRO_Z.list.get(0).triggerValue;
        var zt2 = this.Sen_GYRO_Z.list.get(2).triggerValue;

        // One threshold will be positive and the other negative.
        // Make yt1 and xt1 the positive values;
        if (yt1 < 0) {
            var tmp = yt1;
            yt1 = yt2;
            yt2 = tmp;
        }
        if (zt1 < 0) {
            var tmp = zt1;
            zt1 = zt2;
            zt2 = tmp;
        }

        var ybias = (yt1 + yt2) / 2;
        var zbias = (zt1 + zt2) / 2;

        var maxy = yt1 - ybias;

        var sensitivity = (3500 - maxy) / 30 + 50;

        parameters.yBias = ybias;
        parameters.zBias = zbias;
        parameters.sensitivity = sensitivity;

/*
        console.log("Gyro Mouse: ");
        for(var x in parameters) {
            console.log("    " + x + ": " + parameters[x]);
        } 
 */       
        this.Sen_GYRO_Y.isResolved();
        this.Sen_GYRO_Z.isResolved();
        if (tiltSwitch) {
            var tiltThreshold = this.Sen_ACCEL_Z.list.get(0).triggerValue;
            this.Sen_ACCEL_Z.isResolved();
            parameters.tiltThreshold = tiltThreshold;
        }
        var theSolution = SolutionList.add(Reg.SolGyroMouse);
        theSolution.setParameters(parameters);
        Chooser.addTab(theSolution); 
    }
};

function keyboardExtra(triggerSet, solutionReg, parameters) {
    solutionReg = Reg.SolKeyboardText; // default

    if (triggerSet.list.length() === 1) {
        var param = triggerSet.list.get(0).actionParam;
        // param & 0xff000000 does sign extension to 64-bits
        // I could not find a way to stop this, so ...\
        // the '| 0' after KEY_MODIFIER causes sign extension on that
        // so that the two values will match (ugh!).
        if ((param & 0xff000000) === (KEY_MODIFIER | 0)) {
            solutionReg = Reg.SolKeyboardModifier;
            parameters.keyCode = getWiredKey(param & 0xff);
            parameters.modKey = getWiredKey( (param >> 8) & 0xff);

        } else if (param & 0x80000000) {
            // console.log("Keypress/release found in keyboard action.");
            return;  // keypress or keyrelease - we should not get here.

        } else if (parameters.connection === "Wired") {
            if ((0xfe > param) && (param > 0x7f)) {
                solutionReg = Reg.SolKeyboardSpecial;
                parameters.keyCode = getWiredKey(param & 0xff);
            } 
        } else { // Bluetooth
            if (param < 32) {
                solutionReg = Reg.SolKeyboardSpecial;
                parameters.keyCode = getBTKey(param & 0xff);
            }             
        }
    }

    if (solutionReg === Reg.SolKeyboardText) {
        var returnKey;
        if (parameters.connection === "Wired") {
            returnKey = RETURN_KEY.wiredCode;
        } else {
            returnKey = RETURN_KEY.btCode;
        }
        var endsWithReturn = false;
        let i = 0;
        var list = triggerSet.list;
        var string = "";
        for(i=0; i < list.length(); i++) {
            param = list.get(i).actionParam;
            if (i === (list.length() -1)) {
                if (param === returnKey) {
                    endsWithReturn = true;
                    break;
                }
            }
            for(let j = 3; j >=0; j--) {
                var val = (param >> (j*8) & 0xff);
                if (val !== 0) {
                    string += String.fromCharCode(val);
                }
            }
        }
        
        parameters.text = string;
        parameters.endsWithReturn = endsWithReturn;

    } 
        
    buildIt(triggerSet, solutionReg, parameters);
}

function oneBtnMouseEx(triggerSet, solutionReg, parameters) {
    var trigList = triggerSet.list;
    if (trigList.length() === 15) {
        var trig = trigList.get(2);
        if (trig.action === ACT_BUZZER) {
            parameters.delay = trig.delay;
            parameters.buzzerLength = trig.actionParam & 0xffff;
            buildIt(triggerSet, solutionReg, parameters);            
        } 
    }                   
}

function keyLockExtra(triggerSet, solutionReg, parameters) {
    var trigList = triggerSet.list;
    var param;
    if (trigList.get(0).action === ACT_WIRED_KEYBOARD) {
        param = trigList.get(0).actionParam;
    } else {
        // Audio is on - keyboard action is 2nd.
        // Trusting the hash to keep this right.
        param = trigList.get(1).actionParam;
    }
    if ((param & 0x0ff) === LEFT_SHIFT_KEY.wiredCode) {
        solutionReg = Reg.SolKeyboardShift;
    } else {
        solutionReg = Reg.SolKeyboardControl;
    }
    buildIt(triggerSet, solutionReg, parameters);
}

function buildIt(triggerSet, solutionReg, parameters) {
    /* console.log(triggerSet.sensor.name + ": " + solutionReg.name);
    for(var x in parameters) {
        if (parameters[x] instanceof KeyCode) {
            console.log("    " + x + ": " + parameters[x].name);            
        } else {
            console.log("    " + x + ": " + parameters[x]);
        }
    } */
    
    var theSolution = SolutionList.add(solutionReg);
    theSolution.setParameters(triggerSet.sensor, parameters);
    Chooser.addTab(theSolution);
    triggerSet.isResolved();
}

function buildIt2(triggerSetA, triggerSetB, solutionReg, parameters) {
/*    console.log(triggerSetA.sensor.name + " & B: " + solutionReg.name);
    for(var x in parameters) {
        console.log("    " + x + ": " + parameters[x]);
    } */
    
    var theSolution = SolutionList.add(solutionReg);
    theSolution.setParameters(triggerSetA.sensor, parameters);
    Chooser.addTab(theSolution); 
    triggerSetA.isResolved();
    triggerSetB.isResolved();
}
