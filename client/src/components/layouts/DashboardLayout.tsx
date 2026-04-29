import { useState } from 'react'
import { Outlet } from 'react-router'
import Navbar from '../layout/Navbar.tsx'
import Sidebar from '../layout/Sidebar.tsx'



const DashboardLayout = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className='flex flex-col h-screen overflow-hidden'>
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className='flex flex-1 overflow-hidden'>
            <Sidebar isOpen={isSidebarOpen} />

            <main className='flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50 scroll-smooth'>
                <Outlet />
            </main>
        </div>
    </div>
  )
}

export default DashboardLayout