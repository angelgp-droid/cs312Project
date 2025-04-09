import { Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { NavbarComponent } from './navbar/navbar.component';
export const routes: Routes = [
    {path:'', component: HomepageComponent},
    {path:'about', component: AboutComponent},
    {path:'navbar', component: NavbarComponent}
];
