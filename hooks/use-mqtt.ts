"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import mqtt from "mqtt"
import { useToast } from "@/hooks/use-toast"

interface BMSData {
  timestamp?: number
  pack_voltage?: number
  current?: number
  power?: number
  soc?: number
  remaining_capacity?: number
  cycle_count?: number
  temperature1?: number
  temperature2?: number
  charge_enabled?: boolean
  discharge_enabled?: boolean
  cell_voltages?: number[]
  alarms?: {
    overvoltage?: boolean
    undervoltage?: boolean
    overcurrent_charge?: boolean
    overcurrent_discharge?: boolean
    overtemperature?: boolean
    undertemperature?: boolean
  }
}

interface SystemStatus {
  timestamp?: number
  wifi_connected?: boolean
  mqtt_connected?: boolean
  bms_connected?: boolean
  wifi_rssi?: number
  free_heap?: number
  uptime?: number
  mqtt_pub_count?: number
  mqtt_fail_count?: number
}

interface ConnectionStatus {
  mqtt: boolean
  reconnecting: boolean
  reconnectCount: number
  messageCount: number
  lastError?: string
}

// ✅ FIXED: Correct HiveMQ Cloud WebSocket configuration
const MQTT_CONFIG = {
  broker: "wss://800183b566f44f8b814485f15e6f0a9d.s1.eu.hivemq.cloud:8884/mqtt",
  username: "0971969218",
  password: "Bmkjk0971969218",
  topics: {
    data: "bms/data",
    status: "bms/status",
    control: "bms/control",
  },
}

// ✅ ADDED: Alternative connection configurations to try
const FALLBACK_CONFIGS = [
  {
    broker: "wss://800183b566f44f8b814485f15e6f0a9d.s1.eu.hivemq.cloud:8884/mqtt",
    name: "Primary WebSocket",
  },
  {
    broker: "wss://800183b566f44f8b814485f15e6f0a9d.s1.eu.hivemq.cloud:8884/",
    name: "Alternative WebSocket",
  },
]

