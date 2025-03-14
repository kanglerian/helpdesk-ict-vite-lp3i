import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import './index.css'

import Students from './pages/Students';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import License from './pages/License';
import Auth from './pages/Auth';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Auth/>,
  },
  {
    path: "/student",
    element: <Students/>,
  },
  {
    path: "/admin",
    element: <Admin/>,
  },
  {
    path: "/dashboard",
    element: <Dashboard/>,
  },
  {
    path: "/license",
    element: <License/>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
