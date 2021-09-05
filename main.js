
"use strict"

const MSG_NOT_SUPPORTED = "Unfortunately, this browser does not support connection to a serial device.\
  Supported browers are Chrome, Edge and Opera.  In addition, on these browsers you must enable experimental features.\
 To do this copy one of:\
<ul>\
<li><code>chrome://flags/#enable-experimental-web-platform-features</code>\
<li><code>edge://flags/#enable-experimental-web-platform-features</code>\
<li><code>opera://flags/#enable-experimental-web-platform-features</code>\
</ul>\
and paste it into your brower's address bar.  Then, set the option to \'Enabled\'.";
   
const MSG_MUST_CONNECT = "We now need to correct the your netClé device.<br/>\
Please ensure your device is connected to your computer, and then press OK.";

function startup() {
    // A bunch of lists that cannot be initialized until all javascript
    // files have been loaded.
    createSensorList();
    createActionList();
    loadPorts();
    Chooser.init();
    createConnectionOptions();
    
   if (!Connection.isSupported()) {
        let p = showMessageBox("Unsupported Browser", MSG_NOT_SUPPORTED, ["OK"]);
        p.then( () => {
            
        });
    }
}



function download() {
    if (!Connection.isSupported()) {
        showMessageBox("Unsupported Browser", MSG_NOT_SUPPORTED, ["OK"]);
        return;
    } else {
        // doPortCheck may put up a dialog, and thus returns a promise.
        SolutionList.doPortCheck().then( (val) => {
            if (val === true) {  // Port check passed
                if (Connection.connected) {
                    doDownload();
                } else {
                    getConnected( doDownload );
                } 
            }
        });
    }
}
function toClipboard() {
    // doPortCheck may put up a dialog, and thus returns a promise.
    SolutionList.doPortCheck().then( (val) => {
        if (val === true) {  // Port check passed
            SolutionList.compile();
            TFunc.sendTriggers(CandP.informDataForClipBoard);
            showMessageBox("Information", "Configuration data copied to clipboard.", ["OK"]);    
        }
    }); 
}

// A lot like download - but without the port check.
// Used when launching a Get or Levels or version check.
function connectAndRun( callbackFunc ) {
    if (!Connection.isSupported()) {
        showMessageBox("Unsupported Browser", MSG_NOT_SUPPORTED, ["OK"]);
        return;
    } else {
        if (Connection.connected) {
            callbackFunc();
        } else {
            getConnected( callbackFunc ); 
        }      
    }            
}

// Establish the connections to the hub.  If successful call the callback function.
function getConnected( callbackFunc ) {
    showMessageBox("Information", MSG_MUST_CONNECT, ["OK"])
    .then( () => {  // after message box is closed ...
        return Connection.open();

    }).then( () => {  // after connection is complete ...
        return Connection.checkVersion();

    }).then( (version) => {  // after version check is complete.
        if (version == null) {
             showMessageBox("Error", "You are not connected to a netClé device.", ["OK"]);
             Connection.close();
         } else if (version === "1.04" || version === "2.04") {
             callbackFunc();
         } else {
             showMessageBox("Error", "Your netClé hub firmware is version " + version + 
                ". This is out-of-date. \
In order to use this tool you will need a firmware upgrade.", ["OK"]);
             Connection.close();
         }        

    }).catch( (error) => {  // if connection.open fails
        showMessageBox("Error", "Connection failed:<br/>" + error, ["OK"]);
        return;
    });    
}

function doDownload() {
    SolutionList.compile();
    TFunc.sendTriggers(Connection.informDataToSend);
    Connection.sendCommand(RUN_SENSACT);
    showMessageBox("Information", "Download complete", ["OK"]);    
}
 
function showVersion() {
    var message = "Your hub software version is " + Connection.version + ". ";
    
    var message = "Your hub software version is " + Connection.version + ". ";
    
    if (Connection.version === '1.04' || Connection.version === '2.04') {
        message += "<br/>Your software is up to date.";
    } else {
        message += "<br/>Your software is out of date.";      
    }
    showMessageBox("Version", message, ['OK']);
    Connection.sendCommand(RUN_SENSACT);
}


async function showMessageBox(title, message, buttonList) {
    let p = new Promise( function (resolve, reject) {
        let box = document.getElementById("infoBox");
        let heading = document.getElementById("infoHeading");
        let content = document.getElementById("infoContent");
        let buttons = document.getElementById("infoButtons");
        
        heading.innerHTML = title;
        content.innerHTML = message;
        
        // Clear any old buttons
        while(buttons.firstChild) {
            buttons.removeChild(buttons.lastChild);
        }
        
        for (let b of buttonList) {
            let btn = document.createElement("input");
            btn.type = "button";
            btn.value = b;
            btn.onclick = function() {
                box.style.display = "none";
                resolve(b);
            };
            buttons.appendChild(btn);
        }
        box.style.display = "block";
    });
    return p;
}

/* ========= TESTING SUPPORT ================= */

// Generate the triggers into the Trggers Cache, but do not send to the hub.
function generateTrigs() {
    SolutionList.doPortCheck().then( (val) => {
        if (val === true) {  // Port check passed               
            SolutionList.compile();
        }
    });
}

// Get the hash value for the triggers in the Triggers Cache
function getHash() {
//    var sensorList = [SENSOR_1A, SENSOR_1B, SENSOR_2A, SENSOR_2B, SENSOR_3A, SENSOR_3B];

    var text = "";
    
    for(let s of sensors) {
        var subset = Triggers.getSubSet(s);
        if (subset.length() > 0) {
            let hash = subset.getHash()
            text += "Value for " + s.name + "(" + subset.length() + ") is " + hash.toString(10) + "<br/>";
        }
    }
    showMessageBox("Hash", text, ["OK"]);
}

// Convert a trigger number into a string - so that it could be used as an
// object key.
function printHash(hash) {
    var value = 'H';
    for(let i=7; i>=0; i--) {
        var nibble = (hash >> (4 * i)) & 0xf;
        if (nibble < 10) value += String.fromCharCode(nibble + 0x30);
        else value += String.fromCharCode(nibble - 9 + 0x40);
    }
    return value;
}

function closeConnection() {
    Connection.close();
}

