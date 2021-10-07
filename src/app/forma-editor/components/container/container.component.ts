import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { FormaStoreData } from '../../../../../app/interfaces/FormaApplicationObject';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import {
  clearFormaDefinition,
  loadFormaDefinition,
  setSourceCondition,
  setSourceExplain,
} from '../../store/forma-editor.actions';
import { uploadZipFile } from '../../functions/file-upload';
import { Router } from '@angular/router';
import { ElectronService } from '../../../core/services';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchDialogContentComponent } from '../search-dialog-content/search-dialog-content.component';
import { SearchDialogComponent } from '../search-dialog/search-dialog.component';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
})
export class ContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  // @ViewChild(TemplateRef) _dialogTemplate: TemplateRef<any>;
  // private _overlayRef: OverlayRef;
  // private _portal: TemplatePortal;
  formaExplain: string = '';
  formaCondition: string = '';
  formaScriptType?: string = '';
  formaStoreData$: Observable<FormaStoreData>;
  formaStoreSubscription: Subscription;
  searchDialogRef: MatDialogRef<any>;
  searchAndReplaceDialogRef: MatDialogRef<any>;
  constructor(
    private router: Router,
    private electronService: ElectronService,
    private store: Store<{ editor: any }>,
    private searchDialog: MatDialog,
    private searchAndReplaceDialog: MatDialog // private _viewContainerRef: ViewContainerRef, // private _overlay: Overlay
  ) {
    this.formaStoreData$ = store.select('editor');
  }

  ngOnInit(): void {
    this.electronService.ipcRenderer.on('select_zip_file_container', () => {
      document.getElementById('upload_zip_file_container').click();
    });

    this.electronService.ipcRenderer.on('search_code', () => {
      if (!this.searchDialogRef && !this.searchAndReplaceDialogRef) {
        this.searchDialogRef = this.searchDialog.open(
          SearchDialogContentComponent,
          {
            // backdropClass: 'cdk-overlay-transparent-backdrop',
            hasBackdrop: false,
            width: `${document.body.clientWidth / 2}px`,
            height: `${document.body.clientHeight - 128}px`,
            data: {
              dialogTitle: '検索',
              isReplace: false,
            },
          }
        );
        this.searchDialogRef.afterClosed().subscribe((result) => {
          this.searchDialogRef = null;
        });
      }
    });

    this.electronService.ipcRenderer.on('search_and_replace_code', () => {
      if (!this.searchDialogRef && !this.searchAndReplaceDialogRef) {
        this.searchAndReplaceDialogRef = this.searchAndReplaceDialog.open(
          SearchDialogContentComponent,
          {
            hasBackdrop: false,
            width: `${document.body.clientWidth / 2}px`,
            height: `${document.body.clientHeight - 128}px`,
            data: {
              dialogTitle: '置換',
              isReplace: true,
            },
          }
        );
        this.searchAndReplaceDialogRef.afterClosed().subscribe((result) => {
          this.searchAndReplaceDialogRef = null;
        });
      }
    });

    // 説明及び条件式を設定する
    this.formaStoreSubscription = this.formaStoreData$.subscribe(
      (formaStoreData) => {
        const currentSourceObject = formaStoreData.currentSourceObject;

        if (currentSourceObject.note === '') {
          this.formaExplain = '';
        } else {
          this.formaExplain = currentSourceObject.note;
        }

        if (currentSourceObject.conditionExpression === '') {
          this.formaCondition = '';
        } else {
          this.formaCondition = currentSourceObject.conditionExpression;
        }

        this.formaScriptType = currentSourceObject.scriptType;
      }
    );
  }

  getExplainAreaRowSize() {
    const _win = window as any;
    if (_win.outerHeight <= 768) {
      return 2;
    } else if (_win.outerHeight > 768 && _win.outerHeight <= 900) {
      return 3;
    } else if (_win.outerHeight > 900 && _win.outerHeight <= 1024) {
      return 4;
    } else {
      return 5;
    }
  }

  getConditionAreaRowSize() {
    const _win = window as any;
    if (_win.outerHeight <= 768) {
      return 1;
    } else if (_win.outerHeight > 768 && _win.outerHeight <= 900) {
      return 2;
    } else if (_win.outerHeight > 900 && _win.outerHeight <= 1024) {
      return 3;
    }
  }

  ngAfterViewInit() {}

  uploadZipFile(event) {
    // uploadZipFile(event, this.electronService, this.store);
    const file: File = event.target.files[0];
    if (!file) {
      return;
    }
    this.electronService.ipcRenderer
      .invoke('load_and_unzip', file.path)
      .then((data) => {
        this.store.dispatch(clearFormaDefinition());

        this.store.dispatch(loadFormaDefinition({ formaStoreData: data }));
      })
      .catch((error) => {
      });

    this.router.navigate(['/editor']);
  }

  ngOnDestroy() {
    if (this.formaStoreSubscription) {
      this.formaStoreSubscription.unsubscribe();
    }
  }

  // 双方向バインド済みの"説明"をストアに設定する
  setCurrentSourceExplain() {
    this.store.dispatch(
      setSourceExplain({
        explain: this.formaExplain,
      })
    );
  }
  // 双方向バインド済みの"条件"をストアに設定する
  setCurrentSourceCondition() {
    this.store.dispatch(setSourceCondition({ condition: this.formaCondition }));
  }
}
