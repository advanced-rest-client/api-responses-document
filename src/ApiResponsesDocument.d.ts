import {LitElement, TemplateResult, CSSResult} from 'lit-element';
import {AmfHelperMixin} from '@api-components/amf-helper-mixin';

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
 * In the documentation part it renders annotations (AMF custom properties)
 * added to the response, headers and body.
 */
export declare class ApiResponsesDocument extends AmfHelperMixin(LitElement) {
  get styles(): CSSResult[];
  /**
   * The `returns` property of the method AMF model.
   */
  returns: any[];

  /**
   * Computed value of status codes from `returns` property.
   */
  _codes: string[]|undefined;
  /**
   * Selected index of a status code from the selector.
   * @attribute
   */
  selected: number;
  /**
   * Currently selected response object as AMF model os a type of
   * `http://raml.org/vocabularies/http#Response`
   */
  _selectedResponse: any;
  /**
   * Computed value of method description from `method` property.
   */
  _description: string|undefined;
   /**
    * Computed value of AMF payload definition from `expects`
    * property.
    */
  _payload: object|undefined;
   /**
    * Computed value of AMF payload definition from `expects`
    * property.
    */
  _headers: object|undefined;
   /**
    * Computed value from current `_selectedResponse`. True if the model
    * contains custom properties (annotations in RAML).
    */
  _hasCustomProperties: boolean;
   /**
    * Set to render a mobile friendly view.
    * @attribute
    */
  narrow: boolean;
  /**
   * @deprecated Use `compatibility` instead.
   * @attribute
   */
  legacy: boolean;
  /**
   * Enables compatibility with Anypoint components.
   * @attribute
   */
   compatibility: boolean;
   /**
    * When enabled it renders external types as links and dispatches
    * `api-navigation-selection-changed` when clicked.
    * @attribute
    */
   graph: boolean;
 
   /**
    * A computed list of OAS' Links in currently selected response.
    */
   links: any[]|undefined;
  
  

  /**
   * List of recognized codes.
   */
  get codes(): string[]|undefined;
  get hasPayload(): boolean;
  get hasHeaders(): boolean;
  get hasDescription(): boolean;
  get noDocumentation(): boolean;

  __amfChanged(): Promise<void>;

  /**
   * Computes list of status codes for the selector.
   */
  _computeCodes(): string[]|undefined;

  /**
   * Computes value for `_selectedResponse` property.
   * Codes are sorted so it has to match status code with entry in returns
   * array
   */
  _computeSelectedResponse(): any|undefined;

  /**
   * Checks if given `item` matches `statusCode`
   *
   * @param item Response AMF model
   * @param status Status code as string
   */
  _statusMatches(item: any, status: string): boolean;

  /**
   * Sets `selected` 0 when codes changes.
   * It only sets selection if there's actually a value to render.
   * It prohibits from performing additional computations for nothing.
   */
  _codesChanged(codes?: any[]): void;
  _tabsHandler(e: Event): void;
  _computeLinks(response: any): any;
  render(): TemplateResult;
  _codesSelectorTemplate(): TemplateResult|string;
  _annotationsTemplate(): TemplateResult|string;
  _descriptionTemplate(): TemplateResult|string;
  _headersTemplate(): TemplateResult|string;
  _payloadTemplate(): TemplateResult|string;
  _linksTemplate(): TemplateResult|string;
}
