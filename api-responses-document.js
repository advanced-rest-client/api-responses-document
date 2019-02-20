import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@api-components/raml-aware/raml-aware.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@polymer/marked-element/marked-element.js';
import '@api-components/api-annotation-document/api-annotation-document.js';
import '@api-components/api-headers-document/api-headers-document.js';
import '@api-components/api-body-document/api-body-document.js';
import {AmfHelperMixin} from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-tabs/paper-tab.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
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
 * ## Styling
 *
 * `<api-responses-document>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--api-responses-document` | Mixin applied to this elment | `{}`
 * `--no-info-message` | Theme mixin, applied to empty info message | `{}`
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof ApiElements
 * @appliesMixin ApiElements.AmfHelperMixin
 */
export class ApiResponsesDocument extends AmfHelperMixin(PolymerElement) {
  static get template() {
    return html`
    <style include="markdown-styles"></style>
    <style>
    :host {
      display: block;
      @apply --arc-font-body1;
      @apply --api-responses-document;
    }

    marked-element {
      margin-top: 8px;
    }

    .no-info {
      @apply --no-info-message;
    }
    </style>
    <template is="dom-if" if="[[aware]]">
      <raml-aware raml="{{amfModel}}" scope="[[aware]]"></raml-aware>
    </template>
    <paper-tabs selected="{{selected}}">
      <template is="dom-repeat" items="[[codes]]">
        <paper-tab>[[item]]</paper-tab>
      </template>
    </paper-tabs>
    <template is="dom-if" if="[[hasCustomProperties]]">
      <api-annotation-document shape="[[selectedResponse]]"></api-annotation-document>
    </template>
    <template is="dom-if" if="[[description]]">
      <marked-element markdown="[[description]]">
        <div slot="markdown-html" class="markdown-body"></div>
      </marked-element>
    </template>
    <template is="dom-if" if="[[hasHeaders]]">
      <api-headers-document
        opened=""
        amf-model="[[amfModel]]"
        headers="[[headers]]"
        narrow="[[narrow]]"></api-headers-document>
    </template>
    <template is="dom-if" if="[[hasPayload]]">
      <api-body-document amf-model="[[amfModel]]" body="[[payload]]" narrow="[[narrow]]" opened=""></api-body-document>
    </template>
    <template is="dom-if" if="[[noDocs]]">
      <p class="no-info">No description provided</p>
    </template>
`;
  }

  static get is() {
    return 'api-responses-document';
  }
  static get properties() {
    return {
      /**
       * `raml-aware` scope property to use.
       */
      aware: String,
      /**
       * The `returns` property of the method AMF model.
       *
       * @type {Array<Object>}
       */
      returns: Array,
      /**
       * Computed value of status codes from `returns` property.
       *
       * @type {Array<String>}
       */
      codes: {
        type: Array,
        computed: '_computeCodes(returns, amfModel)',
        observer: '_codesChanged'
      },
      /**
       * Selected index of a status code from the selector.
       */
      selected: Number,
      /**
       * Currently selected response object as AMF model os a type of
       * `http://raml.org/vocabularies/http#Response`
       */
      selectedResponse: {
        type: Object,
        computed: '_computeSelectedResponse(selected, codes, returns)'
      },
      /**
       * Computed value of method description from `method` property.
       */
      description: {
        type: String,
        computed: '_computeDescription(selectedResponse)'
      },
      /**
       * Computed value, true if `description` is set.
       */
      hasDescription: {
        type: Boolean,
        computed: '_computeHasStringValue(description)'
      },
      /**
       * Computed value of AMF payload definition from `expects`
       * property.
       */
      payload: {
        type: Object,
        computed: '_computePayload(selectedResponse)'
      },
      /**
       * Computed value, true if `payload` has values.
       */
      hasPayload: {
        type: Boolean,
        computed: '_computeHasArrayValue(payload)'
      },
      /**
       * Computed value of AMF payload definition from `expects`
       * property.
       */
      headers: {
        type: Object,
        computed: '_computeHeaders(selectedResponse)'
      },
      /**
       * Computed value, true if `payload` has values.
       */
      hasHeaders: {
        type: Boolean,
        computed: '_computeHasArrayValue(headers)'
      },
      /**
       * Computed value from current `selectedResponse`. True if the model
       * contains custom properties (annotations in RAML).
       */
      hasCustomProperties: {
        type: Boolean,
        computed: '_computeHasCustomProperties(selectedResponse)'
      },
      /**
       * Computed value, true when a status is defined but does not
       * contain any documentation.
       */
      noDocs: {
        type: Boolean,
        computed: '_computeNoDocs(hasCustomProperties, hasHeaders, hasPayload, hasDescription)'
      },
      /**
       * Set to render a mobile friendly view.
       */
       narrow: Boolean
    };
  }
  /**
   * Computes list of status codes for the selector.
   *
   * @param {Array<Object>} returns Current value of `returns` property
   * @return {Array<String>}
   */
  _computeCodes(returns) {
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
   * Computes value for `selectedResponse` property.
   * Codes are sorted so it has to match status code with entry in returns
   * array
   *
   * @param {Number} selected
   * @param {Array<String>} codes
   * @param {Array} returns
   * @return {Object}
   */
  _computeSelectedResponse(selected, codes, returns) {
    if (!returns || !codes || (!selected && selected !== 0)) {
      return;
    }
    const status = codes[selected];
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
}
window.customElements.define(ApiResponsesDocument.is, ApiResponsesDocument);