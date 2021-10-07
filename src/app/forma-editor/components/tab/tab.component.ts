import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import {
  FormaCustomScriptObject,
  FormaStoreData,
} from '../../../../../app/interfaces/FormaApplicationObject';
import { FormControl } from '@angular/forms';
import {
  getSourceByTabIndex,
  loadCurrentTabList,
  openCurrentSource,
  removeCurrentSource,
  syncCurrentSourceToMaster,
  syncCurrentSourceToMasterByIndex,
} from '../../store/forma-editor.actions';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
})
export class TabComponent implements OnInit, OnDestroy {
  items: FormaCustomScriptObject[] = [];
  formaStoreData$: Observable<FormaStoreData>;
  formaStoreSubscription: Subscription;
  closeTabSubscription: Subscription;
  selected = new FormControl(0);
  fallbackSourceKey: string;

  constructor(private store: Store<{ editor: any }>) {
    this.formaStoreData$ = store.select('editor');
  }

  ngOnInit(): void {
    this.formaStoreSubscription = this.formaStoreData$.subscribe(
      (formaStoreData) => {
        this.items = formaStoreData.sourceTabList;
        this.selected.setValue(formaStoreData.currentSourceTabIndex);
        this.fallbackSourceKey = formaStoreData.fallbackSourceKey;
      }
    );
  }

  ngOnDestroy() {
    if (this.formaStoreSubscription) {
      this.formaStoreSubscription.unsubscribe();
    }
  }

  selectedTabChange($event) {
    this.store.dispatch(syncCurrentSourceToMasterByIndex());
    const currentIndex = $event.index;
    this.store.dispatch(getSourceByTabIndex({ currentIndex: currentIndex }));
  }

  closeTab($event, primaryKey) {
    const currentIndex = $event.index;
    this.store.dispatch(
      removeCurrentSource({ currentSourcePrimaryKey: primaryKey })
    );
    // this.selected.setValue(this.items.length - 1);
    // this.formaStoreData$.subscribe((formaStoreData) => {
    //   console.log(
    //     `[TabComponent] closeTab:  ${formaStoreData.currentSourceTabIndex}`
    //   );
    //   this.selected.setValue(formaStoreData.currentSourceTabIndex);
    // });

    $event.stopPropagation();
  }
}
