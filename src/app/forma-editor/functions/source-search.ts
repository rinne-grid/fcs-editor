import { DialogSearchResult } from '../../../../app/interfaces/DialogSearchResult';
import {
  FormaCustomScriptObject,
  FormaStoreData,
  SourceStorePositionObject,
} from '../../../../app/interfaces/FormaApplicationObject';

/***
 * sourcePrimaryKeyを元に、対象のソースコードオブジェクトを取得します
 *  scriptEvent[formId]["action"][n]
 *  scriptEvent[formId]["init"][n]
 * @param state
 * @param primaryKey
 */
export function getSourceObjByKey(
  state: FormaStoreData,
  primaryKey: string
): FormaCustomScriptObject {
  let sourceObj: FormaCustomScriptObject = {};
  if (state.modifySourceDict.hasOwnProperty(primaryKey)) {
    return state.modifySourceDict[primaryKey];
  }
  // currentSourceKeyから対象のソースコードオブジェクトを取得する
  Object.keys(state.scriptEvent).forEach((formId) => {
    let eventKeyList = Object.keys(state.scriptEvent[formId]);

    for (let i = 0; i < eventKeyList.length; i++) {
      let eventKey = eventKeyList[i];

      for (let source of state.scriptEvent[formId][eventKey]) {
        if (primaryKey === source.primaryKey) {
          sourceObj = source;
          break;
        }
      }
    }
  });
  return sourceObj;
}

/***
 * sourcePrimaryKeyを元に対象ソースのタブインデックスを取得します
 * @param state
 * @param primaryKey
 */
export function getSourceTabListIndex(state, primaryKey) {
  let currentSourceTabIndex = -1;
  for (let i = 0; i < state.sourceTabList.length; i++) {
    if (primaryKey === state.sourceTabList[i].primaryKey) {
      currentSourceTabIndex = i;
      break;
    }
  }
  // primaryKeyを持つデータがsourcetabListに存在しない場合
  if (currentSourceTabIndex === -1) {
    currentSourceTabIndex = state.sourceTabList.length;
  }
  return currentSourceTabIndex;
}

export function getUpdateSourceObjStorePosition(
  state: FormaStoreData,
  sourceKey: string
) {
  const sourcePos: SourceStorePositionObject = {};

  Object.keys(state.scriptEvent).forEach((formId) => {
    let eventKeyList = Object.keys(state.scriptEvent[formId]);

    for (let i = 0; i < eventKeyList.length; i++) {
      let eventKey = eventKeyList[i];
      for (let j = 0; j < state.scriptEvent[formId][eventKey].length; j++) {
        let stateSourceObj = state.scriptEvent[formId][eventKey][j];
        if (sourceKey === stateSourceObj.primaryKey) {
          sourcePos.formId = formId;
          sourcePos.eventKey = eventKey;
          sourcePos.index = j;
          break;
        }
      }
    }
  });

  return sourcePos;
}

export function getSearchModeToRegExp(keyword, isMatchCase, isUseWildCard) {
  let regexpFlag = 'gi';
  let wildCard = '.*';
  if (isMatchCase) {
    regexpFlag = 'g';
  }
  if (!isUseWildCard) {
    wildCard = '';
  }
  const pattern = `${keyword}${wildCard}`;
  return new RegExp(pattern, regexpFlag);
}

/***
 * keyword及び検索モードを元にソースコードを検索し、結果を返します
 * @param state
 * @param keyword
 * @param isMatchCase
 * @param isUseWildCard
 */
export function searchSourceCodeByKeyword(
  state,
  keyword,
  isMatchCase,
  isUseWildCard
) {
  const scriptEventObj = state.scriptEvent;
  // let regexpFlag = 'gi';
  // let wildCard = '.*';
  // if (isMatchCase) {
  //   regexpFlag = 'g';
  // }
  // if (isUseWildCard) {
  //   wildCard = '';
  // }
  // const pattern = `${keyword}${wildCard}`;
  const searchRegExp = getSearchModeToRegExp(
    keyword,
    isMatchCase,
    isUseWildCard
  );
  const searchedKeyDict = {};
  const dialogSearchResultList: DialogSearchResult[] = [];
  // FIXME: N^5 検索方法模索中
  Object.keys(scriptEventObj).forEach((formId) => {
    const eventActionObj = scriptEventObj[formId];
    Object.keys(eventActionObj).forEach((eventKey) => {
      const customScriptList = eventActionObj[eventKey];
      if (Array.isArray(customScriptList)) {
        customScriptList.forEach((script) => {
          if (!searchedKeyDict.hasOwnProperty(script.primaryKey)) {
            const sourceKey = script.primaryKey;
            const scriptObj = getSourceObjByKey(state, sourceKey);
            let result;
            scriptObj.code.split('\n').forEach((codeRow, index) => {
              result = searchRegExp.exec(codeRow);
              if (result) {
                const dialogSearchResult: DialogSearchResult = {
                  sourceCode: scriptObj.code,
                  sourceSnippet: codeRow,
                  sourceName: scriptObj.virtualName,
                  sourcePrimaryKey: scriptObj.primaryKey,
                  rowNumber: index + 1,
                  resultStartIndex: result.index,
                  resultEndIndex: searchRegExp.lastIndex,
                };
                dialogSearchResultList.push(dialogSearchResult);
              }
            });
            searchedKeyDict[script.primaryKey] = true;
          }
        });
      }
    });
  });
  return dialogSearchResultList;
}
