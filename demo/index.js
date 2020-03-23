import { html } from 'lit-html';
import { ApiDemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '../api-responses-document.js';


class ApiDemo extends ApiDemoPage {
  constructor() {
    super();
    this.componentName = 'api-responses-document';
    this.renderViewControls = true;

    this.initObservableProperties([
      'compatibility',
      'returns',
    ]);

    this.demoStates = ['Material', 'Anypoint'];
    this._demoStateHandler = this._demoStateHandler.bind(this);
  }

  _demoStateHandler(e) {
    const { value } = e.detail;
    this.compatibility = value === 1;
    if (this.compatibility) {
      document.body.classList.add('anypoint');
    } else {
      document.body.classList.remove('anypoint');
    }
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
    const webApi = this._computeWebApi(this.amf);
    const method = this._computeMethodModel(webApi, selected);
    this.returns = this._computeReturns(method);
    this.hasData = true;
  }

  _apiListTemplate() {
    return [
      ['demo-api', 'Demo API'],
      ['oas-callbacks', 'OAS 3 callbacks']
    ].map(([file, label]) => html`
      <anypoint-item data-src="${file}-compact.json">${label} - compact model</anypoint-item>
      <anypoint-item data-src="${file}.json">${label}</anypoint-item>
    `);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      amf,
      returns,
      narrow,
    } = this;
    return html `
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API response document element with various
        configuration options.
      </p>

      <arc-interactive-demo
        .states="${demoStates}"
        @state-chanegd="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <api-responses-document
          .amf="${amf}"
          .returns="${returns}"
          ?narrow="${narrow}"
          ?compatibility="${compatibility}"
          slot="content"
        ></api-responses-document>
      </arc-interactive-demo>
    </section>`;
  }

  _introductionTemplate() {
    return html `
      <section class="documentation-section">
        <h3>Introduction</h3>
        <p>
          A web component to render documentation for a HTTP response. The view is rendered
          using the AMF data model.
        </p>
      </section>
    `;
  }

  _usageTemplate() {
    return html `
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>API responses document comes with 2 predefied styles:</p>
        <ul>
          <li><b>Material Design</b> (default)</li>
          <li>
            <b>Compatibility</b> - To provide compatibility with Anypoint design, use
            <code>compatibility</code> property
          </li>
        </ul>
      </section>`;
  }

  contentTemplate() {
    return html`
    <h2 class="centered main">API responses document</h2>
    ${this.hasData ?
      this._demoTemplate() :
      html`<p>Select a HTTP method in the navigation to see the demo.</p>`}

      ${this._introductionTemplate()}
      ${this._usageTemplate()}
    `;
  }
}
const instance = new ApiDemo();
instance.render();
window._demo = instance;
