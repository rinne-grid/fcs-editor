import { createAction, props } from '@ngrx/store';
import {
  FormaCustomScriptObject,
  FormaStoreData,
} from '../../../../app/interfaces/FormaApplicationObject';
import {DialogSearchResult} from '../../../../app/interfaces/DialogSearchResult';

export const loadFormaDefinition = createAction(
  '[StartPage Component] LoadFormaDefinition',
  props<{ formaStoreData: FormaStoreData }>()
);

export const clearFormaDefinition = createAction(
  '[StartPage Component] clearFormaDefinition'
);

export const openCurrentSource = createAction(
  '[Side Component] OpenCurrentSource',
  props<{ currentSourcePrimaryKey: string }>()
);
export const removeCurrentSource = createAction(
  '[Tab Component] removeCurrentSource',
  props<{ currentSourcePrimaryKey: string }>()
);
export const loadCurrentTabList = createAction(
  '[Side Component] LoadCurrentTab',
  props<{ currentSourcePrimaryKey: string }>()
);
export const getSourceByTabIndex = createAction(
  '[Tab Component] getSourceByTabIndex',
  props<{ currentIndex: number }>()
);
export const setSourceExplain = createAction(
  '[Container Component] setSourceExplain',
  props<{ explain: string }>()
);
export const setSourceCondition = createAction(
  '[Container Component] setSourceCondition',
  props<{ condition: string }>()
);
export const syncBackgroundSourceCode = createAction(
  '[MainEdit Component] syncBackgroundSourceCode',
  props<{ codeText: string }>()
);
export const syncCurrentSourceToMaster = createAction(
  '[Side Component] syncCurrentSourceToMaster'
);
export const syncCurrentSourceToMasterByIndex = createAction(
  '[Tab Component] syncCurrentSourceToMasterByIndex'
);
export const searchSourceCode = createAction(
  "[SearchDialogContent Component] searchSource",
  props<{ keyword: string, isMatchCase: boolean, isUseWildCard:boolean }>()
)
export const replaceSourceCode = createAction(
  "[SearchDialogContent Component replaceSourceCode",
  props<{ searchKeyword: string, replaceKeyword: string, isMatchCase: boolean, isUseWildCard:boolean, searchResultList: DialogSearchResult[]}>()
)
