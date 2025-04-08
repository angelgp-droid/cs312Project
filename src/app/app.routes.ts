import { Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
export const routes: Routes = [
    {path:'', component: HomepageComponent},
    {path:'about', component: AboutComponent}
];
