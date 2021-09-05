/* 
 * solutions.js
 * 
 * This file holds all of the solutions data ad logic.
 * 
 */

"use strict";

class PortUsage {
    constructor(thePort) {
        this.thePort = thePort;
        this.useCount = 0;
        this.firstUser = null;
        this.secondUser = null;
    }
};

let portMap = {};
let portsWithTwoSingles = [];

let SolutionList = {
    list: [],
        
    add: function(solReg) {
        var solution = solReg.createMethod();
        this.list.push(solution);
        return solution;
    },
    
    remove: function(id) {
        var i;
        var found = -1;
        for(i=0; i<this.list.length; i++) {
            if (this.list[i].id === id) {
                found = i;
                break;
            }
        }
        if (found >= 0) {
            this.list.splice(found, 1);
        }       
    },
    
    removeAll: function() {
        var idList = [];
        var i;
        for(i=0; i<this.list.length; i++) {
            idList.push(this.list[i].id);
        }
        
        for(i=0; i<idList.length; i++) {
           Chooser.removeTab(idList[i]); 
        }
    },
    
    // This function limits the show-message / promise stuff to 
    // the highest possible level in the code.
    doPortCheck: async function() {
        var self = this;
        var p = new Promise(function (resolve, reject) {
            self.messageTitle = null;
            self.messageBody = null;
            var result = self.portCheck();
            if (self.messageTitle !== null) {
                showMessageBox(self.messageTitle, self.messageBody, ["OK"])
                .then ( () => {
                    resolve(result);
                });                
            } else {
                resolve(result);
            }
        });
        return p;
    },
    
    portCheck: function() {
        portMap = {};
        portsWithTwoSingles = [];
        var portName;
        var pu;
        
        var ok;
        
        for(var sol of this.list) {
            var p1 = sol.getPortUsed();
            if (p1 !== null) {
                ok = this.checkOnePort(sol, p1, sol.sensorCount);
                if(!ok) return false;
            }
            var p2 = sol.getPortBUsed();
            if (p2 !== null) {
                ok = this.checkOnePort(sol, p2, sol.sensorBCount);
                if(!ok) return false;
            }
        }     
        
        // If we get this far there are no show-stopper errors.
        // We may still need to put out warnings about ports with two singles.
        if (portsWithTwoSingles.length > 0) {
            portName = portsWithTwoSingles[0];
            pu = portMap[ portName ];
            this.messageTitle = "Information";
            this.messageBody = "The solutions '" + pu.firstUser.name + "' and '" + 
    pu.secondUser.name + "' are both using " + portName + " for a single button.<br/>" +
    "This is possible.  You may attach two buttons to the port using a splitter " +
    "or you may attach a two-button control to the port.";
        }
        
        // Make sure single-user ports are assigned to subport A
        for(portName in portMap) {
            pu = portMap[portName];
            if (pu.useCount === 1) {
                pu.firstUser.setSubPort(SENSOR_A);
            }
        } 
        return true;
    },
    
    checkOnePort: function(sol, port, sensorCount) {
        let portName = port.name;
        var pu = portMap[portName];
        if (pu === undefined) {
            // First detected use of this port
            pu = new PortUsage(port);
            pu.useCount = sensorCount;
            pu.firstUser = sol;
            portMap[portName] = pu;
            return true;
        } else {
            if ( (pu.useCount + sensorCount > 2) ) {
                if (pu.secondUser === null) {
                    // There are two users.
                    this.messageTitle = "Port Overuse Error";
                    this.messageBody = "The solutions '" + pu.firstUser.name + 
                            "' and '" + sol.name + "' are both using " + 
                            portName + 
                            ".<br/>You need to move one to another port before downloading.";
                    return false;
                } else {
                    // There are three single-button users
                    this.messageTitle = "Port Overuse Error";
                    this.messageBody = "You have assigned three things to " + portName + ":<br/>" +
    "'" + pu.firstUser.name + "', '" + pu.secondUser.name + "' and '" + sol.name + "'.<br/>" +
    "The maximum allowed is two simple buttons.  Please re-assign one of the solutions.";
                    return false;
                }
            } else { 
                //Must be two single-button users.
                pu.useCount = pu.useCount + sensorCount;
                pu.secondUser = sol;
                
                pu.firstUser.setSubPort(SENSOR_A);
                pu.secondUser.setSubPort(SENSOR_B);
                
                portsWithTwoSingles.push(portName);
                return true;
            }
        }
        return true;
    },
    
    compile: function() {
        Triggers.clear();
        for (var sol of this.list) {
            sol.compile();
        }
    }    
};

class SolutionBase {
    constructor(solReg) {
        this.name = solReg.name;
        this.description = solReg.description;
        this.id = 0;    // This matches the myID member of the content div and the tag button.
                        // It is used when a solution is deleted to find and delete
                        // all related HTML element and objects.
        this.settings = [];
        this.options = [];
        
        // Values used for port usage checks
        this.sensorCount = 1; // Default
        this.sensorBCount = 0;
        this.subPort = SENSOR_A;  // Default
    }
    addSetting(setting) {
        this.settings.push(setting);
    }
    addOption(option) {
        this.options.push(option);
    }
    compile() {
        console.log("Compile not implemented for " + this.name);
    }
    
    // Methods used for port usage checks
    getPortUsed() {
        return null;    // Abstract - overridden by individual solutions
    }
    getPortBUsed() {
        return null;    // Default - can be overridden by individual solutions
    }
    setSubPort(subport) {
        this.subPort = subport;
    }
    
}

// Commonly used questions and prompts
const Q_ONE_BTN_PORT_LOCATION = "The button is connected to:";
const Q_TWO_BTN_PORT_LOCATION = "The buttons are connected to:";
const Q_JOYSTICK_LOCATION = "The joystick is connected to:";
const Q_AUDIO_FEEDBACK = "Add audio feedback for mouse clicks.";
const Q_ENABLE_L_AND_R_CLICKS = "Enable left & right clicks";
const Q_ADD_AUDIO_FEEDBACK_CLICKS = "Add audio feedback for mouse clicks";
const Q_ADD_AUDIO_FEEDBACK_TOGGLE = "Add audio feedback for the toggle button";
const Q_ADD_AUDIO_FEEDBACK_FOR_BTN = "Add audio feedback for button presses.";
const Q_CONNECTION_TYPE = "Connection type:";

// -- Connection Type (wired or bluetooth)

