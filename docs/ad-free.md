# Ad-free site

77 Toolkit no longer embeds the pop-under or social bar network scripts. The
legacy Google publisher entries and both source `ads.txt` files were removed.
Homepage, generated tools, original apps, guides, information pages, and the
404 page are all built without advertising loaders.

`npm run build` recursively checks generated HTML and JavaScript for the known
network domains and Google advertising markers. It also rejects any `ads.txt`
file. `npm test` exercises the guard with deliberately contaminated fixtures.
Keep new tools local and avoid adding third-party script loaders.

The About, Privacy, Terms, Accessibility, and Editorial pages describe the
current ad-free behavior. Favorites store only tool slugs in local storage;
tool input is not stored. Search and category filters are bookmarkable URL
parameters, so catalog search should not contain secrets.

A normal Cloudflare Pages deployment from `main` publishes the change. Verify
that the production pages stop requesting advertising domains and that
`/ads.txt` no longer returns the old publisher authorization. Browser caches or
already open tabs can retain an older page until refreshed. Removing site code
does not close an advertising-provider account or erase cookies previously
set by other domains.
