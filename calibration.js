/* 
 * calibration.js
 * 
 * Handles the gathering of calibration data for the gyro.
 */

class Accumulator {
    constructor() {
        this.max = this.min = this.sum = this.count = 0;
    }
    
    addValue(value) {
        if (this.count == 0) {
            this.max = this.min = this.sum = value;
            this.count = 1;
        } else {
            this.sum += value;
            if (value > this.max) this.max = value;
            if (value < this.min) this.min = value;
            this.count++;
        }
    }
    
    reset() {
        this.max = this.min = this.sum = this.count = 0;
    }
    getMax() {return this.max;}
    getMin() {return this.min;}
    getAvg() {return Math.round(this.sum / this.count);}
}

var CalibrationData = {
    calibrationDone: false,
    accelZAcc: new Accumulator(),
    gyroZAcc:  new Accumulator(),
    gyroYAcc:  new Accumulator(),
    dataCount: 0,
    
    // Data to be collected:
    gyroYBias: 0,
    gyroZBias: 0,
    accelZRestingPoint: 0,
    tiltPoint: 0,
    tiltIsNegative: true,
    
    onCollectionComplete: null,
    
    newSensorData: function(stream) {
        // Because this is a callback function
        // 'this' is the connection obj - not CalibrationData.
        CalibrationData.processNewData(stream);
    },
    
    processNewData: function(stream) {
        this.dataCount++;
        if (this.dataCount >= 20) {
            this.onCollectionComplete();
        }       
        stream.getByte();  // Get rid of the leading 'S'
        var sensorCount = stream.getNum(2);
        for(let i=0; i<sensorCount; i++) {
            var id = stream.getID(2);
            var value = stream.getNum(2);
            switch(id) {
                case SENSOR_ACCEL_Z.id:
                    this.accelZAcc.addValue(value);
                    break;
                case SENSOR_GYRO_Y.id:
                    this.gyroYAcc.addValue(value);
                    break;
                case SENSOR_GYRO_Z.id:
                    this.gyroZAcc.addValue(value);
                    break;
            }
        }
    },
    
    startDataCollection: function() {
        this.accelZAcc.reset();
        this.gyroYAcc.reset();
        this.gyroZAcc.reset();
        this.dataCount = 0;
        Connection.onNewSensorData = this.newSensorData;
        Connection.sendCommand(REPORT_MODE);
    },
    
    stopDataCollection: function() {
        Connection.sendCommand(RUN_SENSACT);        
    },
    
    runCalibration: function() {

        showMessageBox("Calibration", "Attach the gyro as you plan to use it,<br/>"
                    + "with the green side towards your head and the wire hanging down.<br/><br/>"
                    + "Press <b>Continue</b> when ready.", ['Continue', 'Cancel'])

        .then((result) => {
            if (result === 'Continue') {
                return showMessageBox("Calibration", "Now keep your head centered and relaxed for a few seconds<br/>"
                    + "so we can see what is normal for you.<br/><br/>"
                    + "Press <b>Continue</b> when ready.", ['Continue', 'Cancel']);
            }

        }).then((result) => {
            if (result === 'Continue') {
               showMessageBox("Calibration", "Measuring ...", []);
               CalibrationData.startDataCollection();
               return new Promise(function(myResolve) {
                   CalibrationData.onCollectionComplete = function() {
                       CalibrationData.stopDataCollection();
                       
                       // Save data
                       this.gyroYBias = this.gyroYAcc.getAvg();
                       this.gyroZBias = this.gyroZAcc.getAvg();
                       this.accelZRestingPoint = this.accelZAcc.getAvg();
/*
                       console.log("Gyro Y Bias: " + this.gyroYBias);
                       console.log("Gyro Z Bias: " + this.gyroZBias);
                       console.log("Accel Z Resting: " + this.accelZRestingPoint);
  */
                       myResolve("Continue");
                   }
                });
            }
        }).then((result) => {
            if (result === 'Continue') {
                return showMessageBox("Calibration", "Now, we will measure the tilt used to turn the gyro on and off.<br/>"
                    + "Tilt your head to the left a comfortable amount.<br/><br/>"
                    + "Press <b>Continue</b> when when you are in the tilted position.", ['Continue', 'Cancel']);
            }
        }).then((result) => {
            if (result === 'Continue') {
               showMessageBox("Calibration", "Measuring ...", []);
               CalibrationData.startDataCollection();
               return new Promise(function(myResolve) {
                   CalibrationData.onCollectionComplete = function() {
                       CalibrationData.stopDataCollection();
                       
                        // Save data
                        var tiltRange, maxTilt;
                        // Calculate tilt point - left or right.
                        maxTilt = this.accelZAcc.getMin();  // on tilt left we expect values to go negative.
                        if (maxTilt < this.accelZRestingPoint) {
                            // Left tilt
                            tiltRange = maxTilt - this.accelZRestingPoint;  // Large negative value
                            this.tiltPoint = Math.round(this.accelZRestingPoint + tiltRange * 2 / 3);
                            this.tiltIsNegative = true;
                        } else {
                            // Right tilt - OK
                            maxTilt = this.accelZAcc.getMax();
                            tiltRange = maxTilt - this.accelZRestingPoint; // Positive number.
                            this.tiltPoint = Math.round(this.accelZRestingPoint + tiltRange * 2 / 3);
                            this.tiltIsNegative = false;
                        }

                        CalibrationData.calibrationDone = true;
                 //       console.log("Tilt point: " + this.tiltPoint);
                 //       console.log("Tilt is Neg: " + this.tiltIsNegative);
                        myResolve("Continue");
                   }
                });
            }

        }).then((result) => {
            if (result === 'Continue') {
                showMessageBox("Calibration","Great. We're all done.<br/><br/>"
               + "Press <b>Continue</b> to end the calibration.", ['Continue']);
            }
        });
    }
}

function doCalibration() {
    if(Connection.connected) {
        CalibrationData.runCalibration();
    } else {
        getConnected(CalibrationData.runCalibration);
    }    
}


