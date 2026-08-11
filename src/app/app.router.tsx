import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AppLayout } from "../shared/components/layout/AppLayout";
import { CampaignCreatePage, CampaignDetailPage, CampaignListPage } from "@/features/campaigns";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { RequireAdmin } from "@/features/auth/components/RequireAdmin";
import { lazy } from "react";

const DashboardPage = lazy(() => import('../features/dasboard/DashboardPage').then(module => ({ default: module.DashboardPage })));
const RecipientListPage = lazy(() => import('../features/recipients/pages/RecipientListPage').then(module => ({ default: module.RecipientListPage })));
const TemplateListPage = lazy(() => import('../features/templates/pages/TemplateListPage').then(module => ({ default: module.TemplateListPage })));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const UserListPage = lazy(() => import('../features/users/pages/UserListPage').then(module => ({ default: module.UserListPage })));


const appRouter = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />
    },
    {
        path: '/',
        element: <RequireAuth />,
        children: [
            {
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
                    },
                    {
                        path: 'users',
                        element: <RequireAdmin />,
                        children: [
                            {
                                index: true,
                                element: <UserListPage />
                            }
                        ]
                    }
                ]
            }
        ]
    }
])

export function AppRouter() {
    return <RouterProvider router={appRouter}/>
}
