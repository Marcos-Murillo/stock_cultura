"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { InventoryItem } from "@/lib/types"

interface ItemSelectorProps {
  items: InventoryItem[]
  selectedItemId: string
  onSelect: (itemId: string) => void
}

export default function ItemSelector({ items, selectedItemId, onSelect }: ItemSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])

  useEffect(() => {
    const filtered = items.filter(
      (item) =>
        item.status === "available" &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredItems(filtered)
  }, [items, searchTerm])

  const selectedItem = items.find((item) => item.id === selectedItemId)

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="itemSearch">Elemento a Prestar *</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="itemSearch"
            placeholder="Buscar por nombre o número de serie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {searchTerm && (
        <Card className="border-lime-200 max-h-60 overflow-y-auto">
          <CardContent className="p-2">
            <div className="space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 hover:bg-lime-50 cursor-pointer rounded border ${
                      selectedItemId === item.id ? "border-lime-500 bg-lime-50" : "border-lime-100"
                    }`}
                    onClick={() => onSelect(item.id!)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-lime-800">{item.name}</div>
                        <div className="text-sm text-gray-600">Serie: {item.serialNumber}</div>
                        {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Disponible
                        </Badge>
                        {item.loanCount && item.loanCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {item.loanCount} préstamos
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No se encontraron elementos disponibles</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedItem && (
        <Card className="border-lime-500 bg-lime-50">
          <CardContent className="p-3">
            <div className="text-sm text-lime-800 font-medium">Elemento seleccionado:</div>
            <div className="font-semibold text-lime-900">{selectedItem.name}</div>
            <div className="text-sm text-gray-600">Serie: {selectedItem.serialNumber}</div>
          </CardContent>
        </Card>
      )}

      {/* Select oculto para compatibilidad con formularios */}
      <Select value={selectedItemId} onValueChange={onSelect}>
        <SelectTrigger className="hidden">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {filteredItems.map((item) => (
            <SelectItem key={item.id} value={item.id!}>
              {item.name} - {item.serialNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
