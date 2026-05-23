import { lazy } from 'react'


const Home = lazy(() => import('./Home.tsx'));
const Login = lazy(() => import('./Login.tsx'));
const Register = lazy(() => import('./Register.tsx'));
const Channel = lazy(() => import('./Channel.tsx'));


export {
    Home,
    Login,
    Register,
    Channel,
}