class ConnectionType {
    constructor(name, mouseAction, keybdAction, keycodeFunction) { 
        this.name = name; 
        this.mouseAction = mouseAction;
        this.keybdAction = keybdAction;
        this.getKeyCode = keycodeFunction; // Function takes a keyCode (from keyCodes.js)
                                           // and returns the code value
    }
}
const connectionOptions = [];

function getConnection(name) {
    for(var op of connectionOptions) {
        if (op.name === name) return op;
    }
}
function createConnectionOptions() {
    connectionOptions.push( new ConnectionType("Wired", ACT_WIRED_MOUSE, ACT_WIRED_KEYBOARD,
    (keyid) => {return(keyid.wiredCode);} ));
    connectionOptions.push( new ConnectionType("Bluetooth", ACT_BT_MOUSE, ACT_BT_KEYBOARD,
    (keyid) => {return(keyid.btCode);} ));
}

// ======================================================================
// -- SOLUTIONS --------------------------------------------

// -----------------------------------------------------------------
// -- One Button Mouse ------------------------
class OneButtonMouse extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new NumericSelector("Length of delay between beeps (in milliseconds):",
            300, 2000, 1000));
        this.addOption( new NumericSelector("The duration of each beep (in milliseconds):",
            50, 400, 250));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
        this.options[0].setValue(parameters.delay);
        this.options[1].setValue(parameters.buzzerLength);
    }
    
    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var delay = this.options[0].getValue();
        var buzzDuration = this.options[1].getValue() ;
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
        console.log("  Delay: " + delay);
        console.log("  Beep: " +  buzzDuration);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);

        // Actions
        var mouseAction = connectionType.mouseAction;
        var mouseUp = new TAction(mouseAction, MOUSE_UP, true);
        var mouseDown = new TAction(mouseAction, MOUSE_DOWN, true);
        var mouseRight = new TAction(mouseAction, MOUSE_RIGHT, true);
        var mouseLeft = new TAction(mouseAction, MOUSE_LEFT, true);
        var leftClick = new TAction(mouseAction, MOUSE_CLICK, false);
                
        var nothing = new TAction(ACT_NONE, 0, false);
        var lowDur = buzzDuration * 2 / 3;
        if (lowDur < 50) lowDur = 50;
        var upBuzz    = getBuzzerAction(800, buzzDuration);
        var downBuzz  = getBuzzerAction(400, buzzDuration);
        var leftBuzz  = getBuzzerAction(600, buzzDuration);
        var rightBuzz = getBuzzerAction(500, buzzDuration);
        var resetBuzz = getBuzzerAction(200, lowDur);
        
        Triggers.add(btnPressed, 1,     0, nothing,   2);
        Triggers.add(btnRelease, 2,     0, leftClick, 1);
        Triggers.add(btnPressed, 2, delay, upBuzz,    3);
        Triggers.add(btnRelease, 3,     0, nothing,   4);
        Triggers.add(btnPressed, 4,     0, mouseUp,   4);
        Triggers.add(btnPressed, 3, delay, downBuzz,  5);
        Triggers.add(btnRelease, 5,     0, nothing,   6);
        Triggers.add(btnPressed, 6,     0, mouseDown, 6);
        Triggers.add(btnPressed, 5, delay, leftBuzz,  7);
        Triggers.add(btnRelease, 7,     0, nothing,   8);
        Triggers.add(btnPressed, 8,     0, mouseLeft, 8);
        Triggers.add(btnPressed, 7, delay, rightBuzz, 9);
        Triggers.add(btnRelease, 9,     0, nothing,   10);
        Triggers.add(btnPressed,10,     0, mouseRight,10);
        Triggers.add(btnRelease, 0, delay*2, resetBuzz, 1);
    }
}


// -----------------------------------------------------------------
// -- Two Button Mouse -------------------------------

class TwoButtonMouse extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_TWO_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.sensorCount = 2;
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
    }
    
    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
/*         
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
  */      
        var sensorA = port.getSensor(SENSOR_A);
        var sensorB = port.getSensor(SENSOR_B);
        
        var btnAPressed = new TSignal(sensorA, 500, TRIGGER_ON_HIGH);
        var btnARelease = new TSignal(sensorA, 500, TRIGGER_ON_LOW);
        var btnBPressed = new TSignal(sensorB, 500, TRIGGER_ON_HIGH);
        var btnBRelease = new TSignal(sensorB, 500, TRIGGER_ON_LOW);
        
        var mouseAction = connectionType.mouseAction;
        var mouseUp = new TAction(mouseAction, MOUSE_UP, true);
        var mouseDown = new TAction(mouseAction, MOUSE_DOWN, true);
        var mouseRight = new TAction(mouseAction, MOUSE_RIGHT, true);
        var mouseLeft = new TAction(mouseAction, MOUSE_LEFT, true);
        
        var nothing = new TAction(ACT_NONE, 0, false);
        var buzz    = getBuzzerAction(200, 100);
        
        Triggers.add(btnAPressed, 1,    0, nothing,   2);
        Triggers.add(btnAPressed, 2,    0, mouseUp,   2);
        Triggers.add(btnARelease, 2,  500, buzz,      3);
        Triggers.add(btnARelease, 3, 3000, nothing,   1);
        Triggers.add(btnAPressed, 3,    0, nothing,   4);
        Triggers.add(btnAPressed, 4,    0, mouseDown, 4);
        Triggers.add(btnARelease, 4,  500, buzz,      1);
        
        Triggers.add(btnBPressed, 1,    0, nothing,   2);
        Triggers.add(btnBPressed, 2,    0, mouseLeft, 2);
        Triggers.add(btnBRelease, 2,  500, buzz,      3);
        Triggers.add(btnBRelease, 3, 3000, nothing,  1);
        Triggers.add(btnBPressed, 3,    0, nothing,   4);
        Triggers.add(btnBPressed, 4,    0, mouseRight,4);
        Triggers.add(btnBRelease, 4,  500, buzz,      1);       
    }
 }

