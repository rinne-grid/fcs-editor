import { FormaCustomScriptObject } from '../../../../app/interfaces/FormaApplicationObject';

export interface SourceNode {
  name: string;
  children?: SourceNode[];
  type?: string;
  customScriptKey?: string;
  customScriptObject?: FormaCustomScriptObject;
}
