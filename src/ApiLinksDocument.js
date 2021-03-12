import { LitElement, html } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin';
import markdownStyles from '@advanced-rest-client/markdown-styles';
import elementStyles from './LinksStyles.js';

export class ApiLinksDocument extends AmfHelperMixin(LitElement) {
  get styles() {
    return [markdownStyles, elementStyles];
  }

  static get properties() {
    return {
      links: { type: Array }
    };
  }

  render() {
    const { links, styles } = this;
    if (!links || !links.length) {
      return '';
    }
    return html`
    <style>${styles}</style>
    <div class="links-header" role="heading" aria-level="2">Links</div>
    ${links.map((link) => this._linkTemplate(link))}
    `;
  }

  _linkTemplate(link) {
    const name = this._getValue(link, this.ns.aml.vocabularies.core.name);
    return html`
    <div class="link-header">${name}</div>
    ${this._linkOperationTemplate(link)}
    <div slot="markdown-html">
      ${this._mappingsTemplate(link)}
    </div>
    `;
  }

  _linkOperationTemplate(link) {
    const opId = this._getValue(link, this.ns.aml.vocabularies.apiContract.operationId);
    if (!opId) {
      return '';
    }
    return html`
    <div class="operation-id">
      <span class="label">Operation ID:</span>
      <span class="operation-name">${opId}</span>
    </div>
    `;
  }

  _mappingsTemplate(link) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.mapping);
    const mappings = this._ensureArray(link[key]);
    if (!mappings) {
      return '';
    }
    return html`
    <table class="mapping-table">
      <tr>
        <th>Variable</th>
        <th>Expression</th>
      </tr>
      ${mappings.map((mapping) => this._mappingTemplate(mapping))}
    </table>
    `;
  }

  _mappingTemplate(mapping) {
    const exp = this._getValue(mapping, this.ns.aml.vocabularies.apiContract.linkExpression)
    const vars = this._getValue(mapping, this.ns.aml.vocabularies.apiContract.templateVariable)
    return html`
    <tr>
      <td>${vars}</td>
      <td>${exp}</td>
    </tr>
    `;
  }
}
