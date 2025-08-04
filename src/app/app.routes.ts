import { Routes } from '@angular/router';
import { authAdminGuard, authAdminGuardReverse } from './guards/auth-admin.guard';

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
        path: 'aviso-legal',
        loadComponent: () => import('./client/avisolegal/avisolegal.component').then((m) => m.AvisolegalComponent),
    },
    {
        path: 'politica-privacidad',
        loadComponent: () => import('./client/politica-privacidad/politica-privacidad.component').then((m) => m.PoliticaPrivacidadComponent),
    },
    {
        path: 'politica-cookies',
        loadComponent: () => import('./client/politica-cookies/politica-cookies.component').then((m) => m.PoliticaCookiesComponent),
    },
    {
        path: 'iniciosesion',
        loadComponent: () => import('./client/login/login.component').then((m) => m.LoginComponent),
        canActivate: [authAdminGuardReverse]
    },
    {
        path: 'admin',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        canActivateChild: [authAdminGuard],
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
            },
            {
                path: 'blog/nuevo',
                loadComponent: () => import('./admin/post-nuevo/post-nuevo.component').then((m) => m.PostNuevoComponent),
            },
            {
                path: 'blog/:id/editar',
                loadComponent: () => import('./admin/post-editar/post-editar.component').then((m) => m.PostEditarComponent),
            },
            {
                path: 'categorias',
                loadComponent: () => import('./admin/categorias/categorias.component').then((m) => m.CategoriasComponent),
            },
            {
                path: 'newsletters',
                loadComponent: () => import('./admin/newsletters/newsletters.component').then((m) => m.NewslettersComponent),
            },
            {
                path: 'mensajes',
                loadComponent: () => import('./admin/mensajes/mensajes.component').then((m) => m.MensajesComponent),
            }
        ]
    },
    {
        path: '**',
        loadComponent: () => import('./client/notfound/notfound.component').then((m) => m.NotfoundComponent),
    },
];
