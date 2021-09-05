/*
 * levels.js
 * 
 * Code for monitoring and displaying signal levels on the hub.
 * 
 */

class PortMeter {
    constructor(context, portName, xloc, yloc) {
        this.context = context;
        this.name = portName;
        this.xloc = xloc;
        this.yloc = yloc;
        this.level = 0;
        
        this.reDraw();
    }
    
    reDraw() {
        // Erase previous content.
        this.context.fillStyle = 'white';
        this.context.strokeStyle = 'white';
        this.context.lineWidth = 1;
        this.context.fillRect( this.xloc - 55, this.yloc - 55, 110, 110);
        
        this.context.fillStyle = '#000000';
        this.context.strokeStyle = 'black';
        this.context.beginPath();
        this.context.arc(this.xloc, this.yloc, 45, 0.8*Math.PI, 0.2*Math.PI);
        this.context.lineWidth = 2;
        this.context.stroke();
                
        this.drawLine();
        
        // Add the text
        this.context.font = "18px Arial";
        this.context.fillText(this.name, this.xloc-10, this.yloc + 5);
    }
    
    drawLine() {
        var angle = (0.8 + 1.4 * this.level / 1024) * Math.PI;  // Line angle in radians.
        this.context.beginPath();
        this.context.lineWidth = 2;
        var toX = this.xloc + Math.cos(angle) * 15;
        var toY = this.yloc + Math.sin(angle) * 15;
        this.context.moveTo(toX, toY);
        toX = this.xloc + Math.cos(angle) * 49;
        toY = this.yloc + Math.sin(angle) * 49;
        this.context.lineTo(toX, toY);
        this.context.stroke();
        
        // Add a darker arc
        this.context.beginPath();
        var xxx = (0.8 + 1.4 * this.level / 1024);
        this.context.arc(this.xloc, this.yloc, 45, 0.8*Math.PI, xxx*Math.PI);
        this.context.lineWidth = 5;
        this.context.stroke();
    }
    
    setLevel(level) {
        this.level = level;
        this.reDraw();
    }
}

const SWIDTH = 300;
const SHEIGHT = 20;

class PortSlider {
    constructor(context, text, min, max, xloc, yloc) {
        this.context = context;
        this.min = min;
        this.max = max;
        this.text = text;
        this.xloc = xloc;
        this.yloc = yloc;
        this.level = 0;
        this.redraw();
    }
    
    redraw() {
        // Erase previous content.
        this.context.fillStyle = 'white';
        this.context.strokeStyle = 'white';
        this.context.lineWidth = 1;
        this.context.fillRect( this.xloc, this.yloc, SWIDTH, SHEIGHT);
        
        this.context.fillStyle = '#000000';
        this.context.strokeStyle = 'black';

        this.context.font = "18px Arial";
        this.context.fillText(this.text, this.xloc-25, this.yloc + 15);
        
        this.context.beginPath();
        this.context.lineWidth = 2;
        this.context.moveTo(this.xloc, this.yloc + SHEIGHT/2);
        this.context.lineTo(this.xloc + SWIDTH, this.yloc + SHEIGHT/2);
        this.context.moveTo(this.xloc + SWIDTH/2, this.yloc);
        this.context.lineTo(this.xloc + SWIDTH/2, this.yloc + SHEIGHT);
        this.context.stroke();
        
        this.context.beginPath();
        var pointerLocation = SWIDTH * (this.level - this.min) / (this.max - this.min);
        this.context.moveTo(pointerLocation + this.xloc, this.yloc + 2);
        this.context.lineWidth = 1;
        this.context.lineTo(pointerLocation + this.xloc, this.yloc + SHEIGHT - 2);    
        this.context.stroke();
        
        this.context.beginPath();
        this.context.moveTo(this.xloc + SWIDTH/2, this.yloc + SHEIGHT/2);
        this.context.lineWidth = 6;
        this.context.lineTo(pointerLocation + this.xloc, this.yloc + SHEIGHT/2);
        this.context.stroke();
    }
    
