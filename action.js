/*
 * action.js
 * 
 * An experiment in repackaging actions and constants.
 */

// TAction - holder for all parts of an action.
class TAction {
    constructor(action, parameter, repeat) {
        this.action = action;       // Class Action
        this.parameter = parameter; // 32-bit value
        this.repeat = repeat;       // boolean
    }
};

class Action {
    constructor(i, n) {
        this.id = i;
        this.name = n;
    }
};

// List of actions
var AList = {
 ACT_NONE           : new Action(0, "None"),
 ACT_RELAY          : new Action(1, "Relay"),
 ACT_BT_KEYBOARD    : new Action(3, "BT Keyboard"),
 ACT_WIRED_KEYBOARD : new Action(4, "Wired Keyboard"),
 ACT_WIRED_MOUSE    : new Action(5, "Wired Mouse"),
 ACT_SERIAL         : new Action(6, "Serial"),
 ACT_BUZZER         : new Action(7, "Buzzer"),
 ACT_IR             : new Action(8, "IR"),
 ACT_BT_MOUSE       : new Action(9, "BT Mouse"),
 ACT_SET_STATE      : new Action(10, "Set State"),
 ACT_LIGHT_BOX      : new Action(11, "Light Box")
};

// Action-related functions and constants.
var AFunc = {    
    getActionByID: function(id) {
        for(var actionName in AList) {
            let action = AList[actionName];
            if (action.id === id) {
                return action;
            }
        }
        return null;
    },
    
    // Action builders.
    getBuzzerAction: function(pitch, duration) {
        var param = pitch << 16;
        var param = param + duration;
        return new TAction(AList.ACT_BUZZER, param, false);
    },

    getLightBoxAction: function(option, light) {
        return new TAction(AList.ACT_LIGHT_BOX, option + (1 << (light-1)), false);
    },

    getSetStateAction: function(sensor, newState) {
        return new TAction(AList.ACT_SET_STATE, (sensor.id << 8) + newState, false);
    },

    // Mouse Action values
    MOUSE_UP    : 1,
    MOUSE_DOWN  : 2,
    MOUSE_LEFT  : 3,
    MOUSE_RIGHT : 4,
    MOUSE_CLICK : 5,
    MOUSE_PRESS : 6,
    MOUSE_RELEASE : 7,
    MOUSE_RIGHT_CLICK : 8,
    NUDGE_UP    : 10,
    NUDGE_DOWN  : 11,
    NUDGE_LEFT  : 12,
    NUDGE_RIGHT : 13,
    NUDGE_STOP  : 14,
    MOUSE_WHEEL_UP : 20,
    MOUSE_WHEEL_DOWN : 21,
    // Extentions - added for v1.02 of the hub.
    MOUSE_RIGHT_PRESS : 30,
    MOUSE_RIGHT_RELEASE : 31,
    MOUSE_MIDDLE_CLICK : 32,
    MOUSE_MIDDLE_PRESS : 33,
    MOUSE_MIDDLE_RELEASE : 34,

    IR_TV_ON_OFF : 1,
    IR_VOLUME_UP : 2,
    IR_VOLUME_DOWN : 3,
    IR_MUTE : 4,
    IR_BOX_ON_OFF : 101,
    IR_CHANNEL_UP : 102,
    IR_CHANNEL_DOWN : 103,
    IR_DIGIT_0 : 110,
    IR_DIGIT_1 : 111,
    IR_DIGIT_2 : 112,
    IR_DIGIT_3 : 113,
    IR_DIGIT_4 : 114,
    IR_DIGIT_5 : 115,
    IR_DIGIT_6 : 116,
    IR_DIGIT_7 : 117,
    IR_DIGIT_8 : 118,
    IR_DIGIT_9 : 119,

        // Light box action options
    LBO_ONLY   : 0,
    LBO_ADD    : 0x0100,
    LBO_REMOVE : 0x0200,
    LBO_PULSE  : 0x0300,

        // Relay values
    RELAY_PULSE : 0,
    RELAY_ON    : 1,
    RELAY_OFF   : 2,

        // Press and Release values - added to key values
    KEY_PRESS    : 0xff000000,
    KEY_RELEASE  : 0xfe000000,
    KEY_MODIFIER : 0xfd000000
};


