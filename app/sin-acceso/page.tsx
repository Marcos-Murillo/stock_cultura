export default function SinAccesoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-lime-50">
      <h1 className="text-2xl font-bold text-lime-800">Acceso restringido</h1>
      <p className="text-lime-700">No tienes permiso para acceder a esta página.</p>
      <p className="text-sm text-lime-600">Accede desde el portal RCD Digital con tu cuenta asignada.</p>
    </div>
  )
}