    setLevel(level){
        if (level < this.min) level = this.min;
        if (level > this.max) level = this.max;
        this.level = level;
        this.redraw();
    }
}

var Levels = {
    port1AMeter: null,
    port1BMeter: null,
    port2AMeter: null,
    port2BMeter: null,
    port3AMeter: null,
    port3BMeter: null,
    accelXMeter: null,
    accelYMeter: null,
    accelZMeter: null,
    gyroXMeter: null,
    gyroYMeter: null,
    gyroZMeter: null,
    
    startLevels: function() {
        Levels.showLevels();  // Make 'this' refer to this.
    },
    
    init: function() {
        var canvas = document.getElementById("levelsCanvas");
        var context = canvas.getContext("2d");

        // Add the text
        context.font = "24px Arial";
        context.fillText("Ports", 110, 30);
        context.fillText("Accelerometers", 420, 30);
        context.fillText("Gyroscopes", 425, 225);

        this.port1AMeter = new PortMeter(context, "1A", 75, 100);
        this.port1BMeter = new PortMeter(context, "1B", 200, 100);
        this.port2AMeter = new PortMeter(context, "2A", 75, 225);
        this.port2BMeter = new PortMeter(context, "2B", 200, 225);
        this.port3AMeter = new PortMeter(context, "3A", 75, 350);
        this.port3BMeter = new PortMeter(context, "3B", 200, 350);
        
        this.accelXMeter = new PortSlider(context, "X", -16000, 16000, 350, 65);
        this.accelYMeter = new PortSlider(context, "Y", -16000, 16000, 350, 115);
        this.accelZMeter = new PortSlider(context, "Z", -16000, 16000, 350, 165);

        this.gyroXMeter = new PortSlider(context, "X", -15000, 15000, 350, 250);
        this.gyroYMeter = new PortSlider(context, "Y", -15000, 15000, 350, 300);
        this.gyroZMeter = new PortSlider(context, "Z", -15000, 15000, 350, 350);                       
    },
    
    showLevels: function() {
        if (this.port1AMeter === null) {
            this.init();
        }
        
        document.getElementById("levels").style.display = "block";

        Connection.onNewSensorData = (stream) => {this.processData(stream);}
        Connection.sendCommand(REPORT_MODE);
    },
    
    close: function() {
        Connection.sendCommand(RUN_SENSACT);
        document.getElementById("levels").style.display = "none";    
        Connection.onNewSensorData = null;
    },
    
    processData: function(stream) {
        stream.getByte();  // Get rid of the leading 'S'
        var sensorCount = stream.getNum(2);
        for(let i=0; i<sensorCount; i++) {
            var id = stream.getID(2);
            var value = stream.getNum(2);
            switch(id) {
                case SENSOR_1A.id:
                    this.port1AMeter.setLevel(value);
                    break;
                case SENSOR_1B.id:
                    this.port1BMeter.setLevel(value);
                    break;
                case SENSOR_2A.id:
                    this.port2AMeter.setLevel(value);
                    break;
                case SENSOR_2B.id:
                    this.port2BMeter.setLevel(value);
                    break;
                case SENSOR_3A.id:
                    this.port3AMeter.setLevel(value);
                    break;
                case SENSOR_3B.id:
                    this.port3BMeter.setLevel(value);
                    break;
                case SENSOR_ACCEL_X.id:
                    this.accelXMeter.setLevel(value);
                    break;
                case SENSOR_ACCEL_Y.id:
                    this.accelYMeter.setLevel(value);
                    break;
                case SENSOR_ACCEL_Z.id:
                    this.accelZMeter.setLevel(value);
                    break;
                case SENSOR_GYRO_X.id:
                    this.gyroXMeter.setLevel(value);
                    break;
                case SENSOR_GYRO_Y.id:
                    this.gyroYMeter.setLevel(value);
                    break;
                case SENSOR_GYRO_Z.id:
                    this.gyroZMeter.setLevel(value);
                    break;
            }
        }        
    }
     
};

