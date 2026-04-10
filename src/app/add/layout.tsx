import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Novo Link',
  description: 'Salve um novo link para ver depois',
}

export default function AddLayout({ children }: { children: React.ReactNode }) {
  return children
}
