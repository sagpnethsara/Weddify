import { CheckCircle2 } from 'lucide-react'

const metrics = [
  'Rating 4.8/5',
  'Response Time 2.5h',
  'Experience 10 years',
  'Repeat Clients 46%'
]

export default function AIHighlight() {
  return (
    <section className="bg-accent py-20 text-white">
      <div className="section-container grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-4xl">Powered by Advanced Machine Learning</h2>
          <p className="mt-4 text-white/90">
            Our stacking ensemble model combines Random Forest, XGBoost and CatBoost to analyse 12 vendor
            features including rating, experience, response time and repeat client rate to give you the most
            accurate vendor recommendations available.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div><p className="text-2xl font-bold">90.68%</p><p className="text-sm text-white/80">Accuracy</p></div>
            <div><p className="text-2xl font-bold">13,296</p><p className="text-sm text-white/80">Vendors Trained</p></div>
            <div><p className="text-2xl font-bold">12</p><p className="text-sm text-white/80">Features Analysed</p></div>
            <div><p className="text-2xl font-bold">5-Fold</p><p className="text-sm text-white/80">Cross Validation</p></div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 text-textPrimary shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl">Thisara Photography</h3>
            <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">Recommended</span>
          </div>
          <p className="mt-2 text-sm text-textSecondary">Colombo • Photographers</p>
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm font-semibold">
              <span>Confidence</span>
              <span>92.5%</span>
            </div>
            <div className="h-3 rounded-full bg-gray-200">
              <div className="h-full w-[92.5%] rounded-full bg-success" />
            </div>
          </div>
          <div className="mt-6 grid gap-2">
            {metrics.map((metric) => (
              <div key={metric} className="flex items-center gap-2 text-sm text-textSecondary">
                <CheckCircle2 className="text-success" size={16} /> {metric}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
