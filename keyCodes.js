
/*
 * keycodes.js
 * 
 * Codes for all possible keys.
 */ 

"use strict";

let KeyCode = function(name, wiredCode, btCode, isMod, isSpecial) {
    this.name = name;
    this.wiredCode = wiredCode;
    this.btCode = btCode;
    this.isModifier = isMod;
    this.isSpecial = isSpecial;
};

let keyCodeList = [];

keyCodeList.push( new KeyCode("A Key", 0x61, 0, false, false) );
keyCodeList.push( new KeyCode("B Key", 0x62, 0, false, false) );
keyCodeList.push( new KeyCode("C Key", 0x63, 0, false, false) );
keyCodeList.push( new KeyCode("D Key", 0x64, 0, false, false) );
keyCodeList.push( new KeyCode("E Key", 0x65, 0, false, false) );
keyCodeList.push( new KeyCode("F Key", 0x66, 0, false, false) );
keyCodeList.push( new KeyCode("G Key", 0x67, 0, false, false) );
keyCodeList.push( new KeyCode("H Key", 0x68, 0, false, false) );
keyCodeList.push( new KeyCode("I Key", 0x69, 0, false, false) );
keyCodeList.push( new KeyCode("J Key", 0x6A, 0, false, false) );
keyCodeList.push( new KeyCode("K Key", 0x6B, 0, false, false) );
keyCodeList.push( new KeyCode("L Key", 0x6C, 0, false, false) );
keyCodeList.push( new KeyCode("M Key", 0x6D, 0, false, false) );
keyCodeList.push( new KeyCode("N Key", 0x6E, 0, false, false) );
keyCodeList.push( new KeyCode("O Key", 0x6F, 0, false, false) );
keyCodeList.push( new KeyCode("P Key", 0x70, 0, false, false) );
keyCodeList.push( new KeyCode("Q Key", 0x71, 0, false, false) );
keyCodeList.push( new KeyCode("R Key", 0x72, 0, false, false) );
keyCodeList.push( new KeyCode("S Key", 0x73, 0, false, false) );
keyCodeList.push( new KeyCode("T Key", 0x74, 0, false, false) );
keyCodeList.push( new KeyCode("U Key", 0x75, 0, false, false) );
keyCodeList.push( new KeyCode("V Key", 0x76, 0, false, false) );
keyCodeList.push( new KeyCode("W Key", 0x77, 0, false, false) );
keyCodeList.push( new KeyCode("X Key", 0x78, 0, false, false) );
keyCodeList.push( new KeyCode("Y Key", 0x79, 0, false, false) );
keyCodeList.push( new KeyCode("Z Key", 0x7A, 0, false, false) );
        
keyCodeList.push( new KeyCode("0 Key", 0x30, 0, false, false) );
keyCodeList.push( new KeyCode("1 Key", 0x31, 0, false, false) );
keyCodeList.push( new KeyCode("2 Key", 0x32, 0, false, false) );
keyCodeList.push( new KeyCode("3 Key", 0x33, 0, false, false) );
keyCodeList.push( new KeyCode("4 Key", 0x34, 0, false, false) );
keyCodeList.push( new KeyCode("5 Key", 0x35, 0, false, false) );
keyCodeList.push( new KeyCode("6 Key", 0x36, 0, false, false) );
keyCodeList.push( new KeyCode("7 Key", 0x37, 0, false, false) );
keyCodeList.push( new KeyCode("8 Key", 0x38, 0, false, false) );
keyCodeList.push( new KeyCode("9 Key", 0x39, 0, false, false) );
        
keyCodeList.push( new KeyCode("Space Key",  0x20, 0, false, true) );
keyCodeList.push( new KeyCode("Plus Key",   0x2B, 0, false, false) );
keyCodeList.push( new KeyCode("Minus Key",  0x2D, 0, false, false) );
keyCodeList.push( new KeyCode("back Quote", 0x60, 0, false, false) );
keyCodeList.push( new KeyCode("Open Square Bracket",   0x5B, 0, false, false) );
keyCodeList.push( new KeyCode("Closed Square Bracket", 0x5D, 0, false, false) );
keyCodeList.push( new KeyCode("Open Curly Bracket",    0x7B, 0, false, false) );
keyCodeList.push( new KeyCode("Closed Curly Bracket",  0x7D, 0, false, false) );     
        
