export default function Loading() {
  return (
    <div>
      <div className="h-9 w-64 bg-gray-200 rounded-xl animate-pulse mb-6" />
      <div className="h-8 w-full bg-gray-200 rounded-xl animate-pulse mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4">
            <div className="w-20 h-20 rounded-xl bg-gray-200 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
