import {
  clearFormaDefinition,
  loadFormaDefinition,
} from '../store/forma-editor.actions';

export function uploadZipFile(event, electronService, store) {
  const file: File = event.target.files[0];
  if (file) {
  }
  electronService.ipcRenderer
    .invoke('load_and_unzip', file.path)
    .then((data) => {
      store.dispatch(clearFormaDefinition());
      store.dispatch(loadFormaDefinition({ formaStoreData: data }));
    })
    .catch((error) => {
    });
}
