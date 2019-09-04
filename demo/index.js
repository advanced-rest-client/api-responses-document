import { html } from 'lit-html';
import { LitElement } from 'lit-element';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import '@api-components/raml-aware/raml-aware.js';
import '@api-components/api-navigation/api-navigation.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '../api-responses-document.js';

import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
class DemoElement extends AmfHelperMixin(LitElement) {}

window.customElements.define('demo-element', DemoElement);
class ApiDemo extends ApiDemoPageBase {
  constructor() {
    super();
    this.hasData = false;
  }

  get hasData() {
    return this._hasData;
  }

  set hasData(value) {
    this._setObservableProperty('hasData', value);
  }

  get returns() {
    return this._returns;
  }

  set returns(value) {
    this._setObservableProperty('returns', value);
  }

  get helper() {
    return document.getElementById('helper');
  }

  _navChanged(e) {
    const { selected, type } = e.detail;
    if (type === 'method') {
      this.setData(selected);
    } else {
      this.hasData = false;
    }
  }

  setData(selected) {
    const helper = this.helper;
    const webApi = helper._computeWebApi(this.amf);
    const method = helper._computeMethodModel(webApi, selected);
    this.returns = helper._computeReturns(method);
    this.hasData = true;
  }

  contentTemplate() {
    const { returns } = this;
    return html`
    <demo-element id="helper" .amf="${this.amf}"></demo-element>
    <raml-aware .api="${this.amf}" scope="model"></raml-aware>
    ${this.hasData ?
      html`<api-responses-document aware="model" .returns="${returns}" ?narrow="${this.narrowActive}"></api-responses-document>` :
      html`<p>Select a HTTP method in the navigation to see the demo.</p>`}
    `;
  }
}
const instance = new ApiDemo();
instance.render();
window._demo = instance;
