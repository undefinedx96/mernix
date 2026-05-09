import { lazy } from 'react'


const Home = lazy(() => import('./Home.tsx'));
const Login = lazy(() => import('./Login.tsx'));


export {
    Home,
    Login,
}