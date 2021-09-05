/* 
 * registry
 * 
 * A registry of all the solutions.
 * This provides directly usable IDs for all solutions.
 * It also provices information needed to access and create a solution
 * by name.  
 * 
 * It will be expanded in future to allow finding solutions based on
 * hash or threshold value or whatever is used to retrieve solutions.
 */

/*
 * Names - used by chooser, Solution and SolutionFinder.
 * The names must match in all three, so they are all defined here.
 */

class SolBase {
    constructor(name, createFunc) {
        this.name = name;
        this.createFunc = createFunc;
    }
}

// Mouse motion solutions
const SolOneBtnMouse    = new SolBase("One Button Mouse", 0);
const SolTwoBtnMouse    = new SolBase("Two Button Mouse", 0);
const SolJoystickMouse1 = new SolBase("Joystick Mouse",   0);
const SolJoystickMouse2 = new SolBase("Joystick Plus",    0);
const SolGyroMouse      = new SolBase("Gyro Mouse",       0);

// Mouse clicks - one button
const SolLeftClick              = new SolBase("Left Click Button",          0);
const SolRightClick             = new SolBase("Right Click Button",         0);
const SolLeftPressReleaseToggle = new SolBase("Left Press-Release Toggle",  0);
const SolLeftEmulation          = new SolBase("Left Button Emulation",      0);
const SolThreeFuncMouseButton   = new SolBase("Three Function Mouse Button", 0);

// Mouse clicks - two buttons
const SolLeftRightClick = new SolBase("Left-Right Click", 0);

// Scrolling
const SolScrollToggle  = new SolBase("Scroll Up-Down Toggle",  0);
const SolScrollButtons = new SolBase("Scroll Up-Down Buttons", 0);
const SolScrollJoystick = new SolBase("Scroll with Joystick", 0);

// Keyboard
const SolKeyboardText     = new SolBase("Send a text string",                   0);
const SolKeyboardSpecial  = new SolBase("Send a special character",             0);
const SolKeyboardModifier = new SolBase("Send a character plus a modifier",     0);
const SolUpDownArrowToggle = new SolBase("Up-Down arrow toggle",                0);
const SolKeyboardShift    = new SolBase("Press-Release toggle for shift key",   0);
const SolKeyboardControl  = new SolBase("Press-Release toggle for control key", 0);

const SolUnknown          = new SolBase("Unknown", 0);
