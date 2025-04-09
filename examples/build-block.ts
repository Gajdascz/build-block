import { config } from '../src/api.js';

export default config({
  core: {
    outputDirectory: process.cwd(),
    namespace: 'example-namespace',
    slug: 'example-slug',
    title: 'Example Block',
    description: 'Example block description',
    authorName: 'Example Author',
    authorEmail: 'exampleAuthor@example.email.com',
    authorUrl: 'Example Author URL',
    repository: 'Example Repository',
    funding: 'Example Funding'
  },
  block: {
    ancestor: [],
    category: 'widgets',
    icon: 'block-default',
    keywords: ['example', 'block'],
    parent: [],
    providesContext: {},
    usesContext: [],
    example: {},
    styles: [],
    attributes: {
      content: { type: 'string', default: '' },
      alignment: { type: 'string', default: 'left' },
      backgroundColor: { type: 'string', default: '#ffffff' },
      showDetails: { type: 'boolean', default: false }
    },
    supports: {
      align: true,
      anchor: true,
      className: true,
      customClassName: true,
      html: false,
      inserter: true,
      multiple: false,
      reusable: false,
      color: { background: true, text: true, link: true },
      spacing: { blockGap: true, margin: true, padding: true }
    }
  },
  npm: {
    contributors: [{ name: '', email: '', url: '' }],
    keywords: [],
    url: ''
  },
  php: { classScope: 'ExampleNamespace', methodScope: 'exmplns' },
  wp: { contributors: [], requiresPlugins: [], tags: [], updateUrl: '' }
});
