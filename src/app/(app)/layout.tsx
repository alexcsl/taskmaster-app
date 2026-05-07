import { Sidebar } from '@/components/sidebar/sidebar'
import { PageTransition } from '@/components/page-transition'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
