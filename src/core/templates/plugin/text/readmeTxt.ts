import type { ConfiguredTemplate } from '#config';
const _longDescription = `This is the long description.  No limit, and you can use Markdown (as well as in the following sections).

For backwards compatibility, if this section is missing, the full length of the short description will be used, and
Markdown parsed.`;

const _faq = `= A question that someone might have =

An answer to that question.

= What about foo bar? =

Answer to foo bar dilemma.`;

const _screenshots = `1. This screen shot description corresponds to screenshot-1.(png|jpg|jpeg|gif). Screenshots are stored in the /assets directory.
2. This is the second screen shot`;

const _changelog = `= 1.0 =
* A change since the previous version.
* Another change.

= 0.5 =
* List versions from most recent at top to oldest at bottom.`;

const _upgradeNotice = `= 1.0 =
Upgrade notices describe the reason a user should upgrade.  No more than 300 characters.

= 0.5 =
This version fixes a securlty related bug.  Upgrade immediately.`;

const _markdownExample = `Markdown is what the parser uses to process much of the readme file.

[markdown syntax]: https://daringfireball.net/projects/markdown/syntax

Ordered list:

1. Some feature
1. Another feature
1. Something else about the plugin

Unordered list:

* something
* something else
* third thing

Links require brackets and parenthesis:

Here's a link to [WordPress](https://wordpress.org/ "Your favorite software") and one to [Markdown's Syntax Documentation][markdown syntax]. Link titles are optional, naturally.

Blockquotes are email style:

> Asterisks for *emphasis*. Double it up  for **strong**.

And Backticks for code:

\`<?php code(); ?>\``;

const README_CFG = {
  longDescription: _longDescription,
  faq: _faq,
  screenshots: _screenshots,
  changelog: _changelog,
  upgradeNotice: _upgradeNotice,
  markdownExample: _markdownExample
} as const;
type ReadMeCfg = typeof README_CFG;

const buildHeader = (
  title: string,
  wpContributors: string[],
  funding: string,
  wpTags: string[],
  wpVersion: string,
  version: string,
  phpVersion: string,
  license: { type: string; url: string },
  description: string
) => {
  let header = `=== ${title} ===\n`;

  if (wpContributors.length > 0)
    header += `Contributors: ${wpContributors.join(', ')}\n`;

  if (funding) header += `Donate link: ${funding}\n`;

  if (wpTags.length > 0) header += `Tags: ${wpTags.slice(0, 5).join(', ')}\n`;

  if (wpVersion) {
    header += `Requires at least: ${wpVersion}\n`;
    header += `Tested up to: ${wpVersion}\n`;
  }

  if (version) header += `Stable tag: ${version}\n`;

  if (phpVersion) header += `Requires PHP: ${phpVersion}\n`;

  if (license.type) {
    header += `License: ${license.type}\n`;

    if (license.url) {
      header += `License URI: ${license.url}\n`;
    }
  }

  if (description) header += `\n${description}\n`;

  return header;
};

/**
 * https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/
 */
export const create = (): ConfiguredTemplate => ({
  filename: 'readme.txt',
  generate: (
    {
      core: {
        title,
        version,
        authorName,
        authorUrl,
        license,
        description,
        funding,
        repository
      },
      npm: { name: npmName, url: npmUrl, keywords: npmKeywords },
      wp: { contributors: wpContributors, tags: wpTags, version: wpVersion },
      php: { version: phpVersion }
    },
    {
      longDescription = README_CFG.longDescription,
      faq = README_CFG.faq,
      screenshots = README_CFG.screenshots,
      changelog = README_CFG.changelog,
      upgradeNotice = README_CFG.upgradeNotice,
      markdownExample = README_CFG.markdownExample
    }: Partial<ReadMeCfg> = {}
  ) => `${buildHeader(title, wpContributors, funding, wpTags, wpVersion, version, phpVersion, license, description)}
== Description ==

${longDescription}

== Frequently Asked Questions ==

${faq}

== Screenshots ==

${screenshots}

== Changelog ==

${changelog}

== Upgrade Notice ==

${upgradeNotice}

== Markdown Example ==

${markdownExample}

== Development ==
Repository: ${repository}
= Author =
Name: ${authorName}
URL: ${authorUrl}

= Package =
NPM Name: ${npmName}
NPM URL: ${npmUrl}
NPM Keywords: ${npmKeywords.join()}
`
});
