/** Matches PageWrapper's max-width + horizontal padding (see FeaturedProducts). */
const CONTAINER = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'

const STEPS = [
  {
    number: '01',
    title: 'Choose your size',
    description: 'Pick from 5ml, 10ml, or 30ml decants of your favorite fragrance.',
  },
  {
    number: '02',
    title: 'We prepare your order',
    description: 'Each decant is carefully measured and packaged with care.',
  },
  {
    number: '03',
    title: 'Confirm via WhatsApp',
    description: 'We message you on WhatsApp to confirm your order and arrange payment.',
  },
]

/**
 * Three numbered steps explaining the decant → WhatsApp flow. Typography only,
 * no icons — left-aligned on mobile, centered on desktop.
 */
export function HowItWorks() {
  return (
    <section className="py-20 md:py-28">
      <div className={CONTAINER}>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
            How it works
          </h2>
          <p className="mt-3 text-neutral-500">From decant to doorstep in three simple steps.</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="text-left md:text-center">
              <span className="text-4xl font-light text-neutral-300">{step.number}</span>
              <h3 className="mt-4 font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
