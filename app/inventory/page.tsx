"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { addItem, getInventory, removeItem } from "@/lib/firebase"
import type { InventoryItem } from "@/lib/types"
import Navigation from "@/components/navigation"

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadInventory()
  }, [])

  useEffect(() => {
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredItems(filtered)
  }, [items, searchTerm])

  const loadInventory = async () => {
    try {
      const inventory = await getInventory()
      setItems(inventory)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario",
        variant: "destructive",
      })
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.serialNumber) {
      toast({
        title: "Error",
        description: "Nombre y número de serie son obligatorios",
        variant: "destructive",
      })
      return
    }

    // Verificar si el número de serie ya existe
    const existingItem = items.find((item) => item.serialNumber === formData.serialNumber)
    if (existingItem) {
      toast({
        title: "Error",
        description: "Ya existe un elemento con ese número de serie",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await addItem({
        name: formData.name,
        serialNumber: formData.serialNumber,
        description: formData.description,
        status: "available",
        createdAt: new Date(),
      })

      toast({
        title: "Éxito",
        description: "Elemento agregado al inventario",
      })

      setFormData({ name: "", serialNumber: "", description: "" })
      setShowAddForm(false)
      loadInventory()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el elemento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres dar de baja este elemento?")) {
      return
    }

    try {
      await removeItem(id)
      toast({
        title: "Éxito",
        description: "Elemento dado de baja",
      })
      loadInventory()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo dar de baja el elemento",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-lime-800">Inventario</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-lime-600 hover:bg-lime-700">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Elemento
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8 border-lime-200">
            <CardHeader>
              <CardTitle className="text-lime-800">Agregar Nuevo Elemento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Elemento *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Guitarra acústica"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="serialNumber">Número de Serie *</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="Ej: GTA-001"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción adicional del elemento"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-lime-600 hover:bg-lime-700">
                    {loading ? "Agregando..." : "Agregar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-lime-200">
          <CardHeader>
            <CardTitle className="text-lime-800">Stock Disponible</CardTitle>
            <CardDescription>{filteredItems.length} elementos en inventario</CardDescription>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o número de serie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-lime-200 rounded-lg bg-white"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lime-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">Serie: {item.serialNumber}</p>
                    {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-lime-100 text-lime-800">
                      {item.status === "available" ? "Disponible" : "No disponible"}
                    </Badge>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.id!)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "No se encontraron elementos" : "No hay elementos en el inventario"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
