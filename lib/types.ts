export interface InventoryItem {
  id?: string
  name: string
  serialNumber: string
  description?: string
  status: "available" | "loaned" | "removed"
  createdAt: Date
}

export interface Loan {
  id?: string
  borrowerName: string
  borrowerDocument: string
  culturalGroup: string
  itemId: string
  itemName: string
  itemSerialNumber: string
  loanDate: Date
  returnDate?: Date
  status: "active" | "returned"
}
