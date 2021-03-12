import { CSSResult, LitElement, TemplateResult } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin';

export declare class ApiLinksDocument extends AmfHelperMixin(LitElement) {
  get styles(): CSSResult;
  links: any[];
  render(): TemplateResult;
  _linkTemplate(link: any): TemplateResult;
  _linkOperationTemplate(link: any): TemplateResult|string;
  _mappingsTemplate(link: any): TemplateResult|string;
  _mappingTemplate(mapping: any): TemplateResult;
}
