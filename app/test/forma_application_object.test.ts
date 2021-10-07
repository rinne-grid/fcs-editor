import {
  FormaApplicationObject,
  FormaCustomScriptObject,
} from '../interfaces/FormaApplicationObject';
import {
  loadFormaApplicationObject,
  loadFormaCustomScriptActionSetting,
  loadFormaCustomScriptInitEvent,
  loadFormaFormObject,
} from '../function/forma_application_parser';

async function factoryAppObject() {
  return loadFormaApplicationObject(
    `./test/resource/rngd_sample_dl_file_02.zip`
  );
}

// Forma定義のzipファイルからアプリケーション情報をよみだせるかどうか
test('load_forma_application_object', async () => {
  const formaAppObj: FormaApplicationObject = await factoryAppObject();

  expect(formaAppObj.applicationId).not.toBe(undefined);
  expect(formaAppObj.formObjectList[0].formId).not.toBe(undefined);
});

// FormaApplicationObject.FormaFormObjectを元に各フォーム専用データが取得できるかどうか
test('load_forma_form_object', async () => {
  const formaAppObj: FormaApplicationObject = await factoryAppObject();
  const formaFormJsonList = loadFormaFormObject(formaAppObj);
  expect(formaFormJsonList[0]).not.toBe(undefined);
});

// フォームのカスタムスクリプトが取得できるかどうか
test('load_forma_custom_script_event', async () => {
  const formaAppObj: FormaApplicationObject = await factoryAppObject();

  // 複数フォームのJSON情報 {formId: "", formData: ""}
  const formaFormJsonList = loadFormaFormObject(formaAppObj);

  const scriptEvent = {};

  formaFormJsonList.forEach((formObj) => {
    const scriptEventInit: FormaCustomScriptObject[] =
      loadFormaCustomScriptInitEvent(formObj.formId, formObj.formData);
    // console.log(scriptEventInit[0]);
    scriptEvent[formObj.formId] = {};
    scriptEvent[formObj.formId]['init'] = scriptEventInit;

    const scriptActionEvent: FormaCustomScriptObject[] =
      loadFormaCustomScriptActionSetting(formObj.formId, formObj.formData);

    scriptEvent[formObj.formId]['action'] = scriptActionEvent;
    if (scriptEvent[formObj.formId]['action'].length > 0) {
      scriptEvent[formObj.formId]['action'].forEach((code) => {
        console.debug(code);
      });
    }
  });
  expect(Object.keys(scriptEvent).length).toBeGreaterThan(0);
});

test('load_forma_action_setting_list', async () => {
  const formaAppObj: FormaApplicationObject = await factoryAppObject();
  const formaFormJsonList = loadFormaFormObject(formaAppObj);
  let scriptActionEvent: FormaCustomScriptObject[];
  formaFormJsonList.forEach((formObj) => {
    scriptActionEvent = loadFormaCustomScriptActionSetting(
      formObj.formId,
      formObj.formData
    );
  });
  console.debug(scriptActionEvent);
});
