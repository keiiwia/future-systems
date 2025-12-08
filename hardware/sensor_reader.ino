const int NUM_SENSORS = 9;
const int BAUD_RATE = 9600;

// DO pins from LM393 modules
const int SENSOR_PINS[NUM_SENSORS] = {
  2, 3, 4, 5, 6, 7, 8, 9, 10
};

// sensor state array
int sensorStates[NUM_SENSORS];

void setup() {
  Serial.begin(BAUD_RATE);
  
  // init all sensor pins as INPUT
  for (int i = 0; i < NUM_SENSORS; i++) {
    pinMode(SENSOR_PINS[i], INPUT);
  }
  // init sensor states
  for (int i = 0; i < NUM_SENSORS; i++) {
    sensorStates[i] = 0;
  }
  
  // wait for serial connection
  // while (!Serial) {
  //   ; // wait for serial port to connect
  // }
}

void loop() { //read sensors
  for (int i = 0; i < NUM_SENSORS; i++) {
    sensorStates[i] = digitalRead(SENSOR_PINS[i]);
  }
  for (int i = 0; i < NUM_SENSORS; i++) {
    Serial.print(sensorStates[i]);
    if (i < NUM_SENSORS - 1) {
      Serial.print(","); //comma-separated values; js takes care of comma separation
    }
  }
  Serial.println(); // newline to terminate the line
  
  // do not overwhelm the serial buffer
  delay(50); //~20 readings per second
}

