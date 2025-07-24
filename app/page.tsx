import Link from "next/link"
import { Package, Users, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-lime-800 mb-4">Sistema de Inventario Cultural</h1>
          <p className="text-lg text-lime-700 max-w-2xl mx-auto">
            Gestiona el inventario de implementos culturales de la Universidad del Valle
          </p>
        </div>
        

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-lime-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Package className="w-12 h-12 text-lime-600 mx-auto mb-2" />
              <CardTitle className="text-lime-800">Inventario</CardTitle>
              <CardDescription>Agregar elementos, dar de baja y gestionar stock</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/inventory">
                <Button className="w-full bg-lime-600 hover:bg-lime-700">Gestionar Inventario</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-lime-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-lime-600 mx-auto mb-2" />
              <CardTitle className="text-lime-800">Préstamos</CardTitle>
              <CardDescription>Prestar elementos y gestionar devoluciones</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/loans">
                <Button className="w-full bg-lime-600 hover:bg-lime-700">Gestionar Préstamos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-lime-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 text-lime-600 mx-auto mb-2" />
              <CardTitle className="text-lime-800">Reportes</CardTitle>
              <CardDescription>Ver estadísticas y reportes del inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/reports">
                <Button className="w-full bg-lime-600 hover:bg-lime-700">Ver Reportes</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
