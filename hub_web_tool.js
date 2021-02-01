// Check if Serial API is supported by the browser.
if ("serial" in navigator) {
    //console.log("Serial Web API is supported")
} else {
    //console.log("Serial Web API is NOT supported. Would you like to continue anyway?")
}

const encoder = new TextEncoder();
let writer
let buffer = ""
let version
let reader
let triggers
let port

let TRIGGERS

// Used by decode_condition and decode_repeat functions
const BOOL_TRUE = 'p'
const BOOL_FALSE = 'q'

const TRIGGER_ON_LOW = '1'
const TRIGGER_ON_HIGH = '2'
const TRIGGER_ON_EQUAL = '3'

const TRIGGER_ON_LOW_REPEAT = '1'
const TRIGGER_ON_HIGH_REPEAT = '2'
const TRIGGER_ON_EQUAL_REPEAT = '3'

const TRIGGER_ON_LOW_NO_REPEAT = '5'
const TRIGGER_ON_HIGH_NO_REPEAT = '6'
const TRIGGER_ON_EQUAL_NO_REPEAT = '7'

const INPUTS = {1: '3A', 2: '3B', 3: '2A', 4: '2B', 5: '1A',
                6: '1B', 7: 'USB', 8: 'ACCEL-X', 9: 'ACCEL-Y',
                10: 'ACCEL-Z', 11: 'GYRO-X', 12: 'GYRO-Y', 13: 'GYRO-Z',
                14: 'GYRO-ANY'
                }

async function sendHubCommand(cmd) {
    const commands = {
        "Get hub version": 'V',
        "Get input levels": 'Q',
        "Get configuration": 'U',
        "Set to RUN mode": 'R',
    }

    if ( cmd === 'Load configuration') {
        writer.write(encoder.encode(TRIGGERS));
        return
    }
    if ((writer != undefined) && (cmd in commands)) {
        //console.log(cmd)
        writer.write(encoder.encode(commands[cmd]));
    } else {
        //console.log("No connection to Hub.")
        alert("No connection to Hub! Is it plugged in?")
    } 

}

function decode_byte(nibbles) {
    let upper_nibble = (nibbles.charCodeAt(0) & 0b00001111) << 4
    let lower_nibble = nibbles.charCodeAt(1) & 0b00001111
    return upper_nibble | lower_nibble
}

function decode_number(bytes) {
    let size = bytes.length
    let negative = false

    if ((bytes.charCodeAt(0) & 0b00001000) > 0) {
        negative = true
    }

    if (size % 2 != 0) {
        //console.log("Encoded numbers must be an even number of bytes: '" + bytes + "'")
        return -1
    }

    let value = 0
    while (size > 0) {
        value = value << 8 | decode_byte(bytes)
        bytes = bytes.substring(2)
        size -= 2
    }

    if (negative === true) {
        value = value - 0x10000
    }

    return value
}

function decode_id(bytes) {
    let size = bytes.length

    if (size === 1) {
        return bytes.charCodeAt(0) & 0b00001111
    }

    if (size === 2) {
        let result = decode_byte(bytes)
        if (result <= 127) {
            return result
        } else {
            //console.log("Invalid id value specified: '" + bytes + "'")
            return -1
        }
    }

    if (size > 2) {
        //console.log("Id value contains too many bytes: '" + bytes + "'")
        return -1
    }
}

async function parse_input_levels(bytes) {
    unipolar = {"1": port3a_meter, "2": port3b_meter, "3": port2a_meter, "4": port2b_meter,
                "5": port1a_meter, "6": port1b_meter, "14": gyro_any_meter,
               }
    bipolar = {"8": accel_x_meter, "9": accel_y_meter, "10": accel_z_meter, "11": gyro_x_meter,
               "12": gyro_y_meter, "13": gyro_z_meter, 
              }
    const valid_bytes = '`abcdefghijklmno@ABCDEFGHIJKLMNO'

    for ( let c of bytes ) {
        if ( bytes.indexOf(c) === -1 ) {
            //console.log("Invalid input level data\r\n")
            return false
        }
    }
    
    let count = decode_number(bytes.slice(0,4))
    bytes = bytes.slice(4)
    while (count > 0) {
        let id = decode_id(bytes.slice(0,2))
        let value = decode_number(bytes.slice(2,6))
        if (id in unipolar) {
            unipolar[id.toString()].value=value
        }
        if (id in bipolar) {
            if ( value != 0 ) {
                bipolar[id.toString()].value=value
            } else {
                // Clear display - peripheral probably not connected
                bipolar[id.toString()].value=-32768
            }
        }
        bytes = bytes.slice(6)
        count -= 1
    }
    return true
}


