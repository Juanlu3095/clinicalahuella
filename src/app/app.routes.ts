import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./client/home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: 'contacto',
        loadComponent: () => import('./client/contact/contact.component').then((m) => m.ContactComponent),
    },
    {
        path: 'solicitar-cita',
        loadComponent: () => import('./client/book/book.component').then((m) => m.BookComponent),
    },
    {
        path: '**',
        loadComponent: () => import('./client/notfound/notfound.component').then((m) => m.NotfoundComponent),
    },
];
