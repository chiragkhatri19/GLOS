import { useTranslations } from 'next-intl'

export default function DashboardPage() {
  const t = useTranslations()
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%' },
          { label: 'Active Users', value: '2,350', change: '+15.2%' },
          { label: 'Bounce Rate', value: '42.3%', change: '-5.4%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-green-600 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-medium text-gray-900">Recent Activity</h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-700">
            {t('view_all')}
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { action: 'New subscription', user: 'alice@example.com', time: '2 min ago' },
            { action: 'Plan upgraded', user: 'bob@example.com', time: '15 min ago' },
            { action: 'Payment received', user: 'carol@example.com', time: '1 hour ago' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.action}</p>
                <p className="text-xs text-gray-500">{item.user}</p>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
