import { Component, OnInit, OnDestroy } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { SourceNode } from '../../interfaces/SourceNode';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { FormaStoreData } from '../../../../../app/interfaces/FormaApplicationObject';
import {
  loadCurrentTabList,
  openCurrentSource,
  syncCurrentSourceToMaster,
} from '../../store/forma-editor.actions';

@Component({
  selector: 'app-side',
  templateUrl: './side.component.html',
  styleUrls: ['./side.component.scss'],
})
export class SideComponent implements OnInit, OnDestroy {
  treeControl = new NestedTreeControl<SourceNode>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<SourceNode>();
  treeDataList: SourceNode[] = [];

  formaStoreData$: Observable<FormaStoreData>;
  formaStoreSubscription: Subscription;

  currentOpenedSourceKey?: string;
  constructor(private store: Store<{ editor: any }>) {
    this.formaStoreData$ = store.select('editor');
  }

  ngOnInit(): void {
    this.createTreeNode();
  }

  ngOnDestroy() {
    if (this.formaStoreSubscription) {
      this.formaStoreSubscription.unsubscribe();
    }
  }

  createTreeData(scriptEventObj, scriptKey, scriptName, parentTree) {
    // 初期イベントのセット
    const childTreeData: SourceNode = {
      name: scriptName,
      children: [],
      type: 'folder',
    };
    scriptEventObj[scriptKey].forEach((script) => {
      childTreeData.children.push({
        name: script.virtualName,
        type: 'code',
        customScriptKey: script.primaryKey,
      });
    });

    if (scriptEventObj[scriptKey].length > 0) {
      parentTree.children.push(childTreeData);
    }
  }

  createTreeNode(): void {
    this.formaStoreSubscription = this.formaStoreData$.subscribe(
      (formaStoreData) => {
        // ツリーの件数とフォーム件数が異なる場合のみツリーを更新する
        // すでにファイルを開いている際に、別のファイルを開く場合など
        let formNum = Object.keys(formaStoreData.scriptEvent).length;
        if (this.treeDataList.length !== formNum) {
          const scriptEvent = formaStoreData.scriptEvent;
          const treeDataList: SourceNode[] = [];
          Object.keys(formaStoreData.scriptEvent).forEach((scriptEventKey) => {
            const formObj = scriptEvent[scriptEventKey]['formObj'];
            // const rootFolderName = `${formObj.formData.formName} ${formObj.formData.formId} version:${formObj.formData.versionNo}`;

            const treeData: SourceNode = {
              name: scriptEventKey,
              children: [],
              type: 'folder',
            };

            // 初期イベントのセット
            this.createTreeData(
              scriptEvent[scriptEventKey],
              'init',
              '初期イベント',
              treeData
            );

            // アイテムイベントのセット
            this.createTreeData(
              scriptEvent[scriptEventKey],
              'action',
              'アイテムイベント',
              treeData
            );

            // テーブルイベントのセット
            this.createTreeData(
              scriptEvent[scriptEventKey],
              'table',
              'テーブルイベント',
              treeData
            );

            // イベントボタンのセット
            this.createTreeData(
              scriptEvent[scriptEventKey],
              'button',
              'イベントボタン',
              treeData
            );

            // スクリプトのセット
            this.createTreeData(
              scriptEvent[scriptEventKey],
              'script',
              'スクリプト',
              treeData
            );

            if (!(treeData.children.length === 0)) {
              treeDataList.push(treeData);
            }
          });
          this.dataSource.data = treeDataList;
          this.treeDataList = treeDataList;
        }
      }
    );
  }

  sourceTreeClick(event, node: SourceNode): void {
    this.currentOpenedSourceKey = node.customScriptKey;
    // カレントオブジェクトとツリーの同期
    this.store.dispatch(syncCurrentSourceToMaster());
    this.store.dispatch(
      // openCurrentSource({ currentSource: node.customScriptObject })
      openCurrentSource({ currentSourcePrimaryKey: node.customScriptKey })
    );
    this.store.dispatch(
      loadCurrentTabList({ currentSourcePrimaryKey: node.customScriptKey })
    );

  }

  confirmStore(): void {
    // this.formaStoreData$.subscribe((obj) => {
    //   console.log(obj);
    // });
  }

  hasChild = (_: number, node: SourceNode) =>
    !!node.children && node.children.length > 0;
}