// -----------------------------------------------------------------
// -- Joystick 1 ----------------------------------
class JoystickMouse1 extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_JOYSTICK_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ENABLE_L_AND_R_CLICKS, false));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
        this.sensorCount = 2;
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }

    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
        this.options[0].setValue(parameters.clicks);
        this.options[1].setValue(parameters.audio);
    }
    
    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doClicks = this.options[0].getValue();
        var doAudio = this.options[1].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
        console.log("  Do Clicks: " + doClicks);
        console.log("  Do Audio: " + doAudio);   
  */      
        var sensorA = port.getSensor(SENSOR_A);
        var sensorB = port.getSensor(SENSOR_B);

        var sAHigh    = new TSignal(sensorA, 700, TRIGGER_ON_HIGH);
        var sANotHigh = new TSignal(sensorA, 700, TRIGGER_ON_LOW);
        var sALow     = new TSignal(sensorA, 250, TRIGGER_ON_LOW);
        var sANotLow  = new TSignal(sensorA, 250, TRIGGER_ON_HIGH);
        var sBHigh    = new TSignal(sensorB, 700, TRIGGER_ON_HIGH);
        var sBLow     = new TSignal(sensorB, 250, TRIGGER_ON_LOW);
        
        var mouseAction = connectionType.mouseAction;
        var mouseUp = new TAction(mouseAction, MOUSE_UP, true);
        var mouseDown = new TAction(mouseAction, MOUSE_DOWN, true);
        var mouseRight = new TAction(mouseAction, MOUSE_RIGHT, true);
        var mouseLeft = new TAction(mouseAction, MOUSE_LEFT, true);
        var leftClick =  new TAction(mouseAction, MOUSE_CLICK, false);
        var rightClick =  new TAction(mouseAction, MOUSE_RIGHT_CLICK, false);
                
        var nothing = new TAction(ACT_NONE, 0, false);
        var leftBuzz    = getBuzzerAction(400, 100);
        var rightBuzz    = getBuzzerAction(400, 100);
        
        if (!doClicks) {
            // Simple Joystick
            Triggers.add(sAHigh, 1, 0, mouseLeft,  1);
            Triggers.add(sALow , 1, 0, mouseRight, 1);
        } else {            
            // Joystick with L and R click.
            Triggers.add(sALow,    1,   0, nothing,    2);
            Triggers.add(sALow,    2, 300, mouseRight, 3);
            Triggers.add(sALow,    3,   0, mouseRight, 3);
            Triggers.add(sANotLow, 3,   0, nothing,    1);
            if (doAudio) {
                Triggers.add(sANotLow, 2, 20, rightClick, 5);
                Triggers.add(sANotLow, 5,  0, rightBuzz,  1);
            } else {
                Triggers.add(sANotLow, 2, 20, rightClick, 1);                
            }
            Triggers.add(sAHigh,    1,   0, nothing,   6);
            Triggers.add(sAHigh,    6, 300, mouseLeft, 7);
            Triggers.add(sAHigh,    7,   0, mouseLeft, 7);
            Triggers.add(sANotHigh, 7,   0, nothing,   1);
            if (doAudio) {
                Triggers.add(sANotHigh, 6,  20, leftClick, 8);
                Triggers.add(sANotHigh, 8,   0, leftBuzz,  1);
            } else {
                Triggers.add(sANotHigh, 6,  20, leftClick, 1);                
            }
        }
        // Simple up/down
        Triggers.add(sBHigh, 1,  0, mouseDown, 1);
        Triggers.add(sBLow,  1,  0, mouseUp,   1);
    }
}

// -----------------------------------------------------------------
// -- Joystick 2 --------------------------------
class JoystickMouse2 extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_JOYSTICK_LOCATION, portOptions, portOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ENABLE_L_AND_R_CLICKS, false));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_TOGGLE, false));
        
        this.sensorCount = 2;
        this.sensorBCount = 1;
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    getPortBUsed() {
        return this.settings[2].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
        this.settings[2].setValue(getPortBySensor(parameters.singleButtonSensor));
        this.options[0].setValue(parameters.clicks);
        this.options[1].setValue(parameters.audio);
        this.options[2].setValue(parameters.singleButtonAudio);
    }
    
    compile() {
        var connectionType = this.settings[0].getValue();
        var joystickPort = this.settings[1].getValue();
        var buttonPort = this.settings[2].getValue();
        var doClicks = this.options[0].getValue();
        var doAudioClicks = this.options[1].getValue();
        var doAudioToggle = this.options[2].getValue();
        
//        if (!doClicks) doAudioClicks = false;
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Joystick Port: " + joystickPort.name);
        console.log("  Button Port: " + buttonPort.name);
        console.log("  Do Clicks: " + doClicks);
        console.log("  Do Audio for Clicks: " + doAudioClicks);        
        console.log("  Do Audio for Toggle: " + doAudioToggle);  
  */      
        var joystickA = joystickPort.getSensor(SENSOR_A);
        var joystickB = joystickPort.getSensor(SENSOR_B);
        var btnSensor = buttonPort.getSensor(this.subPort);
                
        var jsAHigh    = new TSignal(joystickA, 700, TRIGGER_ON_HIGH);
        var jsANotHigh = new TSignal(joystickA, 700, TRIGGER_ON_LOW);
        var jsALow     = new TSignal(joystickA, 250, TRIGGER_ON_LOW);
        var jsANotLow  = new TSignal(joystickA, 250, TRIGGER_ON_HIGH);
        var jsBHigh    = new TSignal(joystickB, 700, TRIGGER_ON_HIGH);
        var jsBLow     = new TSignal(joystickB, 250, TRIGGER_ON_LOW);
        var btnPressed = new TSignal(btnSensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(btnSensor, 500, TRIGGER_ON_LOW);
        
        // Mouse actions
        var mouseAction = connectionType.mouseAction;
        var mouseUp    = new TAction(mouseAction, MOUSE_UP, true);
        var mouseDown  = new TAction(mouseAction, MOUSE_DOWN, true);
        var mouseRight = new TAction(mouseAction, MOUSE_RIGHT, true);
        var mouseLeft  = new TAction(mouseAction, MOUSE_LEFT, true);
        var leftClick  = new TAction(mouseAction, MOUSE_CLICK, false);
        var rightClick = new TAction(mouseAction, MOUSE_RIGHT_CLICK, false);
        var scrollUp   = new TAction(mouseAction, MOUSE_WHEEL_UP, true);
        var scrollDown = new TAction(mouseAction, MOUSE_WHEEL_DOWN, true);
                
        // Other actions
        var nothing = new TAction(ACT_NONE, 0, false);
        var buzzclick  = getBuzzerAction(400, 100);
        var buzzpress   = getBuzzerAction(200, 100);
        var buzzrelease = getBuzzerAction(800, 100);                
        var lightOn   = getLightBoxAction(LBO_ADD, 4);
        var lightOff  = getLightBoxAction(LBO_REMOVE, 4);
        var setState1 = getSetStateAction(joystickB, 1);
        var setState2 = getSetStateAction(joystickB, 2);
        
        if (!doClicks) {
            // Simple Joystick
            Triggers.add(jsAHigh, 1,  0, mouseLeft, 1);
            Triggers.add(jsALow, 1,   0, mouseRight, 1);
        } else {            
            // Joystick with L and R click.
            Triggers.add(jsALow,    1,   0, nothing,    2);
            Triggers.add(jsALow,    2, 300, mouseRight, 3);
            Triggers.add(jsALow,    3,   0, mouseRight, 3);
            Triggers.add(jsANotLow, 3,   0, nothing,    1);
            if (doAudioClicks) {
                Triggers.add(jsANotLow, 2, 20, rightClick, 5);
                Triggers.add(jsANotLow, 5,  0, buzzclick,    1);
            } else {
                Triggers.add(jsANotLow, 2, 20, rightClick, 1);                
            }
            Triggers.add(jsAHigh,    1,   0, nothing,   6);
            Triggers.add(jsAHigh,    6, 300, mouseLeft, 7);
            Triggers.add(jsAHigh,    7,   0, mouseLeft, 7);
            Triggers.add(jsANotHigh, 7,   0, nothing,   1);
            if (doAudioClicks) {
                Triggers.add(jsANotHigh, 6, 20, leftClick, 8);
                Triggers.add(jsANotHigh, 8,  0, buzzclick,   1);
            } else {
                Triggers.add(jsANotHigh, 6, 20, leftClick, 1);                
            }
        }
        // up/down & scrolling
        Triggers.add(jsBHigh, 1, 0, mouseDown, 1);
        Triggers.add(jsBLow,  1, 0, mouseUp,   1);        
        Triggers.add(jsBHigh, 2, 0, scrollDown, 2);
        Triggers.add(jsBLow,  2, 0, scrollUp,   2); 
        
        // Toggle Button
        if (doAudioToggle) {
            Triggers.add(btnPressed, 1, 0, buzzpress, 2);
            Triggers.add(btnPressed, 2, 0, lightOn,  3);
        } else {
            Triggers.add(btnPressed, 1, 0, lightOn,  3);
        }
        Triggers.add(btnPressed,     3, 0, setState2, 4);
        Triggers.add(btnRelease,     4, 0, nothing,   5);
        if (doAudioToggle) {
            Triggers.add(btnPressed, 5, 0, buzzrelease, 6);
            Triggers.add(btnPressed, 6, 0, lightOff,   7);            
        } else {
            Triggers.add(btnPressed, 5, 0, lightOff,   7);
        }
        Triggers.add(btnPressed,     7, 0, setState1, 8);
        Triggers.add(btnRelease,     8, 0, nothing,   1);
    }
}

