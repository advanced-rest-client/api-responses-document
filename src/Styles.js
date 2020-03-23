import { css } from 'lit-element';

export default css`
:host {
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
}

.codes-selector {
  border-bottom: 1px #e5e5e5 solid;
}
`;
