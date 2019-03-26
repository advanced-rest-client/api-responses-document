[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-responses-document.svg)](https://www.npmjs.com/package/@api-components/api-responses-document)

[![Build Status](https://travis-ci.org/api-components/api-responses-document.svg?branch=stage)](https://travis-ci.org/api-components/api-responses-document)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/api-components/api-responses-document)

## &lt;api-responses-document&gt;

A documentation for method responses based on AMF model.

```html
<api-responses-document></api-responses-document>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @api-components/api-responses-document
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@api-components/api-responses-document/api-responses-document.js';
    </script>
  </head>
  <body>
    <api-responses-document></api-responses-document>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@api-components/api-responses-document/api-responses-document.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <api-responses-document></api-responses-document>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/api-components/api-responses-document
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
