export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-full">
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
        </div>
        <div className="p-5 bg-slate-100 rounded-lg ml-4"></div>
      </div>
      <div className="mt-2 h-4 bg-slate-200 rounded w-2/3"></div>
    </div>
  );
}

export function RecentActivitySkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-6 animate-pulse">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="h-6 bg-slate-200 rounded w-48"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {[1, 2, 3].map((col) => (
          <div key={col} className="p-6 space-y-6">
            <div className="h-4 bg-slate-200 rounded w-32 mb-4"></div>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex justify-between items-start">
                <div className="space-y-2 w-1/2">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-pulse">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px]">
        <div className="h-4 bg-slate-200 rounded w-48 mb-6"></div>
        <div className="h-64 bg-slate-100 rounded-full w-64 mx-auto mt-8"></div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px]">
        <div className="h-4 bg-slate-200 rounded w-48 mb-6"></div>
        <div className="h-full bg-slate-100 rounded-lg w-full mt-2"></div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2 h-[400px]">
        <div className="h-4 bg-slate-200 rounded w-48 mb-6"></div>
        <div className="h-full bg-slate-100 rounded-lg w-full mt-2"></div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 bg-slate-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <RecentActivitySkeleton />
      <DashboardChartsSkeleton />
    </div>
  );
}
