
/* chooser.js
 * 
 * Holds data and code needed to run the cascading solutions chooser.
 */
"use strict";

const ActivityPrompt = "What do you want to do?";
const DevicePrompt = "What device do you want to use?";
const SolutionPrompt = "Possible solutions";

// ----------------------------------------------------------
// Solution Descriptions 



// -- mouse buttons - references to other solutions
const DS_JOYSTICK_CLICKS = "Generate left- and right-clicks as part of a \
<i>Joystick Mouse</i> solution.";
const LDS_JOYSTICK_CLICKS = "There is an option to generate left- and right-clicks using quick \
left and right motions with the <i>Joystick Mouse.</i> \
To enable this select <i>Joystick Mouse</i> or <i>Joystick Plus</i> \
under <i>Control Cursor Motion</i> and then select the \
<i>Enable left & right mouse clicks</i> option.";

const DS_GYRO_CLICKS     = "Generate left- and right-clicks as part of a \
<i>Gyro Mouse</i> solution.";
const LDS_GYRO_CLICKS     = "There is an option to generate left- and right-clicks using quick \
head motions with the <i>Gyro Mouse</i>. \
To enable this select <i>Gyro Mouse</i> under <i>Control Cursor Motion</i> \
and then select the appropriate options.";

// Scrolling Reference
const DS_JOYSTICK_SCROLL = "Control scrolling as part of a <i>Joystick Mouse</i> solution.";
const LDS_JOYSTICK_SCROLL = "<i>Joystick Plus</i> (under <i>Control Cursor Motion</i>) \
allows the joystick to be used for both cursor control and scrolling.";

