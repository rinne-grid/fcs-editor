import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ContainerComponent } from './components/container/container.component';
import { StartPageComponent } from './components/start-page/start-page.component';
const routes: Routes = [
  {
    path: 'start_page',
    component: StartPageComponent,
  },
  {
    path: 'editor',
    component: ContainerComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormaEditorRoutingModule {}