// -----------------------------------------------------------------
// -- Gyro Mouse --------------------------------
class GyroPosition {
    constructor(name) { 
        this.name = name; 
    }
}

const GM_RIGHT_CLICK_OPTION = "Do a right click with a quick right head motion.";
const GM_LEFT_CLICK_OPTION = "Do a left click with a quick nod.";
const GM_HEAD_TILT_OPTION = "A head tilt can be used to turn the gyro on and off.";
const LEFT_SIDE = "left side";
const RIGHT_SIDE = "right side";
const gyroPositions = [];
const LEFT_POSITION = new GyroPosition(LEFT_SIDE);
const RIGHT_POSITION = new GyroPosition(RIGHT_SIDE);
gyroPositions.push( LEFT_POSITION );
gyroPositions.push( RIGHT_POSITION );


class GyroMouse extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox ("I will place the gyro on the ", gyroPositions, gyroPositions[0]));
        this.addSetting( new Slider("Sensitivity", 0, 100, 50) );
        var btn = new Button("Calibrate");
        btn.button.onclick = doCalibration;
        this.addSetting( btn );
        
        this.addOption( new CheckBox (GM_LEFT_CLICK_OPTION, false));
        this.addOption( new CheckBox (GM_RIGHT_CLICK_OPTION, false));
        this.addOption( new CheckBox (GM_HEAD_TILT_OPTION, false));
        this.sensorCount = 0;
        
        // Defaults - until calibration is run.
        this.yBias = 0;
        this.zBias = 0;
        this.tiltThreshold = -2000;
        this.tiltIsNegative = true;
    }
    
    setParameters(parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        var side = parameters.headSide;
        if (side === "Left") {
            this.settings[1].setValue(LEFT_POSITION);
        } else {
            this.settings[1].setValue(RIGHT_POSITION);            
        }
        this.settings[2].setValue(parameters.sensitivity);
        this.options[0].setValue(parameters.leftClick);
        this.options[1].setValue(parameters.rightClick);
        this.options[2].setValue(parameters.tiltSwitch);
        
        this.yBias = parameters.yBias;
        this.zBias = parameters.zBias;
        this.tiltIsNegative = parameters.tiltIsNegative;
        
        if (parameters.tiltThreshold) {
            this.tiltThreshold = parameters.tiltThreshold;
        }
    }
    
    compile() {
        var connectionType  = this.settings[0].getValue();
        var side        = this.settings[1].getValue();
        var sensitivity = this.settings[2].getValue();
        var leftClickOp  = this.options[0].getValue();
        var rightClickOp = this.options[1].getValue();
        var tiltOption = this.options[2].getValue();
        
        if (CalibrationData.calibrationDone) {
            this.yBias = CalibrationData.gyroYBias;
            this.zBias = CalibrationData.gyroZBias;
            this.tiltThreshold = CalibrationData.tiltPoint;
            this.tiltIsNegative = CalibrationData.tiltIsNegative;
        }

        // Default thresholds.
        var z_threshold = 2500 - (sensitivity-50) * 30;
        var y_threshold = 3500 - (sensitivity-50) * 30;
/*
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Side: " + side.name);
        console.log("  Sensitivity: " + sensitivity);
        console.log("  Left Click: " + leftClickOp);
        console.log("  Right Click: " + rightClickOp);
        console.log("  Head Tilt: " + tiltOption);
        console.log("  yBias: " + this.yBias);
        console.log("  zBias: " + this.zBias);
        console.log("  tilt threshold: " + this.tiltThreshold);
        console.log("  tilt is negative: " + this.tiltIsNegative);
        console.log("  z_threshold: " + z_threshold);
        console.log("  y_threshold: " + y_threshold);
*/        
        var mouseAction = connectionType.mouseAction;
        var mouseUp    = new TAction(mouseAction, MOUSE_UP, true);
        var mouseDown  = new TAction(mouseAction, MOUSE_DOWN, true);
        var mouseRight = new TAction(mouseAction, MOUSE_RIGHT, true);
        var mouseLeft  = new TAction(mouseAction, MOUSE_LEFT, true);
        var leftClick  = new TAction(mouseAction, MOUSE_CLICK, false);
        var rightClick = new TAction(mouseAction, MOUSE_RIGHT_CLICK, false);
        
        // Actions used in sub-routines.
        this.nothing = new TAction(ACT_NONE, 0, false);
        this.buzzLo    = getBuzzerAction(400, 250);
        this.buzzVLo    = getBuzzerAction(250, 50);
        this.buzzHi    = getBuzzerAction(800, 100);                
        
        // ------------------------------
        // Left-Right
        this.genSimple(SENSOR_GYRO_Y, y_threshold, this.yBias, true, mouseLeft, 2);
        if (rightClickOp) {
            this.genWithClicks(SENSOR_GYRO_Y, y_threshold, this.yBias, false, mouseRight, rightClick);
        } else {
            this.genSimple(SENSOR_GYRO_Y, y_threshold, this.yBias, false, mouseRight, 4);
        }
        
        // ------------------------------
        // Up-Down
        if (side.name === LEFT_SIDE) {
            this.genSimple(SENSOR_GYRO_Z, z_threshold, this.zBias, true, mouseUp, 2);
            if (leftClickOp) {
                this.genWithClicks(SENSOR_GYRO_Z, z_threshold, this.zBias, false, mouseDown, leftClick);
            } else {
                this.genSimple(SENSOR_GYRO_Z, z_threshold, this.zBias, false, mouseDown, 4);
            }
        } else {
            this.genSimple(SENSOR_GYRO_Z, z_threshold, this.zBias, false, mouseUp, 2);
            if (leftClickOp) {
                this.genWithClicks(SENSOR_GYRO_Z, z_threshold, this.zBias, true, mouseDown, leftClick);                
            } else {
                this.genSimple(SENSOR_GYRO_Z, z_threshold, this.zBias, true, mouseDown, 4);    
            }
        }
        
        // ------------------------------------------
        // Left tilt to turn the gyro on and off.
        if (tiltOption) {
            var gyroYOff = getSetStateAction(SENSOR_GYRO_Y, 9);
            var gyroZOff = getSetStateAction(SENSOR_GYRO_Z, 9);
            var gyroYOn  = getSetStateAction(SENSOR_GYRO_Y, 1);
            var gyroZOn  = getSetStateAction(SENSOR_GYRO_Z, 1);
            var offBeep   = getBuzzerAction(200, 500);
            var readyBeep = getBuzzerAction(800, 100);
            var onBeep    = getBuzzerAction(1200, 100);

            var low, high;
            if (this.tiltIsNegative) {
                low = new TSignal(SENSOR_ACCEL_Z, this.tiltThreshold, TRIGGER_ON_LOW);
                high = new TSignal(SENSOR_ACCEL_Z, this.tiltThreshold, TRIGGER_ON_HIGH);
             } else {
                low = new TSignal(SENSOR_ACCEL_Z, this.tiltThreshold, TRIGGER_ON_HIGH);
                high = new TSignal(SENSOR_ACCEL_Z, this.tiltThreshold, TRIGGER_ON_LOW);
             }           
             
            Triggers.add(low,  1,    0, gyroYOff,  2);
            Triggers.add(low,  2,    0, gyroZOff,  3);
            Triggers.add(low,  3,    0, offBeep,   4);
            Triggers.add(high, 4,  500, this.nothing,   8);
            Triggers.add(high, 6,    0, gyroYOn,   7);
            Triggers.add(high, 7,    0, gyroZOn,   1);
            Triggers.add(low,  8,    0, readyBeep, 9);
            Triggers.add(high, 9,  100, onBeep,    6);
        }       
    }    
    
    genSimple(sensor, threshold, bias, startLow, func, next) {
        var low, notLow, high, notHigh;
        
        if (startLow) {
            low = new TSignal(sensor, -threshold+bias, TRIGGER_ON_LOW);
            high = new TSignal(sensor, threshold+bias, TRIGGER_ON_HIGH);
        } else {
            // Reverse high-low sense
            high = new TSignal(sensor, -threshold + bias, TRIGGER_ON_LOW);
            low = new TSignal(sensor, threshold + bias, TRIGGER_ON_HIGH);            
        }
        notLow = low.not();
        notHigh = high.not();
        
        // Left-Right
        Triggers.add(low,          1,  80, this.buzzLo,  next);
        Triggers.add(notLow,    next,   0, func,    next);
        Triggers.add(high,      next,  50, this.buzzVLo, next+1);
        Triggers.add(notHigh, next+1, 250, this.nothing, 1);        
    }
    
    genWithClicks(sensor, threshold, bias, startLow, func1, func2) {
        var low, notLow, high, notHigh;
        
        if (startLow) {
            low = new TSignal(sensor, -threshold + bias, TRIGGER_ON_LOW);
            high = new TSignal(sensor, threshold + bias, TRIGGER_ON_HIGH);
        } else {
            // Reverse high-low sense
            high = new TSignal(sensor, -threshold + bias, TRIGGER_ON_LOW);
            low = new TSignal(sensor, threshold + bias, TRIGGER_ON_HIGH);            
        }
        notLow = low.not();
        notHigh = high.not();
    
        Triggers.add(low,     1,  80, this.buzzLo,  4);
        Triggers.add(notLow,  4, 300, func1,   5);
        Triggers.add(notHigh, 5,   0, func1,   5);
        Triggers.add(high,    5,  50, this.buzzVLo, 8);
        Triggers.add(high,    4,  50, this.buzzHi,  7);
        Triggers.add(notHigh, 7,   0, func2,   8);
        Triggers.add(notHigh, 8, 250, this.nothing, 1);
    }
}

