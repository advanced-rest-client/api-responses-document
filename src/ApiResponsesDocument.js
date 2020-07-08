import { LitElement, html } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@api-components/raml-aware/raml-aware.js';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import '@api-components/api-annotation-document/api-annotation-document.js';
import '@api-components/api-headers-document/api-headers-document.js';
import '@api-components/api-body-document/api-body-document.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tabs.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tab.js';
import styles from './Styles.js';
import '../api-links-document.js';
/**
 * `api-responses-document`
 *
 * A documentation for method responses based on AMF model.
 *
 * It renders a selector of available status codes in the responses array.
 * This is computed from `returns` property which must be an array
 * as a value of AMF's `http://www.w3.org/ns/hydra/core#returns` property
 * of the `method` shape.
 *
 * Status codes are sorted before rendering.
 *
 * In the documentation part it renders annotations (AMF custom proeprties)
 * added to the response, headers and body.
 *
 *
 * @customElement
 * @demo demo/index.html
 * @appliesMixin ApiElements.AmfHelperMixin
 */
export class ApiResponsesDocument extends AmfHelperMixin(LitElement) {
  get styles() {
    return [
      markdownStyles,
      styles,
    ];
  }

  static get properties() {
    return {
      /**
       * `raml-aware` scope property to use.
       */
      aware: { type: String },
      /**
       * The `returns` property of the method AMF model.
       *
       * @type {Array<Object>}
       */
      returns: { type: Array },
      /**
       * Computed value of status codes from `returns` property.
       *
       * @type {Array<String>}
       */
      _codes: { type: Array },
      /**
       * Selected index of a status code from the selector.
       */
      selected: { type: Number },
      /**
       * Currently selected response object as AMF model os a type of
       * `http://raml.org/vocabularies/http#Response`
       */
      _selectedResponse: { type: Object },
      /**
       * Computed value of method description from `method` property.
       */
      _description: { type: String },
      /**
       * Computed value of AMF payload definition from `expects`
       * property.
       */
      _payload: { type: Object },
      /**
       * Computed value of AMF payload definition from `expects`
       * property.
       */
      _headers: { type: Object },
      /**
       * Computed value from current `_selectedResponse`. True if the model
       * contains custom properties (annotations in RAML).
       */
      _hasCustomProperties: { type: Boolean },
      /**
       * Set to render a mobile friendly view.
       */
       narrow: { type: Boolean },
       /**
       * @deprecated Use `compatibility` instead
       */
      legacy: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * When enabled it renders external types as links and dispatches
       * `api-navigation-selection-changed` when clicked.
       */
      graph: { type: Boolean },
      /**
       * A computed list of OAS' Links in currently selected response.
       * @type {Array<Object>|undefined}
       */
      links: { type: Array },
    };
  }

  get legacy() {
    return this._compatibility;
  }

  set legacy(value) {
    this.compatibility = value;
  }

  get returns() {
    return this._returns;
  }

  set returns(value) {
    const old = this._returns;
    if (old === value) {
      return;
    }
    this._returns = value;
    this.requestUpdate('returns', old);
    this.__amfChanged();
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    const old = this._selected;
    if (old === value) {
      return;
    }
    this._selected = value;
    this.requestUpdate('selected', old);
    this._selectedResponse = this._computeSelectedResponse();
  }
  /**
   * List of recognized codes.
   * @return {Array<String>}
   */
  get codes() {
    return this._codes;
  }

  get _codes() {
    return this.__codes;
  }

  set _codes(value) {
    const old = this.__codes;
    if (old === value) {
      return;
    }
    this.__codes = value;
    this._codesChanged(value);
    this.requestUpdate('_codes', old);
    this.dispatchEvent(new CustomEvent('codes-changed'), {
      detail: {
        value
      }
    });
  }

  get _selectedResponse() {
    return this.__selectedResponse;
  }

  set _selectedResponse(value) {
    const old = this.__selectedResponse;
    if (old === value) {
      return;
    }
    this.__selectedResponse = value;
    this.requestUpdate('_selectedResponse', old);
    this._description = this._computeDescription(value);
    this._payload = this._computePayload(value);
    this._headers = this._computeHeaders(value);
    this._hasCustomProperties = this._computeHasCustomProperties(value);
    this.links = this._computeLinks(value);
  }

  get hasPayload() {
    const {
      _payload,
    } = this;
    return !!(_payload && _payload.length);
  }

  get hasHeaders() {
    const {
      _headers,
    } = this;
    return !!(_headers && _headers.length);
  }

  get hasDescription() {
    const {
      _description,
    } = this;
    return !!_description;
  }

  get noDocumentation() {
    const {
      hasDescription,
      hasPayload,
      hasHeaders,
      _hasCustomProperties,
    } = this;
    return !(_hasCustomProperties || hasHeaders || hasPayload || hasDescription);
  }

