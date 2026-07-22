export const guideCatalog = [
  {
    slug: "repair-invalid-json",
    title: "How to repair invalid JSON without changing its meaning",
    description: "A careful workflow for fixing JSON syntax, reviewing inferred changes, and validating the result before it returns to an application.",
    kicker: "Developer data",
    readingTime: "7 min read",
    published: "2026-07-22",
    updated: "2026-07-22",
    relatedTools: ["json-fix", "json-diff"],
    sections: [
      {
        heading: "Start by separating syntax from data quality",
        paragraphs: [
          "JSON can fail for a small mechanical reason even when the intended data is obvious to a person. Common examples include single-quoted strings, unquoted property names, trailing commas, comments, or a missing separator. A parser rejects the whole document because JSON has a deliberately narrow grammar. Repairing that grammar is different from deciding whether the fields, values, and relationships are correct for an application.",
          "Preserve the original before changing anything. The original is the only reliable record of what was received, and it lets you distinguish a repair from an accidental rewrite. If the input came from an API, log, or configuration system, also record its source and encoding. A copied fragment may be incomplete even after every visible punctuation error has been fixed.",
        ],
      },
      {
        heading: "Repair the least ambiguous errors first",
        paragraphs: [
          "Begin with changes that have one clear interpretation: remove a trailing comma, replace JavaScript-style single quotes with JSON double quotes, or quote a plain property name. Then parse again. Small repair steps make it easier to see which change made the document valid and reduce the chance of silently inventing data.",
          "Stop when information is missing rather than merely malformed. A truncated string, absent value, or unbalanced nested object can have several plausible completions. A tool may suggest a parseable result, but only a person who understands the producing system can decide which missing content was intended.",
        ],
        bullets: ["Keep numbers as numbers unless the source clearly intended an identifier string.", "Treat dates as strings unless an application schema says otherwise.", "Do not delete unknown properties simply to satisfy a consumer.", "Never add credentials or defaults that were not present in the source."],
      },
      {
        heading: "Review structure and meaning after parsing",
        paragraphs: [
          "Successful parsing proves that the output follows JSON syntax. It does not prove that required properties exist, values use the correct types, identifiers are unique, or dates fall within an allowed range. Compare the repaired result with the original and inspect every location where a character was inserted, removed, or replaced.",
          "When a schema is available, validate against it after repair. When there is no schema, compare the result with a known-good example from the same system. JSON Diff is useful for this second step because it ignores formatting and shows changes by property path, but array reordering and schema rules still require human interpretation.",
        ],
      },
      {
        heading: "Handle production data defensively",
        paragraphs: [
          "Prefer synthetic or redacted examples when debugging. A local browser tool avoids sending text to an application server, but clipboard managers, extensions, screen sharing, crash reports, and other software on the device may still observe sensitive values. Rotate any token or password that was pasted into an environment you do not fully trust.",
          "Before deploying a repaired configuration, run the application's own tests and load it in a non-production environment. A parseable document can still change feature flags, permissions, endpoints, or numeric behavior. Keep the repair as a reviewable change rather than overwriting the only copy of the input.",
        ],
      },
    ],
    takeaway: "The safest repair is the smallest change that makes the intended structure explicit, followed by a separate schema and business-rule review.",
    resources: [{ label: "RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format", url: "https://www.rfc-editor.org/rfc/rfc8259" }],
  },
  {
    slug: "jwt-decode-vs-verify",
    title: "JWT decoding is not JWT verification",
    description: "Understand what a decoded token can show, what signature verification proves, and which application checks still remain afterward.",
    kicker: "Authentication",
    readingTime: "8 min read",
    published: "2026-07-22",
    updated: "2026-07-22",
    relatedTools: ["jwt-decoder", "timestamp"],
    sections: [
      {
        heading: "Why every JWT is easy to read",
        paragraphs: [
          "A common compact JWT contains three dot-separated sections: a header, a payload, and a signature. The first two sections are JSON encoded with Base64URL so they can travel in text protocols. Base64URL is reversible without a key, which means anyone who receives the token can normally read its algorithm label and claims.",
          "That readability is intentional. A JWT is often signed rather than encrypted. The signature protects integrity and origin when it is verified correctly, but it does not hide the payload. Passwords, private keys, regulated identifiers, and other secrets generally do not belong in readable claims merely because the token string looks opaque.",
        ],
      },
      {
        heading: "What a decoder can and cannot tell you",
        paragraphs: [
          "A decoder can reveal fields such as issuer, subject, audience, scopes, expiration, and not-before time. This is useful for diagnosing the wrong tenant, environment, role, or clock value. It can also report malformed Base64URL or invalid JSON. None of those observations prove that the issuer created the token.",
          "An attacker can create a header and payload with any claims they want. If an application makes an authorization decision from decoded claims before verifying the signature, the claims are simply user-controlled input. A successful decode therefore means only that the first two sections follow an expected representation.",
        ],
      },
      {
        heading: "Verification requires application context",
        paragraphs: [
          "Real verification uses a trusted key and an expected algorithm. The verifier must reject unexpected algorithms rather than accepting whatever the token header requests. For asymmetric signatures it may retrieve a key set from a trusted issuer, select the correct key, and enforce rotation and caching rules.",
          "Signature verification is still not the final authorization check. The application should validate issuer, audience, expiration, not-before time, token type, required scopes, and any tenant or session policy. Some systems also maintain revocation or account-state checks that cannot be represented by the token alone.",
        ],
        bullets: ["Pin accepted algorithms in application configuration.", "Match issuer and audience exactly.", "Allow only a deliberate amount of clock skew.", "Treat unknown critical headers and claim types as errors."],
      },
      {
        heading: "Use real tokens with care",
        paragraphs: [
          "Bearer tokens can grant access to data or actions until they expire or are revoked. Prefer an expired, test, or redacted token when investigating structure. Even with local decoding, other software on the device can access the clipboard or observe the screen.",
          "If a production token is posted in a ticket, chat, recording, or public issue, assume it is compromised. Remove the disclosure where possible, revoke or rotate the token, and review access logs. Deleting the visible message does not guarantee that every copy disappeared.",
        ],
      },
    ],
    takeaway: "Decode to inspect; verify with a trusted library and explicit application policy before using any claim for authentication or authorization.",
    resources: [
      { label: "RFC 7519: JSON Web Token", url: "https://www.rfc-editor.org/rfc/rfc7519" },
      { label: "RFC 8725: JSON Web Token Best Current Practices", url: "https://www.rfc-editor.org/rfc/rfc8725" },
    ],
  },
  {
    slug: "base64-is-not-encryption",
    title: "Base64 is an encoding, not encryption",
    description: "Learn why Base64 values are readable, how standard and URL-safe alphabets differ, and what to use when security is the real requirement.",
    kicker: "Encoding fundamentals",
    readingTime: "6 min read",
    published: "2026-07-22",
    updated: "2026-07-22",
    relatedTools: ["base64", "jwt-decoder"],
    sections: [
      {
        heading: "What Base64 actually changes",
        paragraphs: [
          "Computers store text, images, and files as bytes. Some text-oriented transports are safer when those bytes are represented using a limited set of printable characters. Base64 takes groups of bytes and maps them to characters from a defined alphabet. The operation does not require a password and is designed to be reversed.",
          "Because every three input bytes are represented by four characters, Base64 usually increases size by roughly one third before surrounding protocol overhead. Padding characters may appear at the end when the number of input bytes is not divisible by three. Removing padding can be valid in a protocol that defines how to restore it, but it does not make the value more secure.",
        ],
      },
      {
        heading: "Standard Base64 and Base64URL",
        paragraphs: [
          "Standard Base64 uses plus and slash in its alphabet. Those characters have special meanings in URLs and some form encodings, so Base64URL replaces them with hyphen and underscore. Base64URL values also commonly omit padding. JWT sections use this URL-safe form.",
          "A decoder needs to know which alphabet and byte interpretation are expected. Text tools usually interpret decoded bytes as UTF-8. Arbitrary files may contain bytes that are not valid UTF-8 and should instead be handled as binary data with a known media type.",
        ],
      },
      {
        heading: "Why encoded secrets remain secrets in plain sight",
        paragraphs: [
          "An encoded API key, password, or authorization value is still the original credential in a reversible representation. Search tools and scanners routinely recognize Base64 patterns, and a person can decode them in seconds. Encoding a secret before committing it to source control or putting it in a URL does not reduce the exposure.",
          "When confidentiality is required, use authenticated encryption with managed keys. When a receiver must confirm who created a message, use a suitable digital signature or message authentication code. When comparing integrity, use a cryptographic hash with a trustworthy reference. Each of these solves a different problem that Base64 does not attempt to solve.",
        ],
      },
      {
        heading: "A practical inspection workflow",
        paragraphs: [
          "Before decoding an unknown value, identify the context: HTTP Basic credentials, a JWT section, a data URL, an email attachment, or an application-specific field. Decode only in a trusted environment, inspect the media type or expected character encoding, and avoid automatically executing or opening decoded content.",
          "After encoding, perform a round trip and compare the decoded bytes with the source. For text, include non-ASCII samples to confirm UTF-8 behavior. For a URL parameter, verify that the URL-safe alphabet and padding policy match the receiving application rather than applying substitutions by guesswork.",
        ],
      },
    ],
    takeaway: "Base64 makes bytes easier to transport as text. It provides no secrecy, authenticity, integrity policy, or access control by itself.",
    resources: [{ label: "RFC 4648: Base-N Encodings", url: "https://www.rfc-editor.org/rfc/rfc4648" }],
  },
  {
    slug: "image-formats-and-compression",
    title: "PNG, JPEG, and WebP: choose by image content",
    description: "A practical comparison of common browser image formats, compression artifacts, transparency, resizing, and repeat export quality.",
    kicker: "Image workflow",
    readingTime: "8 min read",
    published: "2026-07-22",
    updated: "2026-07-22",
    relatedTools: ["image-compressor", "image-resizer", "image-converter", "color-spectrum"],
    sections: [
      {
        heading: "Format is a content decision",
        paragraphs: [
          "A filename extension does not describe quality by itself. PNG, JPEG, and WebP use different representations and compression strategies. The best result depends on whether the image is a photograph, flat illustration, screenshot, logo, transparent overlay, or a mixture of these.",
          "JPEG is widely suited to photographs and continuous tone but does not support alpha transparency. PNG preserves exact pixel values with lossless compression and is often effective for interface graphics, line art, and images with repeated flat colors. WebP can encode lossy or lossless images and supports transparency, offering another tradeoff rather than an automatic win.",
        ],
      },
      {
        heading: "Resize before chasing a quality slider",
        paragraphs: [
          "Pixel dimensions often dominate web delivery cost. A camera image that is several thousand pixels wide remains unnecessarily expensive when it is displayed in a small article column. Create a separate resized copy near the largest rendered size, then tune compression while looking at that output.",
          "Preserve aspect ratio unless stretching is intentional. If the destination requires a different shape, decide whether to crop, pad, or redesign the composition. A resizer cannot infer the important subject, and forcing both width and height can distort faces, circles, text, and product proportions.",
        ],
      },
      {
        heading: "Inspect the artifacts that matter",
        paragraphs: [
          "Lossy compression can blur fine texture, create ringing around sharp edges, or break smooth gradients into bands. Screenshots and diagrams may show damage sooner than photographs because small text and one-pixel boundaries are visually important. Compare at 100 percent zoom and at the real display size.",
          "Transparency needs a deliberate check. Converting an image with alpha to JPEG requires a background color, and an unexpected matte may appear around edges. Color profiles and browser encoders can also affect appearance. A visual that looks correct in one editor should still be previewed in the target browser and page background.",
        ],
      },
      {
        heading: "Avoid generation loss and preserve the source",
        paragraphs: [
          "Every additional lossy export starts from already simplified pixels and can introduce more damage. Keep the original or a high-quality master, and generate delivery variants from that source rather than repeatedly editing a downloaded derivative.",
          "File size is only one part of performance. Responsive image markup, caching, lazy loading, correct dimensions, and avoiding layout shifts also matter. For a repeatable production workflow, use a build pipeline that records dimensions, formats, and quality settings instead of relying on manual exports that cannot be reproduced.",
        ],
        bullets: ["Photograph: compare JPEG and lossy WebP.", "Screenshot or line art: compare PNG and lossless WebP.", "Transparency: use a format with alpha support.", "Animation or professional color: verify support in a specialized workflow."],
      },
    ],
    takeaway: "Choose a format after considering image content, dimensions, transparency, and the destination; then compare the actual exported pixels rather than relying on a universal rule.",
    resources: [{ label: "MDN: Image file type and format guide", url: "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types" }],
  },
  {
    slug: "removing-image-metadata",
    title: "Removing image metadata is one part of privacy",
    description: "Understand what re-encoding can remove, what it may change, and which visible or platform-level clues remain after EXIF cleanup.",
    kicker: "Image privacy",
    readingTime: "7 min read",
    published: "2026-07-22",
    updated: "2026-07-22",
    relatedTools: ["metadata-remover", "image-converter"],
    sections: [
      {
        heading: "Metadata can describe more than the picture",
        paragraphs: [
          "Image containers may carry camera model, capture time, orientation, editing software, copyright fields, thumbnails, color profiles, and sometimes location coordinates. The exact fields depend on the format, device, and applications that handled the file. A viewer that shows only a few EXIF fields does not prove that no other blocks exist.",
          "Metadata is not automatically harmful. Orientation and color information can be necessary for correct display, while copyright and attribution fields can support a publishing workflow. Privacy cleanup should begin with a clear purpose: remove unnecessary personal or device information while understanding which useful properties may also change.",
        ],
      },
      {
        heading: "Why browser re-encoding often helps",
        paragraphs: [
          "A browser can decode visible pixels into memory and draw them to Canvas. Exporting that drawing creates a new raster file rather than copying the original container byte for byte. Common camera metadata is normally not carried into the new output because the browser encoder has no reason to reproduce it.",
          "This process can also change quality, dimensions, transparency, color behavior, animation, and file size. It should therefore create a separate result, never silently overwrite the only source. Formats and browser implementations differ, so a privacy claim should be verified against the downloaded file rather than assumed from the operation name.",
        ],
      },
      {
        heading: "Verify with an independent inspection",
        paragraphs: [
          "Download the cleaned image and inspect it with another metadata tool or the destination platform's own information panel. Using a separate implementation helps reveal fields that the cleanup interface itself does not display. Confirm dimensions and orientation at the same time because removing metadata can expose an orientation problem that was previously corrected during display.",
          "Keep the original privately until the result has been reviewed. If evidence preservation, legal discovery, journalism, or forensic analysis is involved, do not alter the source; follow a documented chain-of-custody process and work on verified copies with appropriate specialist tools.",
        ],
      },
      {
        heading: "Visible content and sharing context still matter",
        paragraphs: [
          "Metadata removal cannot hide a street sign, reflection, face, badge, browser tab, document title, map, or address visible in the pixels. It also does not change a revealing filename, public cloud link, message recipient, or account identity. Review the complete sharing context, not only the EXIF panel.",
          "Platforms may create their own metadata, thumbnails, logs, and backups after upload. Read the platform's privacy controls and assume that a public post can be copied. A cleaned local file reduces one category of exposure; it is not an anonymity guarantee.",
        ],
      },
    ],
    takeaway: "Re-encode a copy, independently inspect the result, and review visible pixels, filename, platform, and audience before sharing.",
    resources: [{ label: "MDN: Canvas toBlob()", url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob" }],
  },
  {
    slug: "wcag-color-contrast",
    title: "How to use WCAG contrast ratios in real interfaces",
    description: "Move from two hexadecimal colors to a practical review of text size, component states, opacity, images, and implemented accessibility.",
    kicker: "Accessibility",
    readingTime: "8 min read",
    published: "2026-07-22",
    updated: "2026-07-22",
    relatedTools: ["contrast-checker", "color-spectrum"],
    sections: [
      {
        heading: "A ratio describes two rendered colors",
        paragraphs: [
          "WCAG contrast calculations compare relative luminance between a foreground and background. A ratio of 1:1 means the luminance is the same, while higher ratios indicate more separation. For WCAG 2.x Level AA, normal text generally needs at least 4.5:1 and large text at least 3:1, subject to the definitions and exceptions in the standard.",
          "The calculator needs the colors that are actually rendered together. A design token may use opacity, blend over another surface, sit on a gradient, or appear above an image. Calculate the composited result or sample the implemented state instead of checking two source tokens that never meet as solid colors on screen.",
        ],
      },
      {
        heading: "Text size, weight, and state change the review",
        paragraphs: [
          "Large-text thresholds apply only when the rendered text meets the standard's size and weight definition. Browser zoom, responsive typography, and font availability can affect the result. Do not label ordinary body text as large simply because a design file uses a bold style.",
          "Check default, hover, active, focus, visited, selected, disabled, error, and placeholder states. A component that passes at rest may fail when the background changes or opacity is reduced. Focus indicators and essential non-text graphics have additional contrast considerations that a text-only result does not cover.",
        ],
      },
      {
        heading: "Passing contrast does not guarantee readability",
        paragraphs: [
          "A passing ratio is necessary for covered content but is not a complete measure of accessibility. Font choice, line length, spacing, motion, glare, cognitive load, color vision differences, and the clarity of the language all affect whether a person can use the interface.",
          "Color must not be the only way information is communicated. Error fields need text or another programmatically available cue, charts need labels or patterns, and links within paragraphs need a visual distinction that does not disappear for users who perceive color differently.",
        ],
      },
      {
        heading: "Test the implemented product",
        paragraphs: [
          "Use a calculator while choosing a palette, then repeat the check in browser developer tools or an accessibility audit after implementation. Automated tools can find many deterministic failures, but a keyboard and screen-reader review is still needed for semantics, focus order, labels, announcements, and interaction behavior.",
          "Record the exact component, state, foreground, background, ratio, criterion, and remediation. This makes the finding reproducible and prevents a passing replacement color from being applied to the wrong state or surface.",
        ],
        bullets: ["Check real composited colors.", "Verify the correct text-size category.", "Review every interactive state.", "Combine automated checks with manual use."],
      },
    ],
    takeaway: "Use the ratio as a precise test for a precise pair of rendered colors, then evaluate the complete implemented experience.",
    resources: [{ label: "W3C WCAG 2.2: Contrast (Minimum)", url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" }],
  },
  {
    slug: "timestamps-and-timezones",
    title: "Unix timestamps, UTC, and local time without surprises",
    description: "A debugging guide to seconds versus milliseconds, explicit offsets, daylight-saving transitions, and trustworthy date exchange.",
    kicker: "Dates and APIs",
    readingTime: "7 min read",
    published: "2026-07-22",
    updated: "2026-07-22",
    relatedTools: ["timestamp", "jwt-decoder"],
    sections: [
      {
        heading: "An instant is not a display timezone",
        paragraphs: [
          "A Unix timestamp represents elapsed time from a defined epoch and identifies an instant independent of the viewer's timezone. Converting that instant to a calendar date requires a display zone. Two people can see different local dates for the same timestamp while still referring to the same moment.",
          "Use UTC for machine exchange and logs unless a contract explicitly requires another representation. Include a Z suffix or numeric offset in date strings. A date and time without an offset may be interpreted as local time, and different environments can apply different zones or parsing rules.",
        ],
      },
      {
        heading: "Seconds and milliseconds are the classic integration error",
        paragraphs: [
          "Unix timestamps are frequently expressed in seconds, while JavaScript Date values commonly use milliseconds. The values differ by a factor of one thousand. A seconds value treated as milliseconds points near 1970; a milliseconds value treated as seconds may be far outside a usable date range.",
          "Do not rely only on magnitude heuristics in a production API. Document the unit in the field name or schema, validate its allowed range, and include an example. During debugging, compare both interpretations and confirm the intended date with the producing system.",
        ],
      },
      {
        heading: "Daylight-saving rules belong to named zones",
        paragraphs: [
          "A fixed offset such as -05:00 describes one relationship to UTC at one instant. It does not contain the historical and future daylight-saving rules associated with a region such as America/New_York. Recurring local schedules therefore need a named timezone and a policy for skipped or repeated wall-clock times.",
          "Historical timezone rules can change when governments update policy, and devices may ship different timezone database versions. Test transitions explicitly when payroll, billing, transportation, or scheduled jobs depend on local civil time.",
        ],
      },
      {
        heading: "Create reproducible date reports",
        paragraphs: [
          "When sharing a timestamp issue, record the raw value, unit, UTC ISO result, intended named timezone, observed local output, browser or runtime, and device timezone setting. This lets another person reproduce the conversion instead of guessing from a screenshot.",
          "Avoid ambiguous strings such as 07/08/26. Prefer an ISO-style date with four-digit year and explicit offset when an instant is intended. For date-only concepts such as a birthday, do not invent midnight UTC unless the data model genuinely needs an instant.",
        ],
      },
    ],
    takeaway: "Exchange explicit instants in UTC, document seconds versus milliseconds, and use named zones only when local calendar rules are part of the requirement.",
    resources: [{ label: "RFC 3339: Date and Time on the Internet", url: "https://www.rfc-editor.org/rfc/rfc3339" }],
  },
  {
    slug: "regex-testing-safely",
    title: "Test regular expressions with correctness and performance in mind",
    description: "Build representative test sets, understand engine differences, and reduce the risk of patterns that become slow on adversarial input.",
    kicker: "Pattern engineering",
    readingTime: "8 min read",
    published: "2026-07-22",
    updated: "2026-07-22",
    relatedTools: ["regex-tester", "text-diff"],
    sections: [
      {
        heading: "Define the language before writing the pattern",
        paragraphs: [
          "A regular expression is easier to review when the accepted input is described first. Collect representative matches, near-misses, empty input, boundary lengths, unexpected Unicode, and characters that require escaping. For validation, decide whether the whole string must match and anchor the pattern accordingly.",
          "Avoid using a pattern as a substitute for business rules that are clearer in code. A date-shaped string can match a regular expression while describing an impossible date. An email-shaped value can match while no deliverable mailbox exists. Separate lexical shape from semantic validation.",
        ],
      },
      {
        heading: "Know the destination engine",
        paragraphs: [
          "JavaScript, PCRE, Python, Java, .NET, database systems, and command-line tools support different syntax and behavior. Lookbehind, named groups, Unicode properties, backreferences, flags, and replacement escaping may work differently or not at all. Test with the same engine and version that will run the production pattern.",
          "In JavaScript, flags alter matching in important ways. Multiline changes how line anchors behave, dotAll changes whether a dot matches newlines, Unicode mode changes code-point handling, and global or sticky matching affects iteration state. Record flags next to the pattern rather than treating them as an editor preference.",
        ],
      },
      {
        heading: "Watch for excessive backtracking",
        paragraphs: [
          "Some backtracking engines can spend rapidly increasing time exploring alternatives when nested quantifiers or ambiguous repeated groups meet a long near-match. A pattern that is instant on a short sample may become a denial-of-service risk when it processes untrusted input.",
          "Use bounded repetitions when the format has a real maximum, prefer unambiguous alternatives, and test long failing inputs as well as successful ones. Apply input-length limits and execution controls in the application. A browser tester can reveal a visibly slow pattern, but it is not a formal performance proof.",
        ],
      },
      {
        heading: "Turn examples into regression tests",
        paragraphs: [
          "Once the pattern works, move its positive and negative examples into automated tests in the target project. Include the flags and expected capture groups. Tests protect against a future simplification that restores an old false positive or breaks Unicode and boundary behavior.",
          "For extraction, verify every capture group's meaning and every match index. For replacement, preview the complete output and confirm that unmatched text is preserved. Use a parser instead when the input has nesting, escaping, comments, or a grammar that has outgrown a bounded lexical pattern.",
        ],
        bullets: ["Test empty, shortest, longest, and malformed input.", "Include long failing strings for performance review.", "Run tests in the production regex engine.", "Prefer parsers for nested structured formats."],
      },
    ],
    takeaway: "A trustworthy regex comes with a defined input language, engine-specific tests, performance limits, and a clear boundary where a parser becomes the better tool.",
    resources: [
      { label: "MDN: Regular expressions", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions" },
      { label: "OWASP: Regular expression Denial of Service", url: "https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS" },
    ],
  },
];
