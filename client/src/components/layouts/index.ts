import { lazy } from 'react'


const AuthLayout = lazy(() => import('./AuthLayout.tsx'));
const DashboardLayout = lazy(() => import('./DashboardLayout.tsx'));


export {
    AuthLayout,
    DashboardLayout
}