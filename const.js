/* 
 * const.js
 * 
 * Constant values for trigger parameters.
 */

"use strict";

// Mouse Action values
const MOUSE_UP = 1;
const MOUSE_DOWN = 2;
const MOUSE_LEFT = 3;
const MOUSE_RIGHT = 4;
const MOUSE_CLICK = 5;
const MOUSE_PRESS = 6;
const MOUSE_RELEASE = 7;
const MOUSE_RIGHT_CLICK = 8;
const NUDGE_UP = 10;
const NUDGE_DOWN = 11;
const NUDGE_LEFT = 12;
const NUDGE_RIGHT = 13;
const NUDGE_STOP = 14;
const MOUSE_WHEEL_UP = 20;
const MOUSE_WHEEL_DOWN = 21;
// Extentions - added for v1.02 of the hub.
const MOUSE_RIGHT_PRESS = 30;
const MOUSE_RIGHT_RELEASE = 31;
const MOUSE_MIDDLE_CLICK = 32;
const MOUSE_MIDDLE_PRESS = 33;
const MOUSE_MIDDLE_RELEASE = 34;

const IR_TV_ON_OFF = 1;
const IR_VOLUME_UP = 2;
const IR_VOLUME_DOWN = 3;
const IR_MUTE = 4;
const IR_BOX_ON_OFF = 101;
const IR_CHANNEL_UP = 102;
const IR_CHANNEL_DOWN = 103;
const IR_DIGIT_0 = 110;
const IR_DIGIT_1 = 111;
const IR_DIGIT_2 = 112;
const IR_DIGIT_3 = 113;
const IR_DIGIT_4 = 114;
const IR_DIGIT_5 = 115;
const IR_DIGIT_6 = 116;
const IR_DIGIT_7 = 117;
const IR_DIGIT_8 = 118;
const IR_DIGIT_9 = 119;
    
    // Light box action options
const LBO_ONLY = 0;
const LBO_ADD = 0x0100;
const LBO_REMOVE = 0x0200;
const LBO_PULSE = 0x0300;
    
    // Relay values
const RELAY_PULSE = 0;
const RELAY_ON = 1;
const RELAY_OFF = 2;
    
    // Press and Release values - added to key values
const KEY_PRESS = 0xff000000;
const KEY_RELEASE = 0xfe000000;
const KEY_MODIFIER = 0xfd000000;


