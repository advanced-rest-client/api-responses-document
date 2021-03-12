import { fixture, assert, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-links-document.js';

/** @typedef {import('..').ApiLinksDocument} ApiLinksDocument */

describe('ApiLinksDocument', () => {
  /** 
   * @returns {Promise<ApiLinksDocument>}
   */
  async function modelFixture(amf, links) {
    return fixture(html`<api-links-document
      .amf="${amf}"
      .links="${links}"
    ></api-links-document>`);
  }

  [
    ['Full model', false],
    ['Compact model', true]
  ]
  .forEach(([label, compact]) => {
    describe(label, () => {
      describe('Basic template rendering', () => {
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact, 'oas-callbacks');
        });

        it('does not render anything when no links', async () => {
          const element = await modelFixture(amf, null);
          const node = element.shadowRoot.querySelector('.links-header');
          assert.notOk(node);
        });

        it('renders the section title', async () => {
          const links = AmfLoader.linksModel(amf, '/subscribe', 'post', '200');
          const element = await modelFixture(amf, links);
          const node = element.shadowRoot.querySelector('.links-header');
          assert.ok(node);
        });
      });

      describe('Link title rendering', () => {
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact, 'oas-callbacks');
        });

        it('renders all available links', async () => {
          const links = AmfLoader.linksModel(amf, '/subscribe', 'post', '200');
          const element = await modelFixture(amf, links);
          const nodes = element.shadowRoot.querySelectorAll('.link-header');
          assert.lengthOf(nodes, 2);
        });

        it('links headers have name', async () => {
          const links = AmfLoader.linksModel(amf, '/subscribe', 'post', '200');
          const element = await modelFixture(amf, links);
          const nodes = element.shadowRoot.querySelectorAll('.link-header');
          assert.equal(nodes[0].innerText.trim(), 'unsubscribeOp');
          assert.equal(nodes[1].innerText.trim(), 'otherOp');
        });

        it('renders a single header', async () => {
          const links = AmfLoader.linksModel(amf, '/subscribe', 'post', '402');
          const element = await modelFixture(amf, links);
          const nodes = element.shadowRoot.querySelectorAll('.link-header');
          assert.lengthOf(nodes, 1);
          assert.equal(nodes[0].innerText.trim(), 'paymentUrl');
        });
      });

      describe('Operation id rendering', () => {
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact, 'oas-callbacks');
        });

        it('renders all available operation IDs', async () => {
          const links = AmfLoader.linksModel(amf, '/subscribe', 'post', '200');
          const element = await modelFixture(amf, links);
          const nodes = element.shadowRoot.querySelectorAll('.operation-id');
          assert.lengthOf(nodes, 1);
        });

        it('operation ID has a name', async () => {
          const links = AmfLoader.linksModel(amf, '/subscribe', 'post', '200');
          const element = await modelFixture(amf, links);
          const node = element.shadowRoot.querySelector('.operation-id .operation-name');
          assert.equal(node.innerText.trim(), 'unsubscribeOperation');
        });

        it('does no render operation id when missing', async () => {
          const links = AmfLoader.linksModel(amf, '/subscribe', 'post', '402');
          const element = await modelFixture(amf, links);
          const node = element.shadowRoot.querySelector('.operation-id');
          assert.notOk(node);
        });
      });

      describe('Mapping rendering', () => {
        let amf;

        before(async () => {
          amf = await AmfLoader.load(compact, 'oas-callbacks');
        });

        it('renders mapping table', async () => {
          const links = AmfLoader.linksModel(amf, '/subscribe', 'post', '200');
          const element = await modelFixture(amf, links);
          const nodes = element.shadowRoot.querySelectorAll('.mapping-table');
          assert.lengthOf(nodes, 2);
        });

        it('renders single mapping', async () => {
          const links = AmfLoader.linksModel(amf, '/subscribe', 'post', '200');
          const element = await modelFixture(amf, links);
          const node = element.shadowRoot.querySelectorAll('.mapping-table')[0];
          const rows = node.querySelectorAll('tr');
          // header + single row
          assert.lengthOf(rows, 2);
        });

        it('renders multiple mapping', async () => {
          const links = AmfLoader.linksModel(amf, '/subscribe', 'post', '200');
          const element = await modelFixture(amf, links);
          const node = element.shadowRoot.querySelectorAll('.mapping-table')[1];
          const rows = node.querySelectorAll('tr');
          // header + two rows
          assert.lengthOf(rows, 3);
        });

        it('renders mapping values', async () => {
          const links = AmfLoader.linksModel(amf, '/subscribe', 'post', '200');
          const element = await modelFixture(amf, links);
          const node = element.shadowRoot.querySelectorAll('.mapping-table')[0];
          const row = node.querySelectorAll('tr')[1];
          const cols = row.querySelectorAll('td');

          assert.equal(cols[0].innerText.trim(), 'Id', 'variable is rendered');
          assert.equal(cols[1].innerText.trim(), '$response.body#/subscriberId', 'expression is rendered');
        });
      });
    });
  });
});
