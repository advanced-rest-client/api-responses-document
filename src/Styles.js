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
  border-bottom: 1px var(--api-responses-document-codes-selector-divider-border-bottom-color, #e5e5e5) solid;
}

api-links-document {
  margin-top: 20px;
}

.method-response {
  padding-left: var(--api-responses-method-padding-left, 20px);
  padding-right: var(--api-responses-method-padding-right, 20px);
}
`;
