# 🔋 ESP32 JK BMS Monitor - Hệ thống giám sát pin hoàn chỉnh

## 📋 Tổng quan
Hệ thống giám sát và điều khiển JK BMS real-time qua MQTT với giao diện web responsive, tối ưu cho vận hành 24/7.

## 🔧 Cấu hình hệ thống

### WiFi & MQTT
- **WiFi SSID**: `wifi`
- **WiFi Password**: `0971969218`
- **MQTT Broker**: `800183b566f44f8b814485f15e6f0a9d.s1.eu.hivemq.cloud`
- **MQTT Port**: `8883` (ESP32) / `8884` (Web)
- **MQTT Username**: `0971969218`
- **MQTT Password**: `Bmkjk0971969218`

### MQTT Topics
- `bms/data` - Dữ liệu BMS (ESP32 → Web)
- `bms/status` - Trạng thái hệ thống (ESP32 → Web)  
- `bms/control` - Lệnh điều khiển (Web → ESP32)

## 🔌 Kết nối phần cứng

### ESP32 ↔ JK BMS
\`\`\`
ESP32 Pin 16 (RX) ← TX JK BMS
ESP32 Pin 17 (TX) → RX JK BMS
ESP32 GND       ← GND JK BMS
\`\`\`

### LED Status
- **Pin 2**: WiFi Status (Xanh = Connected)
- **Pin 4**: MQTT Status (Xanh = Connected)
- **Pin 5**: System Status (Nhấp nháy)

## 🚀 Cài đặt ESP32

### 1. Arduino IDE Setup
\`\`\`bash
# Board Manager URL:
https://dl.espressif.com/dl/package_esp32_index.json

# Board: ESP32 Dev Module
# Upload Speed: 921600
# CPU Frequency: 240MHz
\`\`\`

### 2. Thư viện cần thiết
\`\`\`bash
# Library Manager → Install:
- ArduinoJson (by Benoit Blanchon)
- PubSubClient (by Nick O'Leary)
\`\`\`

### 3. Upload firmware
1. Kết nối ESP32 qua USB
2. Chọn đúng COM Port
3. Upload file `ESP32/esp32_jk_bms_monitor.ino`
4. Mở Serial Monitor (115200 baud)

## 🌐 Web Application

### Cài đặt & Chạy
\`\`\`bash
npm install
npm run dev
\`\`\`

### Deploy Production
\`\`\`bash
npm run build
# Hoặc deploy lên Vercel/Netlify
\`\`\`

## 📊 Tính năng chính

### ✅ ESP32 Firmware (24/7 Stable)
- Đọc dữ liệu thật từ JK BMS qua UART
- Gửi dữ liệu lên MQTT mỗi 3 giây
- Nhận lệnh điều khiển từ web
- Auto-reconnect WiFi/MQTT với exponential backoff
- Memory monitoring & auto-restart
- Rate limiting để tránh MQTT flooding
- Watchdog feeding để tránh crash

### ✅ Web Interface
- Giao diện tiếng Việt responsive
- 3 tab: Tổng quan, Pin Cell, Điều khiển
- Real-time data từ MQTT WebSocket
- Điều khiển sạc/xả từ xa
- Connection health monitoring
- Auto-reconnect với rate limiting

## 🛡️ Tính năng 24/7 Stability

### ESP32
- **Memory Management**: Auto-restart nếu heap < 5KB
- **Connection Recovery**: Exponential backoff cho WiFi/MQTT
- **Rate Limiting**: Minimum 1.5s giữa các MQTT publish
- **Watchdog**: Feed watchdog mỗi 1 giây
- **Statistics**: Track uptime, reconnects, publish count

### Web Client
- **Health Check**: Kiểm tra kết nối mỗi 30 giây
- **Command Rate Limit**: 1 giây giữa các lệnh
- **Message Size Limit**: 2048 bytes max
- **Auto Cleanup**: Proper client disposal

## 🔍 Debug & Monitoring

### ESP32 Serial Logs
\`\`\`
✅ WiFi connected! IP: 192.168.1.100 | RSSI: -45 dBm
✅ MQTT connected!
📊 BMS read #10 | V:48.2V | I:-5.5A
📤 Data sent (20)
💾 Heap: 28456 bytes (Low: 25123)
📊 === 24/7 OPERATION STATS ===
⏱️  Uptime: 3600 seconds
📤 MQTT publishes: 1200 (fails: 2)
\`\`\`

### Web Console Logs
\`\`\`
✅ MQTT Connected (stable mode)
📊 BMS Data batch received: {voltage: 48.2, current: -5.5, soc: 75, count: 20}
📡 System stats: {uptime: 3600, heap: 28456, publishes: 1200}
\`\`\`

## ⚠️ Troubleshooting

### ESP32 không kết nối WiFi
\`\`\`
❌ WiFi connection failed!
→ Kiểm tra SSID/Password trong ESP32/config.h
\`\`\`

### MQTT không kết nối
\`\`\`
❌ MQTT failed, rc=-2
→ Kiểm tra broker URL và credentials
\`\`\`

### Web không nhận dữ liệu
\`\`\`
❌ MQTT Connection error
→ Kiểm tra WebSocket URL trong hooks/use-mqtt.ts
\`\`\`

### Không có dữ liệu BMS
\`\`\`
⏳ Still waiting for real BMS data
→ Kiểm tra kết nối UART ESP32 ↔ BMS (Pin 16, 17)
\`\`\`

## 🎛️ Lệnh điều khiển

### JSON Commands (Web → ESP32)
\`\`\`json
// Bật/tắt sạc
{"command": "charge_enable", "value": true/false}

// Bật/tắt xả  
{"command": "discharge_enable", "value": true/false}

// Reset BMS
{"command": "reset_bms"}
\`\`\`

## 📈 Performance Metrics (24/7)

### Expected Performance
- **Memory Usage**: 25-30KB stable
- **MQTT Messages**: ~1200/hour
- **WiFi Reconnects**: <5/day
- **BMS Reads**: ~1200/hour

### Warning Thresholds
- **Heap < 10KB**: Warning logged
- **Heap < 5KB**: Auto restart
- **MQTT Fail Rate > 50%**: Rate limiting activated
- **No BMS Data > 15s**: Connection lost

## 📁 Cấu trúc file

\`\`\`
jk-bms-monitor/
├── ESP32/
│   ├── esp32_jk_bms_monitor.ino    # Main firmware (24/7 stable)
│   ├── config.h                    # WiFi/MQTT config
│   └── bms_protocol.h              # JK BMS protocol
├── app/
│   └── page.tsx                    # Main web interface
├── components/
│   ├── overview-tab.tsx            # Tổng quan tab
│   ├── cells-tab.tsx               # Pin cells tab
│   ├── control-tab.tsx             # Điều khiển tab
│   └── status-indicator.tsx        # Status indicators
├── hooks/
│   └── use-mqtt.ts                 # MQTT hook (24/7 stable)
├── package.json                    # Dependencies
└── README.md                       # This file
\`\`\`

## 🎯 Deployment Checklist

### ESP32
- [ ] Upload firmware với đúng config
- [ ] Kiểm tra Serial Monitor logs
- [ ] Verify LED status (WiFi, MQTT, System)
- [ ] Test BMS connection (UART)

### Web App
- [ ] Deploy lên Vercel/Netlify
- [ ] Test MQTT WebSocket connection
- [ ] Verify real-time data updates
- [ ] Test control commands

## 🎯 **DEPLOYMENT VERIFICATION**

### **ESP32 Verification**
1. **Serial Monitor Output:**
\`\`\`
=== ESP32 JK BMS Monitor - 24/7 Stable Version ===
✅ WiFi connected! IP: 192.168.1.xxx | RSSI: -xx dBm
✅ MQTT connected!
📊 BMS read #1 | V:xx.xV | I:x.xA
📤 Data sent (1)
\`\`\`

2. **LED Status:**
- Pin 2 (WiFi): 🟢 Solid Green
- Pin 4 (MQTT): 🟢 Solid Green  
- Pin 5 (System): 🔵 Blinking Blue

### **Web App Verification**
1. **Console Logs:**
\`\`\`
🚀 Initializing MQTT connection...
✅ MQTT Connected successfully!
📊 BMS Data received: {voltage: xx.x, current: x.x, soc: xx}
\`\`\`

2. **UI Features:**
- ✅ Real-time data updates
- ✅ 3 tabs working (Tổng quan, Pin Cell, Điều khiển)
- ✅ Control commands working
- ✅ Mobile responsive
- ✅ Vietnamese interface

### **System Integration Test**
1. **Data Flow:** ESP32 → MQTT → Web ✅
2. **Control Flow:** Web → MQTT → ESP32 ✅
3. **Real-time Updates:** < 3 seconds ✅
4. **Error Recovery:** Auto-reconnect ✅

---
**🎉 HỆ THỐNG HOÀN CHỈNH - SẴN SÀNG PRODUCTION!**
