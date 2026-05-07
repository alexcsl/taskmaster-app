import { Sidebar } from '@/components/sidebar/sidebar'
import { PageTransition } from '@/components/page-transition'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Spacer for mobile hamburger button */}
        <div className="h-14 lg:hidden" />
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
