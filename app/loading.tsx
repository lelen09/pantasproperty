export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 bg-white border-b border-gray-100" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
