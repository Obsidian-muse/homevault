import { Reveal } from './reveal'

const steps = [
  {
    step: '01',
    title: 'Add your homes',
    desc: 'Create a profile for each property and organize it into rooms and spaces in seconds.',
  },
  {
    step: '02',
    title: 'Catalog your assets',
    desc: 'Log appliances, electronics, and valuables with photos, prices, and warranty details.',
  },
  {
    step: '03',
    title: 'Stay effortlessly organized',
    desc: 'Track maintenance, monitor warranties, and get reminders before anything expires.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-violet">How it works</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Get set up in three simple steps
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-7">
                <div className="text-5xl font-semibold tracking-tighter text-transparent [-webkit-text-stroke:1px_var(--border)]">
                  {s.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
