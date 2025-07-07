"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Wifi, Zap, Battery, Thermometer, Activity, AlertCircle } from "lucide-react"
import { useMQTT } from "@/hooks/use-mqtt"
import { OverviewTab } from "@/components/overview-tab"
import { CellsTab } from "@/components/cells-tab"
import { ControlTab } from "@/components/control-tab"
import { StatusIndicator } from "@/components/status-indicator"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function BMSMonitor() {
  const { bmsData, systemStatus, connectionStatus, sendCommand, isConnected, lastUpdate } = useMQTT()

  // Check if data is stale (no update for 10 seconds)
  const isDataStale = lastUpdate && Date.now() - lastUpdate > 10000

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        {/* Header - Mobile Optimized */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Giám Sát JK BMS</h1>
              <p className="text-sm sm:text-base text-gray-600">Hệ thống quản lý pin thông minh</p>
              {/* ✅ ADDED: Enhanced debug info */}
              <p className="text-xs text-gray-500">
                MQTT:{" "}
                {isConnected ? "✅ Connected" : connectionStatus.reconnecting ? "🔄 Connecting..." : "❌ Disconnected"}
                {connectionStatus.lastError && ` | Error: ${connectionStatus.lastError}`}
                {connectionStatus.reconnectCount > 0 && ` | Attempts: ${connectionStatus.reconnectCount}`}
              </p>
            </div>

            {/* Status Indicators - Mobile Stack */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              <StatusIndicator icon={Wifi} label="WiFi" status={systemStatus?.wifi_connected} color="blue" compact />
              <StatusIndicator
                icon={Activity}
                label="MQTT"
                status={connectionStatus.mqtt}
                color={connectionStatus.reconnecting ? "orange" : "green"}
                compact
              />
              <StatusIndicator icon={Battery} label="BMS" status={systemStatus?.bms_connected} color="orange" compact />
            </div>
          </div>

          {/* Enhanced Connection Alert */}
          {(!isConnected || isDataStale) && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {connectionStatus.reconnecting ? (
                  <>🔄 Đang kết nối MQTT... (Lần thử: {connectionStatus.reconnectCount})</>
                ) : !isConnected ? (
                  <>❌ Mất kết nối MQTT. {connectionStatus.lastError && `Lỗi: ${connectionStatus.lastError}`}</>
                ) : (
                  <>⚠️ Dữ liệu không được cập nhật. Kiểm tra ESP32.</>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Stats - Mobile Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">Điện áp</p>
                  <p className="text-lg font-bold truncate">{bmsData?.pack_voltage?.toFixed(2) || "0.00"}V</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">Dòng điện</p>
                  <p className="text-lg font-bold truncate">{bmsData?.current?.toFixed(2) || "0.00"}A</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">SOC</p>
                  <p className="text-lg font-bold truncate">{bmsData?.soc?.toFixed(0) || "0"}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">Nhiệt độ</p>
                  <p className="text-lg font-bold truncate">{bmsData?.temperature1?.toFixed(1) || "0.0"}°C</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content - Mobile Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="cells" className="text-xs sm:text-sm">
              Pin Cell
            </TabsTrigger>
            <TabsTrigger value="control" className="text-xs sm:text-sm">
              Điều khiển
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab bmsData={bmsData} systemStatus={systemStatus} />
          </TabsContent>

          <TabsContent value="cells">
            <CellsTab bmsData={bmsData} />
          </TabsContent>

          <TabsContent value="control">
            <ControlTab bmsData={bmsData} sendCommand={sendCommand} isConnected={isConnected} />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}
