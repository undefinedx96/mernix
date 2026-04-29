import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { Home, DashboardLayout } from './pages/index.ts'


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
          // {
          //   path: 'settings',
          //   element: (
          //     <AuthLayout authentication={true}>
          //       <Suspense><ProfileSettings /></Suspense>
          //     </AuthLayout>
          //   )
          // }
        ]
      },
      // {
      //   path: 'login',
      //   element: (
      //     <AuthLayout authentication={false}>
      //       <Suspense><Login /></Suspense>
      //     </AuthLayout>
      //   )
      // },
      {
        path: '*',
        element: <Navigate to='/' replace />
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)