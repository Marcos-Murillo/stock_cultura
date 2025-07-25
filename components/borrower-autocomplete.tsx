"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { getBorrowerSuggestions } from "@/lib/firebase"
import type { BorrowerSuggestion } from "@/lib/types"

interface BorrowerAutocompleteProps {
  onSelect: (borrower: BorrowerSuggestion) => void
  formData: {
    borrowerName: string
    borrowerDocument: string
    borrowerPhone: string
    borrowerEmail: string
    culturalGroup: string
  }
  setFormData: (data: any) => void
}

export default function BorrowerAutocomplete({ onSelect, formData, setFormData }: BorrowerAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<BorrowerSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadSuggestions = async () => {
      if (formData.borrowerName.length > 2 || formData.borrowerDocument.length > 3) {
        setLoading(true)
        const searchTerm = formData.borrowerName || formData.borrowerDocument
        const results = await getBorrowerSuggestions(searchTerm)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
        setLoading(false)
      } else {
        setShowSuggestions(false)
      }
    }

    const debounceTimer = setTimeout(loadSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [formData.borrowerName, formData.borrowerDocument])

  const handleSuggestionClick = (suggestion: BorrowerSuggestion) => {
    setFormData({
      ...formData,
      borrowerName: suggestion.name,
      borrowerDocument: suggestion.document,
      borrowerPhone: suggestion.phone,
      borrowerEmail: suggestion.email,
      culturalGroup: suggestion.culturalGroup,
    })
    onSelect(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative">
          <Label htmlFor="borrowerName">Nombre del Solicitante *</Label>
          <Input
            id="borrowerName"
            value={formData.borrowerName}
            onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
            placeholder="Nombre completo"
            required
          />
        </div>
        <div className="relative">
          <Label htmlFor="borrowerDocument">Cédula *</Label>
          <Input
            id="borrowerDocument"
            value={formData.borrowerDocument}
            onChange={(e) => setFormData({ ...formData, borrowerDocument: e.target.value })}
            placeholder="Número de cédula"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="borrowerPhone">Número de Teléfono *</Label>
          <Input
            id="borrowerPhone"
            value={formData.borrowerPhone}
            onChange={(e) => setFormData({ ...formData, borrowerPhone: e.target.value })}
            placeholder="Número de teléfono"
            required
          />
        </div>
        <div>
          <Label htmlFor="borrowerEmail">Correo Electrónico *</Label>
          <Input
            id="borrowerEmail"
            type="email"
            value={formData.borrowerEmail}
            onChange={(e) => setFormData({ ...formData, borrowerEmail: e.target.value })}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>
      </div>

      {showSuggestions && (
        <Card className="border-lime-200">
          <CardContent className="p-2">
            <div className="text-sm text-gray-600 mb-2">Sugerencias basadas en préstamos anteriores:</div>
            {loading ? (
              <div className="text-sm text-gray-500">Cargando sugerencias...</div>
            ) : (
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-lime-50 cursor-pointer rounded border border-lime-100"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="font-medium text-lime-800">{suggestion.name}</div>
                    <div className="text-sm text-gray-600">
                      {suggestion.document} • {suggestion.phone} • {suggestion.email}
                    </div>
                    <div className="text-xs text-gray-500">{suggestion.culturalGroup}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
