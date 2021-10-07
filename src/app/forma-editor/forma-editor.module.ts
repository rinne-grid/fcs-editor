import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

import { ContainerComponent } from './components/container/container.component';
import { TabComponent } from './components/tab/tab.component';
import { SideComponent } from './components/side/side.component';
import { MainEditComponent } from './components/main-edit/main-edit.component';
import { FormaEditorRoutingModule } from './forma-editor-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { StartPageComponent } from './components/start-page/start-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { formaEditorReducer } from './store/forma-editor.reducer';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SearchDialogComponent } from './components/search-dialog/search-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SearchDialogContentComponent } from './components/search-dialog-content/search-dialog-content.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';

@NgModule({
  declarations: [
    ContainerComponent,
    TabComponent,
    SideComponent,
    MainEditComponent,
    StartPageComponent,
    SearchDialogComponent,
    SearchDialogContentComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    // Angular Material Module
    MatTreeModule,
    MatSidenavModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,

    // My Project Module
    FormaEditorRoutingModule,

    // Ngrx
    StoreModule.forRoot({
      editor: formaEditorReducer,
    }),
    DragDropModule,
    MatButtonToggleModule,
    MatCardModule,
  ],
})
export class FormaEditorModule {}
