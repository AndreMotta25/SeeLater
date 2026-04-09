import type { Metadata } from 'next'

import { HeroSection } from '@/components/landing/HeroSection'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { SolutionSection } from '@/components/landing/SolutionSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { BenefitsGrid } from '@/components/landing/BenefitsGrid'
import { FAQSection } from '@/components/landing/FAQSection'
import { CTAFinalSection } from '@/components/landing/CTAFinalSection'

export const metadata: Metadata = {
  title: 'Depois — Nunca mais esqueça seus links salvos',
  description:
    'Salve links para ver depois e nunca mais esqueça aquele conteúdo. IA local, funciona offline, privacidade total.',
  openGraph: {
    title: 'Depois — Nunca mais esqueça seus links salvos',
    description:
      'Salve links para ver depois e nunca mais esqueça aquele conteúdo. IA local, funciona offline, privacidade total.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function LandingPage() {
  return (
    <main className="bg-landing-bg text-landing-text overflow-x-hidden">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <BenefitsGrid />
      <FAQSection />
      <CTAFinalSection />
    </main>
  )
}