function decode_state(state_byte) {
    return state_byte.charCodeAt(0) & 0b00001111
}

function decode_input (bytes) {

    return INPUTS[decode_id(bytes)]
}

function decode_condition (c) {

    if (c === TRIGGER_ON_LOW || c === TRIGGER_ON_LOW_NO_REPEAT) { return '<' }
    if (c === TRIGGER_ON_HIGH || c === TRIGGER_ON_HIGH_NO_REPEAT) { return '>' }
    if (c === TRIGGER_ON_EQUAL || c === TRIGGER_ON_EQUAL_NO_REPEAT) { return '=' }

    //console.log("Invalid trigger condition: '" + c + "'" );
    process.exit(1);
}

function decode_output (output_bytes, parameter_bytes) {

     const MOUSE = { 1 : 'Mouse Up', 2 : 'Mouse Down', 3: 'Mouse Left', 4 : 'Mouse Right',
                     5 : 'Mouse Left Click', 6 : 'Mouse Left Press', 7 : 'Mouse Left Release',
                     8 : 'Mouse Right Click', 10: 'Nudge Up', 11 : 'Nudge Down',
                     12 : 'Nudge Left', 13 : 'Nudge Right', 14 : 'Nudge Stop',
                     20 : 'Mouse Wheel Up', 21 : 'Mouse Wheel Down',
                     30 : 'Mouse Right Press', 31 : 'Mouse Right Release'}

    const RELAY = { 0 : 'Pulse', 1 : 'On', 2: 'Off'}

    let out = {}
    let output = decode_id(output_bytes)
    let parameters = decode_number(parameter_bytes)

    if (output === 0 ) { out.action = 'Nothing'; return out }
    if (output === 1 ) { out.action = 'Relay'; out.state = RELAY[parameters]; return out }
    if (output === 2 ) { out.action = 'Relay 2'; out.state = RELAY[parameters]; return out }
    if (output === 3 ) { out.action = 'BT Keyboard'; out.state = parameters; return out }
    if (output === 4 ) { out.action = 'USB Keyboard'; out.state = parameters; return out }
    if (output === 5 ) { out.action = 'USB'; out.state = MOUSE[parameters]; return out }
    if (output === 6 ) { out.action = 'Serial Send'; out.state = parameters; return out }
    if (output === 7 ) { out.action = 'Buzzer'; out.frequency = (parameters >> 16) & 0x0000ffff;
                         out.duration = parameters & 0x0000ffff; return out }
    if (output === 8 ) { out.action = 'IR LED'; out.state = parameters; return out }
    if (output === 9 ) { out.action = 'BT'; out.state = MOUSE[parameters]; return out }
    if (output === 10 ) { out.action = 'Set State'; out.sensor = INPUTS[parameters>>8]; out.sensor_state = parameters & 0xff; return out }
    if (output === 11 ) { out.action = 'Light Box'; out.state = parameters.toString(2); return out }
    if (output === 12 ) { out.action = 'LCD Display'; out.state = parameters.toString(2); return out }
    
    out.action = output
    out.state = parameters
    return out 
}

function decode_repeat(r) {

    if (r === BOOL_FALSE || r === TRIGGER_ON_LOW_NO_REPEAT ||
        r === TRIGGER_ON_HIGH_NO_REPEAT || r === TRIGGER_ON_EQUAL_NO_REPEAT) {
        return false
    }

    if (r === BOOL_TRUE || r === TRIGGER_ON_LOW_REPEAT ||
        r === TRIGGER_ON_HIGH_REPEAT || r === TRIGGER_ON_EQUAL_REPEAT) {
        return true
    }

    //console.log("Invalid trigger repeat parameter: '" + enc_byte + "'" );
    process.exit(1);
}

