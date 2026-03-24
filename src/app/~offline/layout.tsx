import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline',
  robots: 'noindex, nofollow',
}

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
