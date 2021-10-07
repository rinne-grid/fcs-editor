export interface FormItemList {
  item_id: string;
  item_view_names: any;
  item_type: string;
  item_view_type: any;
  item_exist_dbinput: boolean;
  style: any;
  input_list: any[];
  item_properties: any;
  table_id: string;
}

export interface FormEventSettingList {
  item_id: string;
  event_type: string;
  note: string;
  indicator_flag: boolean;
}

export interface FormEvent {
  event_setting_list: FormEventSettingList[];
  action_setting_list: any[];
  table_event_setting_list: any[];
  table_action_setting_list: any;
  form_action_setting_list: any[];
}

export interface FormRootObject {
  header: any;
  item_list: FormItemList[];
  footer: any;
  event: Event;
  sp_item_list: any[];
}
