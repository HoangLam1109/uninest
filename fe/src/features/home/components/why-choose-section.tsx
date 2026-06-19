import { Headphones, Home, Shield } from 'lucide-react'
import { useGsapReveal } from '../hooks/use-gsap-reveal'
import { whyChooseFeatures } from '../data'

const iconMap = {
  shield: Shield,
  home: Home,
  headset: Headphones,
} as const

export function WhyChooseSection() {
  const sectionRef = useGsapReveal<HTMLElement>()

  return (
    <section
      ref={sectionRef}
      id="about"
      className="bg-foreground px-6 py-16 text-white lg:px-20 lg:py-20"
    >
      <div className="mx-auto max-w-4xl text-center" data-gsap-reveal>
        <h2 className="font-serif text-3xl font-bold lg:text-4xl">
          Tại sao nên chọn UniNest?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
          Chúng tôi không chỉ cung cấp một căn phòng, chúng tôi mang đến một
          trải nghiệm sống trọn vẹn và hiện đại.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-7xl gap-8 md:grid-cols-3">
        {whyChooseFeatures.map((feature) => {
          const Icon = iconMap[feature.icon]
          return (
            <article
              key={feature.title}
              data-gsap-reveal
              className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/20">
                <Icon className="size-7 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-xl font-bold">{feature.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                {feature.description}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
