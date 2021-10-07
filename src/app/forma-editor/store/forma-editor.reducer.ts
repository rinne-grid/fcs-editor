import { createReducer, on } from '@ngrx/store';
import {
  getSourceByTabIndex,
  loadCurrentTabList,
  loadFormaDefinition,
  openCurrentSource,
  syncCurrentSourceToMaster,
  syncCurrentSourceToMasterByIndex,
  syncBackgroundSourceCode,
  setSourceExplain,
  setSourceCondition,
  removeCurrentSource,
  clearFormaDefinition,
  searchSourceCode,
  replaceSourceCode,
} from './forma-editor.actions';
import {
  FormaCustomScriptObject,
  FormaStoreData,
} from '../../../../app/interfaces/FormaApplicationObject';
import { DialogSearchResult } from '../../../../app/interfaces/DialogSearchResult';
import {
  getSearchModeToRegExp,
  getSourceObjByKey,
  getSourceTabListIndex,
  getUpdateSourceObjStorePosition,
  searchSourceCodeByKeyword,
} from '../functions/source-search';

export const initialState: FormaStoreData = {
  formaAppObj: {},
  formaFormJsonList: [],
  scriptEvent: {},
  currentSourceObject: {},
  currentSourceKey: '',
  sourceTabList: [],
  currentSourceTabIndex: 0,
  fallbackSourceTabIndex: -1,
  fallbackSourceKey: '',
  modifySourceDict: {},
  backgroundExplainText: '',
  backgroundCondition: '',
  dialogSearchResult: [],
};

