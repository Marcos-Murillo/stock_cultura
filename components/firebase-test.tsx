"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { testFirebaseConnection } from "@/lib/firebase"

export default function FirebaseTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleTest = async () => {
    setTesting(true)
    setResult(null)

    try {
      const success = await testFirebaseConnection()
      setResult(success ? "✅ Conexión exitosa" : "❌ Error de conexión")
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="border-lime-200 mb-4">
      <CardHeader>
        <CardTitle className="text-lime-800">Prueba de Conexión Firebase</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Button onClick={handleTest} disabled={testing} className="bg-lime-600 hover:bg-lime-700">
            {testing ? "Probando..." : "Probar Conexión"}
          </Button>
          {result && <span className={result.includes("✅") ? "text-green-600" : "text-red-600"}>{result}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
