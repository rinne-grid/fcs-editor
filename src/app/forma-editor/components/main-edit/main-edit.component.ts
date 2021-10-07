import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import * as monaco from 'monaco-editor';
import { Observable, Subscription } from 'rxjs';
import { FormaStoreData } from '../../../../../app/interfaces/FormaApplicationObject';
import { Store } from '@ngrx/store';
import { syncBackgroundSourceCode } from '../../store/forma-editor.actions';

@Component({
  selector: 'app-main-edit',
  templateUrl: './main-edit.component.html',
  styleUrls: ['./main-edit.component.scss'],
})
export class MainEditComponent implements AfterViewInit, OnDestroy {
  editor: monaco.editor.IStandaloneCodeEditor;

  formaStoreData$: Observable<FormaStoreData>;
  formaStoreSubscription: Subscription;

  constructor(private store: Store<{ editor: any }>) {
    this.formaStoreData$ = store.select('editor');
  }

  ngInit() {}

  ngOnDestroy() {
    if (this.formaStoreSubscription) {
      this.formaStoreSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    (window as any).MonacoEnvironment = {
      getWorkerUrl: function (workerId, label) {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
              self.MonacoEnvironment = { baseUrl: '${window.location.origin}/' };
              importScripts('${window.location.origin}/vs/base/worker/workerMain.js');
          `)}`;
      },
    };
    this.initMonaco();
    this.formaStoreData$.subscribe((formaStoreData) => {
      // if (this.editor) {
      const currentSourceObject = formaStoreData.currentSourceObject;
      if (currentSourceObject.hasOwnProperty('code')) {
        this.editor.setValue(currentSourceObject.code);
      }
    });
  }

  // monacoOnDidChangeContent(event) {
  // }

  initMonaco() {
    this.editor = monaco.editor.create(document.getElementById('editor'), {
      value: '',
      language: 'javascript',
      minimap: {
        // enabled: false,
      },
      renderIndentGuides: true,
      renderWhitespace: 'all',
      // theme: "vs-dark",
    });

    // this.editor.getModel().onDidChangeContent((event) => {
    //   this.monacoOnDidChangeContent(event);
    // });
    (window as any).monacoGlobalEditorObject = this.editor;
  }
}