let Chooser = {
    // PUBLIC ENTRY POINT - to initialize chooser tables.
    init: function() {
        this.initActivities();
        this.initDevices();
        this.initSolutions();
    },
    
    // -----------------------------------------
    // Activities
    Activity: function(id, text) {
        this.id = id;
        this.text = text;
    },
    Activities: [],
    activitySelection: 0,
    
    initActivities: function() {
        this.Activities.push (new this.Activity(1, "Control Cursor Motion"));
        this.Activities.push (new this.Activity(2, "Press Mouse Buttons"));
        this.Activities.push (new this.Activity(3, "Scrolling"));
        this.Activities.push (new this.Activity(4, "Keyboard Actions"));
    },
    
    // --------------------------------------------
    // Devices
    Device: function(id, parentid, text) {
        this.id = id;
        this.parentid = parentid;
        this.text = text;
    },
    Devices: [],
    deviceSelection: 0,
    
    initDevices: function() {
        /* for CURSOR */
        this.Devices.push (new this.Device(1, 1, "One Button"));
        this.Devices.push (new this.Device(2, 1, "Two Buttons"));
        this.Devices.push (new this.Device(3, 1, "Joystick"));
        this.Devices.push (new this.Device(4, 1, "Gyro"));

        /* for MOUSE_BUTTONS */
        this.Devices.push (new this.Device(10, 2, "One Button"));
        this.Devices.push (new this.Device(11, 2, "Two Buttons"));
        this.Devices.push (new this.Device(12, 2, "Joystick"));
        this.Devices.push (new this.Device(13, 2, "Gyro"));

        /* for SCROLLING */
        this.Devices.push (new this.Device(21, 3, "One Button"));
        this.Devices.push (new this.Device(22, 3, "Two Buttons"));
        this.Devices.push (new this.Device(23, 3, "Joystick"));

        /* for KEYBOARD */
        this.Devices.push (new this.Device(31, 4, "One Button"));
    },
    
    // --------------------------------------------------------
    // Solution References
    Selection: function(deviceid, reg) {
        this.deviceid = deviceid;
        this.solreg = reg;  // Solution registry. Holds name, summary, description and createFunc
    },

    Reference: function(deviceid, name, shortD, longD) {
        this.deviceid = deviceid;
        this.name = name;
        this.shortD = shortD;
        this.longD = longD;
    },
    SolutionRef: [],

    initSolutions: function() {
        this.SolutionRef.push (new this.Selection(1, Reg.SolOneBtnMouse));
        this.SolutionRef.push (new this.Selection(2, Reg.SolTwoBtnMouse));
        this.SolutionRef.push (new this.Selection(3, Reg.SolJoystickMouse1));
        this.SolutionRef.push (new this.Selection(3, Reg.SolJoystickMouse2));
        this.SolutionRef.push (new this.Selection(4, Reg.SolGyroMouse));

        this.SolutionRef.push (new this.Selection(10, Reg.SolLeftClick));
        this.SolutionRef.push (new this.Selection(10, Reg.SolRightClick));
        this.SolutionRef.push (new this.Selection(10, Reg.SolLeftPressReleaseToggle));
        this.SolutionRef.push (new this.Selection(10, Reg.SolLeftEmulation));
        this.SolutionRef.push (new this.Selection(10, Reg.SolThreeFuncMouseButton));

        // -- mouse buttons - two button
        this.SolutionRef.push (new this.Selection(11, Reg.SolLeftRightClick));

        // -- mouse buttons - references to other solutions
        this.SolutionRef.push (new this.Reference(12, "Joystick Clicks", DS_JOYSTICK_CLICKS, LDS_JOYSTICK_CLICKS));
        this.SolutionRef.push (new this.Reference(13, "Gyro Clicks",     DS_GYRO_CLICKS,     LDS_GYRO_CLICKS));

        // -- scrolling
        this.SolutionRef.push (new this.Selection(21, Reg.SolScrollToggle));
        this.SolutionRef.push (new this.Selection(22, Reg.SolScrollButtons));
        this.SolutionRef.push (new this.Selection(23, Reg.SolScrollJoystick));

        //Reference
        this.SolutionRef.push (new this.Reference(23, "Scroll with Joystick Mouse", DS_JOYSTICK_SCROLL, LDS_JOYSTICK_SCROLL));

        // -- keyboard
        this.SolutionRef.push (new this.Selection(31, Reg.SolKeyboardText));
        this.SolutionRef.push (new this.Selection(31, Reg.SolKeyboardSpecial));
        this.SolutionRef.push (new this.Selection(31, Reg.SolKeyboardModifier));
        this.SolutionRef.push (new this.Selection(31, Reg.SolUpDownArrowToggle));
        this.SolutionRef.push (new this.Selection(31, Reg.SolKeyboardShift));
        this.SolutionRef.push (new this.Selection(31, Reg.SolKeyboardControl));        
    },
    
    // PUBLIC ENTRY POINT to show solution choice dialogs
    showSolutionDlg: function() {
        // Show the solutions modal dialog 
        document.getElementById("solutionsDlg").style.display = "block";  
        this.updateDisplay();
    },
    
    // PUBLIC ENTRY POINT - when the user clicks on the close button.
    closeIt: function() {
        document.getElementById("solutionsDlg").style.display = "none";
        this.activitySelection = 0;
        this.deviceSelection = 0;
        this.hidePossible();        
    },
    
    // Update all of the dialog, using the user's current selections.
    updateDisplay: function() {
        var chooserBase = document.getElementById("solutionContent");
        while (chooserBase.firstChild) {
            chooserBase.removeChild(chooserBase.lastChild);
        }

        var title = document.createElement("p");
        title.className = "solutionTitle";
        title.innerHTML = ActivityPrompt;
        chooserBase.appendChild(title);

        for (let act of this.Activities){
            var b = document.createElement("input");
            b.type = "button";
            b.className = "activityButton";
            b.value = act.text;
            chooserBase.appendChild(b);
            this.activityButtonAction(b, act);
            if (act.id === this.activitySelection) {
                b.style.backgroundColor = "lightblue";
                var newDiv = document.createElement("div");
                chooserBase.appendChild(newDiv);
                this.showDevices(newDiv, act.id);
            }
        }        
    },
    
    // Show a devices list below the selected activity.
    showDevices: function(deviceDiv, parentID) {
        var title = document.createElement("p");
        title.className = "devicesTitle";
        title.innerHTML = DevicePrompt;
        deviceDiv.appendChild(title);

        for(let device of this.Devices) {        
            if (device.parentid === parentID) {
                var b = document.createElement("input");
                b.type = "button";
                b.className = "deviceButton";
                b.value = device.text;
                if (device.id === this.deviceSelection) {
                    b.style.backgroundColor = "lightblue";
                }
                this.deviceButtonAction(b, device);
                deviceDiv.appendChild(b);
            }
        }        
    },

    // Define what to do when an activity button is pressed.
    activityButtonAction: function(button, activity) {
        button.onclick = () => {  // Note: Arrow function is required to preserve 'this'.
            this.activitySelection = activity.id;
            this.updateDisplay();
            this.hidePossible();
        };
    },

    // What to do when a device button is clicked.
    // Open a list of available solutions.
    deviceButtonAction: function(btn, device) {
        btn.onclick = (event) => { // Note: Arrow function is required to preserve 'this'.
            this.hidePossible();
            this.deviceSelection = device.id;
            this.updateDisplay();
            let theDiv = document.getElementById("possibleSolutions");
            while(theDiv.firstChild) {  // Empty the div.
                theDiv.removeChild(theDiv.lastChild);
            }

            var title = document.createElement("p");
            title.innerHTML = SolutionPrompt;
            title.className = "solutionsTitle";
            theDiv.appendChild(title);

            for (let solRef of this.SolutionRef) {
                if (solRef.deviceid === device.id) {
                    var name;
                    var toolTipText;

                    if (solRef instanceof this.Selection) {
                        name = solRef.solreg.name;
                        toolTipText = solRef.solreg.summary;
                    } else {
                        name = solRef.name;
                        toolTipText = solRef.shortD;
                    }
                    var innerDiv = document.createElement("div");
                    innerDiv.className = "tooltipdiv";
                    theDiv.appendChild(innerDiv);

                    var b = document.createElement("input");
                    b.type = "button";
                    b.className = "solutionButton";
                    b.value = name;
                    this.solutionButtonAction(b, solRef);
                    innerDiv.appendChild(b);  

                    // Tool tip
                    var tooltip = document.createElement("span");
                    tooltip.className = "tooltip";
                    tooltip.innerHTML = toolTipText;
                    innerDiv.appendChild(tooltip);
                }
            }

            let scroll = Math.floor(window.scrollY);
            
            // Position and display the div.
            theDiv.style.display = "block";
            theDiv.style.position = "absolute";
            theDiv.style.top = (event.clientY - 15 + scroll).toString() + "px";
            theDiv.style.left = (event.clientX + 50).toString() + "px"; 
        };
    },

    hidePossible: function() {
       let theDiv = document.getElementById("possibleSolutions");
       theDiv.style.display = "none";
   },

    // Define the action when a solutions button is pressed
    solutionButtonAction: function(btn, solRef) {
       btn.onclick = () => { // Note: Arrow function is required to preserve 'this'.
            if (solRef instanceof this.Reference) {
                this.closeIt();
                showMessageBox("Information", solRef.longD, ["OK"]);
            } else {
                var solreg = solRef.solreg;  // Get solution registry
                var theSolution = SolutionList.add(solreg);
                this.addTab(theSolution);
                this.closeIt();
            }
        };
    },

    // --- New Tab --------------
    // addTab() is called when a solution is actually selected.
    // Code to support the addition of a tab, creation of the Solution object
    // and display of solution settings and options.
    nextID: 0,
    // PUBLIC ENTRY POINT to insert a Solution created by uploading.
    addTab: function(theSolution) {
        this.nextID++;
        var currentID = this.nextID;
        theSolution.id = currentID;  // This id is attached to the solution, tab and content-div.
                                     // This makes it possible to remove all three when requested.
        let buttonHolder = document.getElementById("tabButtons");
        let contentHolder = document.getElementById("tabContents");

        let tabDiv = document.createElement("div");
        let tabButton = document.createElement("input");
        let tabClose = document.createElement("span");

        tabDiv.className = "tabDivItem";
        tabDiv.myID = currentID;

        tabButton.type = "button";
        tabButton.className = "tabButton";
        tabButton.value = theSolution.name;
        tabButton.myID = currentID;
        tabButton.onclick = () => {// Note: Arrow function is required to preserve 'this'.
            this.setActiveTab(currentID);
        };

        tabClose.className = "closeTab";
        tabClose.innerHTML = "&times";
        tabClose.onclick = () => {// Note: Arrow function is required to preserve 'this'.
            showMessageBox("Please confirm", "Do you want to delete " + theSolution.name + "?", ["Yes", "No"])
                .then( (response) => {
                    if (response === "Yes") {
                        this.removeTab(currentID);
                    }
                });
        };

        tabDiv.appendChild(tabButton);
        tabDiv.appendChild(tabClose);

        buttonHolder.appendChild(tabDiv);

        this.createContent(theSolution, contentHolder, currentID);

        this.setActiveTab(currentID);
    },


    // Update tabs when one is clicked, to adjust its shading
    // (by changing classes) and make the content div visible.
    setActiveTab: function(selectedID) {
        var tabs = document.getElementsByClassName("tabDivItem");
        for(let t of tabs) {
            if (t.myID === selectedID) {
                t.className = "tabDivItem activeItem";
            } else {
                t.className = "tabDivItem";
            }
        }
        var cont = document.getElementsByClassName("tabContent");
        for(let c of cont) {
            if (c.myID === selectedID) {
                c.style.display = "block";
            } else {
                c.style.display = "none";
            }
        }
    },

    createContent: function(theSolution, contentHolder, currentID) {
        let content = document.createElement("div");
        content.className = "tabContent";
        content.myID = currentID;
        contentHolder.appendChild(content);   

        let descriptionDiv = document.createElement("div");
        let settingsDiv = document.createElement("div");
        let optionsDiv = document.createElement("div");

        content.appendChild(descriptionDiv);
        content.appendChild(settingsDiv);
        content.appendChild(optionsDiv);

        descriptionDiv.className = "solutionBlock";
        settingsDiv.className = "solutionBlock";
        optionsDiv.className = "solutionBlock";

        let t1 = document.createElement("h2");
        t1.innerHTML = "Description";
        descriptionDiv.appendChild(t1);

        let t2 = document.createElement("h2");
        t2.innerHTML = "Settings";
        settingsDiv.appendChild(t2);

        let t3 = document.createElement("h2");
        t3.innerHTML = "Options";
        optionsDiv.appendChild(t3);

        this.displayContent(theSolution, descriptionDiv, settingsDiv, optionsDiv);
    },

    // Close button is clicked.
    // We need to find and remove the content div, the tab button and 
    // the Solution (in the SolutionList - in solutions.js).
    // PUBLIC ENTRY POINT to clear tabs after an upload.
    removeTab: function(selectedID) {
        let tabsHolder = document.getElementById("tabButtons");
        let contentHolder = document.getElementById("tabContents");

        // Remove the tab
        var tabs = document.getElementsByClassName("tabDivItem");
        for(let t of tabs) {
            if (t.myID === selectedID) {
                tabsHolder.removeChild(t);
            }
        }
        var cont = document.getElementsByClassName("tabContent");
        for(let c of cont) {
            if (c.myID === selectedID) {
                c.style.display = "none";
                contentHolder.removeChild(c);
            } 
        } 

        tabs = document.getElementsByClassName("activeItem");
        if (tabs.length === 0) { // we just deleted the active item.
            tabs = document.getElementsByClassName("tabDivItem");
            if (tabs.length > 0) {
                this.setActiveTab(tabs[0].myID);
            }
        }

        // Remove the solution item from the internal solutions list.
        SolutionList.remove(selectedID);
    },

    displayContent: function(theSolution, descriptionDiv, settingsDiv, optionsDiv) {
        var p = document.createElement("p");
        p.innerHTML = theSolution.description;

        descriptionDiv.appendChild(p);

        for (let setting of theSolution.settings) {
            this.addControlItem(settingsDiv, setting);
        }

        for (let option of theSolution.options) {
            this.addControlItem(optionsDiv, option);
        }
    },

    // theItem is a Widget.  This adds an item to either settings or options
    addControlItem: function(outerDiv, theItem) {
        let newDiv = document.createElement("div");
        newDiv.className = "settingDiv";
        if (theItem.isLabelFirst()) {
            newDiv.appendChild(theItem.getLabel());        
        } 
            newDiv.appendChild(theItem.getWidget());
        if (!theItem.isLabelFirst()) {
            newDiv.appendChild(theItem.getLabel());       
        }
        outerDiv.appendChild(newDiv);
    }
};




