// __mocks__/styled-components.js
// Global Jest mock for styled-components v6 API

const React = require('react');

// Mock implementation of styled-components
const styled = (tagName) => {
  // Return a React component directly (not a function)
  const Component = (props) => React.createElement(tagName, props, props.children);
  Component.displayName = `styled.${tagName}`;
  return Component;
};

// Add methods to the styled function
styled.keyframes = (...args) => ({});
styled.ThemeProvider = ({ children }) => React.createElement(React.Fragment, null, children);
styled.createGlobalStyle = () => () => null;
styled.css = () => '';

// Add HTML tags as properties
const htmlTags = [
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo',
  'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col',
  'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl',
  'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2',
  'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img',
  'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark',
  'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup',
  'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby',
  's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style',
  'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead',
  'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'
];

htmlTags.forEach(tag => {
  styled[tag] = (...args) => {
    // Return a React component
    const Component = (props) => React.createElement(tag, props, props.children);
    Component.displayName = `styled.${tag}`;
    return Component;
  };
});

module.exports = styled;