// -----------------------------------------------------------------
// -- Left Click Button -----------------------------------
class LeftClickButton extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
    }

    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
        this.options[0].setValue(parameters.audio);
    }

    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doAudio = this.options[0].getValue();
 /*                       
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
   */     
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);

        var leftClick  = new TAction(connectionType.mouseAction, MOUSE_CLICK, false);
         
        Triggers.add(btnPressed, 1,  0, leftClick, 1); 
        
        if (doAudio) {
            var buzz = getBuzzerAction(400, 100);
            Triggers.add(btnPressed, 1,  0, buzz, 1);
        }
   }
}

// -----------------------------------------------------------------
// -- Right Click Button -----------------------------------
class RightClickButton extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
        this.options[0].setValue(parameters.audio);
    }

    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doAudio = this.options[0].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
        */
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);

        var rightClick = new TAction(connectionType.mouseAction, MOUSE_RIGHT_CLICK, false);
         
        Triggers.add(btnPressed, 1,  0, rightClick, 1); 
        
        if (doAudio) {
            var buzz = getBuzzerAction(400, 100);
            Triggers.add(btnPressed, 1,  0, buzz, 1);
        }
    }
 }

// -----------------------------------------------------------------
// -- Left Press-Release Toggle -----------------------------------
class LeftPressReleaseToggle extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
        this.options[0].setValue(parameters.audio);
    }

    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doAudio = this.options[0].getValue();
 /*               
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
*/
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
        
        var press   = new TAction(connectionType.mouseAction, MOUSE_PRESS, false);
        var release = new TAction(connectionType.mouseAction, MOUSE_RELEASE, false);
        var lightOn   = getLightBoxAction(LBO_ADD, 3);
        var lightOff  = getLightBoxAction(LBO_REMOVE, 3);
        var buzz = getBuzzerAction(200, 100);
        var hibuzz = getBuzzerAction(800, 100);
        
        if ( doAudio ) {
            Triggers.add(btnPressed, 1, 0, buzz,      1);
        }
        Triggers.add(btnPressed, 1,   0, press,     2);            
        Triggers.add(btnRelease, 2,   0, lightOn,   3);
        if ( doAudio ) {
            Triggers.add(btnPressed, 3, 0, hibuzz ,   3);
        }
        Triggers.add(btnPressed, 3,   0, release,   4);
        Triggers.add(btnRelease, 4,   0, lightOff,   1);        
    }
 }

