# AdSense readiness

The production build includes the site-level requirements that belong in this
repository:

- static, crawlable homepage links for every tool;
- original guides, examples, limitations, and FAQs for every tool page;
- real About, Privacy, Terms, and Contact pages;
- category landing pages for Developer, Text, and Image tools;
- a real `404.html`, canonical URLs, structured data, `robots.txt`, `ads.txt`,
  and a complete sitemap;
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
an explanation of the implementation, limitations, and FAQs. The root build
fails when a tool does not have corresponding content.

Do not place advertisements where they can be confused with navigation,
primary actions, copy buttons, or download buttons. Legal pages and the 404 page
do not include the AdSense loader.
