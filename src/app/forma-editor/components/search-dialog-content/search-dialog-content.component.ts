import {
  Component,
  Inject,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  DialogContentData,
  SearchReplaceDialogContentData,
} from '../../interfaces/DialogContentData';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as monaco from 'monaco-editor';
import { Store } from '@ngrx/store';
import { FormaStoreData } from '../../../../../app/interfaces/FormaApplicationObject';
import { Observable, Subscription } from 'rxjs';
import {
  loadCurrentTabList,
  openCurrentSource,
  replaceSourceCode,
  searchSourceCode,
  syncCurrentSourceToMaster,
} from '../../store/forma-editor.actions';
import { DialogSearchResult } from '../../../../../app/interfaces/DialogSearchResult';
import { first } from 'rxjs/operators';
import { Range } from 'monaco-editor';

@Component({
  selector: 'app-search-dialog-content',
  templateUrl: './search-dialog-content.component.html',
  styleUrls: ['./search-dialog-content.component.scss'],
})
export class SearchDialogContentComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('searchKeyword', { static: true }) searchKeywordInput: any;

  // editorストア監視
  formaStoreData$: Observable<FormaStoreData>;

  // editorストア購読: unsubscribe用
  formaStoreSubscription: Subscription;
  constructor(
    // 親コンポーネントからのデータ受けとり用
    @Inject(MAT_DIALOG_DATA) public data: SearchReplaceDialogContentData,
    private store: Store<{ editor: any }>
  ) {
    this.formaStoreData$ = store.select('editor');
  }

  // ダイアログ用エディタオブジェクト
  searchEditor: monaco.editor.IStandaloneCodeEditor;

  // 大文字/小文字を区別するかどうか
  isMatchCase: boolean;

  // ワイルドカードを利用するかどうか
  isUseWildCard: boolean;

  // 検索モード(トグルボタン)の取得値
  searchMode?: string;

  // 検索結果格納用リスト
  // -> storeより
  searchResultList: DialogSearchResult[] = [];

  // 現在表示中のソースコードprimaryKey + virtualName + 行
  currentSourcePrimaryKeyStr?: string;

  // monaco editorの選択範囲
  selectionRange?: Range;

  // 検索エディタのクラス
  editorStyle?: string = 'search-editor-style';

  // 置換キーワード
  replaceKeyword?: string;

  ngOnInit(): void {
    this.searchEditor = monaco.editor.create(
      document.getElementById('search_editor'),
      {
        value: '',
        language: 'javascript',
        minimap: {
          enabled: false,
        },
        renderIndentGuides: true,
        renderWhitespace: 'all',
      }
    );
    (window as any).monacoGlobalSearchEditor = this.searchEditor;

    this.formaStoreSubscription = this.formaStoreData$.subscribe(
      (formaStoreData) => {
        this.searchResultList = formaStoreData.dialogSearchResult;
        if (this.searchResultList.length > 0) {
          const firstResult = this.searchResultList[0];
          this.setCurrentSourceEditorSetting(firstResult);
        } else {
          this.searchEditor.setValue('');
          this.searchEditor.revealLine(1);
          this.currentSourcePrimaryKeyStr = '';
        }
      }
    );
  }

  ngAfterViewInit() {
    this.searchKeywordInput.nativeElement.focus();
  }

  ngOnDestroy() {
    if (this.formaStoreSubscription) {
      this.formaStoreSubscription.unsubscribe();
    }
  }

  setCurrentSourceEditorSetting(targetObj: DialogSearchResult) {
    this.searchEditor.setValue(targetObj.sourceCode);
    this.searchEditor.revealLineInCenter(targetObj.rowNumber);
    this.selectionRange = new Range(
      targetObj.rowNumber,
      999,
      targetObj.rowNumber,
      999
    );
    this.searchEditor.setSelection(this.selectionRange);
    this.currentSourcePrimaryKeyStr = `${targetObj.sourcePrimaryKey}${targetObj.sourceName}${targetObj.rowNumber}`;
  }

  /***
   * トグルボタンの状態を元に、検索モードの設定を行う
   */
  setSearchMode(): void {
    if (this.searchMode) {
      this.isMatchCase = this.searchMode.includes('match_case');
      this.isUseWildCard = this.searchMode.includes('wild_card');
    }
  }

  /***
   * エンターキーが押された時に入力された文字列でストア上のソースコード検索を実施する
   * @param event
   */
  searchSourceCode(event): void {
    this.setSearchMode();
    const keyword = event.target.value;

    this.store.dispatch(
      searchSourceCode({
        keyword: keyword,
        isMatchCase: this.isMatchCase,
        isUseWildCard: this.isUseWildCard,
      })
    );
  }

  replaceSourceCode(): void {
    if (this.searchResultList.length === 0) {
      return;
    } else {
      const searchKeyword = this.searchKeywordInput.nativeElement.value;
      this.store.dispatch(
        replaceSourceCode({
          searchKeyword: searchKeyword,
          replaceKeyword: this.replaceKeyword,
          isMatchCase: this.isMatchCase,
          isUseWildCard: this.isUseWildCard,
          searchResultList: this.searchResultList,
        })
      );
      this.store.dispatch(syncCurrentSourceToMaster());
      alert(
        `${this.searchResultList.length}件のカスタムスクリプトを置換しました`
      );
    }
  }

  /***
   * 検索結果のコードスニペットをクリックした際に対象コードをエディタに表示する
   * @param event
   * @param resultObj
   */
  clickResultCode(event, resultObj: DialogSearchResult): void {
    this.setCurrentSourceEditorSetting(resultObj);
    // this.searchEditor.setValue(resultObj.sourceCode);
    // this.searchEditor.revealLineInCenter(resultObj.rowNumber);
    // this.currentSourcePrimaryKeyStr = resultObj.sourcePrimaryKey;
  }

  openResultCode(event, resultObj: DialogSearchResult): void {
    this.store.dispatch(syncCurrentSourceToMaster());
    this.store.dispatch(
      // openCurrentSource({ currentSource: node.customScriptObject })
      openCurrentSource({ currentSourcePrimaryKey: resultObj.sourcePrimaryKey })
    );
    this.store.dispatch(
      loadCurrentTabList({
        currentSourcePrimaryKey: resultObj.sourcePrimaryKey,
      })
    );
  }
}
