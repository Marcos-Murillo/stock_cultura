"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createDamageReport } from "@/lib/firebase"
import type { InventoryItem } from "@/lib/types"

interface DamageReportModalProps {
  item: InventoryItem
  isOpen: boolean
  onClose: () => void
  onReportCreated: () => void
}

export default function DamageReportModal({ item, isOpen, onClose, onReportCreated }: DamageReportModalProps) {
  const [formData, setFormData] = useState({
    reportedBy: "",
    damageDescription: "",
    severity: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.reportedBy || !formData.damageDescription || !formData.severity) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await createDamageReport({
        itemId: item.id!,
        itemName: item.name,
        itemSerialNumber: item.serialNumber,
        reportDate: new Date(),
        reportedBy: formData.reportedBy,
        damageDescription: formData.damageDescription,
        severity: formData.severity as "low" | "medium" | "high",
        status: "pending",
      })

      toast({
        title: "Éxito",
        description: "Reporte de daño creado correctamente",
      })

      setFormData({ reportedBy: "", damageDescription: "", severity: "" })
      onReportCreated()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el reporte",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-orange-800">Reportar Daño</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="font-medium text-orange-800">{item.name}</div>
            <div className="text-sm text-gray-600">Serie: {item.serialNumber}</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reportedBy">Reportado por *</Label>
              <Input
                id="reportedBy"
                value={formData.reportedBy}
                onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                placeholder="Nombre de quien reporta"
                required
              />
            </div>

            <div>
              <Label htmlFor="severity">Severidad del Daño *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bajo - Daño menor, funcional</SelectItem>
                  <SelectItem value="medium">Medio - Daño notable, uso limitado</SelectItem>
                  <SelectItem value="high">Alto - Daño severo, no funcional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="damageDescription">Descripción del Daño *</Label>
              <textarea
                id="damageDescription"
                value={formData.damageDescription}
                onChange={(e) => setFormData({ ...formData, damageDescription: e.target.value })}
                placeholder="Describe detalladamente el daño observado..."
                className="w-full p-2 border border-gray-300 rounded-md resize-none h-24"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                {loading ? "Creando..." : "Crear Reporte"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
