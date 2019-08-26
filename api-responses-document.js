import { LitElement, html, css } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@api-components/raml-aware/raml-aware.js';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import '@api-components/api-annotation-document/api-annotation-document.js';
import '@api-components/api-headers-document/api-headers-document.js';
import '@api-components/api-body-document/api-body-document.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-tabs/paper-tab.js';
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
 * @polymer
 * @demo demo/index.html
 * @memberof ApiElements
 * @appliesMixin ApiElements.AmfHelperMixin
 */
export class ApiResponsesDocument extends AmfHelperMixin(LitElement) {
  static get styles() {
    return [
      markdownStyles,
      css`:host {
        display: block;
        font-size: var(--arc-font-body1-font-size);
        font-weight: var(--arc-font-body1-font-weight);
        line-height: var(--arc-font-body1-line-height);
      }

      arc-marked {
        margin-top: 8px;
        padding: 0;
      }

      .no-info {
        font-style: italic;
      }`
    ];
  }

  render() {
    const { _description, _payload, _headers, _hasCustomProperties, aware, selected, codes, _selectedResponse, amf, narrow } = this;
    const hasDescription = !!_description;
    const hasPayload = !!(_payload && _payload.length);
    const hasHeaders = !!(_headers && _headers.length);
    const noDocs = this._computeNoDocs(_hasCustomProperties, hasHeaders, hasPayload, hasDescription);
    return html`
    ${aware ?
      html`<raml-aware @api-changed="${this._apiChangedHandler}" .scope="${aware}"></raml-aware>` : undefined}
    ${codes && codes.length ? html`<paper-tabs .selected="${selected}" @selected-changed="${this._tabsHandler}">
      ${codes.map((item) => html`<paper-tab>${item}</paper-tab>`)}
      </paper-tabs>` : undefined}
    ${_hasCustomProperties ? html`<api-annotation-document .shape="${_selectedResponse}"></api-annotation-document>`:undefined}
    ${_description ? html`<arc-marked .markdown="${_description}">
      <div slot="markdown-html" class="markdown-body"></div>
    </arc-marked>` : undefined}
    ${hasHeaders ? html`<api-headers-document opened .amf="${amf}" .headers="${_headers}"
      ?narrow="${narrow}"></api-headers-document>` : undefined}
    ${hasPayload ? html`<api-body-document .amf="${amf}" .body="${_payload}" ?narrow="${narrow}" opened></api-body-document>` : undefined}
    ${noDocs ? html`<p class="no-info">No description provided</p>` : undefined}`;
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
       narrow: { type: Boolean }
    };
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
    this._codes = this._computeCodes();
    this._selectedResponse = this._computeSelectedResponse();
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
    this._selectedResponse = this._computeSelectedResponse();
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
  }
  __amfChanged() {
    this._codes = this._computeCodes();
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
      const value = this._getValue(item, this.ns.w3.hydra.core + 'statusCode');
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
    const value = this._getValue(item, this.ns.w3.hydra.core + 'statusCode');
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

  _computeNoDocs(hasCustomProperties, hasHeaders, hasPayload, hasDescription) {
    return !(hasCustomProperties || hasHeaders || hasPayload || hasDescription);
  }

  _apiChangedHandler(e) {
    const { value } = e.detail;
    this.amf = value;
  }

  _tabsHandler(e) {
    this.selected = e.detail.value;
  }
}
window.customElements.define('api-responses-document', ApiResponsesDocument);
