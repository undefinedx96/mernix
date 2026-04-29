import { lazy } from 'react'


const Home = lazy(() => import('./Home.tsx'));
// const WatchPage = lazy(() => import('./pages/WatchPage.tsx'));
// const Login = lazy(() => import('./pages/Login.tsx'));
// const ProfileSettings = lazy(() => import('./pages/ProfileSettings.tsx'));

const DashboardLayout = lazy(() => import('../components/layouts/DashboardLayout.tsx'));
const AuthLayout = lazy(() => import('../components/layouts/AuthLayout.tsx'));


export {
    Home,
    DashboardLayout,
    AuthLayout,
}