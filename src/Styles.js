import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

arc-marked {
  margin-top: 8px;
  padding: 0;
}

.no-info {
  font-style: italic;
}

.codes-selector-divider {
  margin: 0 50px;
  border-bottom: 1px var(--api-responses-document-codes-selector-divider-border-bottom-color, #e5e5e5) solid;
}

api-links-document {
  margin-top: 20px;
}

.method-response {
  padding-left: 20px;
  padding-right: 20px;
}
`;
