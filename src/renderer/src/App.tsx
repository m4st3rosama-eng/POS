import React, { useState } from 'react'
import { AppDataProvider, useAppData } from './context/AppDataContext'
import { POSScreen, type View } from './screens/POSScreen'
import { SalesScreen } from './screens/SalesScreen'
import { ReportsScreen } from './screens/ReportsScreen'
import { MenuManagementScreen } from './screens/MenuManagementScreen'

function AppShell(): React.ReactElement {
  const { loading } = useAppData()
  const [view, setView] = useState<View>('pos')

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bark text-cream">Loading…</div>
    )
  }

  switch (view) {
    case 'sales':
      return <SalesScreen onBack={() => setView('pos')} />
    case 'reports':
      return <ReportsScreen onBack={() => setView('pos')} />
    case 'menu':
      return <MenuManagementScreen onBack={() => setView('pos')} />
    default:
      return <POSScreen onNavigate={setView} />
  }
}

export default function App(): React.ReactElement {
  return (
    <AppDataProvider>
      <AppShell />
    </AppDataProvider>
  )
}
