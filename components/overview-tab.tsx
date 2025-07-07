"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Zap, Battery, Thermometer } from "lucide-react"

interface BMSData {
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
  wifi_rssi?: number
  free_heap?: number
  uptime?: number
}

interface OverviewTabProps {
  bmsData: BMSData | null
  systemStatus: SystemStatus | null
}

export function OverviewTab({ bmsData, systemStatus }: OverviewTabProps) {
  const hasAlarms = bmsData?.alarms && Object.values(bmsData.alarms).some((alarm) => alarm)

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "0s"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  return (
    <div className="grid gap-6">
      {/* Main Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thông số chính</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Điện áp pack:</span>
                <span className="font-medium">{bmsData?.pack_voltage?.toFixed(2) || "0.00"} V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dòng điện:</span>
                <span className="font-medium">{bmsData?.current?.toFixed(2) || "0.00"} A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Công suất:</span>
                <span className="font-medium">{bmsData?.power?.toFixed(1) || "0.0"} W</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái pin</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">SOC:</span>
                  <span className="font-medium">{bmsData?.soc?.toFixed(0) || "0"}%</span>
                </div>
                <Progress value={bmsData?.soc || 0} className="h-2" />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dung lượng còn lại:</span>
                <span className="font-medium">{bmsData?.remaining_capacity?.toFixed(1) || "0.0"} Ah</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Chu kỳ sạc:</span>
                <span className="font-medium">{bmsData?.cycle_count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhiệt độ</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cảm biến 1:</span>
                <span className="font-medium">{bmsData?.temperature1?.toFixed(1) || "0.0"}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cảm biến 2:</span>
                <span className="font-medium">{bmsData?.temperature2?.toFixed(1) || "0.0"}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <Badge
                  variant={
                    (bmsData?.temperature1 || 0) > 45 || (bmsData?.temperature2 || 0) > 45
                      ? "destructive"
                      : (bmsData?.temperature1 || 0) > 35 || (bmsData?.temperature2 || 0) > 35
                        ? "secondary"
                        : "default"
                  }
                >
                  {(bmsData?.temperature1 || 0) > 45 || (bmsData?.temperature2 || 0) > 45
                    ? "Quá nóng"
                    : (bmsData?.temperature1 || 0) > 35 || (bmsData?.temperature2 || 0) > 35
                      ? "Ấm"
                      : "Bình thường"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Status */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái điều khiển</CardTitle>
          <CardDescription>Tình trạng sạc và xả của hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                <span>Chế độ sạc</span>
              </div>
              <Badge variant={bmsData?.charge_enabled ? "default" : "secondary"}>
                {bmsData?.charge_enabled ? "Bật" : "Tắt"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Battery className="h-5 w-5 text-blue-500" />
                <span>Chế độ xả</span>
              </div>
              <Badge variant={bmsData?.discharge_enabled ? "default" : "secondary"}>
                {bmsData?.discharge_enabled ? "Bật" : "Tắt"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alarms */}
      {hasAlarms && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Cảnh báo hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {bmsData?.alarms?.overvoltage && <Badge variant="destructive">Quá điện áp</Badge>}
              {bmsData?.alarms?.undervoltage && <Badge variant="destructive">Thiếu điện áp</Badge>}
              {bmsData?.alarms?.overcurrent_charge && <Badge variant="destructive">Quá dòng sạc</Badge>}
              {bmsData?.alarms?.overcurrent_discharge && <Badge variant="destructive">Quá dòng xả</Badge>}
              {bmsData?.alarms?.overtemperature && <Badge variant="destructive">Quá nhiệt</Badge>}
              {bmsData?.alarms?.undertemperature && <Badge variant="destructive">Quá lạnh</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cường độ WiFi:</span>
              <span className="font-medium">{systemStatus?.wifi_rssi || 0} dBm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bộ nhớ trống:</span>
              <span className="font-medium">{Math.round((systemStatus?.free_heap || 0) / 1024)} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Thời gian hoạt động:</span>
              <span className="font-medium">{formatUptime(systemStatus?.uptime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
