import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const t = useTranslations()
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Profile Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-medium text-gray-900 mb-4">Personal Information</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              defaultValue="Chirag Khatri"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              defaultValue="chirag@acme.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Asia/Kolkata (UTC+5:30)</option>
              <option>America/New_York (UTC-5)</option>
            </select>
          </div>
        </div>
        {/* Save + Cancel — casual form context */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            {t('save')}
          </button>
          <button className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            {t('cancel')}
          </button>
        </div>
      </div>

      {/* Saved addresses list — delete is casual here */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-medium text-gray-900 mb-4">Saved Addresses</h2>
        {['123 Main St, Mumbai', '456 Park Ave, Delhi'].map((addr, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-700">{addr}</span>
            <button className="text-sm text-red-500 hover:text-red-700">
              {t('delete')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
