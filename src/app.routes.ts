import { Routes } from '@angular/router';
import { authGuard } from './app/core/auth/auth.guard';
import { guestGuard } from './app/core/auth/guest.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./app/pages/auth/login/login.component').then(c => c.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./app/pages/auth/register/register.component').then(c => c.RegisterComponent)
      },
       {
        path: 'forgot-password',
        loadComponent: () => import('./app/pages/auth/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent)
      },
    ]
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./app/pages/main/layout.component').then(c => c.LayoutComponent),
    children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        {
            path: 'dashboard',
            loadComponent: () => import('./app/pages/main/dashboard/dashboard.component').then(c => c.DashboardComponent)
        },
        {
            path: 'knowledge',
            loadComponent: () => import('./app/pages/main/knowledge/knowledge-list/knowledge-list.component').then(c => c.KnowledgeListComponent)
        },
        {
            path: 'tools',
            loadComponent: () => import('./app/pages/main/tools/tools.component').then(c => c.ToolsComponent)
        },
        {
            path: 'nodes',
            loadComponent: () => import('./app/pages/main/nodes/nodes.component').then(c => c.NodesComponent)
        },
        {
            path: 'plans',
            loadComponent: () => import('./app/pages/main/plans/plans.component').then(c => c.PlansComponent)
        },
        // FIX: Add route for plan detail page.
        {
            path: 'plans/:id',
            loadComponent: () => import('./app/pages/main/plans/plan-detail/plan-detail.component').then(c => c.PlanDetailComponent)
        },
        {
            path: 'orders',
            loadComponent: () => import('./app/pages/main/orders/orders-list/orders-list.component').then(c => c.OrdersListComponent)
        },
        {
            path: 'order-status/:trade_no',
            loadComponent: () => import('./app/pages/main/orders/order-status/order-status.component').then(c => c.OrderStatusComponent)
        },
        {
            path: 'tickets',
            loadComponent: () => import('./app/pages/main/tickets/tickets-list/tickets-list.component').then(c => c.TicketsListComponent)
        },
        {
            path: 'tickets/:id',
            loadComponent: () => import('./app/pages/main/tickets/ticket-detail/ticket-detail.component').then(c => c.TicketDetailComponent)
        },
        {
            path: 'invites',
            loadComponent: () => import('./app/pages/main/invites/invites.component').then(c => c.InvitesComponent)
        },
        {
            path: 'community',
            loadComponent: () => import('./app/pages/main/community/community.component').then(c => c.CommunityComponent)
        },
        {
            path: 'traffic-log',
            loadComponent: () => import('./app/pages/main/traffic-log/traffic-log.component').then(c => c.TrafficLogComponent)
        },
        {
            path: 'profile',
            loadComponent: () => import('./app/pages/main/profile/profile.component').then(c => c.ProfileComponent)
        }
    ]
  },
  { path: '**', redirectTo: '/app/dashboard' }
];