// -----------------------------------------------------------------
// -- Left Button Emulation -----------------------------------
class LeftButtonEmulation extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
   }

    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);

        var press   = new TAction(connectionType.mouseAction, MOUSE_PRESS, false);
        var release = new TAction(connectionType.mouseAction, MOUSE_RELEASE, false);
                
        Triggers.add(btnPressed, 1, 0, press,   2); 
        Triggers.add(btnRelease, 2, 0, release, 1);         
    }
}

// -----------------------------------------------------------------
// -- Three Function Button -----------------------------------
class ThreeFunctionButton extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
   }

     compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
        
        var mouseAction = connectionType.mouseAction;
        var mouseLClick = new TAction(mouseAction, MOUSE_CLICK, false);
        var mouseRClick = new TAction(mouseAction, MOUSE_RIGHT_CLICK, false);
        var mouseLPress = new TAction(mouseAction, MOUSE_PRESS, false);
        var nothing = new TAction(ACT_NONE, 0, false);
        var hibuzz = getBuzzerAction(400, 100);
        
        Triggers.add(btnPressed, 1,   0, nothing,     2);
        Triggers.add(btnRelease, 2,   0, mouseLClick, 1);
        Triggers.add(btnPressed, 2, 500, hibuzz,      3);
        Triggers.add(btnRelease, 3,   0, mouseRClick, 1);
        Triggers.add(btnPressed, 3, 500, hibuzz,      4);
        Triggers.add(btnRelease, 4,   0, mouseLPress, 1);
    }
 }

// -----------------------------------------------------------------
// -- Left-Right click buttons -----------------------------------
class LeftRightClick extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_TWO_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
        
        this.sensorCount = 2;
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
        this.options[0].setValue(parameters.audio);
    }
    
    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doAudio = this.options[0].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
  */      
        var sensorA = port.getSensor(SENSOR_A);
        var sensorB = port.getSensor(SENSOR_B);
        var btnAPressed = new TSignal(sensorA, 500, TRIGGER_ON_HIGH);
        var btnBPressed = new TSignal(sensorB, 500, TRIGGER_ON_HIGH);
        
        var mouseLClick = new TAction(connectionType.mouseAction, MOUSE_CLICK, false);
        var mouseRClick = new TAction(connectionType.mouseAction, MOUSE_RIGHT_CLICK, false);
        var buzz = getBuzzerAction(400, 100);
        
        Triggers.add(btnAPressed, 1, 0, mouseLClick, 1);
        Triggers.add(btnBPressed, 1, 0, mouseRClick, 1);
        if ( doAudio ) {
            Triggers.add(btnAPressed, 1, 0, buzz, 1);
            Triggers.add(btnBPressed, 1, 0, buzz, 1);                
        }        
    }
 }


// -- SCROLLING
// 
// -----------------------------------------------------------------
// -- Scroll Up Down Toggle  -----------------------------------           
class ScrollUpDownToggle extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
   }

     compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
 /*       
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
   */     
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
                
        var scrollUp = new TAction(connectionType.mouseAction, MOUSE_WHEEL_UP, true);
        var scrollDown = new TAction(connectionType.mouseAction, MOUSE_WHEEL_DOWN, true);
        var nothing = new TAction(ACT_NONE, 0, false);
        var buzz   = getBuzzerAction(200, 100);
        
        Triggers.add(btnPressed, 1,    0, nothing,   2);
        Triggers.add(btnPressed, 2,    0, scrollDown,2);
        Triggers.add(btnRelease, 2,  800, buzz,      3);
        Triggers.add(btnRelease, 3, 3000, nothing,   1);
        Triggers.add(btnPressed, 3,    0, nothing,   4);
        Triggers.add(btnPressed, 4,    0, scrollUp,  4);
        Triggers.add(btnRelease, 4,  800, buzz,      1);
    }
 }

// -----------------------------------------------------------------
// -- Scroll Up Down Buttons -----------------------------------
class ScrollUpDownButtons extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_TWO_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_FOR_BTN, false));
        
        this.sensorCount = 2;
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
        this.options[0].setValue(parameters.audio);
    }
    
    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doAudio = this.options[0].getValue();
