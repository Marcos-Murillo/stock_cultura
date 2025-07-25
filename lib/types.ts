export interface InventoryItem {
  id?: string
  name: string
  serialNumber: string
  description?: string
  status: "available" | "loaned" | "removed"
  createdAt: Date
  damageReports?: DamageReport[]
  loanCount?: number
}

export interface Loan {
  id?: string
  borrowerName: string
  borrowerDocument: string
  borrowerPhone: string
  borrowerEmail: string
  culturalGroup: string
  itemId: string
  itemName: string
  itemSerialNumber: string
  loanDate: Date
  returnDate?: Date
  status: "active" | "returned"
}

export interface DamageReport {
  id?: string
  itemId: string
  itemName: string
  itemSerialNumber: string
  reportDate: Date
  reportedBy: string
  damageDescription: string
  severity: "low" | "medium" | "high"
  status: "pending" | "resolved"
}

export interface BorrowerSuggestion {
  name: string
  document: string
  phone: string
  email: string
  culturalGroup: string
}
