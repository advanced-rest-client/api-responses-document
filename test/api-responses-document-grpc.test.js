import { fixture, assert, nextFrame, aTimeout, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-responses-document.js';

/** @typedef {import('..').ApiResponsesDocument} ApiResponsesDocument */

describe('ApiResponsesDocument - gRPC support', () => {
  /** 
   * @returns {Promise<ApiResponsesDocument>}
   */
  async function basicFixture() {
    return fixture(html`<api-responses-document></api-responses-document>`);
  }

  /**
   * @param {any} amf
   * @param {any} returns
   * @param {any} endpoint
   * @returns {Promise<ApiResponsesDocument>}
   */
  async function modelFixture(amf, returns, endpoint) {
    return fixture(html`<api-responses-document
      .amf="${amf}"
      .returns="${returns}"
      .endpoint="${endpoint}"
    ></api-responses-document>`);
  }

  // Only test with full model since grpc-test-compact.json doesn't exist
  [
    ['Full model', false]
  ]
  .forEach(([label, compact]) => {
    describe(label, () => {
      describe('gRPC endpoint detection', () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load(compact, 'grpc-test');
        });

        beforeEach(async () => {
          element = await basicFixture();
          element.amf = amf;
        });

        it('detects gRPC endpoint', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, 'Greeter');
          const returns = AmfLoader.responseModel(amf, 'Greeter', 'post');
          element.endpoint = endpoint;
          element.returns = returns;
          await aTimeout();

          assert.isTrue(element._isGrpcEndpoint(endpoint));
        });

        it('renders gRPC response with correct CSS class', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, 'Greeter');
          const returns = AmfLoader.responseModel(amf, 'Greeter', 'post');
          element.endpoint = endpoint;
          element.returns = returns;
          await nextFrame();

          const responseDiv = element.shadowRoot.querySelector('.grpc-response');
          assert.ok(responseDiv, 'gRPC response div exists');
          assert.isTrue(responseDiv.classList.contains('method-response'));
        });
      });

      describe('gRPC status code handling', () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load(compact, 'grpc-test');
        });

        beforeEach(async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, 'Greeter');
          const returns = AmfLoader.responseModel(amf, 'Greeter', 'post');
          element = await modelFixture(amf, returns, endpoint);
          await aTimeout();
        });

        it('computes "success" code for gRPC empty status code', () => {
          assert.typeOf(element._codes, 'array');
          assert.include(element._codes, 'success', 'Contains success code');
        });

        it('selects first response by default', () => {
          assert.equal(element.selected, 0);
        });

        it('computes selectedResponse correctly', () => {
          assert.typeOf(element._selectedResponse, 'object');
          assert.ok(element._selectedResponse);
        });

        it('matches "success" status to empty status code', () => {
          const response = element.returns[0];
          assert.isTrue(element._statusMatches(response, 'success'));
        });
      });

      describe('gRPC tabs behavior', () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load(compact, 'grpc-test');
        });

        beforeEach(async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, 'Greeter');
          const returns = AmfLoader.responseModel(amf, 'Greeter', 'post');
          element = await modelFixture(amf, returns, endpoint);
          await nextFrame();
        });

        it('does not render status code tabs for gRPC', () => {
          const tabs = element.shadowRoot.querySelector('anypoint-tabs');
          assert.notOk(tabs, 'No tabs rendered for gRPC endpoint');
        });

        it('does not render codes selector for gRPC', () => {
          const selector = element.shadowRoot.querySelector('.codes-selector');
          assert.notOk(selector, 'No codes selector rendered');
        });
      });

      describe('gRPC response content rendering', () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load(compact, 'grpc-test');
        });

        beforeEach(async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, 'Greeter');
          const returns = AmfLoader.responseModel(amf, 'Greeter', 'post');
          element = await modelFixture(amf, returns, endpoint);
          await aTimeout();
        });

        it('renders payload for gRPC response', () => {
          assert.typeOf(element._payload, 'array');
          assert.isTrue(element._payload.length > 0);
        });

        it('renders api-body-document for gRPC', async () => {
          await nextFrame();
          const bodyDoc = element.shadowRoot.querySelector('api-body-document');
          assert.ok(bodyDoc, 'api-body-document is rendered');
        });

        it('passes endpoint to api-body-document', async () => {
          await nextFrame();
          const bodyDoc = element.shadowRoot.querySelector('api-body-document');
          assert.ok(bodyDoc.endpoint, 'endpoint is passed to body document');
        });

        it('sets renderReadOnly property on api-body-document', async () => {
          await nextFrame();
          const bodyDoc = element.shadowRoot.querySelector('api-body-document');
          assert.isTrue(bodyDoc.renderReadOnly, 'renderReadOnly is set to true');
        });
      });

      describe('Multiple gRPC operations', () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load(compact, 'grpc-test');
        });

        it('handles post method (SayHello1)', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, 'Greeter');
          const returns = AmfLoader.responseModel(amf, 'Greeter', 'post');
          element = await modelFixture(amf, returns, endpoint);
          await aTimeout();

          assert.ok(element._selectedResponse);
          assert.typeOf(element._payload, 'array');
        });

        it('handles publish method (SayHello2)', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, 'Greeter');
          const returns = AmfLoader.responseModel(amf, 'Greeter', 'publish');
          element = await modelFixture(amf, returns, endpoint);
          await aTimeout();

          assert.ok(element._selectedResponse);
          assert.typeOf(element._payload, 'array');
        });

        it('handles subscribe method (SayHello3)', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, 'Greeter');
          const returns = AmfLoader.responseModel(amf, 'Greeter', 'subscribe');
          element = await modelFixture(amf, returns, endpoint);
          await aTimeout();

          assert.ok(element._selectedResponse);
          assert.typeOf(element._payload, 'array');
        });

        it('handles pubsub method (SayHello4)', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, 'Greeter');
          const returns = AmfLoader.responseModel(amf, 'Greeter', 'pubsub');
          element = await modelFixture(amf, returns, endpoint);
          await aTimeout();

          assert.ok(element._selectedResponse);
          assert.typeOf(element._payload, 'array');
        });
      });

      describe('gRPC media types', () => {
        let amf;
        let element;

        before(async () => {
          amf = await AmfLoader.load(compact, 'grpc-test');
        });

        beforeEach(async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, 'Greeter');
          const returns = AmfLoader.responseModel(amf, 'Greeter', 'post');
          element = await modelFixture(amf, returns, endpoint);
          await aTimeout();
        });

        it('handles application/protobuf media type', () => {
          assert.ok(element._payload);
          const payload = element._payload[0];
          const mediaType = element._getValue(payload, element.ns.aml.vocabularies.core.mediaType);
          assert.equal(mediaType, 'application/protobuf');
        });
      });

      describe('gRPC vs REST endpoints', () => {
        let grpcAmf;
        let restAmf;

        before(async () => {
          grpcAmf = await AmfLoader.load(compact, 'grpc-test');
          restAmf = await AmfLoader.load(compact, 'demo-api');
        });

        it('differentiates gRPC from REST endpoints', async () => {
          const grpcEndpoint = AmfLoader.lookupEndpoint(grpcAmf, 'Greeter');
          const restEndpoint = AmfLoader.lookupEndpoint(restAmf, '/people');

          const grpcElement = await basicFixture();
          grpcElement.amf = grpcAmf;
          
          const restElement = await basicFixture();
          restElement.amf = restAmf;

          assert.isTrue(grpcElement._isGrpcEndpoint(grpcEndpoint), 'gRPC endpoint detected');
          assert.isFalse(restElement._isGrpcEndpoint(restEndpoint), 'REST endpoint not detected as gRPC');
        });

        it('renders tabs for REST but not for gRPC', async () => {
          const grpcEndpoint = AmfLoader.lookupEndpoint(grpcAmf, 'Greeter');
          const grpcReturns = AmfLoader.responseModel(grpcAmf, 'Greeter', 'post');
          const grpcElement = await modelFixture(grpcAmf, grpcReturns, grpcEndpoint);
          await nextFrame();

          const restEndpoint = AmfLoader.lookupEndpoint(restAmf, '/people');
          const restReturns = AmfLoader.responseModel(restAmf, '/people', 'put');
          const restElement = await modelFixture(restAmf, restReturns, restEndpoint);
          await nextFrame();

          const grpcTabs = grpcElement.shadowRoot.querySelector('anypoint-tabs');
          const restTabs = restElement.shadowRoot.querySelector('anypoint-tabs');

          assert.notOk(grpcTabs, 'No tabs for gRPC');
          assert.ok(restTabs, 'Tabs present for REST');
        });
      });
    });
  });

  describe('a11y for gRPC', () => {
    let grpcAmf;

    before(async () => {
      // Use full model only (compact=false)
      grpcAmf = await AmfLoader.load(false, 'grpc-test');
    });

    it('is accessible with gRPC model data', async () => {
      const endpoint = AmfLoader.lookupEndpoint(grpcAmf, 'Greeter');
      const returns = AmfLoader.responseModel(grpcAmf, 'Greeter', 'post');
      const element = await fixture(html`<api-responses-document
        .amf="${grpcAmf}"
        .returns="${returns}"
        .endpoint="${endpoint}"
      ></api-responses-document>`);
      
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast', 'button-name', 'aria-command-name', 'aria-required-children']
      });
    });
  });
});

