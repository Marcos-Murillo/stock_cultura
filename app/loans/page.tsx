"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, UserCheck, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getInventory, getLoans, createLoan, returnLoan } from "@/lib/firebase"
import { CULTURAL_GROUPS } from "@/lib/constants"
import type { InventoryItem, Loan } from "@/lib/types"
import Navigation from "@/components/navigation"
import BorrowerAutocomplete from "@/components/borrower-autocomplete"
import ItemSelector from "@/components/item-selector"

export default function LoansPage() {
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showLoanForm, setShowLoanForm] = useState(false)
  const [formData, setFormData] = useState({
    borrowerName: "",
    borrowerDocument: "",
    borrowerPhone: "",
    borrowerEmail: "",
    culturalGroup: "",
    itemId: "",
    loanDate: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const filtered = loans.filter(
      (loan) =>
        loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.itemSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.borrowerDocument.includes(searchTerm) ||
        loan.borrowerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredLoans(filtered)
  }, [loans, searchTerm])

  const loadData = async () => {
    try {
      const [inventory, loansList] = await Promise.all([getInventory(), getLoans()])

      const available = inventory.filter((item) => item.status === "available")
      setAvailableItems(available)
      setLoans(loansList)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    }
  }

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.borrowerName ||
      !formData.borrowerDocument ||
      !formData.borrowerPhone ||
      !formData.borrowerEmail ||
      !formData.culturalGroup ||
      !formData.itemId
    ) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    const selectedItem = availableItems.find((item) => item.id === formData.itemId)
    if (!selectedItem) {
      toast({
        title: "Error",
        description: "Elemento no encontrado",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await createLoan({
        borrowerName: formData.borrowerName,
        borrowerDocument: formData.borrowerDocument,
        borrowerPhone: formData.borrowerPhone,
        borrowerEmail: formData.borrowerEmail,
        culturalGroup: formData.culturalGroup,
        itemId: formData.itemId,
        itemName: selectedItem.name,
        itemSerialNumber: selectedItem.serialNumber,
        loanDate: new Date(formData.loanDate),
        status: "active",
      })

      toast({
        title: "Éxito",
        description: "Préstamo registrado correctamente",
      })

      setFormData({
        borrowerName: "",
        borrowerDocument: "",
        borrowerPhone: "",
        borrowerEmail: "",
        culturalGroup: "",
        itemId: "",
        loanDate: new Date().toISOString().split("T")[0],
      })
      setShowLoanForm(false)
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el préstamo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReturnLoan = async (loanId: string) => {
    if (!confirm("¿Confirmar la devolución de este elemento?")) {
      return
    }

    try {
      await returnLoan(loanId)
      toast({
        title: "Éxito",
        description: "Elemento devuelto correctamente",
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la devolución",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-lime-800">Préstamos</h1>
          <Button onClick={() => setShowLoanForm(!showLoanForm)} className="bg-lime-600 hover:bg-lime-700">
            <UserCheck className="w-4 h-4 mr-2" />
            Nuevo Préstamo
          </Button>
        </div>

        {showLoanForm && (
          <Card className="mb-8 border-lime-200">
            <CardHeader>
              <CardTitle className="text-lime-800">Registrar Nuevo Préstamo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLoan} className="space-y-6">
                <BorrowerAutocomplete
                  onSelect={(borrower) => {
                    // El autocompletado ya maneja la actualización del formData
                  }}
                  formData={formData}
                  setFormData={setFormData}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="culturalGroup">Grupo Cultural *</Label>
                    <Select
                      value={formData.culturalGroup}
                      onValueChange={(value) => setFormData({ ...formData, culturalGroup: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {CULTURAL_GROUPS.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="loanDate">Fecha del Préstamo *</Label>
                    <Input
                      id="loanDate"
                      type="date"
                      value={formData.loanDate}
                      onChange={(e) => setFormData({ ...formData, loanDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <ItemSelector
                  items={availableItems}
                  selectedItemId={formData.itemId}
                  onSelect={(itemId) => setFormData({ ...formData, itemId })}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-lime-600 hover:bg-lime-700">
                    {loading ? "Registrando..." : "Registrar Préstamo"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowLoanForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-lime-200">
          <CardHeader>
            <CardTitle className="text-lime-800">Préstamos Activos</CardTitle>
            <CardDescription>
              {filteredLoans.filter((loan) => loan.status === "active").length} préstamos activos
            </CardDescription>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, elemento, serie, cédula o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLoans
                .filter((loan) => loan.status === "active")
                .map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-4 border border-lime-200 rounded-lg bg-white"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lime-800">{loan.itemName}</h3>
                      <p className="text-sm text-gray-600">Serie: {loan.itemSerialNumber}</p>
                      <p className="text-sm text-gray-600">Prestado a: {loan.borrowerName}</p>
                      <p className="text-sm text-gray-600">Cédula: {loan.borrowerDocument}</p>
                      <p className="text-sm text-gray-600">Teléfono: {loan.borrowerPhone}</p>
                      <p className="text-sm text-gray-600">Email: {loan.borrowerEmail}</p>
                      <p className="text-sm text-gray-600">Grupo: {loan.culturalGroup}</p>
                      <p className="text-sm text-gray-500">Fecha: {loan.loanDate.toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-100 text-orange-800">Prestado</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturnLoan(loan.id!)}
                        className="border-lime-600 text-lime-600 hover:bg-lime-50"
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Devolver
                      </Button>
                    </div>
                  </div>
                ))}
              {filteredLoans.filter((loan) => loan.status === "active").length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "No se encontraron préstamos" : "No hay préstamos activos"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
