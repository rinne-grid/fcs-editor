export interface FormaFormObject {
  formId?: string;
  localeId?: string;
  formName?: string;
  versionNo?: string;
  templateFlag?: string;
  globalTplFlag?: string;
  jsonFilePath?: string;
}

export interface FormaApplicationObject {
  applicationId?: string;
  localeId?: string;
  applicationName?: string;
  notes?: string;
  targetLocale?: string;
  applicationType?: string;
  companyAdminFlag?: string;
  versionNo?: string;
  listViewType?: string;
  formObjectList?: FormaFormObject[];
  zipFileExtractPath?: string;
}

export interface FormaCustomScriptObject {
  code?: string;
  note?: string;
  itemId?: string;
  jsonStoreKey?: string;
  primaryKey?: string;
  conditionExpression?: string;
  virtualName?: string;
  formId?: string;
  scriptType?: string;
}

export interface FormaCustomScriptCategoryObject {
  initEvent?: FormaCustomScriptObject[];
  itemEvent?: FormaCustomScriptObject[];
  scriptItem?: FormaCustomScriptObject[];
}

export interface FormaStoreData {
  formaAppObj?: any;
  formaFormJsonList?: any;
  scriptEvent?: any;
  currentSourceObject?: any;
  currentSourceKey?: string;
  sourceTabList?: any;
  currentSourceTabIndex?: any;
  fallbackSourceTabIndex?: any;
  fallbackSourceKey?: any;
  modifySourceDict?: any;
  backgroundSourceCode?: any;
  backgroundExplainText?: any;
  backgroundCondition?: any;
  dialogSearchResult?: any;
}


export interface FormaActionSettingObject {
  actionType?: string;
  conditionExpression?: string;
  customScript?: string;
  errHandling?: string;
  note?: string;
}

export interface SourceStorePositionObject {
  formId?: string;
  eventKey?: string;
  index?: number;
}