const UP_ARROW_KEY = new KeyCode("Up Arrow",    0xDA, 14, false, true);
const DOWN_ARROW_KEY = new KeyCode("Down Arrow",  0xD9, 12, false, true);
keyCodeList.push( UP_ARROW_KEY );
keyCodeList.push( DOWN_ARROW_KEY );
keyCodeList.push( new KeyCode("Left Arrow",  0xD8, 11, false, true) );
keyCodeList.push( new KeyCode("Right Arrow", 0xD7, 7, false, true) );
  
keyCodeList.push( new KeyCode("Backspace", 0xB2, 8, false, true) );
keyCodeList.push( new KeyCode("Tab",       0xB3, 9, false, true) );

const RETURN_KEY = new KeyCode("Return",    0xB0, 10, false, true);
keyCodeList.push( RETURN_KEY );
keyCodeList.push( new KeyCode("Escape",    0xB1, 27, false, true) );
keyCodeList.push( new KeyCode("Insert",    0xD1, 1, false, true) );
keyCodeList.push( new KeyCode("Delete",    0xD4, 4, false, true) );
keyCodeList.push( new KeyCode("Page Up",   0xD3, 3, false, true) );
keyCodeList.push( new KeyCode("Page Down", 0xD6, 6, false, true) );
keyCodeList.push( new KeyCode("Home",      0xD2, 2, false, true) );
keyCodeList.push( new KeyCode("End",       0xD5, 5, false, true) );
        
keyCodeList.push( new KeyCode("CAPS LOCK", 0xC1, 0, false, false) );
        
keyCodeList.push( new KeyCode("Comma",        0x2C, 0, false, false) );
keyCodeList.push( new KeyCode("Period",       0x2E, 0, false, false) );
keyCodeList.push( new KeyCode("Greater Than", 0x3C, 0, false, false) );
keyCodeList.push( new KeyCode("Less Than",    0x3E, 0, false, false) );
        
keyCodeList.push( new KeyCode("F1", 0xC2, 15, false, true) );
keyCodeList.push( new KeyCode("F2", 0xC3, 16, false, true) );
keyCodeList.push( new KeyCode("F3", 0xC4, 17, false, true) );
keyCodeList.push( new KeyCode("F4", 0xC5, 18, false, true) );
keyCodeList.push( new KeyCode("F5", 0xC6, 19, false, true) );
keyCodeList.push( new KeyCode("F6", 0xC7, 20, false, true) );
keyCodeList.push( new KeyCode("F7", 0xC8, 21, false, true) );
keyCodeList.push( new KeyCode("F8", 0xC9, 22, false, true) );
keyCodeList.push( new KeyCode("F9", 0xCA, 23, false, true) );
keyCodeList.push( new KeyCode("F10", 0xCB, 24, false, true) );
keyCodeList.push( new KeyCode("F11", 0xCC, 25, false, true) );
keyCodeList.push( new KeyCode("F12", 0xCD, 26, false, true) );
        
const LEFT_CONTROL_KEY = new KeyCode("Left Control",  0x80, 0xE0, true, false);
const LEFT_SHIFT_KEY = new KeyCode("Left Shift",    0x81, 0xE1, true, false);
keyCodeList.push( LEFT_CONTROL_KEY );
keyCodeList.push( LEFT_SHIFT_KEY );
keyCodeList.push( new KeyCode("Left Alt",      0x82, 0xE2, true, false) );
keyCodeList.push( new KeyCode("Left Windows",  0x83, 0xE3, true, false) );
keyCodeList.push( new KeyCode("Right Control", 0x84, 0xE4, true, true) );
keyCodeList.push( new KeyCode("Right Shift",   0x85, 0xE5, true, false) );
keyCodeList.push( new KeyCode("Right Alt",     0x86, 0xE6, true, true) );
keyCodeList.push( new KeyCode("Right Windows", 0x87, 0xE7, true, false) );

function getWiredKey(value) {
    for(let ch of keyCodeList) {
        if (ch.wiredCode === value) {
            return ch;
        }
    }
}

function getBTKey(value) {
    for(let ch of keyCodeList) {
        if (ch.btCode === value) {
            return ch;
        }
    }    
}



