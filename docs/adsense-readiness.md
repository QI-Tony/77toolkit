# AdSense readiness

The production build includes the site-level requirements that belong in this
repository:

- static, crawlable homepage links for every tool;
- task-specific scenarios, review checklists, alternatives, privacy notes,
  examples, limitations, and FAQs for every tool page;
- ten original long-form guides with primary references and related tools;
- real About, Privacy, Terms, and Contact pages;
- category landing pages for Developer, Text, and Image tools;
- a real `404.html`, canonical URLs, structured data, `robots.txt`, `ads.txt`,
  favicons, dated sitemap entries, and a complete sitemap;
- one AdSense loader on every indexable HTML page and no loader on the noindex
  404 page;
- information links in the homepage and generated tool-page footers; and
- separation between publisher content, advertisements, tool controls, and
  download actions.

## Dashboard tasks

These steps cannot be completed in source code:

1. In AdSense, open **Privacy & messaging** and configure a Google-certified
   consent message for the EEA, UK, and Switzerland where required.
2. Confirm the production domain is `77toolkit.com` and the publisher ID is
   `pub-3812186991635556`.
3. In Google Search Console, verify the domain property and submit
   `https://77toolkit.com/sitemap.xml`.
4. Inspect the homepage, all three category pages, the four information pages,
   and representative tool pages. Resolve indexing or mobile usability issues.
5. Reapply only after the deployed pages are accessible and Search Console has
   crawled the new structure.

## Content rules for future tools

Do not publish an empty interface or copy the same guide to multiple tools. A
new catalog item must also have a matching entry in
`apps/browser-tools/content.mjs` with task-specific steps, a realistic example,
an explanation of the implementation, limitations, and FAQs. It must also have
an entry in `apps/browser-tools/editorial.mjs`. The root build fails on missing
content, thin tool or guide copy, duplicate AdSense loaders, missing canonical
or favicon metadata, legacy product names, and broken internal links.

Do not place advertisements where they can be confused with navigation,
primary actions, copy buttons, or download buttons. All indexable information
pages include the site-level loader; the noindex 404 page does not.
