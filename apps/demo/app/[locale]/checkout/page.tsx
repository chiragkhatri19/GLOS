import { useTranslations } from 'next-intl'

export default function CheckoutPage() {
  const t = useTranslations()
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Complete your order</h1>

      {/* Order summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Order Summary</h2>
        <div className="flex flex-col gap-3">
          {[
            { item: 'Acme Pro Plan — Annual', price: '$39.00' },
            { item: 'Additional seats (2)', price: '$10.00' },
          ].map((row, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-700">
              <span>{row.item}</span>
              <span>{row.price}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>$49.00</span>
          </div>
        </div>
      </div>

      {/* Card on file */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-900">Visa ending in 4242</p>
            <p className="text-xs text-gray-500 mt-0.5">Expires 08/27</p>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Default</span>
        </div>
        {/* save in financial context — save card details */}
        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded border-gray-300" />
          <span className="text-sm text-gray-600">{t('save')} card for future payments</span>
        </label>
      </div>

      {/* Confirm — large, prominent, financial action */}
      <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl text-base font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200">
        {t('confirm')} — $49.00
      </button>
      <p className="text-center text-xs text-gray-400 mt-3">
        By confirming, you agree to our Terms of Service
      </p>

      {/* cancel order — low prominence but financial context */}
      <div className="text-center mt-4">
        <button className="text-sm text-gray-500 hover:text-gray-700 underline">
          {t('cancel')} order
        </button>
      </div>
    </div>
  )
}