/*       
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
  */      
        var sensorA = port.getSensor(SENSOR_A);
        var sensorB = port.getSensor(SENSOR_B);
        var btnAPressed = new TSignal(sensorA, 500, TRIGGER_ON_HIGH);
        var btnBPressed = new TSignal(sensorB, 500, TRIGGER_ON_HIGH);
        
        var scrollUp   = new TAction(connectionType.mouseAction, MOUSE_WHEEL_UP, true);
        var scrollDown = new TAction(connectionType.mouseAction, MOUSE_WHEEL_DOWN, true);
        var buzz = getBuzzerAction(200, 100);
        
        Triggers.add(btnAPressed, 1, 0, scrollUp, 1);
        Triggers.add(btnBPressed, 1, 0, scrollDown, 1);
        if ( doAudio ) {
            Triggers.add(btnAPressed, 1, 0, buzz, 1);
            Triggers.add(btnBPressed, 1, 0, buzz, 1);                
        }        
    }
 }

// -----------------------------------------------------------------
// -- Scroll Up Down Buttons -----------------------------------

class ScrollWithJoystick extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_JOYSTICK_LOCATION, portOptions, portOptions[0]));
        this.addOption( new CheckBox (Q_ENABLE_L_AND_R_CLICKS, false));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_CLICKS, false));
        
        this.sensorCount = 2;
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
        this.options[0].setValue(parameters.clicks);
        this.options[1].setValue(parameters.audio);
    }
    
    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var doClicks = this.options[0].getValue();
        var doAudio = this.options[1].getValue();
/*       
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
  */      
        var joystickA = port.getSensor(SENSOR_A);
        var joystickB = port.getSensor(SENSOR_B);
        var jsAHigh    = new TSignal(joystickA, 700, TRIGGER_ON_HIGH);
        var jsALow     = new TSignal(joystickA, 250, TRIGGER_ON_LOW);
        var jsBHigh    = new TSignal(joystickB, 700, TRIGGER_ON_HIGH);
        var jsBNotHigh = new TSignal(joystickB, 700, TRIGGER_ON_LOW);
        var jsBLow     = new TSignal(joystickB, 250, TRIGGER_ON_LOW);
        var jsBNotLow  = new TSignal(joystickB, 250, TRIGGER_ON_HIGH);
        
        var nothing = new TAction(ACT_NONE, 0, false);
        var scrollUp   = new TAction(connectionType.mouseAction, MOUSE_WHEEL_UP, true);
        var scrollDown = new TAction(connectionType.mouseAction, MOUSE_WHEEL_DOWN, true);
        var buzz = getBuzzerAction(400, 100);
        var mouseLClick = new TAction(connectionType.mouseAction, MOUSE_CLICK, false);
        var mouseRClick = new TAction(connectionType.mouseAction, MOUSE_RIGHT_CLICK, false);
        
        Triggers.add(jsBLow, 1, 0, scrollUp, 1);
        Triggers.add(jsBNotLow, 1, 0, nothing, 1);
        Triggers.add(jsBHigh, 1, 0, scrollDown, 1);
        Triggers.add(jsBNotHigh, 1, 0, nothing, 1);
        
        if (doClicks) {
            Triggers.add(jsAHigh, 1, 0, mouseLClick, 1);
            Triggers.add(jsALow, 1, 0, mouseRClick, 1);
            if (doAudio) {
                Triggers.add(jsAHigh, 1, 0, buzz, 1);
                Triggers.add(jsALow, 1, 0, buzz, 1);            
            }
        }
    }
 }

// -- KEYBOARD
// -----------------------------------------------------------------
// -- Keyboard Text -----------------------------------
class KeyboardText extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addSetting( new TextBox ("Text: ", 20));
        this.addOption( new CheckBox ("End with RETURN.", false));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
        this.settings[2].setValue(parameters.text);
        this.options[0].setValue(parameters.endsWithReturn);
    }

    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var text = this.settings[2].getValue();
        var addReturn = this.options[0].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
        console.log("  Text: " + text);
        console.log("  Return: " + addReturn);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        
        let i = 0;
        while(i < text.length) {
            let end = i + 4;
            if (end > (text.length)) end = text.length;
            var data = text.slice(i, end);
            // Convert data - as string - to a 32-bit parameter number.
            var value = 0;
            for(let j=0; j < data.length; j++) {
                value = (value << 8) + data.charCodeAt(j);
            }
            var keys = new TAction(connectionType.keybdAction, value, false);
            i = end;
            Triggers.add(btnPressed, 1, 0, keys, 1);
        }
        
        if ( addReturn ) {
            var returnKey = new TAction(connectionType.keybdAction, connectionType.getKeyCode(RETURN_KEY), false);
            Triggers.add(btnPressed, 1,  0, returnKey, 1);            
        }        
    }
 }

// -----------------------------------------------------------------
// -- Keyboard Special -----------------------------------
class KeyboardSpecial extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0]));
        this.addSetting( new SpecialKeys("Special Key "));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
        this.settings[2].setValue(parameters.keyCode);
   }

    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
        var key = this.settings[2].getValue();
 /*       
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
        console.log("  Key:  " + key.name);
   */     
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);

        var action = new TAction(connectionType.keybdAction, connectionType.getKeyCode(key), false);
        
        Triggers.add(btnPressed, 1,  0, action, 1);         
    }
 }

// -----------------------------------------------------------------
// -- Keyboard Modifier -----------------------------------
class KeyboardModifier extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0], "setting"));
        this.addSetting( new ModifierKeys("Modifier Key "));
        this.addSetting( new NotModifierKeys("Key Press "));
    }
    
    getPortUsed() {
        return this.settings[0].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getPortBySensor(sensor));
        this.settings[1].setValue(parameters.modKey);
        this.settings[2].setValue(parameters.keyCode);
   }

    compile() {
        var port = this.settings[0].getValue();
        var modifier  = this.settings[1].getValue();
        var key = this.settings[2].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Port: " + port.name);
        console.log("  Modifier:" + modifier.name);
        console.log("  Key:     " + key.name);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);

        var code = KEY_MODIFIER + (modifier.wiredCode << 8) + key.wiredCode;
        var action = new TAction(ACT_WIRED_KEYBOARD, code, false);
        
        Triggers.add(btnPressed, 1,  0, action, 1);         
    }
 }

