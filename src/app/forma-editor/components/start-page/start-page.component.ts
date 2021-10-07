import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'app/core/services/electron/electron.service';
import { uploadZipFile } from '../../functions/file-upload';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import {
  loadFormaDefinition,
  syncCurrentSourceToMaster,
} from '../../store/forma-editor.actions';
import {
  FormaCustomScriptObject,
  FormaStoreData,
} from '../../../../../app/interfaces/FormaApplicationObject';
import { parseJsonStoreKey } from '../../functions/string-key-operations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchDialogContentComponent } from '../search-dialog-content/search-dialog-content.component';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss'],
})
export class StartPageComponent implements OnInit, OnDestroy {
  // formaFormJsonList$: Observable<any>;
  // scriptEvent$: Observable<any>;
  formaStoreData$: Observable<FormaStoreData>;
  formaStoreSubscription: Subscription;
  formaStoreSubscriptionForExportCustomScript: Subscription;
  dialogRef: MatDialogRef<any>;

  constructor(
    private router: Router,
    private electronService: ElectronService,
    private store: Store<{ editor: any }>,
    private dialog: MatDialog
  ) {
    // this.formaFormJsonList$ = store.select('formaFormJsonList');
    // this.scriptEvent$ = store.select('scriptEvent');
    this.formaStoreData$ = store.select('editor');
  }

  ngOnInit(): void {
    this.electronService.ipcRenderer.on(
      'get_store_data_for_export_custom_script',
      (event, savePath) => {
        this.store.dispatch(syncCurrentSourceToMaster());
        this.formaStoreSubscriptionForExportCustomScript =
          this.formaStoreData$.subscribe((formaStoreData) => {
            const exportFormaStoreData = { ...formaStoreData };
            this.electronService.ipcRenderer
              .invoke('do_export_custom_script', savePath, exportFormaStoreData)
              .then((result) => {
                alert('カスタムスクリプトの保存が完了しました。');
              })
              .catch((error) => {});
          });
        this.formaStoreSubscriptionForExportCustomScript.unsubscribe();
      }
    );
    //-----------------------------------------------------------------------------
    // zipファイル選択処理
    // Mainプロセス側で、zipファイルを選択した
    //-----------------------------------------------------------------------------
    this.electronService.ipcRenderer.on('select_zip_file', () => {
      this.openZipFileButtonClick();
    });
    //-----------------------------------------------------------------------------
    // zipファイル出力処理
    // Mainプロセス側で、zipファイルにエクスポートを選択した
    //-----------------------------------------------------------------------------
    this.electronService.ipcRenderer.on('export_zip_file', (e, savePath) => {
      this.store.dispatch(syncCurrentSourceToMaster());
      this.formaStoreSubscription = this.formaStoreData$.subscribe(
        (formaStoreData) => {
          // ストアと同期する
          let zipTargetData = JSON.parse(
            JSON.stringify(formaStoreData.formaFormJsonList)
          );
          // modifySourceDictの値をformaFormJsonListに反映する
          zipTargetData.forEach((formaFormObj) => {
            const mergeList = Object.keys(
              formaStoreData.modifySourceDict
            ).filter((modifySourceKey) => {
              return (
                formaStoreData.modifySourceDict[modifySourceKey].formId ===
                formaFormObj.formId
              );
            });

            mergeList.forEach((primaryKey) => {
              const sourceObj = formaStoreData.modifySourceDict[primaryKey];
              const keyList = parseJsonStoreKey(sourceObj.jsonStoreKey);

              // Forma定義のキーをたどり、更新したカスタムスクリプトを設定する
              let targetFormObj: any = {};
              for (let i = 0; i < keyList.length; i++) {
                if (i === 0) {
                  targetFormObj = formaFormObj.formData[keyList[i]];
                } else {
                  targetFormObj = targetFormObj[keyList[i]];
                }
              }
              // 初期イベント、アイテムイベント、テーブルイベント
              if (sourceObj.scriptType === 'event') {
                targetFormObj.customScript = sourceObj.code;
                targetFormObj.note = sourceObj.note;
                targetFormObj.conditionExpression =
                  sourceObj.conditionExpression;
                // イベントボタンスクリプト、スクリプト
              } else {
                targetFormObj.item_properties.script = sourceObj.code;

                if (
                  sourceObj.note !== '' &&
                  targetFormObj.item_type !== 'product_72_script'
                ) {
                  if (targetFormObj.item_properties.labels.length > 0) {
                    targetFormObj.item_properties.labels[0]['ja'] =
                      sourceObj.note;
                  } else {
                    targetFormObj.item_properties.labels[0] = {};
                    targetFormObj.item_properties.labels[0]['ja'] =
                      sourceObj.note;
                  }
                }
                targetFormObj.item_view_names['ja'] =
                  sourceObj.conditionExpression;
              }
            });
          });
          const newFormaAppObj = JSON.parse(
            JSON.stringify(formaStoreData.formaAppObj)
          );
          this.electronService.ipcRenderer
            .invoke('store_and_zip', savePath, newFormaAppObj, zipTargetData)
            .then((data) => {
              alert('zipファイルの保存が完了しました');
            })
            .catch((error) => {
              console.error(error);
            });
        }
      );
      this.formaStoreSubscription.unsubscribe();
    });
  }

  ngOnDestroy() {
    if (this.formaStoreSubscription) {
      this.formaStoreSubscription.unsubscribe();
    }
    if (this.formaStoreSubscriptionForExportCustomScript) {
      this.formaStoreSubscriptionForExportCustomScript.unsubscribe();
    }
  }

  openZipFileButtonClick() {
    document.getElementById('upload_zip_file').click();
  }
  uploadZipFile(event) {
    uploadZipFile(event, this.electronService, this.store);
    this.router.navigate(['/editor']);
  }
}