function translate_trigger(bytes) {
    let trigger = { }

    trigger.state = decode_state(bytes.substring(2,3));
    trigger.input = decode_input(bytes.substring(0,2));
    trigger.condition =  decode_condition(bytes.substring(7,8));
    if (trigger.input !== 'USB') {
        trigger.threshold = decode_number(bytes.substring(3,7));
    } else {
        trigger.character = String.fromCharCode(decode_number(bytes.substring(3,7)));
    }
    trigger.duration = decode_number(bytes.substring(19,23));

    // decode output and parameters
    trigger.output = decode_output(bytes.substring(8,10), bytes.substring(11,19));
    trigger.repeat = decode_repeat(bytes[7]);
    trigger.next_state = decode_state(bytes.substring(10,12));
    return trigger
}

function decode_triggers(bytes, trigger_length) {
    let count = 0
    let triggers = {}
    while ((bytes.length > 0) && (bytes[0] !== 'Y')) {
        let trigger = bytes.substring(0,trigger_length)

        trigger = translate_trigger(trigger)
        triggers[count] = trigger
        bytes = bytes.substring(trigger_length)
        count += 1
    }

    return triggers
}

function highlight_active_inputs_and_output_summary(triggers) {
    inputs = {"3A": "port3a", "3B": "port3b", "2A": "port2a", "2B": "port2b",
              "1A": "port1a", "1B": "port1b", "ACCEL-X": "accel_x", "ACCEL-Y": "accel_y",
              "ACCEL-Z": "accel_z", "GYRO-X": "gyro_x", "GYRO-Y": "gyro_y", "GYRO-Z": "gyro_z", 
              "GYRO-ANY": "gyro_any", "USB":"usb"
             }

    for (let key in inputs) document.getElementById(inputs[key]).classList.replace('assigned', 'not_assigned')
    const keys = Object.keys(triggers);
    //console.log(triggers)
    //console.log(keys.length)
    document.getElementById("trigger_count").innerHTML = ' ( ' +  keys.length + ' triggers )'
    for (let key in keys) {
        let trigger = triggers[key]
        let output = trigger['output']
        //console.log(Object.keys(trigger))
        document.getElementById(inputs[trigger['input']]).classList.replace('not_assigned','assigned')

        document.getElementById("config_summary").innerHTML +=  key + ':  If ' + trigger['input']
        document.getElementById("config_summary").innerHTML +=  ' in state ' + trigger['state'] + ' and ' + trigger['input'] + ' ' 

        if (trigger['condition'] === '<' ) document.getElementById("config_summary").innerHTML +=  '&lt; ' 
        if (trigger['condition'] === '>' ) document.getElementById("config_summary").innerHTML +=  '&gt; ' 
        if (trigger['condition'] === '=' ) document.getElementById("config_summary").innerHTML +=  '= ' 

        if (trigger['input'] === 'USB') {

            document.getElementById("config_summary").innerHTML +=  trigger['character'] + ' for ' + trigger['duration'] + ' msec. Do ' 

        } else {

            document.getElementById("config_summary").innerHTML +=  trigger['threshold'] + ' for ' + trigger['duration'] + ' msec. Do ' 

        }

        if (output ['action'] === 'Buzzer') {
            document.getElementById("config_summary").innerHTML +=  output['action'] + ' at ' + output['frequency'] + ' Hz for ' 
            document.getElementById("config_summary").innerHTML +=  output['duration'] + ' msec. then set state of ' + trigger['input'] + ' to ' + trigger['next_state']  + '<br>'
            continue
        }

        if (output ['action'] === 'Nothing') {
            document.getElementById("config_summary").innerHTML +=  output['action'] + ' then set state of ' + trigger['input'] + ' to ' + trigger['next_state']  + '<br>'
            continue
        }

        if (output ['action'] === 'Set State') {
            document.getElementById("config_summary").innerHTML +=  output['action'] + ' of input ' + output['sensor'] + ' to ' + output['sensor_state'] 
            document.getElementById("config_summary").innerHTML +=  ' then set state of ' + trigger['input'] + ' to ' + trigger['next_state']  + '<br>'
            continue
        }

        document.getElementById("config_summary").innerHTML +=  output['action'] + ' ' + output['state'] 
        document.getElementById("config_summary").innerHTML +=  ' then set state of ' + trigger['input'] + ' to ' + trigger['next_state']  + '<br>'
    }
}

