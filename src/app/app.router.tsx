import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AppLayout } from "../shared/components/layout/AppLayout";
import { CampaignCreatePage, CampaignDetailPage, CampaignListPage } from "@/features/campaigns";
import { lazy } from "react";

const DashboardPage = lazy(() => import('../features/dasboard/DashboardPage').then(module => ({ default: module.DashboardPage })));
const RecipientListPage = lazy(() => import('../features/recipients/pages/RecipientListPage').then(module => ({ default: module.RecipientListPage })));
const TemplateListPage = lazy(() => import('../features/templates/pages/TemplateListPage').then(module => ({ default: module.TemplateListPage })));


const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout/>,
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" />
            },
            {
                path: 'dashboard',   
                element: <DashboardPage /> 
            },
            {
                path: 'campaigns', 
                element: <CampaignListPage />
            },
            {
                path: 'campaigns/new', 
                element: <CampaignCreatePage />
            },
            {
                path: 'campaigns/:id', 
                element: <CampaignDetailPage />
            },
            {
                path: 'recipients',  
                element: <RecipientListPage />
            },
            {
                path: 'templates',   
                element: <TemplateListPage />
            }
        ]
    }
])

export function AppRouter() {
    return <RouterProvider router={appRouter}/>
}