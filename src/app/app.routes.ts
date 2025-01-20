import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./client/home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: 'blog',
        loadComponent: () => import('./client/blog/blog.component').then((m) => m.BlogComponent),
    },
    {
        path: 'blog/:slug',
        loadComponent: () => import('./client/blog-post/blog-post.component').then((m) => m.BlogPostComponent),
    },
    {
        path: 'contacto',
        loadComponent: () => import('./client/contact/contact.component').then((m) => m.ContactComponent),
    },
    {
        path: 'reservar-cita',
        loadComponent: () => import('./client/book/book.component').then((m) => m.BookComponent),
    },
    {
        path: 'admin',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./admin/inicio/inicio.component').then((m) => m.InicioComponent),
            },
            {
                path: 'reservas',
                loadComponent: () => import('./admin/reservas/reservas.component').then((m) => m.ReservasComponent),
            },
            {
                path: 'citas',
                loadComponent: () => import('./admin/citas/citas.component').then((m) => m.CitasComponent),
            },
            {
                path: 'blog',
                loadComponent: () => import('./admin/blog/blog.component').then((m) => m.BlogComponent),
            }
        ]
    },
    {
        path: '**',
        loadComponent: () => import('./client/notfound/notfound.component').then((m) => m.NotfoundComponent),
    },
];