function decode_mouse_parameters(bytes) {

    let mouse = {}
    mouse['Block Size'] = decode_number(bytes.substring(1,5))
    mouse['Delay 1'] = decode_number(bytes.substring(5,7))
    mouse['Jump 1'] = decode_number(bytes.substring(7,9))
    mouse['Delay 2'] = decode_number(bytes.substring(9,11))
    mouse['Jump 2'] = decode_number(bytes.substring(11,13))
    mouse['Delay 3'] = decode_number(bytes.substring(13,15))
    mouse['Jump 3'] = decode_number(bytes.substring(15,17))
    mouse['Timer 1'] = decode_number(bytes.substring(17,21))
    mouse['Timer 2'] = decode_number(bytes.substring(21,25))

    return mouse
}

function output_mouse_summary(m){
        document.getElementById("mouse_summary").innerHTML =  'Delay 1 = ' + m['Delay 1'] + ' msec. Jump 1 = ' + m['Jump 1'] + ' pixels'
        document.getElementById("mouse_summary").innerHTML += '<br>' + 'Delay 2 = ' + m['Delay 2'] + ' msec. Jump 2 = ' + m['Jump 2'] + ' pixels'
        document.getElementById("mouse_summary").innerHTML += '<br>' + 'Delay 3 = ' + m['Delay 3'] + ' msec. Jump 3 = ' + m['Jump 3'] + ' pixels'
        document.getElementById("mouse_summary").innerHTML += '<br>' + 'Timer 1 = ' + m['Timer 1'] + ' Timer 2 = ' + m['Timer 2']
}

async function parse_configuration(bytes) {
    //console.log("Hub Configuration", bytes[0], "\n");
    if (bytes[0] != '1') {
        alert("Hub uses unsupported configuration format.")
        return
    }
    bytes = bytes.slice(1) 

    let trigger_count = decode_number(bytes.substring(0,2))

    bytes = bytes.slice(2) 

    let triggers = decode_triggers(bytes, 23)
    highlight_active_inputs_and_output_summary(triggers)

    if (bytes.indexOf('Y') >= 0) {
        document.getElementById("enc_mouse").innerHTML =  bytes.slice(bytes.indexOf('Y')) 
        let mouse_parameters = decode_mouse_parameters(bytes.slice(bytes.indexOf('Y')))
        output_mouse_summary(mouse_parameters)
    }

    //output_trigger_summary(triggers)


}

async function parse(response) {

    //console.log("Response:", response, "\n");

    if (response.indexOf('V') >= 0) {
        document.getElementById("hub_version").innerHTML = response.slice(1,-1)
        //console.log("Hub Firmware Version:", response.slice(1,-1), "\n");
    }

    if (response.indexOf('S') >= 0) {
        parse_input_levels(response.slice(1,-1))
    }

    if (response.indexOf('T') >= 0) {
        TRIGGERS = response
        document.getElementById("enc_config").innerHTML = response
        document.getElementById("enc_config").classList.replace('not_assigned','assigned')
        parse_configuration(response.slice(1,-1))
    }


}

async function updateConnection() {


    navigator.serial.addEventListener("connect", (event) => {
        // TODO: Automatically open event.target or warn user a port is available.
        //console.log("Connection Detected")
    });

    navigator.serial.addEventListener("disconnect", (event) => {
    // TODO: Remove |event.target| from the UI.
    // If the serial port was opened, a stream error would be observed as well.
        //console.log("Disconnect")
    });

    //console.log("port", port)
    if (port) {
        //console.log("Disconnect")
        reader.cancel()
        return
    } else {
        //console.log("Connect")
        getReader()
        document.getElementById("dropzone").classList.replace('not_assigned','assigned')
    }

}

