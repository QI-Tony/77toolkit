# Advertising and publisher readiness

The production build includes the site-level requirements that belong in this
repository:

- static, crawlable homepage links for every tool;
- task-specific scenarios, review checklists, alternatives, privacy notes,
  examples, limitations, and FAQs for every tool page;
- twelve original long-form guides with primary references and related tools;
- About, Editorial Policy, Accessibility, Privacy, Terms, Contact, and
  human-readable Site Map pages;
- category landing pages for Developer, Text, Image, and Web tools;
- a real `404.html`, canonical URLs, structured data, `robots.txt`, `ads.txt`,
  favicons, dated sitemap entries, and a complete sitemap;
- one pop-under loader and one social bar loader on every indexable HTML page,
  with neither loader on the noindex 404 page;
- information links in the homepage and generated tool-page footers; and
- written disclosure of third-party advertising behavior and data handling.

## Current advertising integration

The two configured advertising tags are loaded at the end of each normal page
so they do not block the initial HTML and stylesheet loading:

- Popunder: `pl31227992.profitableratecpmnetwork.com`
- SocialBar: `pl31227993.profitableratecpmnetwork.com`

The build fails if either tag is missing, duplicated, or present on the 404
page. It also fails if the previous Google AdSense loader reappears, preventing
an accidental mixed-network deployment.

Pop-under and social bar formats can open or overlay third-party content. Test
the production site on desktop and mobile after each ad-network configuration
change. Confirm that ads do not cover navigation, input, result, copy, or
download controls, and that closing an ad does not trap keyboard focus.

## Dashboard and compliance tasks

These steps cannot be completed in source code:

1. In the advertising network dashboard, confirm that both tags belong to
   `77toolkit.com` and that the account is active.
2. Configure any consent, opt-out, frequency, category, and regional controls
   required for the audiences you serve.
3. Review ad destinations and block misleading, unsafe, or unsuitable
   categories when the network provides those controls.
4. Test direct page loads and at least one tool interaction in a fresh browser
   profile, with the console and network panel open.
5. Verify the domain property in Google Search Console and submit
   `https://77toolkit.com/sitemap.xml`.
6. If applying to Google AdSense again, remove or pause intrusive formats first
   and complete a fresh policy, consent, navigation, and mobile usability
   review before reintroducing Google's loader.

## Content rules for future tools

Do not publish an empty interface or copy the same guide to multiple tools. A
new catalog item must also have a matching entry in
`apps/browser-tools/content.mjs` with task-specific steps, a realistic example,
an explanation of the implementation, limitations, and FAQs. It must also have
an entry in `apps/browser-tools/editorial.mjs`. The root build fails on missing
content, thin tool or guide copy, duplicate ad loaders, missing canonical or
favicon metadata, legacy product names, and broken internal links.

Third-party advertising must never be presented as a tool result, navigation
item, copy button, or download action. Avoid wording that encourages ad clicks.
