import { fixture, assert, nextFrame, aTimeout } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-responses-document.js';

describe('<api-responses-document>', function() {
  async function basicFixture() {
    return (await fixture(`<api-responses-document></api-responses-document>`));
  }

  async function awareFixture() {
    return (await fixture(`<api-responses-document aware="test"></api-responses-document>`));
  }

  function getResponseModel(element, endpointPath, methodIndex) {
    const webapi = element._computeWebApi(element.amf);
    const endpoint = element._computeEndpointByPath(webapi, endpointPath);
    const opKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.supportedOperation);
    const method = element._ensureArray(endpoint[opKey])[methodIndex];
    return element._computeReturns(method);
  }

  [
    ['Full model', false],
    ['Compact model', true]
  ]
  .forEach((item) => {
    describe(item[0], () => {
      describe('Basic', () => {
        it('Adds raml-aware to the DOM if aware is set', async () => {
          const element = await awareFixture();
          await nextFrame();
          const node = element.shadowRoot.querySelector('raml-aware');
          assert.ok(node);
        });

        it('reads amf model from the aware', async () => {
          const element = await awareFixture();
          await nextFrame();
          const aware = document.createElement('raml-aware');
          aware.scope = 'test';
          aware.api = [{}];
          assert.deepEqual(element.amf, [{}]);
        });

        it('raml-aware is not in the DOM by default', async () => {
          const element = await basicFixture();
          await nextFrame();
          const node = element.shadowRoot.querySelector('raml-aware');
          assert.notOk(node);
        });

        it('selected is undefined by default', async () => {
          const element = await basicFixture();
          await nextFrame();
          assert.isUndefined(element.selected);
        });

        it('api-annotation-document is not in the DOM', async () => {
          const element = await basicFixture();
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-annotation-document');
          assert.notOk(node);
        });

        it('arc-marked is not in the DOM', async () => {
          const element = await basicFixture();
          await nextFrame();
          const node = element.shadowRoot.querySelector('arc-marked');
          assert.notOk(node);
        });

        it('api-headers-document is not in the DOM', async () => {
          const element = await basicFixture();
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-headers-document');
          assert.notOk(node);
        });

        it('api-body-document is not in the DOM', async () => {
          const element = await basicFixture();
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-body-document');
          assert.notOk(node);
        });
      });

      describe('Fully defined response', () => {
        let element;
        beforeEach(async () => {
          const amf = await AmfLoader.load(item[1]);
          element = await basicFixture();
          element.amf = amf;
          element.returns = getResponseModel(element, '/people', 2);
          await aTimeout();
        });

        it('is accessible', async () => {
          await assert.isAccessible(element, {
            // this is to be styled in final application.
            // also, there's some issue with the test, the contrast ration is
            // ok with defaults.
            ignoredRules: ['color-contrast']
          });
        });

        it('Codes are computed in order', () => {
          assert.deepEqual(element._codes, ['200', '204', '400']);
        });

        it('Codes are rendered', async () => {
          await nextFrame();
          const nodes = element.shadowRoot.querySelectorAll('anypoint-tabs anypoint-tab');
          assert.lengthOf(nodes, 3,  'has 3 tabs');
          assert.equal(nodes[0].innerText.trim(), '200',  '200 status is rendered');
          assert.equal(nodes[1].innerText.trim(), '204',  '204 status is rendered');
          assert.equal(nodes[2].innerText.trim(), '400',  '400 status is rendered');
        });

        it('selected is computed', () => {
          assert.deepEqual(element.selected, 0);
        });

        it('selectedResponse is computed', () => {
          const response = element._selectedResponse;
          assert.typeOf(response, 'object', 'selectedResponse is an object');
          const status = element._getValue(response, element.ns.aml.vocabularies.core.name);
          assert.equal(status, '200', 'Computed correct response');
        });

        it('Description is rendered', async () => {
          assert.typeOf(element._description, 'string', '_description is computed');
          await nextFrame();
          const node = element.shadowRoot.querySelector('arc-marked');
          assert.ok(node);
        });

        it('Annotations are rendered', async () => {
          assert.isTrue(element._hasCustomProperties, '_hasCustomProperties is computed');
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-annotation-document');
          assert.ok(node);
        });

        it('Headers are rendered', async () => {
          assert.typeOf(element._headers, 'array', '_headers is computed');
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-headers-document');
          assert.ok(node);
        });

        it('Payload is rendered', async () => {
          assert.typeOf(element._payload, 'array', '_payload is computed');
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-body-document');
          assert.ok(node);
        });
      });

      describe('Partially defined response', () => {
        let element;
        beforeEach(async () => {
          const amf = await AmfLoader.load(item[1]);
          element = await basicFixture();
          element.amf = amf;
          element.returns = getResponseModel(element, '/people', 2);
          await aTimeout();
        });

        it('selectedResponse is computed', () => {
          element.selected = 2;
          const response = element._selectedResponse;
          assert.typeOf(response, 'object', 'selectedResponse is an object');
          const status = element._getValue(response, element.ns.aml.vocabularies.core.name);
          assert.equal(status, 400);
        });

        it('Description is rendered', async () => {
          element.selected = 2;
          assert.typeOf(element._description, 'string', '_description is computed');
          await nextFrame();
          const node = element.shadowRoot.querySelector('arc-marked');
          assert.ok(node);
        });

        it('Annotations are not rendered', async () => {
          element.selected = 2;
          assert.isFalse(element._hasCustomProperties, '_hasCustomProperties is computed');
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-annotation-document');
          assert.notOk(node);
        });

        it('Headers are not rendered', async () => {
          element.selected = 2;
          assert.isUndefined(element._headers, '_headers is computed');
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-headers-document');
          assert.notOk(node);
        });

        it('Payload is rendered', async () => {
          element.selected = 2;
          assert.typeOf(element._payload, 'array', '_payload is computed');
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-body-document');
          assert.ok(node);
        });
      });

      describe('Empty response', () => {
        let element;
        beforeEach(async () => {
          const amf = await AmfLoader.load(item[1]);
          element = await basicFixture();
          element.amf = amf;
          element.returns = getResponseModel(element, '/no-desc', 0);
          await aTimeout();
        });

        it('_description is not computed', () => {
          assert.isUndefined(element._description);
        });

        it('_payload is not computed', () => {
          assert.isUndefined(element._payload);
        });

        it('_headers is not computed', () => {
          assert.isUndefined(element._headers);
        });

        it('hasCustomProperties is computed', () => {
          assert.isFalse(element._hasCustomProperties);
        });

        it('no docs info is rendered', () => {
          const node = element.shadowRoot.querySelector('.no-info');
          assert.ok(node);
        });

        it('No info message is rendered', async () => {
          await nextFrame();
          const node = element.shadowRoot.querySelector('.no-info');
          assert.ok(node);
        });
      });
    });
  });
});