async function disconnect() {
    if (reader) {
        await reader.cancel();
        await inputDone.catch(() => {});
        reader = null;
        inputDone = null;
    }
}


async function getReader() {
// Filter on devices with the Arduino Leonardo USB Vendor/Product IDs.
    const filters = [
        { usbVendorId: 0x2341, usbProductId: 0x8036 },
        { usbVendorId: 0x10c4, usbProductId: 0xea60 },
        ];

    try {
        port = await navigator.serial.requestPort({filters});
        await port.open({ baudRate: 9600 });
        //console.log(port.getInfo())

        connectButton.innerText = '🔌 Disconnect';
        document.getElementById("getSensors").disabled = false;    
        document.getElementById("getTriggers").disabled = false;    
        //document.getElementById("loadConfig").disabled = false;    
        document.getElementById("runHub").disabled = false;    
        document.getElementById("getVersion").disabled = false;    

        writer = port.writable.getWriter();
        sendHubCommand('Get hub version')
        //sendHubCommand('Get triggers')
        //sendHubCommand('Get input levels')

        const decoder = new TextDecoder();
        reader = port.readable.getReader();

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                    // Allow the serial port to be closed later.
                    reader.releaseLock();
                    break;
                    }

            buffer =  buffer + decoder.decode(value).replace(/[^0-9\'-zA-Z]/g, '')

            // Look for end of response
            //console.log("Buffer:", buffer, "\n");
            if (buffer.indexOf('Z') > 0) {
                let index = buffer.indexOf('Z') + 1
                let response = buffer.slice(0, index)
                parse(response)
                buffer = buffer.slice(index)
                //console.log("New Buffer:", buffer, "\n");
            }

        }
        //console.log("Closing port")
        writer.releaseLock();
        reader.releaseLock();
        await port.close();
        //console.log("Port closed:", port)
        connectButton.innerText = '🔌 Connect';
    } catch (e) {
        //console.log("No Hub Found.")
        connectButton.innerText = '🔌 Connect';
        document.getElementById("getSensors").disabled = true;    
        document.getElementById("getTriggers").disabled = true;    
        //document.getElementById("loadConfig").disabled = true;    
        document.getElementById("runHub").disabled = true;    
        document.getElementById("getVersion").disabled = true;    
    }

}


// Check that all characters are valid
function validate(data) {
    const valid_chars = '`abcdefghijklmno@ABCDEFGHIJKLMNO' + 'Y' + 'tz123567pq'

    if (data[0] !== 'T' || data[data.length-1] !== 'Z') {
        //console.log('Invalid Configuration Data: Trigger data prefix \'T\' and/or suffix \'Z\' not found.')
        return false
    }

    for (let i = 1; i < data.length-1; i++ ) {
        if (valid_chars.includes(data[i]) === false) {
            //console.log("Invalid Configuration Data: '" + data[i] + "'" + ' is not a valid configuration character.')
            return false
        }
    } 

    return true
}

(function() {
    let dropzone = document.getElementById('dropzone')

    let upload = function (files) {
        const reader = new FileReader()
        reader.readAsText(files[0])

        reader.onload = function(e) {
            let new_config = reader.result
            new_config = new_config.replace(/\s+/g, '')       // Remove whitepaces and newlines   
            if (validate(new_config) === true) {
                if (port === undefined) alert ("Hub is NOT connected!")
                else {
                    writer.write(encoder.encode(new_config));
                    sendHubCommand('Get configuration')
                }
            } else {
               alert("'" + files[0].name + "' is an INVALID configuration file!")
            }
        }
    }

    dropzone.ondrop = function(e) {
        e.preventDefault()
        this.className = "dropzone"
        upload(e.dataTransfer.files)
    }

    dropzone.ondragover = function() {
        this.className = "dropzone dragover"
        return false
    }

    dropzone.ondragleave = function() {
        this.className = "dropzone"
        return false
    }

}())
