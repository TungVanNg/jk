"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Zap, Battery, RotateCcw, Power, AlertTriangle } from "lucide-react"

interface BMSData {
  charge_enabled?: boolean
  discharge_enabled?: boolean
  pack_voltage?: number
  current?: number
  soc?: number
}

interface ControlTabProps {
  bmsData: BMSData | null
  sendCommand: (command: string, value?: boolean) => boolean
  isConnected: boolean
}

export function ControlTab({ bmsData, sendCommand, isConnected }: ControlTabProps) {
  const [isChargeChanging, setIsChargeChanging] = useState(false)
  const [isDischargeChanging, setIsDischargeChanging] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleChargeToggle = async (enabled: boolean) => {
    setIsChargeChanging(true)
    try {
      sendCommand("charge_enable", enabled)
      // Simulate delay for UI feedback
      setTimeout(() => setIsChargeChanging(false), 1000)
    } catch (error) {
      setIsChargeChanging(false)
    }
  }

  const handleDischargeToggle = async (enabled: boolean) => {
    setIsDischargeChanging(true)
    try {
      sendCommand("discharge_enable", enabled)
      setTimeout(() => setIsDischargeChanging(false), 1000)
    } catch (error) {
      setIsDischargeChanging(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      sendCommand("reset_bms")
      setTimeout(() => setIsResetting(false), 2000)
    } catch (error) {
      setIsResetting(false)
    }
  }

  const canControl = isConnected && bmsData

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className={!isConnected ? "border-red-200 bg-red-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="h-5 w-5" />
            Trạng thái kết nối
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>Kết nối BMS:</span>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Đã kết nối" : "Mất kết nối"}
            </Badge>
          </div>
          {!isConnected && (
            <p className="text-sm text-red-600 mt-2">
              Không thể điều khiển khi mất kết nối. Vui lòng kiểm tra kết nối MQTT.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái hiện tại</CardTitle>
          <CardDescription>Thông tin về tình trạng sạc và xả</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-muted-foreground">Điện áp</p>
              <p className="text-xl font-bold">{bmsData?.pack_voltage?.toFixed(2) || "0.00"} V</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Battery className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground">Dòng điện</p>
              <p className="text-xl font-bold">{bmsData?.current?.toFixed(2) || "0.00"} A</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Power className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-sm text-muted-foreground">SOC</p>
              <p className="text-xl font-bold">{bmsData?.soc?.toFixed(0) || "0"} %</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Switches */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              Điều khiển sạc
            </CardTitle>
            <CardDescription>Bật/tắt chế độ sạc pin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Chế độ sạc</p>
                <p className="text-sm text-muted-foreground">
                  Trạng thái:{" "}
                  <Badge variant={bmsData?.charge_enabled ? "default" : "secondary"}>
                    {bmsData?.charge_enabled ? "Đang bật" : "Đang tắt"}
                  </Badge>
                </p>
              </div>
              <Switch
                checked={bmsData?.charge_enabled || false}
                onCheckedChange={handleChargeToggle}
                disabled={!canControl || isChargeChanging}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              {bmsData?.charge_enabled ? "Pin có thể nhận điện từ nguồn sạc" : "Pin không thể nhận điện từ nguồn sạc"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5 text-blue-500" />
              Điều khiển xả
            </CardTitle>
            <CardDescription>Bật/tắt chế độ xả pin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Chế độ xả</p>
                <p className="text-sm text-muted-foreground">
                  Trạng thái:{" "}
                  <Badge variant={bmsData?.discharge_enabled ? "default" : "secondary"}>
                    {bmsData?.discharge_enabled ? "Đang bật" : "Đang tắt"}
                  </Badge>
                </p>
              </div>
              <Switch
                checked={bmsData?.discharge_enabled || false}
                onCheckedChange={handleDischargeToggle}
                disabled={!canControl || isDischargeChanging}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              {bmsData?.discharge_enabled ? "Pin có thể cung cấp điện cho tải" : "Pin không thể cung cấp điện cho tải"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset BMS */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <RotateCcw className="h-5 w-5" />
            Khởi động lại BMS
          </CardTitle>
          <CardDescription>Khởi động lại hệ thống quản lý pin (sử dụng cẩn thận)</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                disabled={!canControl || isResetting}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {isResetting ? "Đang khởi động lại..." : "Khởi động lại BMS"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Xác nhận khởi động lại
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn khởi động lại BMS? Thao tác này sẽ tạm thời ngắt kết nối và có thể ảnh hưởng đến
                  hoạt động của hệ thống pin.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-orange-600 hover:bg-orange-700">
                  Xác nhận khởi động lại
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Lưu ý:</strong> Chỉ sử dụng tính năng này khi BMS gặp sự cố hoặc theo hướng dẫn kỹ thuật.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Safety Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Thông tin an toàn</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2 text-sm">
            <li>• Luôn kiểm tra trạng thái pin trước khi thay đổi cài đặt</li>
            <li>• Không tắt cả sạc và xả cùng lúc trong thời gian dài</li>
            <li>• Theo dõi nhiệt độ pin khi điều khiển</li>
            <li>• Liên hệ kỹ thuật viên nếu có cảnh báo bất thường</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
