import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type RevealOptions = {
  selector?: string
  y?: number
  duration?: number
  stagger?: number
  start?: string
}

export function useGsapReveal<T extends HTMLElement>({
  selector = '[data-gsap-reveal]',
  y = 32,
  duration = 0.8,
  stagger = 0.12,
  start = 'top 78%',
}: RevealOptions = {}): RefObject<T | null> {
  const scopeRef = useRef<T>(null)

  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    const context = gsap.context(() => {
      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(selector, { clearProps: 'all' })
      })

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = gsap.utils.toArray<HTMLElement>(selector)

        if (!targets.length) return

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            y: 0,
            duration,
            ease: 'power3.out',
            stagger,
            scrollTrigger: {
              trigger: scope,
              start,
              once: true,
            },
          },
        )
      })

      return () => media.revert()
    }, scope)

    return () => context.revert()
  }, [duration, selector, stagger, start, y])

  return scopeRef
}
