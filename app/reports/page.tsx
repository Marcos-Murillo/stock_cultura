"use client"

import { useState, useEffect } from "react"
import { BarChart3, Package, Users, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getInventory, getLoans } from "@/lib/firebase"
import type { InventoryItem, Loan } from "@/lib/types"
import Navigation from "@/components/navigation"

export default function ReportsPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [inventory, loansList] = await Promise.all([getInventory(), getLoans()])
      setItems(inventory)
      setLoans(loansList)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalItems: items.length,
    availableItems: items.filter((item) => item.status === "available").length,
    loanedItems: items.filter((item) => item.status === "loaned").length,
    activeLoans: loans.filter((loan) => loan.status === "active").length,
    returnedLoans: loans.filter((loan) => loan.status === "returned").length,
  }

  const groupStats = loans.reduce(
    (acc, loan) => {
      if (loan.status === "active") {
        acc[loan.culturalGroup] = (acc[loan.culturalGroup] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const recentLoans = loans
    .filter((loan) => loan.status === "active")
    .sort((a, b) => b.loanDate.getTime() - a.loanDate.getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando reportes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-lime-800 mb-2">Reportes y Estadísticas</h1>
          <p className="text-lime-700">Resumen del estado del inventario cultural</p>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-lime-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-lime-800">Total Elementos</CardTitle>
              <Package className="h-4 w-4 text-lime-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-lime-800">{stats.totalItems}</div>
            </CardContent>
          </Card>

          <Card className="border-lime-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-lime-800">Disponibles</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.availableItems}</div>
            </CardContent>
          </Card>

          <Card className="border-lime-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-lime-800">Prestados</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.activeLoans}</div>
            </CardContent>
          </Card>

          <Card className="border-lime-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-lime-800">Devoluciones</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.returnedLoans}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Préstamos por Grupo Cultural */}
          <Card className="border-lime-200">
            <CardHeader>
              <CardTitle className="text-lime-800">Préstamos por Grupo Cultural</CardTitle>
              <CardDescription>Elementos actualmente prestados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(groupStats)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([group, count]) => (
                    <div key={group} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 flex-1 pr-2">
                        {group.length > 50 ? `${group.substring(0, 50)}...` : group}
                      </span>
                      <Badge variant="secondary" className="bg-lime-100 text-lime-800">
                        {count}
                      </Badge>
                    </div>
                  ))}
                {Object.keys(groupStats).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No hay préstamos activos</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Préstamos Recientes */}
          <Card className="border-lime-200">
            <CardHeader>
              <CardTitle className="text-lime-800">Préstamos Recientes</CardTitle>
              <CardDescription>Últimos 5 préstamos activos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between p-3 border border-lime-100 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-lime-800">{loan.itemName}</h4>
                      <p className="text-sm text-gray-600">{loan.borrowerName}</p>
                      <p className="text-xs text-gray-500">{loan.loanDate.toLocaleDateString()}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">Activo</Badge>
                  </div>
                ))}
                {recentLoans.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No hay préstamos recientes</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado del Inventario */}
        <Card className="mt-6 border-lime-200">
          <CardHeader>
            <CardTitle className="text-lime-800">Estado del Inventario</CardTitle>
            <CardDescription>Resumen por categorías</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-lime-200 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {((stats.availableItems / stats.totalItems) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Disponibilidad</div>
              </div>
              <div className="text-center p-4 border border-lime-200 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {((stats.activeLoans / stats.totalItems) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">En Préstamo</div>
              </div>
              <div className="text-center p-4 border border-lime-200 rounded-lg">
                <div className="text-2xl font-bold text-lime-600 mb-2">
                  {stats.totalItems > 0
                    ? ((stats.returnedLoans / (stats.returnedLoans + stats.activeLoans)) * 100).toFixed(1)
                    : 0}
                  %
                </div>
                <div className="text-sm text-gray-600">Tasa de Devolución</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
