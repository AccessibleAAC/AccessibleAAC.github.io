/* 
 * reg.js
 * 
 * Registry of solutions - version 2.
 */

var Reg = {
    SolOneBtnMouse: { 
        name: "One Button Mouse",
        summary: "Enable left-click and control of cursor motion with a single button.",
        description: "Control a mouse with a single button. A quick click generates a mouse left-click.<br/>\
Press and hold the button to select cursor control.<br/>\
Releasing after one beep puts the netClé into mouse-up mode. In this mode pressing the button will move the cursor up.<br/>\
You may press and hold to move the cursor quickly, or use quick taps to nudge the cursor to the desired location.<br/>\
Release the button after two beeps and netClé will enter mouse-down mode.<br/>\
Three beeps gets you to mouse-left mode and four gives you mouse-right.<br/>\
When in one of the cursor control modes stop touching the button for 2 seconds and a low beep will announce<br/>\
that the system has reset and you may choose a new mouse direction.",
        createMethod: function() {return new OneButtonMouse(Reg.SolOneBtnMouse);}
    },
    
    SolTwoBtnMouse: {
        name: "Two Button Mouse",
        summary: "Enable cursor control with two buttons. \
One button controls left-right cursor motion and the other controls \
up-down motion.",
        description: "Control cursor motion with two toggle buttons.<br/>\
    One button controls up & down cursor motion the other controls left & right.<br/>\
    Press a button to move the cursor in one direction. Release the button until you hear a beep and then <br/>\
    press the button again to move the cursor in the opposite direction.<br/>\
    There is a half-second delay before the change of direction takes place.  This makes it possible to use<br/>\
    repeated quick taps to finely adjust the cursor position. ",
        createMethod: function() {return new TwoButtonMouse(Reg.SolTwoBtnMouse);}
    },
    
    SolJoystickMouse1: {
        name: "Joystick Mouse",
        summary: "Control the cursor with a joystick. Left- and right-click capability can be added.",
        description: "This is a simple control which uses a joystick to move the mouse up, down left and right.<br/>\
    You can optionally add the ability to generate a left- or right-mouse click by giving the joystick a quick left or right tap.",
        createMethod: function() {return new JoystickMouse1(Reg.SolJoystickMouse1);}
    },
        
     SolJoystickMouse2: {
        name: "Joystick Plus",
        summary: "Enable cursor and scrolling control with the joystick and a button.",
        description: "Allows a joystick and a button to control mouse motion and scrolling.<br/>\
    When the button is pressed once the joystick up- down-motion will control scrolling.<br/>\
    Pressing the button again returns the joystick to cursor control mode.<br/>\
    If you are using the light box it will indicate whether you are in mouse-moving or scrolling mode.<br/>\
    You can optionally add the ability to generate a left- or right-mouse click by giving the joystick a quick left or right tap.<br/> \
    If you have the light box connected light #4 will be lit when in scroll mode.",
        createMethod: function() {return new JoystickMouse2(Reg.SolJoystickMouse2);}
    },
        
    SolGyroMouse: {
        name: "Gyro Mouse",
        summary: "Using the gyroscope, control the cursor with head motions.",
        description: "Allows the use of head motions to control the cursor.<br/>\
    Attach the cursor to side of the head using a head band, the arm of a pair of glassed or a cap<br/>\
    with the wire hanging straight down.<br/>\
    Before using press the <i>Calibrate</i> button and follow the instructions.",
        createMethod: function() {return new GyroMouse(Reg.SolGyroMouse);}
    },
    
    SolLeftClick: {
        name: "Left Click Button",
        summary: "Create a button which generates a left-click when pressed.",
        description: "The button generates a left-click when pressed.",
        createMethod: function() {return new  LeftClickButton(Reg.SolLeftClick);}                
    },
    
    SolRightClick: {
        name: "Right Click Button",
        summary: "Create a button which generates a right-click when pressed.",
        description: "The button generates a right-click when pressed.",
        createMethod: function() {return new  RightClickButton(Reg.SolRightClick);}                
    },
    
    SolLeftPressReleaseToggle: {
        name: "Left Press-Release Toggle",
        summary: "Allow drag and drop without having to hold a button.",
        description: "When the button is pressed a left-button press-and-hold action is generated.<br/>\
Pressing the button again generates a left-button release.<br/>\
Thus, you can tap the button, move the cursor and then tap the button again to perform a drag and drop operation.<br/>\
This enables drag and drop for someone who has difficulty pressing and holding a button.  If you have the light box connected light #3 will be lit \
when the button is being held.",
        createMethod: function() {return new  LeftPressReleaseToggle(Reg.SolLeftPressReleaseToggle);}                
    },
    
    SolLeftEmulation: {
        name: "Left Button Emulation",
        summary: "Create a button which acts like the left mouse button. \
It is pressed when pressed and released when released.",
        description: "The button acts exactly like the left-mouse button.<br/>\
It is pressed when pressed, remains pressed when held and is released when released.",
        createMethod: function() {return new  LeftButtonEmulation(Reg.SolLeftEmulation);}                
    },
    
    SolThreeFuncMouseButton: {
        name: "Three Function Mouse Button",
        summary: "Provide left-click, right-click and left press and hold \
with a single button.",
        description: "This provides the most useful mouse-click functions in a single button.<br/>\
Tap it once to generate a left-click.<br/>\
Press and hold the button, releasing after one beep to generate a right-click.<br/>\
Release after two beeps to generate a left-mouse press-and-hold, initiating drag and drop.<br/>\
Use a quick tap to release the held button.",
        createMethod: function() {return new  ThreeFunctionButton(Reg.SolThreeFuncMouseButton);}                
    },
    
    SolLeftRightClick: {
        name: "Left-Right Click",
        summary: "Create two buttons.  One  does a left-click \
and the other does a right-click.",
        description: "One button generates a left-click, the other generates a right-click.",
        createMethod: function() {return new LeftRightClick(Reg.SolLeftRightClick);}                
    },
     
    SolScrollToggle: {
        name: "Scroll Up-Down Toggle",
        summary: "Control scrolling up and down with a single button.",
        description: "One button toggles between scrolling up and scrolling down.<br/>\
Press the button to move scroll down. Release the button until you hear a beep and then \
press the button again to scroll up.<br/>\
There is a half-second delay before the change of direction takes place.  This makes it possible to use \
repeated quick taps to finely adjust the scroll position.",
        createMethod: function() {return new  ScrollUpDownToggle(Reg.SolScrollToggle);}                
    },
     
    SolScrollButtons: {
        name: "Scroll Up-Down Buttons",
        summary: "Create two buttons, one button scrolls up, the other scrolls down.",
        description: "One button scrolls up, the other scrolls down.",
        createMethod: function() {return new  ScrollUpDownButtons(Reg.SolScrollButtons);}                
    },
     
    SolScrollJoystick: {
        name: "Scroll with Joystick",
        summary: "Simple scrolling using a joystick.",
        description: "A joystick is used to scroll up and down. \
You can optionally have left and right joystick motions generate left and right clicks.",
        createMethod: function() {return new  ScrollWithJoystick(Reg.SolScrollJoystick);}                
    },
     
    SolKeyboardText: {
        name: "Send a text string",
        summary: "Type up to 20 characters by pressing a single button",
        description: "Send up to 20 characters (optionally ending with RETURN) \
by pressing a single button.",
        createMethod: function() {return new  KeyboardText(Reg.SolKeyboardText);}                
    },
     
    SolKeyboardSpecial: {
        name: "Send a special character",
        summary: "Type a special character (e.g. Page Up, Home or F3).",
        description: "Send a special character (e.g. Page Up, Home or F3).",
        createMethod: function() {return new  KeyboardSpecial(Reg.SolKeyboardSpecial);}                
    },
     
    SolKeyboardModifier: {
        name: "Send a character plus a modifier",
        summary: "Type a character plus a modifier key (e.g. control + c) with a single button.",
        description: "Sometimes it can be difficult to press two keys at the same time.<br/>\
This can make it impossible to type things like control+C.<br/>\
This solution allows you to create a button that will send a modifier key (like shift or control) \
and a regular key with a single press.",
        createMethod: function() {return new  KeyboardModifier(Reg.SolKeyboardModifier);}                
    },
     
    SolUpDownArrowToggle: {
        name: "Up-Down arrow toggle",
        summary: "Send up- and down-arrow keystrokes with a single button.",
        description: "One button which generates up- and down- arrow keystrokes.<br/>\
Press the button to send a down-arrow. Release the button until you hear a beep and then \
press the button again to send an up-arrow.<br/>\
There is a half-second delay before the change of direction takes place, allowing the use of \
repeated quick taps to make fine adjustments.",
        createMethod: function() {return new  KeyboardUpDownArrowToggle(Reg.SolUpDownArrowToggle);}                
    },
     
    SolKeyboardShift: {
        name: "Press-Release toggle for shift key",
        summary: "Press and hold the shift key by touching a button.",
        description: "One button which generates a shift-key press event when pressed once, \
and generates the release when pressed a second time.  Allows a user to 'hold' the shift key \
without having the actually hold a key. If you have the light box connected light #2 will be lit \
when the shift key is being held.",
        createMethod: function() {return new  KeyboardShift(Reg.SolKeyboardShift);}                
    },
     
    SolKeyboardControl: {
        name: "Press-Release toggle for control key",
        summary: "Press and hold the control key by touching a button.",
        description: "One button which generates a control-key press event when pressed once, \
and generates the release when pressed a second time.  Allows a user to 'hold' the control key \
without having the actually hold a key. If you have the light box connected light #1 will be lit \
when the control key is being held.",
        createMethod: function() {return new  KeyboardControl(Reg.SolKeyboardControl);}                
    },
     
    SolUnknown: {
        name: "Unknown",
        summary: "Unknown",
        description: "The settings for this port are not recognized as a known solution. \
They will, however, be preserved as part of the next download..",
        createMethod: function() {return new  UnknownSolution(Reg.SolUnknown);}                
    }
   
};



