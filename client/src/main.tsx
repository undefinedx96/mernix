import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { Channel, Home, Login, ProfileSettings, Register, WatchHistory } from './pages/index.ts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './providers/AuthProvider.tsx'
import { AuthLayout, DashboardLayout } from './components/layouts/index.ts'



const queryClient = new QueryClient();


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Suspense><Home /></Suspense>
          },
          {
            path: 'c/:username',
            element: (
              <AuthLayout authentication={true}>
                <Suspense><Channel /></Suspense>
              </AuthLayout>
            )
          },
          {
            path: 'settings',
            element: (
              <AuthLayout authentication={true}>
                <Suspense><ProfileSettings /></Suspense>
              </AuthLayout>
            )
          },
          {
            path: 'watch-history',
            element: (
              <AuthLayout authentication={true}>
                <Suspense><WatchHistory /></Suspense>
              </AuthLayout>
            )
          },
        ]
      },
      {
        path: 'login',
        element: (
          <AuthLayout authentication={false}>
            <Suspense><Login /></Suspense>
          </AuthLayout>
        )
      },
      {
        path: 'register',
        element: (
          <AuthLayout authentication={false}>
            <Suspense><Register /></Suspense>
          </AuthLayout>
        )
      },
      {
        path: '*',
        element: <Navigate to='/' replace />
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </QueryClientProvider>
)