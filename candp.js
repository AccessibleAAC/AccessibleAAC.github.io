/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Cut and Paste methods
var CandP = {
    decoder: new TextDecoder(),
    encoder: new TextEncoder(),
    
    informDataForClipBoard: function(data) {
        CandP.toClipBoard(data);
    },
    
    toClipBoard: function(data) {
        var triggerText = this.decoder.decode(data);
        navigator.clipboard.writeText(triggerText);
    }, 
    
    fromClipBoard: function() {
        navigator.clipboard.readText()
          .then(text => {
            CandP.processPaste(text);
          })
          .catch(err => {
            console.error('Failed to read clipboard contents: ', err);
          });    
      },
      
      dropZoneDrop: function(ev) {
            ev.preventDefault();
            var items = ev.dataTransfer.items;
            if (items && items.length >= 1) {
                var kind = ev.dataTransfer.items[0].kind;
                var type = ev.dataTransfer.items[0].type;
                if (kind === "string" && type === "text/plain") {
                    let data = ev.dataTransfer.getData("text");
                    CandP.processPaste(data);
                }
                else if (kind === "file" && type === "text/plain") {
                    let file = ev.dataTransfer.items[0].getAsFile();
                    let reader = new FileReader();
                    reader.onload = function() {
                        CandP.processPaste(reader.result);
                    };
                    reader.readAsText(file);
                } else {
                    showMessageBox("Drop Failed", "This type of data cannot be processed", ['OK']);
                }
            } 
      },
      
    dropZoneDragOver: function(ev) {
        ev.preventDefault();
          
    },
      
    processPaste: function(triggerData) {
//        console.log("PROCESSING DATA:");
//        console.log(triggerData);
        
        var start = triggerData.indexOf("T1");
        if (start === -1) {
            showMessageBox("Error", "Invalid configuration data: missing start sequence.", ['OK']);
            return;
        }
        if (start !== 0) {
            triggerData = triggerData.slice(start, -1);
        }
        var end = triggerData.indexOf('Z');
        if (end === -1) {
            showMessageBox("Error", "Invalid configuration data: missing end sequence.", ['OK']);
            return;
        }
        triggerData = triggerData.slice(0, end+1);
        
        var uint8Array = this.encoder.encode(triggerData);
        
        try {
            inputStream.init(uint8Array);
            TFunc.loadTriggers(inputStream);
            Recreate.rebuildAll();
            download();
        } catch(error) {
            showMessageBox("Error", "Invalid configuration data: " + error, ['OK']);
        }        
    }
};


