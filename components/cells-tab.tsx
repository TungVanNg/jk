"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Battery } from "lucide-react"

interface BMSData {
  cell_voltages?: number[]
}

interface CellsTabProps {
  bmsData: BMSData | null
}

export function CellsTab({ bmsData }: CellsTabProps) {
  const cellVoltages = bmsData?.cell_voltages || []
  const maxVoltage = Math.max(...cellVoltages, 0)
  const minVoltage = Math.min(...cellVoltages.filter((v) => v > 0), 0)
  const avgVoltage = cellVoltages.length > 0 ? cellVoltages.reduce((sum, v) => sum + v, 0) / cellVoltages.length : 0
  const voltageDiff = maxVoltage - minVoltage

  const getCellStatus = (voltage: number) => {
    if (voltage < 3000) return { status: "Thấp", variant: "destructive" as const }
    if (voltage > 4200) return { status: "Cao", variant: "destructive" as const }
    if (voltage < 3200) return { status: "Yếu", variant: "secondary" as const }
    if (voltage > 4000) return { status: "Tốt", variant: "default" as const }
    return { status: "Bình thường", variant: "default" as const }
  }

  return (
    <div className="space-y-4">
      {/* Cell Statistics - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Số lượng cell</p>
            <p className="text-xl font-bold">{cellVoltages.length}</p>
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Cao nhất</p>
            <p className="text-xl font-bold text-green-600">{maxVoltage.toFixed(0)} mV</p>
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Thấp nhất</p>
            <p className="text-xl font-bold text-red-600">{minVoltage.toFixed(0)} mV</p>
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Chênh lệch</p>
            <p className="text-xl font-bold text-orange-600">{voltageDiff.toFixed(0)} mV</p>
          </div>
        </Card>
      </div>

      {/* Balance Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Trạng thái cân bằng</CardTitle>
          <CardDescription className="text-sm">
            Điện áp TB: {avgVoltage.toFixed(0)} mV | Chênh lệch: {voltageDiff.toFixed(0)} mV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Độ cân bằng</span>
              <span>{voltageDiff < 50 ? "Tốt" : voltageDiff < 100 ? "Trung bình" : "Cần cân bằng"}</span>
            </div>
            <Progress value={Math.max(0, 100 - (voltageDiff / 200) * 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Individual Cells - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Chi tiết từng cell</CardTitle>
          <CardDescription className="text-sm">Điện áp và trạng thái của từng cell pin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {cellVoltages.map((voltage, index) => {
              const { status, variant } = getCellStatus(voltage)
              const percentage = maxVoltage > 0 ? (voltage / maxVoltage) * 100 : 0

              return (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Battery className="h-3 w-3" />
                      <span className="text-sm font-medium">Cell {index + 1}</span>
                    </div>
                    <Badge variant={variant} className="text-xs px-1 py-0">
                      {status}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Điện áp:</span>
                      <span className="font-medium">{voltage.toFixed(0)} mV</span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>

                  <div className="text-xs text-muted-foreground min-h-[1rem]">
                    {voltage === maxVoltage && <span className="text-green-600">Cao nhất</span>}
                    {voltage === minVoltage && <span className="text-red-600">Thấp nhất</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {cellVoltages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Battery className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có dữ liệu cell</p>
              <p className="text-sm">Đang chờ dữ liệu từ BMS...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
