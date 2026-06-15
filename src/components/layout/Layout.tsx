import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden" style={{ background: '#0d1117' }}>
      <Navbar />
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  )
}
