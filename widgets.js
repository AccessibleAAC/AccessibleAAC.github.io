/* 
 * widgets.js
 * 
 * Widgets needed in solution areas.
 */

"use strict";



// Selection box function
let widgetID = 0;  // create a unique id for each one created.
                      // This is so the for= of the label matches the id of the widget.
                      
class WidgetBase {
    // Base class for widgets.  Creates the standard label.
    constructor(labelText) {
        widgetID++;
        this.selID = "select" + widgetID;
        
        this.label = document.createElement("label");
        this.label.htmlFor = this.selID;
        this.label.innerHTML = labelText;
        this.label.className = "setting";
    }
    
    getLabel() { return this.label; }

    // Return false if the label should go after the widget (e.g. radio buttons)
    isLabelFirst() { return true; }
}

class SelectionBox extends WidgetBase {
    constructor(labelText, optionList, initialValue) {
        super(labelText);

        this.dropDown = document.createElement("select");
        this.dropDown.id = this.selID;
        this.dropDown.className = "setting";
        this.dropDown.multiple = false;

        for (let op of optionList) {
            var option = document.createElement("option");
            option.innerHTML = op.name;
            option.myValue = op; // myValue is a new member - hold the option (name, value).
            if (op === initialValue) {
                option.selected = true;
            } else {
                option.selected = false;
            }
            this.dropDown.appendChild(option);
        }    
    }
    
    getWidget() { return this.dropDown; }
    
    getValue() {
        var index = this.dropDown.selectedIndex;
        var option = this.dropDown.options[index];
        var val = option.myValue;
        return val;        
    }
    
    setValue(value) {
        for (let op of this.dropDown.options) {
            var val = op.myValue;
            if (value === val) {
                op.selected = true;
            } else {
                op.selected = false;
            }
        }       
    }
}

// All sets of key actions share get/set options.
// They vary in the set of keys presented in the drop-down list,
// and this is established in the constructor.
class KeySets extends WidgetBase {
    constructor(label) {
        super(label);
    }
    
    getWidget() { return this.dropDown; }
    
    getValue() {
        var index = this.dropDown.selectedIndex;
        var option = this.dropDown.options[index];
        var val = option.myValue;
        return val;        
    }
    
    setValue(value) {
        for (let op of this.dropDown.options) {
            var val = op.myValue;
            if (value === val) {
                op.selected = true;
            } else {
                op.selected = false;
            }
        }       
    }  
}

class SpecialKeys extends KeySets {
    constructor(label) {
        super(label);

        this.dropDown = document.createElement("select");
        this.dropDown.id = this.selID;
        this.dropDown.className = "setting";
        this.dropDown.multiple = false;

        var first = true;
        for (let key of keyCodeList) {
            if (key.isSpecial) {
                var option = document.createElement("option");
                option.innerHTML = key.name;
                option.myValue = key;
                if (first) {
                    option.selected = true;
                    first = false;
                } else {
                    option.selected = false;
                }
                this.dropDown.appendChild(option);
            }
        }    
    } 
}

class ModifierKeys extends KeySets {
    constructor(label) {
        super(label);

        this.dropDown = document.createElement("select");
        this.dropDown.id = this.selID;
        this.dropDown.className = "setting";
        this.dropDown.multiple = false;

        var first = true;
        for (let key of keyCodeList) {
            if (key.isModifier) {
                var option = document.createElement("option");
                option.innerHTML = key.name;
                option.myValue = key;
                if (first) {
                    option.selected = true;
                    first = false;
                } else {
                    option.selected = false;
                }
                this.dropDown.appendChild(option);
            }
        }    
    } 
}

class NotModifierKeys extends KeySets {
    constructor(label) {
        super(label);

        this.dropDown = document.createElement("select");
        this.dropDown.id = this.selID;
        this.dropDown.className = "setting";
        this.dropDown.multiple = false;

        var first = true;
        for (let key of keyCodeList) {
            if (!key.isModifier) {
                var option = document.createElement("option");
                option.innerHTML = key.name;
                option.myValue = key;
                if (first) {
                    option.selected = true;
                    first = false;
                } else {
                    option.selected = false;
                }
                this.dropDown.appendChild(option);
            }
        }    
    } 
}

// A box that will accept numeric input.
class NumericSelector extends WidgetBase {
    constructor(label, minValue, maxValue, initialValue) {
        super(label);
        
        this.num = document.createElement("input");
        this.num.type = "number";
        this.num.min = minValue;
	this.num.max = maxValue;
	this.num.id = this.selID;
        this.num.value = initialValue;
        this.num.className = "setting";

        this.num.onchange = function() {
            var val = this.value;
            if (val < minValue) { this.value = minValue; }
            if (val > maxValue) { this.value = maxValue; }
        };
    }
    
    getWidget() { return this.num;}
    
    getValue() {return parseInt( this.num.value );}
    setValue(number) {this.num.value = number.toString();}
}

// A check box
class CheckBox extends WidgetBase {
    constructor(label, defaultValue) {
        super(label);

        this.checkBox = document.createElement("input");
        this.checkBox.type = "checkbox";
        this.checkBox.className = "setting";
        this.checkBox.id = this.selID;
        this.checkBox.checked = defaultValue;
    }
    
    getWidget() { return this.checkBox; }
    isLabelFirst() { return false; }
    
    getValue() { return this.checkBox.checked; }
    setValue(val) { this.checkBox.checked = val; }
}

// A box for text entry.
class TextBox extends WidgetBase {
    constructor(label, maxlen) {
        super(label);

        this.textBox = document.createElement("input");
        this.textBox.type = "textbox";
        this.textBox.className = "setting textinput";
        this.textBox.id = this.selID;
        this.textBox.value = "";
        this.textBox.maxlength = maxlen;
        this.textBox.size = maxlen;
        this.textBox.oninput = function() {
            var val = this.value;
            if (val.length > maxlen) {
                val = val.slice(0,20);
                this.value = val;
            }
        };
    }
    
    getWidget() { return this.textBox; }
    
    getValue() { return this.textBox.value; }
    setValue(val) { this.textBox.value = val; }  
}

class Slider extends WidgetBase {
    constructor(label, min, max, dft) {
        super(label);
        
        this.slider = document.createElement("input");
        this.slider.type = "range";
        this.slider.className = "setting range";
        this.slider.min = min;
        this.slider.max = max;
        this.slider.value = dft;
    }
    getWidget() { return this.slider; }
    
    // Meaningless
    getValue() { return parseInt(this.slider.value); }
    setValue(val) { this.slider.value = val; }  
}

class Button extends WidgetBase {
    constructor(text) {
        super("");
        
        this.button = document.createElement("input");
        this.button.type = "button";
        this.button.className = "setting button";
        this.button.value = text;
    }
    getWidget() { return this.button; }
    
    // Meaningless
    getValue() { return 0; }
    setValue(val) { }  
}

// This is for putting text in the settings area.
class TextOnlyWidget extends WidgetBase {
    constructor(labelText) {
        super(labelText);
        
        this.span = document.createElement("span");
        this.span.className = "setting span";
        this.span.value = '';
    }
    getLabel() { return this.label; }
    getWidget() { return this.span; }
    
    // Meaningless
    getValue() { return 0; }
    setValue(val) { }  
}

