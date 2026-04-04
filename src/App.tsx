import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { Toast } from '@/components/shared/Toast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Home } from '@/pages/Home'
import { About } from '@/pages/About'
import { Training } from '@/pages/Training'
import { Advisory } from '@/pages/Advisory'
import { Shop } from '@/pages/Shop'
import { Toolbox } from '@/pages/Toolbox'
import { Opportunities } from '@/pages/Opportunities'
import { Knowledge } from '@/pages/Knowledge'
import { Checkout } from '@/pages/Checkout'
import { Subscribe } from '@/pages/Subscribe'
import { PaymentCallback } from '@/pages/PaymentCallback'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'

// Lazy-load admin panel (admin only, not in main bundle)
import { lazy, Suspense } from 'react'
const AdminPanel = lazy(() => import('@/pages/admin/AdminPanel').then(m => ({ default: m.AdminPanel })))

interface ToastState { message: string; type: 'success' | 'error' | 'info' }

export default function App() {
  const { loading, isAdmin } = useAuth()
  const cart = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  function showToast(message: string, type: ToastState['type'] = 'success') {
    setToast({ message, type })
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <>
      <Header cartCount={cart.itemCount} onCartOpen={() => setCartOpen(true)} />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/training" element={<Training />} />
          <Route path="/advisory" element={<Advisory />} />
          <Route path="/shop" element={<Shop onAddToCart={(p) => { cart.addItem(p); showToast(`${p.name} added to cart`) }} onCartOpen={() => setCartOpen(true)} />} />
          <Route path="/toolbox" element={<Toolbox />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/checkout" element={<Checkout items={cart.items} total={cart.total} onSuccess={() => { cart.clearCart(); showToast('Order placed!') }} />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route
            path="/admin/*"
            element={
              isAdmin
                ? <Suspense fallback={<LoadingSpinner fullPage />}><AdminPanel showToast={showToast} /></Suspense>
                : <Navigate to="/" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {cartOpen && (
        <CartDrawer
          items={cart.items}
          total={cart.total}
          onClose={() => setCartOpen(false)}
          onRemove={cart.removeItem}
          onUpdateQty={cart.updateQuantity}
          onCheckout={() => { setCartOpen(false); window.location.href = '/checkout' }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
