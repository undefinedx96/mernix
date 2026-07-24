import { lazy } from 'react'


const Home = lazy(() => import('./Home.tsx'));
const Login = lazy(() => import('./Login.tsx'));
const Register = lazy(() => import('./Register.tsx'));
const Channel = lazy(() => import('./Channel.tsx'));
const ProfileSettings = lazy(() => import('./ProfileSettings.tsx'));
const WatchHistory = lazy(() => import('./WatchHistory.tsx'));
const SearchResults = lazy(() => import('./SearchResults.tsx'));
const CreatorDashboard = lazy(() => import('./studio/CreatorDashboard.tsx'));
const StudioAnalytics = lazy(() => import('./studio/StudioAnalytics.tsx'));
const StudioMyVideos = lazy(() => import('./studio/StudioMyVideos.tsx'));


export {
    Home,
    Login,
    Register,
    Channel,
    ProfileSettings,
    WatchHistory,
    SearchResults,
    CreatorDashboard,
    StudioAnalytics,
    StudioMyVideos,
}