# Hardware-Software Communication Protocol

This document defines the communication protocol between the Arduino hardware and the web application.

## Overview

The Arduino sends sensor data to the web application via Serial (USB) communication.

## Serial Configuration

- **Baud Rate**: 9600
- **Data Bits**: 8
- **Stop Bits**: 1
- **Parity**: None
- **Flow Control**: None

## Data Format

### Message Structure

Each message is a single line terminated with a newline character (`\n`).

### Sensor Data Format

- **Format**: Comma-separated values (CSV)
- **Values**: 9 integers (one per sensor)
- **Value Range**: 0 or 1
  - `0` = Sensor not triggered (light detected / below threshold)
  - `1` = Sensor triggered (dark / above threshold)
- **Termination**: Newline character (`\n`)

### Example Messages

```
0,0,0,0,0,0,0,0,0\n
0,1,0,1,0,0,1,0,0\n
1,1,1,1,1,1,1,1,1\n
```

### Message Frequency

- Messages are sent continuously in a loop
- Default delay: 50ms between messages (~20 messages/second)
- Adjustable in Arduino code via `delay()` in `loop()`

## Sensor Mapping

| Sensor Index | Arduino Pin (Default) | Web Popup ID |
|--------------|----------------------|--------------|
| 0            | 2                    | popup-0      |
| 1            | 3                    | popup-1      |
| 2            | 4                    | popup-2      |
| 3            | 5                    | popup-3      |
| 4            | 6                    | popup-4      |
| 5            | 7                    | popup-5      |
| 6            | 8                    | popup-6      |
| 7            | 9                    | popup-7      |
| 8            | 10                   | popup-8      |

## Error Handling

### Web Application

- If fewer than 9 values are received, the line is logged as a warning and ignored
- Invalid values (not 0 or 1) are logged as warnings and ignored
- Connection errors are displayed in the status element

### Arduino

- No error handling required (simple digital read)
- Ensure pins are configured correctly in `setup()`

## Configuration Constants

Both hardware and software should use matching constants:

- **Number of Sensors**: 9
- **Baud Rate**: 9600

These are defined in:
- Hardware: `hardware/sensor_reader.ino` (`NUM_SENSORS`, `BAUD_RATE`)
- Software: `web/script.js` (`NUM_SENSORS`)

## Testing

To test the protocol independently:

1. **Arduino Serial Monitor**: Open at 9600 baud to see raw output
2. **Web Console**: Open browser DevTools to see parsed data and sensor states
3. **Web Serial API**: Use browser's serial connection dialog to select device

