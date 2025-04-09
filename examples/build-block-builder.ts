import { builder } from '../src/api.js';

export default builder({
  /**
   * Required minimum configuration needs to be provided for initializing the builder. Extracted from core.
   */
  namespace: 'example-namespace',
  slug: 'example-slug',
  title: 'Example Block',
  description: 'Example block description'
})
  .core({
    outputDirectory: process.cwd(),
    authorName: 'Example Author',
    authorEmail: 'exampleAuthor@example.email.com',
    authorUrl: 'Example Author URL',
    repository: 'Example Repository',
    funding: 'Example Funding'
  })
  .block({
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
  })
  .npm({
    contributors: [{ name: 'contributor0', email: '', url: '' }],
    tags: ['npmtag0', 'npmtag1'],
    url: 'example.com'
  })
  .wp({
    contributors: ['contributor0', 'contributor1'],
    requiresPlugins: ['plugin0', 'plugin1'],
    tags: ['wptag0', 'wptag1'],
    updateUrl: 'example.com'
  })
  .php({ classScope: 'ExampleNamespace', methodScope: 'exmplns' })
  .build();