export function useMQTT() {
  const [bmsData, setBmsData] = useState<BMSData | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    mqtt: false,
    reconnecting: false,
    reconnectCount: 0,
    messageCount: 0,
  })
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)

  const clientRef = useRef<mqtt.MqttClient | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentConfigIndexRef = useRef<number>(0)
  const lastCommandTimeRef = useRef<number>(0)
  const { toast } = useToast()

  // Rate limiting for commands
  const canSendCommand = useCallback(() => {
    const now = Date.now()
    if (now - lastCommandTimeRef.current < 1000) {
      return false
    }
    lastCommandTimeRef.current = now
    return true
  }, [])

  const connect = useCallback(() => {
    if (clientRef.current?.connected) {
      return
    }

    const currentConfig = FALLBACK_CONFIGS[currentConfigIndexRef.current] || FALLBACK_CONFIGS[0]

    console.log(`🔄 Attempting MQTT connection (${currentConfig.name})...`)
    console.log(`🔗 Broker: ${currentConfig.broker}`)
    console.log(`👤 Username: ${MQTT_CONFIG.username}`)

    setConnectionStatus((prev) => ({
      ...prev,
      reconnecting: true,
      lastError: undefined,
    }))

    try {
      // Clean up existing client
      if (clientRef.current) {
        clientRef.current.removeAllListeners()
        clientRef.current.end(true)
        clientRef.current = null
      }

      // ✅ FIXED: Optimized connection options for HiveMQ Cloud
      const client = mqtt.connect(currentConfig.broker, {
        username: MQTT_CONFIG.username,
        password: MQTT_CONFIG.password,
        keepalive: 60,
        connectTimeout: 20000, // Increased timeout
        reconnectPeriod: 0, // Disable auto-reconnect, we'll handle it manually
        clean: true,
        clientId: `bms_web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        protocolVersion: 4,
        // ✅ ADDED: WebSocket specific options
        transformWsUrl: (url, options, client) => {
          console.log(`🌐 WebSocket URL: ${url}`)
          return url
        },
      })

      // ✅ ADDED: Connection timeout handler
      const connectionTimeout = setTimeout(() => {
        console.log("⏰ Connection timeout - trying next configuration")
        client.end(true)

        // Try next configuration
        currentConfigIndexRef.current = (currentConfigIndexRef.current + 1) % FALLBACK_CONFIGS.length

        setConnectionStatus((prev) => ({
          ...prev,
          reconnecting: false,
          lastError: `Timeout with ${currentConfig.name}`,
        }))

        // Retry with next config after delay
        setTimeout(() => connect(), 2000)
      }, 25000) // 25 second timeout

      client.on("connect", (connack) => {
        clearTimeout(connectionTimeout)
        console.log("✅ MQTT Connected successfully!")
        console.log("🎉 Connection details:", connack)

        // Reset config index on successful connection
        currentConfigIndexRef.current = 0

        setConnectionStatus((prev) => ({
          ...prev,
          mqtt: true,
          reconnecting: false,
          reconnectCount: prev.reconnectCount + 1,
          lastError: undefined,
        }))

        // Subscribe to topics with delay
        setTimeout(() => {
          const topics = [MQTT_CONFIG.topics.data, MQTT_CONFIG.topics.status]
          console.log("📡 Subscribing to topics:", topics)

          client.subscribe(topics, { qos: 0 }, (err, granted) => {
            if (err) {
              console.error("❌ Subscribe error:", err)
              toast({
                title: "Lỗi đăng ký topic",
                description: `Không thể đăng ký: ${err.message}`,
                variant: "destructive",
              })
            } else {
              console.log("✅ Successfully subscribed:", granted)
              toast({
                title: "Kết nối thành công",
                description: `Đã kết nối ${currentConfig.name}`,
              })
            }
          })
        }, 1000)
      })

      client.on("message", (topic, message) => {
        try {
          if (message.length > 2048) {
            console.warn("⚠️  Message too large, truncating")
            return
          }

          const data = JSON.parse(message.toString())

          // ✅ ADDED: Debug logs để kiểm tra
          console.log(`📨 Received topic: ${topic}`)
          console.log(`📊 Message data:`, data)

          setConnectionStatus((prev) => ({
            ...prev,
            messageCount: prev.messageCount + 1,
          }))

          if (topic === MQTT_CONFIG.topics.data) {
            console.log("📊 BMS Data received:", data)
            setBmsData(data)
            setLastUpdate(Date.now())
          } else if (topic === MQTT_CONFIG.topics.status) {
            console.log("📡 System status received:", data)
            setSystemStatus(data)
          }
        } catch (error) {
          console.error("❌ Error parsing message:", error)
        }
      })

      client.on("error", (error) => {
        clearTimeout(connectionTimeout)
        console.error("❌ MQTT Error:", error)

        const errorMessage = error.message || error.toString()
        setConnectionStatus((prev) => ({
          ...prev,
          mqtt: false,
          reconnecting: false,
          lastError: errorMessage,
        }))

        // Handle specific error types
        if (errorMessage.includes("connack timeout")) {
          console.log("🔄 CONNACK timeout - trying next configuration")
          currentConfigIndexRef.current = (currentConfigIndexRef.current + 1) % FALLBACK_CONFIGS.length

          toast({
            title: "Timeout kết nối",
            description: "Đang thử cấu hình khác...",
            variant: "destructive",
          })

          // Retry with next config
          setTimeout(() => connect(), 3000)
        } else if (errorMessage.includes("Connection refused")) {
          toast({
            title: "Kết nối bị từ chối",
            description: "Kiểm tra thông tin đăng nhập",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Lỗi kết nối MQTT",
            description: errorMessage,
            variant: "destructive",
          })
        }
      })

      client.on("close", () => {
        clearTimeout(connectionTimeout)
        console.log("🔌 MQTT Connection closed")
        setConnectionStatus((prev) => ({ ...prev, mqtt: false, reconnecting: false }))
      })

      client.on("disconnect", (packet) => {
        clearTimeout(connectionTimeout)
        console.log("💔 MQTT Disconnected:", packet)
        setConnectionStatus((prev) => ({ ...prev, mqtt: false }))
      })

      client.on("offline", () => {
        console.log("📴 MQTT Offline")
        setConnectionStatus((prev) => ({ ...prev, mqtt: false }))
      })

      clientRef.current = client
    } catch (error) {
      console.error("❌ MQTT Connection setup error:", error)
      setConnectionStatus((prev) => ({
        ...prev,
        mqtt: false,
        reconnecting: false,
        lastError: error instanceof Error ? error.message : "Setup error",
      }))

      // Retry with exponential backoff
      const backoffTime = Math.min(30000, 3000 * Math.pow(2, Math.min(connectionStatus.reconnectCount, 3)))
      console.log(`🔄 Will retry in ${backoffTime}ms`)

      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, backoffTime)
    }
  }, [toast, connectionStatus.reconnectCount])

  const sendCommand = useCallback(
    (command: string, value?: boolean) => {
      if (!clientRef.current?.connected) {
        console.log("❌ Cannot send command - MQTT not connected")
        toast({
          title: "Không thể gửi lệnh",
          description: "Chưa kết nối đến hệ thống BMS",
          variant: "destructive",
        })
        return false
      }

      if (!canSendCommand()) {
        console.log("⚠️  Command rate limited")
        toast({
          title: "Gửi lệnh quá nhanh",
          description: "Vui lòng chờ 1 giây giữa các lệnh",
          variant: "destructive",
        })
        return false
      }

      const payload = {
        command,
        value: value !== undefined ? value : true,
        timestamp: Date.now(),
      }

      console.log(`📤 Sending command: ${command} = ${value}`)

      clientRef.current.publish(
        MQTT_CONFIG.topics.control,
        JSON.stringify(payload),
        { qos: 0, retain: false },
        (error) => {
          if (error) {
            console.error("❌ Error sending command:", error)
            toast({
              title: "Lỗi gửi lệnh",
              description: `Không thể gửi lệnh ${command}`,
              variant: "destructive",
            })
          } else {
            console.log("✅ Command sent successfully")
            toast({
              title: "Gửi lệnh thành công",
              description: `Đã gửi lệnh ${command}`,
            })
          }
        },
      )

      return true
    },
    [toast, canSendCommand],
  )

  // Initialize connection
  useEffect(() => {
    console.log("🚀 Initializing MQTT connection...")
    connect()

    return () => {
      console.log("🧹 Cleaning up MQTT connection...")
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (clientRef.current) {
        clientRef.current.removeAllListeners()
        clientRef.current.end(true)
      }
    }
  }, [connect])

  // Health check with manual reconnection
  useEffect(() => {
    const healthCheck = setInterval(() => {
      if (!connectionStatus.mqtt && !connectionStatus.reconnecting) {
        console.log("🏥 Health check: Attempting reconnection")
        connect()
      }
    }, 45000) // Check every 45 seconds

    return () => clearInterval(healthCheck)
  }, [connect, connectionStatus.mqtt, connectionStatus.reconnecting])

  return {
    bmsData,
    systemStatus,
    connectionStatus,
    sendCommand,
    isConnected: connectionStatus.mqtt,
    lastUpdate,
  }
}