let _formaEditorReducer = createReducer(
  initialState,
  //-----------------------------------------------------------------------------
  // IM-Forma定義をストアに格納する
  //-----------------------------------------------------------------------------
  on(loadFormaDefinition, (state, { formaStoreData }) => {
    return {
      ...state,
      formaAppObj: formaStoreData.formaAppObj,
      formaFormJsonList: formaStoreData.formaFormJsonList,
      scriptEvent: formaStoreData.scriptEvent,
    };
  }),
  //-----------------------------------------------------------------------------
  // ストアに格納したデータをすべてクリアする
  //-----------------------------------------------------------------------------
  on(clearFormaDefinition, (state) => {
    return {
      ...state,
      formaAppObj: {},
      formaFormJsonList: [],
      scriptEvent: {},
      currentSourceObject: {},
      currentSourceKey: '',
      sourceTabList: [],
      currentSourceTabIndex: 0,
      fallbackSourceTabIndex: -1,
      fallbackSourceKey: '',
      modifySourceDict: {},
      backgroundExplainText: '',
      backgroundCondition: '',
    };
  }),
  //-----------------------------------------------------------------------------
  // sourceキーを元に指定されたソースコードオブジェクトをセットする
  //-----------------------------------------------------------------------------
  on(openCurrentSource, (state, { currentSourcePrimaryKey }) => {
    let sourceObj = getSourceObjByKey(state, currentSourcePrimaryKey);
    let sourceTabIndex = getSourceTabListIndex(state, currentSourcePrimaryKey);

    let targetSourceObj;
    if (state.modifySourceDict.hasOwnProperty(sourceObj.primaryKey)) {
      targetSourceObj = state.modifySourceDict[sourceObj.primaryKey];
    } else {
      targetSourceObj = sourceObj;
    }

    return {
      ...state,
      currentSourceObject: targetSourceObj,
      currentSourceKey: currentSourcePrimaryKey,
      currentSourceTabIndex: sourceTabIndex,
      backgroundExplainText: targetSourceObj.note,
      backgroundCondition: targetSourceObj.conditionExpression,
    };
  }),
  //-----------------------------------------------------------------------------
  // カレントソースキーを元にタブを削除する
  //-----------------------------------------------------------------------------
  on(removeCurrentSource, (state, { currentSourcePrimaryKey }) => {
    const removeTargetIndex = getSourceTabListIndex(
      state,
      currentSourcePrimaryKey
    );

    let sourceTabIndex = 0;
    // カレントタブインデックスが削除対象インデックス以下の場合
    // タブインデックスを減らす
    // -> 表示するソースコードは変わらないが、
    //    sourceTabListが消え、タブインデックスを調節する必要があるため
    if (removeTargetIndex <= state.currentSourceTabIndex) {
      sourceTabIndex = state.currentSourceTabIndex - 1;

      // 削除対象がカレントタブよりも大きい
    } else if (state.currentSourceTabIndex < removeTargetIndex) {
      sourceTabIndex = state.currentSourceTabIndex;
    }
    return {
      ...state,
      sourceTabList: state.sourceTabList.filter((sourceObj) => {
        return sourceObj.primaryKey !== currentSourcePrimaryKey;
      }),
      currentSourceTabIndex: sourceTabIndex,
    };
  }),
  //-----------------------------------------------------------------------------
  // ソースコードタブの一覧をセットする
  //-----------------------------------------------------------------------------
  on(loadCurrentTabList, (state, { currentSourcePrimaryKey }) => {
    const currentSourceObj = getSourceObjByKey(state, currentSourcePrimaryKey);

    let currentSourceTabIndex = -1;
    for (let i = 0; i < state.sourceTabList.length; i++) {
      if (currentSourcePrimaryKey === state.sourceTabList[i].primaryKey) {
        currentSourceTabIndex = i;
        break;
      }
    }

    //sourceTabListに存在しない場合、現在のタブ数をセットする
    if (currentSourceTabIndex === -1) {
      currentSourceTabIndex = state.sourceTabList.length;
    }

    // すでにcurrentSourceObjがtabListに存在するかどうか
    const tabList = state.sourceTabList.filter((sourceObj) => {
      return sourceObj.primaryKey === currentSourcePrimaryKey;
    });

    // オープン済でない場合、エディタタブの項目として追加する
    if (tabList.length === 0) {
      return {
        ...state,
        sourceTabList: [...state.sourceTabList, currentSourceObj],
        currentSourceTabIndex: currentSourceTabIndex,
      };
    } else {
      return { ...state, currentSourceTabIndex: currentSourceTabIndex };
    }
  }),
  //-----------------------------------------------------------------------------
  // タブインデックスに紐づくソースオブジェクトを取得する
  //-----------------------------------------------------------------------------
  on(getSourceByTabIndex, (state, { currentIndex }) => {
    const currentSourceObj = state.sourceTabList[currentIndex];
    // 対象のソースキーに紐づくオブジェクトがmodifySourceDictに存在する場合、
    // 該当のオブジェクトを返す
    if (currentSourceObj) {
      let targetSourceObj;
      if (state.modifySourceDict.hasOwnProperty(currentSourceObj.primaryKey)) {
        targetSourceObj = state.modifySourceDict[currentSourceObj.primaryKey];
      } else {
        targetSourceObj = currentSourceObj;
      }
      return {
        ...state,
        currentSourceObject: targetSourceObj,
        currentSourceTabIndex: currentIndex,
      };
    } else {
      (window as any).monacoGlobalEditorObject.setValue('');
      return {
        ...state,
        backgroundSourceCode: '',
        backgroundCondition: '',
        backgroundExplainText: '',
        currentSourceObject: {},
      };
    }
  }),
  //-----------------------------------------------------------------------------
  // カレントソースの説明をストアに設定する
  // - タブ切り替え時か、ツリークリック時に同期する
  //-----------------------------------------------------------------------------
  on(setSourceExplain, (state, { explain }) => {
    return {
      ...state,
      // backgroundExplainText: explain,
      currentSourceObject: {
        ...state.currentSourceObject,
        note: explain,
        code: (window as any).monacoGlobalEditorObject.getValue(),
      },
    };
  }),
  //-----------------------------------------------------------------------------
  // カレントソースの説明をストアに設定する
  // - タブ切り替え時か、ツリークリック時に同期する
  //-----------------------------------------------------------------------------
  on(setSourceCondition, (state, { condition }) => {
    return {
      ...state,
      currentSourceObject: {
        ...state.currentSourceObject,
        conditionExpression: condition,
        code: (window as any).monacoGlobalEditorObject.getValue(),
      },
    };
  }),
  //-----------------------------------------------------------------------------
  // 編集済みのストアを用意しキーとソースを格納する
  // 格納済みストアにあれば対象を復帰する
  //-----------------------------------------------------------------------------
  on(syncCurrentSourceToMasterByIndex, (state) => {
    if (state.currentSourceObject.hasOwnProperty('primaryKey')) {
      return {
        ...state,
        modifySourceDict: {
          ...state.modifySourceDict,
          [state.currentSourceObject.primaryKey]: {
            code: (window as any).monacoGlobalEditorObject.getValue(),
            note: state.currentSourceObject.note,
            itemId: state.currentSourceObject.itemId,
            jsonStoreKey: state.currentSourceObject.jsonStoreKey,
            primaryKey: state.currentSourceObject.primaryKey,
            customScriptKey: state.currentSourceObject.customScriptKey,
            conditionExpression: state.currentSourceObject.conditionExpression,
            virtualName: state.currentSourceObject.virtualName,
            formId: state.currentSourceObject.formId,
            scriptType: state.currentSourceObject.scriptType,
          },
        },
        fallbackSourceKey: state.currentSourceKey,
        currentSourceObject: {
          ...state.currentSourceObject,
          code: (window as any).monacoGlobalEditorObject.getValue(),
        },
      };
    } else {
      return {
        ...state,
      };
    }
  }),
  //-----------------------------------------------------------------------------
  // カレントソースオブジェクトと変更対象オブジェクトの同期を取る
  //-----------------------------------------------------------------------------
  on(syncCurrentSourceToMaster, (state) => {
    if (
      state.currentSourceObject &&
      state.currentSourceObject.hasOwnProperty('primaryKey')
    ) {
      return {
        ...state,
        modifySourceDict: {
          ...state.modifySourceDict,
          [state.currentSourceObject.primaryKey]: {
            code: (window as any).monacoGlobalEditorObject.getValue(),
            note: state.currentSourceObject.note,
            itemId: state.currentSourceObject.itemId,
            jsonStoreKey: state.currentSourceObject.jsonStoreKey,
            primaryKey: state.currentSourceObject.primaryKey,
            customScriptKey: state.currentSourceObject.customScriptKey,
            conditionExpression: state.currentSourceObject.conditionExpression,
            virtualName: state.currentSourceObject.virtualName,
            formId: state.currentSourceObject.formId,
            scriptType: state.currentSourceObject.scriptType,
          },
        },

        fallbackSourceKey: state.currentSourceKey,
        currentSourceObject: {
          ...state.currentSourceObject,
          code: (window as any).monacoGlobalEditorObject.getValue(),
        },
      };
    } else {
      return {
        ...state,
      };
    }
  }),
  on(searchSourceCode, (state, { keyword, isMatchCase, isUseWildCard }) => {
    let dialogSearchResultList: DialogSearchResult[];
    dialogSearchResultList = searchSourceCodeByKeyword(
      state,
      keyword,
      isMatchCase,
      isUseWildCard
    );
    return {
      ...state,
      dialogSearchResult: dialogSearchResultList,
    };
  }),
  on(
    replaceSourceCode,
    (
      state,
      {
        searchKeyword,
        replaceKeyword,
        isMatchCase,
        isUseWildCard,
        searchResultList,
      }
    ) => {
      const sourceKeyList = [];
      // 対象となるソースコードのsourceキーを抽出。
      // -> 結果リストに格納されたものに関しては同じソースコードが含まれる場合があるため、
      // -> sourceKeyListに一度追加したら、同じsourceキーはスキップする
      searchResultList.forEach((result) => {
        if (!sourceKeyList.includes(result.sourcePrimaryKey)) {
          sourceKeyList.push(result.sourcePrimaryKey);
        }
      });
      const replacePatternRegexp = getSearchModeToRegExp(
        searchKeyword,
        isMatchCase,
        isUseWildCard
      );

      const sourceObjDict = {};
      let newCurrentSourceObj: FormaCustomScriptObject = {};
      sourceKeyList.forEach((sourceKey) => {
        const sourceObj = getSourceObjByKey(state, sourceKey);
        const newSourceObj = { ...sourceObj };
        newSourceObj.code = newSourceObj.code.replace(
          replacePatternRegexp,
          replaceKeyword
        );
        sourceObjDict[sourceKey] = newSourceObj;
        if (
          state.currentSourceObject.primaryKey === sourceKey ||
          !state.currentSourceObject.hasOwnProperty('primaryKey')
        ) {
          newCurrentSourceObj = newSourceObj;
        }
      });

      if (state.currentSourceObject.hasOwnProperty('primaryKey')) {
        (window as any).monacoGlobalEditorObject.setValue(
          newCurrentSourceObj.code
        );
      }

      const sourcePosObj = getUpdateSourceObjStorePosition(
        state,
        newCurrentSourceObj.primaryKey
      );

      return {
        ...state,
        modifySourceDict: {
          ...state.modifySourceDict,
          ...sourceObjDict,
        },
        currentSourceObj: {
          ...state.currentSourceObject,
          code: newCurrentSourceObj.code,
        },
        scriptEvent: {
          ...state.scriptEvent,
          [sourcePosObj.formId]: {
            ...state.scriptEvent[sourcePosObj.formId],
            [sourcePosObj.eventKey]: state.scriptEvent[sourcePosObj.formId][
              sourcePosObj.eventKey
            ].map((sourceObj) => {
              if (sourceObj.primaryKey === newCurrentSourceObj.primaryKey) {
                return newCurrentSourceObj;
              } else {
                return sourceObj;
              }
            }),
          },
        },
        sourceTabList: state.sourceTabList.map((sourceObj) => {
          if (sourceObj.primaryKey === newCurrentSourceObj.primaryKey) {
            return newCurrentSourceObj;
          } else {
            return sourceObj;
          }
        }),
      };
    }
  )
);

export function formaEditorReducer(state, action) {
  return _formaEditorReducer(state, action);
}
