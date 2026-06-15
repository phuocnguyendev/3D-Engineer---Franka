import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

const MobileBasePage = lazy(() => import('@/pages/MobileBasePage'))
const ManipulatorPage = lazy(() => import('@/pages/ManipulatorPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-brand-accent border-t-transparent animate-spin" />
        <span className="text-brand-muted text-sm font-mono">Loading…</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<PageLoader />}>
                <ManipulatorPage />
              </Suspense>
            }
          />
          <Route
            path="/mobile-base"
            element={
              <Suspense fallback={<PageLoader />}>
                <MobileBasePage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