// -----------------------------------------------------------------
// -- Up-Down Arrow Toggle -----------------------------------
class KeyboardUpDownArrowToggle extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_CONNECTION_TYPE, connectionOptions, connectionOptions[0]));
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0], "setting"));
    }
    
    getPortUsed() {
        return this.settings[1].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getConnection(parameters.connection));
        this.settings[1].setValue(getPortBySensor(sensor));
   }
    
    compile() {
        var connectionType = this.settings[0].getValue();
        var port = this.settings[1].getValue();
/*        
        console.log("Compile " + this.name);
        console.log("  Connection: " + connectionType.name);
        console.log("  Port: " + port.name);
  */      
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
                
        var upArrow   = new TAction(connectionType.keybdAction, connectionType.getKeyCode(UP_ARROW_KEY), true);
        var downArrow = new TAction(connectionType.keybdAction, connectionType.getKeyCode(DOWN_ARROW_KEY), true);
        var nothing = new TAction(ACT_NONE, 0, false);
        var buzz   = getBuzzerAction(200, 100);
        
        Triggers.add(btnPressed, 1,    0, nothing,   2);
        Triggers.add(btnPressed, 2,    0, downArrow, 2);
        Triggers.add(btnRelease, 2,  800, buzz,      3);
        Triggers.add(btnRelease, 3, 3000, nothing,   1);
        Triggers.add(btnPressed, 3,    0, nothing,   4);
        Triggers.add(btnPressed, 4,    0, upArrow,   4);
        Triggers.add(btnRelease, 4,  800, buzz,      1);    
    }
}

// -----------------------------------------------------------------
// -- Keyboard Shift -----------------------------------
class KeyboardShift extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0], "setting"));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_FOR_BTN, false));
    }
    
    getPortUsed() {
        return this.settings[0].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getPortBySensor(sensor));
        this.options[0].setValue(parameters.audio);
   }

    compile() {
        var port = this.settings[0].getValue();
        var doAudio = this.options[0].getValue();
 /*               
        console.log("Compile " + this.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
*/
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
        
        var press   = new TAction(ACT_WIRED_KEYBOARD, LEFT_SHIFT_KEY.wiredCode + KEY_PRESS, false);
        var release = new TAction(ACT_WIRED_KEYBOARD, LEFT_SHIFT_KEY.wiredCode + KEY_RELEASE, false);
        var lightOn   = getLightBoxAction(LBO_ADD, 2);
        var lightOff  = getLightBoxAction(LBO_REMOVE, 2);
        var buzz = getBuzzerAction(200, 100);
        var hibuzz = getBuzzerAction(800, 100);
        
        if ( doAudio ) {
            Triggers.add(btnPressed, 1, 0, buzz,    1);
        }
        Triggers.add(btnPressed, 1,   0, press,     2);            
        Triggers.add(btnRelease, 2,   0, lightOn,   3);
        if ( doAudio ) {
            Triggers.add(btnPressed, 3, 0, hibuzz , 3);
        }
        Triggers.add(btnPressed, 3,   0, release,   4);
        Triggers.add(btnRelease, 4,   0, lightOff,   1);        
    }
}


// -----------------------------------------------------------------
// -- Keyboard Control -----------------------------------
class KeyboardControl extends SolutionBase {
    constructor(solreg) {
        super(solreg);
        this.addSetting( new SelectionBox (Q_ONE_BTN_PORT_LOCATION, portOptions, portOptions[0], "setting"));
        this.addOption( new CheckBox (Q_ADD_AUDIO_FEEDBACK_FOR_BTN, false));
    }
    
    getPortUsed() {
        return this.settings[0].getValue();
    }
    
    setParameters(sensor, parameters) {
        this.settings[0].setValue(getPortBySensor(sensor));
        this.options[0].setValue(parameters.audio);
   }

    compile() {
        var port = this.settings[0].getValue();
        
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
         var port = this.settings[0].getValue();
        var doAudio = this.options[0].getValue();
/*                
        console.log("Compile " + this.name);
        console.log("  Port: " + port.name);
        console.log("  Do Audio: " + doAudio);
*/
        var sensor = port.getSensor(this.subPort);
        var btnPressed = new TSignal(sensor, 500, TRIGGER_ON_HIGH);
        var btnRelease = new TSignal(sensor, 500, TRIGGER_ON_LOW);
        
        var press   = new TAction(ACT_WIRED_KEYBOARD, LEFT_CONTROL_KEY.wiredCode + KEY_PRESS, false);
        var release = new TAction(ACT_WIRED_KEYBOARD, LEFT_CONTROL_KEY.wiredCode + KEY_RELEASE, false);
        var lightOn   = getLightBoxAction(LBO_ADD, 1);
        var lightOff  = getLightBoxAction(LBO_REMOVE, 1);
        var buzz = getBuzzerAction(200, 100);
        var hibuzz = getBuzzerAction(800, 100);
        
        if ( doAudio ) {
            Triggers.add(btnPressed, 1, 0, buzz,      1);
        }
        Triggers.add(btnPressed, 1,   0, press,     2);            
        Triggers.add(btnRelease, 2,   0, lightOn,   3);
        if ( doAudio ) {
            Triggers.add(btnPressed, 3, 0, hibuzz ,   3);
        }
        Triggers.add(btnPressed, 3,   0, release,   4);
        Triggers.add(btnRelease, 4,   0, lightOff,   1);        
   }
}

class UnknownSolution extends SolutionBase {
    constructor(solreg) {
        super(solreg);
    }
    
    getPortUsed() {
        return this.settings[0].getValue();
    }
    
    loadTriggers(tList) {
        this.tList = tList;
        var sensor = tList.get(0).sensor;
        this.originalPort = getPortBySensor(sensor);
        
        if (this.originalPort === null) {
            this.addSetting( new TextOnlyWidget ("This configuration is for a gyroscope or for USB input.  The sensor assignment cannot be changed."));
            
        } else {
            this.addSetting( new SelectionBox ("This configuration is using ", portOptions, portOptions[0], "setting"));
            this.addSetting( new TextOnlyWidget ("Because this is an unrecognized configuration, the consequences of changing the port setting are unknown."));
            this.settings[0].setValue(this.originalPort);
            
        }
    }

    compile() {
        if (this.originalPort !== null) {
            var selectedPort = this.settings[0].getValue();
        
            if (selectedPort !== this.originalPort) {
                // The damn fool changed the port on an unknown config!
                // console.log("Change of port.");
                var newSensor = selectedPort.getSensor(this.subPort);
                for(let trig of this.tList.theList) {
                    trig.sensor = newSensor;
                }
            }
            for(let trig of this.tList.theList) {
                Triggers.addTrigger(trig);
            }
        }
    }
}
