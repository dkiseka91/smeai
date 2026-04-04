import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Target, ShoppingBag, GraduationCap, Wrench, ArrowLeft } from 'lucide-react'
import { ArticlesManager } from './ArticlesManager'
import { OpportunitiesManager } from './OpportunitiesManager'
import { ProductsManager } from './ProductsManager'
import { ProgrammesManager } from './ProgrammesManager'
import { ToolboxManager } from './ToolboxManager'
import { AdminDashboard } from './AdminDashboard'

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/articles', label: 'Articles', icon: BookOpen },
  { path: '/admin/opportunities', label: 'Opportunities', icon: Target },
  { path: '/admin/products', label: 'Products', icon: ShoppingBag },
  { path: '/admin/programmes', label: 'Programmes', icon: GraduationCap },
  { path: '/admin/toolbox', label: 'Toolbox', icon: Wrench },
]

interface AdminPanelProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void
}

export function AdminPanel({ showToast }: AdminPanelProps) {
  const location = useLocation()
  const [sidebarOpen] = useState(true)

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: '#f8f9fc' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 60, flexShrink: 0,
        background: '#1A2744', transition: 'width 0.2s',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {sidebarOpen && (
            <div style={{ fontFamily: 'Syne', fontWeight: 800, color: '#F5A623', fontSize: '0.95rem' }}>
              ⚙ Admin Panel
            </div>
          )}
        </div>
        <nav style={{ flex: 1, padding: '0.75rem 0' }}>
          {NAV.map(({ path, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === path : location.pathname.startsWith(path) && path !== '/admin'
            const exactActive = exact && location.pathname === path
            const isActive = exact ? exactActive : active
            return (
              <Link
                key={path}
                to={path}
                title={label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.65rem 1rem', textDecoration: 'none',
                  color: isActive ? '#F5A623' : 'rgba(255,255,255,0.65)',
                  background: isActive ? 'rgba(245,166,35,0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #F5A623' : '3px solid transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap', overflow: 'hidden',
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link
            to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
              color: 'rgba(255,255,255,0.45)', fontFamily: 'DM Sans', fontSize: '0.8rem',
            }}
          >
            <ArrowLeft size={16} />
            {sidebarOpen && 'Back to Site'}
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/articles/*" element={<ArticlesManager showToast={showToast} />} />
          <Route path="/opportunities/*" element={<OpportunitiesManager showToast={showToast} />} />
          <Route path="/products/*" element={<ProductsManager showToast={showToast} />} />
          <Route path="/programmes/*" element={<ProgrammesManager showToast={showToast} />} />
          <Route path="/toolbox/*" element={<ToolboxManager showToast={showToast} />} />
        </Routes>
      </div>
    </div>
  )
}
