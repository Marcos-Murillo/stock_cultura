// Configuración de Firebase con mejor manejo de errores
import { initializeApp } from "firebase/app"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import type { InventoryItem, Loan } from "./types"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBp8ZLReb-pVnLUJIyxfr3tJPsWFADAXjk",
  authDomain: "culturastock.firebaseapp.com",
  projectId: "culturastock",
  storageBucket: "culturastock.firebasestorage.app",
  messagingSenderId: "1061069000479",
  appId: "1:1061069000479:web:402179bf42965c93722a2a",
  measurementId: "G-Y9EDDHBE68"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)


// Funciones para el inventario con mejor manejo de errores
export const addItem = async (item: Omit<InventoryItem, "id">) => {
  try {
    console.log("Agregando item:", item)
    const docRef = await addDoc(collection(db, "inventory"), {
      ...item,
      createdAt: Timestamp.fromDate(item.createdAt),
    })
    console.log("Item agregado con ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error detallado al agregar item:", error)
    if (error instanceof Error) {
      throw new Error(`Error al agregar elemento: ${error.message}`)
    }
    throw new Error("Error desconocido al agregar elemento")
  }
}

export const getInventory = async (): Promise<InventoryItem[]> => {
  try {
    console.log("Obteniendo inventario...")
    const querySnapshot = await getDocs(query(collection(db, "inventory"), orderBy("createdAt", "desc")))
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as InventoryItem[]
    console.log("Inventario obtenido:", items.length, "items")
    return items
  } catch (error) {
    console.error("Error detallado al obtener inventario:", error)
    if (error instanceof Error) {
      throw new Error(`Error al cargar inventario: ${error.message}`)
    }
    throw new Error("Error desconocido al cargar inventario")
  }
}

export const removeItem = async (itemId: string) => {
  try {
    console.log("Eliminando item:", itemId)
    await deleteDoc(doc(db, "inventory", itemId))
    console.log("Item eliminado exitosamente")
  } catch (error) {
    console.error("Error detallado al eliminar item:", error)
    if (error instanceof Error) {
      throw new Error(`Error al eliminar elemento: ${error.message}`)
    }
    throw new Error("Error desconocido al eliminar elemento")
  }
}

export const updateItemStatus = async (itemId: string, status: "available" | "loaned" | "removed") => {
  try {
    console.log("Actualizando estado del item:", itemId, "a:", status)
    await updateDoc(doc(db, "inventory", itemId), { status })
    console.log("Estado actualizado exitosamente")
  } catch (error) {
    console.error("Error detallado al actualizar estado:", error)
    if (error instanceof Error) {
      throw new Error(`Error al actualizar estado: ${error.message}`)
    }
    throw new Error("Error desconocido al actualizar estado")
  }
}

// Funciones para préstamos con mejor manejo de errores
export const createLoan = async (loan: Omit<Loan, "id">) => {
  try {
    console.log("Creando préstamo:", loan)
    // Crear el préstamo
    const docRef = await addDoc(collection(db, "loans"), {
      ...loan,
      loanDate: Timestamp.fromDate(loan.loanDate),
      createdAt: Timestamp.now(),
    })
    console.log("Préstamo creado con ID:", docRef.id)

    // Actualizar el estado del elemento a 'prestado'
    await updateItemStatus(loan.itemId, "loaned")

    return docRef.id
  } catch (error) {
    console.error("Error detallado al crear préstamo:", error)
    if (error instanceof Error) {
      throw new Error(`Error al crear préstamo: ${error.message}`)
    }
    throw new Error("Error desconocido al crear préstamo")
  }
}

export const getLoans = async (): Promise<Loan[]> => {
  try {
    console.log("Obteniendo préstamos...")
    const querySnapshot = await getDocs(query(collection(db, "loans"), orderBy("loanDate", "desc")))
    const loans = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      loanDate: doc.data().loanDate.toDate(),
      returnDate: doc.data().returnDate ? doc.data().returnDate.toDate() : undefined,
    })) as Loan[]
    console.log("Préstamos obtenidos:", loans.length, "préstamos")
    return loans
  } catch (error) {
    console.error("Error detallado al obtener préstamos:", error)
    if (error instanceof Error) {
      throw new Error(`Error al cargar préstamos: ${error.message}`)
    }
    throw new Error("Error desconocido al cargar préstamos")
  }
}

export const returnLoan = async (loanId: string) => {
  try {
    console.log("Procesando devolución del préstamo:", loanId)
    const loanDoc = doc(db, "loans", loanId)

    // Obtener información del préstamo
    const loans = await getLoans()
    const loan = loans.find((l) => l.id === loanId)

    if (!loan) {
      throw new Error("Préstamo no encontrado")
    }

    // Actualizar el préstamo como devuelto
    await updateDoc(loanDoc, {
      status: "returned",
      returnDate: Timestamp.now(),
    })

    // Actualizar el estado del elemento a 'disponible'
    await updateItemStatus(loan.itemId, "available")

    console.log("Devolución procesada exitosamente")
  } catch (error) {
    console.error("Error detallado al procesar devolución:", error)
    if (error instanceof Error) {
      throw new Error(`Error al procesar devolución: ${error.message}`)
    }
    throw new Error("Error desconocido al procesar devolución")
  }
}

// Función para probar la conexión
export const testFirebaseConnection = async () => {
  try {
    console.log("Probando conexión a Firebase...")
    const testCollection = collection(db, "test")
    await getDocs(testCollection)
    console.log("✅ Conexión a Firebase exitosa")
    return true
  } catch (error) {
    console.error("❌ Error de conexión a Firebase:", error)
    return false
  }
}
