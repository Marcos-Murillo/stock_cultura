"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, AlertTriangle, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDetailedStats } from "@/lib/firebase"
import Navigation from "@/components/navigation"

interface ItemStat {
  id?: string
  name: string
  serialNumber: string
  totalLoans: number
  activeLoans: number
  returnedLoans: number
  damageReports: number
  lastLoanDate: Date | null
  status: string
}

interface DetailedStats {
  itemStats: ItemStat[]
  groupStats: Record<string, any>
  totalItems: number
  totalLoans: number
  activeLoans: number
  totalDamageReports: number
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<DetailedStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"totalLoans" | "damageReports" | "name">("totalLoans")
  const [showOnlyActive, setShowOnlyActive] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const detailedStats = await getDetailedStats()
      setStats(detailedStats)
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando estadísticas...</div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">Error al cargar estadísticas</div>
        </div>
      </div>
    )
  }

  const sortedItems = [...stats.itemStats].sort((a, b) => {
    switch (sortBy) {
      case "totalLoans":
        return b.totalLoans - a.totalLoans
      case "damageReports":
        return b.damageReports - a.damageReports
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const filteredItems = showOnlyActive
    ? sortedItems.filter((item) => item.status === "available" || item.activeLoans > 0)
    : sortedItems

  const topGroups = Object.entries(stats.groupStats)
    .sort(([, a], [, b]) => b.totalLoans - a.totalLoans)
    .slice(0, 10)

  const mostUsedItems = stats.itemStats
    .filter((item) => item.totalLoans > 0)
    .sort((a, b) => b.totalLoans - a.totalLoans)
    .slice(0, 10)

  const itemsWithDamage = stats.itemStats
    .filter((item) => item.damageReports > 0)
    .sort((a, b) => b.damageReports - a.damageReports)

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-lime-800 mb-2">Estadísticas Detalladas</h1>
          <p className="text-lime-700">Análisis completo del uso del inventario cultural</p>
        </div>

        {/* Resumen General */}
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
              <CardTitle className="text-sm font-medium text-lime-800">Total Préstamos</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalLoans}</div>
            </CardContent>
          </Card>

          <Card className="border-lime-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-lime-800">Préstamos Activos</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.activeLoans}</div>
            </CardContent>
          </Card>

          <Card className="border-lime-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-lime-800">Reportes de Daño</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalDamageReports}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Elementos Más Prestados */}
          <Card className="border-lime-200">
            <CardHeader>
              <CardTitle className="text-lime-800">Top 10 - Elementos Más Prestados</CardTitle>
              <CardDescription>Elementos con mayor número de préstamos históricos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostUsedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-lime-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-lime-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-lime-800">{item.name}</div>
                        <div className="text-sm text-gray-600">Serie: {item.serialNumber}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-lime-600">{item.totalLoans}</div>
                      <div className="text-xs text-gray-500">préstamos</div>
                    </div>
                  </div>
                ))}
                {mostUsedItems.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No hay datos de préstamos</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Grupos Culturales Más Activos */}
          <Card className="border-lime-200">
            <CardHeader>
              <CardTitle className="text-lime-800">Top 10 - Grupos Más Activos</CardTitle>
              <CardDescription>Grupos con mayor número de préstamos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topGroups.map(([group, data], index) => (
                  <div key={group} className="flex items-center justify-between p-3 border border-lime-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-blue-800 text-sm">
                          {group.length > 40 ? `${group.substring(0, 40)}...` : group}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{data.totalLoans}</div>
                      <div className="text-xs text-gray-500">préstamos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Elementos con Reportes de Daño */}
        {itemsWithDamage.length > 0 && (
          <Card className="border-red-200 mb-8">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Elementos con Reportes de Daño
              </CardTitle>
              <CardDescription>Elementos que han reportado daños o problemas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {itemsWithDamage.map((item) => (
                  <div key={item.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-red-800">{item.name}</div>
                        <div className="text-sm text-gray-600">Serie: {item.serialNumber}</div>
                      </div>
                      <Badge variant="destructive">{item.damageReports} reportes</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla Detallada de Todos los Elementos */}
        <Card className="border-lime-200">
          <CardHeader>
            <CardTitle className="text-lime-800">Tabla Detallada de Elementos</CardTitle>
            <CardDescription>Estadísticas completas de todos los elementos del inventario</CardDescription>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={sortBy === "totalLoans" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("totalLoans")}
                className="bg-lime-600 hover:bg-lime-700"
              >
                Ordenar por Préstamos
              </Button>
              <Button
                variant={sortBy === "damageReports" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("damageReports")}
                className="bg-lime-600 hover:bg-lime-700"
              >
                Ordenar por Daños
              </Button>
              <Button
                variant={sortBy === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("name")}
                className="bg-lime-600 hover:bg-lime-700"
              >
                Ordenar por Nombre
              </Button>
              <Button
                variant={showOnlyActive ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyActive(!showOnlyActive)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {showOnlyActive ? "Mostrar Todos" : "Solo Activos"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-lime-200">
                    <th className="text-left p-3 font-medium text-lime-800">Elemento</th>
                    <th className="text-left p-3 font-medium text-lime-800">Serie</th>
                    <th className="text-center p-3 font-medium text-lime-800">Estado</th>
                    <th className="text-center p-3 font-medium text-lime-800">Total Préstamos</th>
                    <th className="text-center p-3 font-medium text-lime-800">Activos</th>
                    <th className="text-center p-3 font-medium text-lime-800">Devueltos</th>
                    <th className="text-center p-3 font-medium text-lime-800">Daños</th>
                    <th className="text-left p-3 font-medium text-lime-800">Último Préstamo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id || `item-${item.serialNumber}`}
                      className="border-b border-lime-100 hover:bg-lime-50"
                    >
                      <td className="p-3">
                        <div className="font-medium text-lime-800">{item.name}</div>
                      </td>
                      <td className="p-3 text-gray-600">{item.serialNumber}</td>
                      <td className="p-3 text-center">
                        {item.status === "available" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Disponible
                          </Badge>
                        )}
                        {item.status === "loaned" && <Badge className="bg-orange-100 text-orange-800">Prestado</Badge>}
                        {item.status === "removed" && <Badge variant="destructive">Dado de baja</Badge>}
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-lime-600">{item.totalLoans}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-orange-600">{item.activeLoans}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-blue-600">{item.returnedLoans}</span>
                      </td>
                      <td className="p-3 text-center">
                        {item.damageReports > 0 ? (
                          <Badge variant="destructive">{item.damageReports}</Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600">
                        {item.lastLoanDate ? item.lastLoanDate.toLocaleDateString() : "Nunca prestado"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">No hay elementos que mostrar</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
