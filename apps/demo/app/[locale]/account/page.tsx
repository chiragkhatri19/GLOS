import { useTranslations } from 'next-intl'

export default function AccountPage() {
  const t = useTranslations()
  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900">Account</h1>

      {/* Normal settings section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-medium text-gray-900 mb-4">Account Preferences</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Email notifications</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Two-factor authentication</span>
            <input type="checkbox" className="rounded" />
          </label>
        </div>
        <button className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium">
          {t('save')}
        </button>
      </div>

      {/* DANGER ZONE — delete is destructive and permanent here */}
      <div className="bg-white rounded-xl border-2 border-red-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-red-600">⚠</span>
          <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          Once you delete your account, there is no going back.
        </p>
        <p className="text-sm font-medium text-red-600 mb-5">
          This action is permanent and cannot be undone. All your data, workspaces, and billing history will be permanently erased.
        </p>
        <button className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          {t('delete')} Account
        </button>
      </div>

      {/* Confirm deletion modal — confirm is destructive here */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Confirm account deletion</h3>
        <p className="text-sm text-gray-600 mb-4">
          Type your email address to confirm you want to permanently delete your account.
        </p>
        <input
          type="email"
          placeholder="chirag@acme.com"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
        />
        <div className="flex gap-3">
          <button className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
            {t('confirm')} Deletion
          </button>
          <button className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