  async __amfChanged() {
    await this.updateComplete;
    this._codes = this._computeCodes();
    this._selectedResponse = this._computeSelectedResponse();
  }
  /**
   * Computes list of status codes for the selector.
   *
   * @return {Array<String>}
   */
  _computeCodes() {
    const { returns } = this;
    if (!returns || !returns.length) {
      return;
    }
    const codes = [];
    returns.forEach((item) => {
      const value = this._getValue(item, this.ns.aml.vocabularies.apiContract.statusCode);
      if (value) {
        codes.push(value);
      }
    });
    codes.sort();
    return codes;
  }
  /**
   * Computes value for `_selectedResponse` property.
   * Codes are sorted so it has to match status code with entry in returns
   * array
   * @return {Object}
   */
  _computeSelectedResponse() {
    const { selected, _codes, returns } = this;
    if (!returns || !_codes || (!selected && selected !== 0)) {
      return;
    }
    const status = _codes[selected];
    return returns.find((item) => this._statusMatches(item, status));
  }
  /**
   * Checks if given `item` matches `statusCode`
   *
   * @param {Object} item Response AMF model
   * @param {String} status Status code as string
   * @return {Boolean}
   */
  _statusMatches(item, status) {
    if (!item) {
      return false;
    }
    const value = this._getValue(item, this.ns.aml.vocabularies.apiContract.statusCode);
    return value === status;
  }
  /**
   * Sets `selected` 0 when codes changes.
   * It only sets selection if there's actually a value to render.
   * It prohibits from performing additional computations for nothing.
   *
   * @param {?Array} codes
   */
  _codesChanged(codes) {
    if (codes && codes.length) {
      this.selected = 0;
    }
  }

  _apiChangedHandler(e) {
    const { value } = e.detail;
    this.amf = value;
  }

  _tabsHandler(e) {
    this.selected = e.detail.value;
  }

  _computeLinks(response) {
    if (!response) {
      return null;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.link);
    return this._ensureArray(response[key]);
  }

  render() {
    return html`<style>${this.styles}</style>
    ${this._awareTemplate()}
    ${this._codesSelectorTemplate()}
    ${this._annotationsTemplate()}
    ${this._descriptionTemplate()}
    ${this._headersTemplate()}
    ${this._payloadTemplate()}
    ${this._linksTemplate()}
    ${this.noDocumentation ? html`<p class="no-info">No description provided</p>` : ''}`;
  }

  _codesSelectorTemplate() {
    const { codes, selected } = this;
    if (!codes || !codes.length) {
      return '';
    }
    return html`
    <div class="codes-selector">
      <anypoint-tabs
        scrollable
        .selected="${selected}"
        ?compatibility="${this.compatibility}"
        @selected-changed="${this._tabsHandler}">
        ${codes.map((item) => html`<anypoint-tab>${item}</anypoint-tab>`)}
      </anypoint-tabs>
    </div>`;
  }

  _awareTemplate() {
    const {
      aware,
    } = this;
    if (!aware) {
      return '';
    }
    return html`<raml-aware @api-changed="${this._apiChangedHandler}" .scope="${aware}"></raml-aware>`;
  }

  _annotationsTemplate() {
    const {
      _hasCustomProperties,
      compatibility,
      _selectedResponse,
    } = this;
    if (!_hasCustomProperties) {
      return '';
    }
    return html`<api-annotation-document
      ?compatibility="${compatibility}"
      .shape="${_selectedResponse}"
    ></api-annotation-document>`;
  }

  _descriptionTemplate() {
    const {
      _description,
    } = this;
    if (!_description) {
      return '';
    }
    return html`<arc-marked .markdown="${_description}" sanitize>
      <div slot="markdown-html" class="markdown-body"></div>
    </arc-marked>`;
  }

  _headersTemplate() {
    const {
      _headers,
      amf,
      narrow,
      compatibility,
      graph
    } = this;
    const hasHeaders = !!(_headers && _headers.length);
    if (!hasHeaders) {
      return '';
    }
    return html`<api-headers-document
      opened
      .amf="${amf}"
      .headers="${_headers}"
      ?compatibility="${compatibility}"
      ?narrow="${narrow}"
      ?graph="${graph}"
    ></api-headers-document>`;
  }

  _payloadTemplate() {
    const {
      _payload,
      amf,
      narrow,
      compatibility,
      graph
    } = this;
    const hasPayload = !!(_payload && _payload.length);
    if (!hasPayload) {
      return '';
    }
    return html`<api-body-document
      .amf="${amf}"
      .body="${_payload}"
      ?narrow="${narrow}"
      ?compatibility="${compatibility}"
      ?graph="${graph}"
      renderreadonly
      opened></api-body-document>`
  }

  _linksTemplate() {
    const { links, amf } = this;
    if (!links || !links.length) {
      return '';
    }
    return html`
    <api-links-document
      .amf="${amf}"
      .links="${links}"
    ></api-links-document>
    `;
  }
}
