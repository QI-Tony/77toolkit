export const categoryContent = {
  Developer: {
    slug: "developer",
    title: "Developer Tools",
    description: "Local utilities for inspecting, converting, scheduling, validating, and generating everyday development data.",
    intro: [
      "Developer work often involves small transformations that do not justify installing another application or sending project data to an unknown service. This collection covers JSON, XML, tokens, timestamps, cron schedules, calendar arithmetic, encoding, patterns, identifiers, password generation, and hashing in focused browser interfaces.",
      "The tools are designed for quick inspection and debugging. Inputs are processed on the device whenever the browser provides the required capability. Security-sensitive results still need professional validation before they are used in production systems.",
    ],
    principles: [
      "Local processing for pasted data and selected files",
      "Readable output with explicit errors and limitations",
      "Shareable URLs for one clearly defined task",
    ],
  },
  Text: {
    slug: "text",
    title: "Text Tools",
    description: "Practical tools for cleaning, comparing, reshaping, measuring, and previewing text without uploading it.",
    intro: [
      "Text passes through chat applications, documents, spreadsheets, code editors, and web forms, often carrying formatting or structure that is inconvenient in the next destination. These tools handle common cleanup and transformation tasks while keeping the original text visible.",
      "Every text utility works in the browser and does not require an account. The collection supports editorial work, developer-oriented naming formats, and a safe Markdown preview, with source and results kept easy to review before copying.",
    ],
    principles: [
      "Immediate results that remain editable and reviewable",
      "Unicode-aware counting and conversion where practical",
      "No account, upload, or stored document history",
    ],
  },
  Image: {
    slug: "image",
    title: "Image Tools",
    description: "Browser-based image utilities for color analysis, compression, resizing, conversion, accessibility, and privacy.",
    intro: [
      "Preparing an image for a website, presentation, or message usually requires only one specific operation. This collection keeps those operations separate so users can compress, resize, convert, inspect, or clean an image without navigating a full photo editor.",
      "Selected images are decoded and processed locally with browser APIs. Re-encoding can change file size, color profiles, animation, and metadata, so the result should always be previewed before replacing an original file.",
    ],
    principles: [
      "Local Canvas and Web API processing",
      "A visible preview before downloading a result",
      "Clear warnings when re-encoding changes file properties",
    ],
  },
  Web: {
    slug: "web",
    title: "Web Tools",
    description: "Focused browser utilities for URLs, tabular data, HTML text, and responsive CSS measurements.",
    intro: [
      "Web work often fails at boundaries: an encoded query value is decoded twice, a CSV field contains an unexpected comma, HTML text is inserted without escaping, or a responsive measurement is calculated from the wrong viewport. This collection makes those assumptions visible before the result moves into a site or application.",
      "Each utility runs locally and keeps source and result close together for review. The tools follow browser standards, but production code should still validate untrusted input, document encoding rules, and test output in the environment that will consume it.",
    ],
    principles: [
      "Standards-based parsing with visible assumptions",
      "Input and output shown together for manual review",
      "No remote URL fetching or uploaded data",
    ],
  },
};

export const toolContent = {
  "number-base": {
    "intro": "Convert integer identifiers, bit masks, hexadecimal values, and binary examples without passing through floating-point arithmetic. Select any source and destination bases from 2 through 36. The input stays visible beside an exact, copyable result, including when the value is larger than the safe integer range of a JavaScript Number.",
    "steps": [
      "Enter the integer and select its source base. A matching 0b, 0o, or 0x prefix is optional for binary, octal, or hexadecimal.",
      "Choose the destination base and select Convert. Invalid digits are rejected instead of silently truncated.",
      "Copy the result or select Swap bases to convert a successful result back to its original base."
    ],
    "example": {
      "input": "9007199254740993 (base 10)",
      "output": "20000000000001 (base 16)"
    },
    "howItWorks": "Each digit is checked against the selected alphabet and accumulated using BigInt multiplication and addition. Output uses digits 0–9 followed by lowercase letters a–z. Leading zeroes and a positive sign are normalized away; a negative value keeps a leading minus sign.",
    "limitations": [
      "Only whole integers are supported. Decimal fractions, exponent notation, digit separators, and internal whitespace are rejected.",
      "Negative values use signed magnitude text, not a fixed-width two’s complement representation. Input is limited to 4,096 digits."
    ],
    "faqs": [
      {
        "question": "Can I convert a 64-bit database ID?",
        "answer": "Yes. Paste the original digit string directly. Do not first parse it as a JavaScript Number, because any precision already lost cannot be recovered by this tool."
      },
      {
        "question": "Why did leading zeroes disappear?",
        "answer": "The result represents a number rather than a fixed-width code. Add padding separately if a protocol requires a particular width; do not use this tool to preserve identifier formatting."
      }
    ]
  },
  "json-string": {
    "intro": "Turn multiline text into a quoted JSON string for fixtures, configuration values, and request examples. The reverse operation reads a complete JSON string literal and restores its text, including newlines, quotes, backslashes, and Unicode. This tool handles one string rather than repairing or formatting an entire JSON document.",
    "steps": [
      "Select Text → JSON string to escape plain text, or JSON string → Text to decode a string literal.",
      "Paste the input. Decoding requires the surrounding double quotes; encoding accepts empty text as a valid empty string.",
      "Select Convert, review the result, and copy it into the appropriate string field in your document."
    ],
    "example": {
      "input": "Hello \"77\" followed by a newline",
      "output": "\"Hello \\\"77\\\"\\n\""
    },
    "howItWorks": "Encoding uses JSON.stringify on the input string. Decoding uses JSON.parse and then verifies that the parsed value is actually a string. Objects, arrays, numbers, booleans, and null are rejected even though they may be valid JSON. No code is evaluated.",
    "limitations": [
      "JSON escaping does not make text safe for HTML, inline script tags, SQL, or shell commands. Use the escaping rules of the destination context.",
      "A single operation accepts up to one million UTF-16 code units. Escaped newlines become actual line breaks in decoded output."
    ],
    "faqs": [
      {
        "question": "Will Chinese text and emoji survive?",
        "answer": "Yes. JSON supports Unicode strings, and ordinary non-ASCII characters remain readable. Control characters, quotes, and backslashes receive the escaping required by JSON."
      },
      {
        "question": "Why is my object rejected?",
        "answer": "Unescape expects a single JSON string such as \"hello\", not an object such as {\"message\":\"hello\"}. Use JSON Fix for complete documents that need repair or formatting."
      }
    ]
  },
  "utm-builder": {
    "intro": "Create a campaign link for a newsletter, social post, or other channel without editing query punctuation by hand. The builder keeps unrelated query parameters and the URL fragment while replacing the five standard UTM fields with your chosen values. It does not contact the destination or send campaign information to an analytics service.",
    "steps": [
      "Paste an absolute HTTP or HTTPS destination URL. Remove any embedded username or password before using it.",
      "Enter source, medium, and campaign. Add term or content when you need to distinguish keywords or placements.",
      "Select Build URL, inspect the complete result, and copy it. Test the destination yourself before publishing the link."
    ],
    "example": {
      "input": "https://example.com/?plan=team + newsletter / email / launch",
      "output": "https://example.com/?plan=team&utm_source=newsletter&utm_medium=email&utm_campaign=launch"
    },
    "howItWorks": "The browser URL parser separates the path, query, and fragment. URLSearchParams encodes campaign values, replaces repeated standard UTM fields, and removes optional term or content fields left blank. Other query values remain present, although their serialized encoding may be normalized by the browser.",
    "limitations": [
      "The tool does not verify that the destination exists, accepts these parameters, or records campaign attribution.",
      "Values are case-sensitive in many reporting workflows. Existing signed URLs may break when query serialization changes, even if their parameter values are preserved."
    ],
    "faqs": [
      {
        "question": "Does this install analytics or track visitors?",
        "answer": "No. It only constructs text locally. Whether a later visit records attribution depends on the destination website and its analytics setup."
      },
      {
        "question": "Can I include spaces or Chinese text?",
        "answer": "Yes. Provide ordinary text and the browser encodes it as query data. Do not pre-encode values: a literal percent sign would itself be encoded again."
      }
    ]
  },
  "json-fix": {
    intro: "JSON Fix is for configuration fragments, API responses, and copied objects that are almost valid JSON but fail to parse. It repairs common punctuation and quoting problems, then formats the result so changes are easy to inspect.",
    steps: [
      "Paste the malformed JSON into the editor.",
      "Run the repair and review any reported changes or remaining errors.",
      "Copy or download the formatted result only after confirming that values still mean what you expect.",
    ],
    example: { input: "{name: 'toolkit', active: true,}", output: "{\n  \"name\": \"toolkit\",\n  \"active\": true\n}" },
    howItWorks: "The tool applies targeted syntax repairs and then parses the result as JSON. Successful parsing is a syntax check, not a validation of your application's schema or business rules.",
    limitations: ["Ambiguous missing values cannot always be inferred safely.", "Secrets pasted into any browser tool should be rotated if the device or session is not trusted."],
    faqs: [
      { question: "Can JSON Fix recover every broken document?", answer: "No. It can repair common syntax mistakes, but heavily truncated or logically ambiguous data requires a human decision." },
      { question: "Does the JSON leave my browser?", answer: "The repair interface processes the pasted text in the current browser session and does not upload it to a 77 Toolkit API." },
    ],
  },
  "json-diff": {
    intro: "JSON Diff compares data by structure rather than by visual line wrapping. It is useful when an API response, configuration file, or saved object has changed and you need the exact property path for each difference.",
    steps: ["Paste valid JSON into the Original and Updated editors.", "Select Compare JSON.", "Review added, removed, and changed paths together with their before and after values."],
    example: { input: "Original: {\"status\":\"draft\",\"count\":2}", output: "Updated: $.status → ready; $.count → 3" },
    howItWorks: "Objects are compared by key, arrays by index, and primitive values by type and value. The $ symbol represents the document root, with dot and bracket notation identifying nested data.",
    limitations: ["Array reordering appears as changes at multiple indexes.", "Both documents must already be valid JSON; use JSON Fix first when parsing fails."],
    faqs: [
      { question: "Is key order treated as a difference?", answer: "No. Object properties are compared by key, so formatting and key order do not create false changes." },
      { question: "Can it compare very large responses?", answer: "It runs locally and can handle ordinary API payloads, but extremely large documents may be constrained by the device's memory." },
    ],
  },
  timestamp: {
    intro: "Timestamp Converter translates Unix seconds, Unix milliseconds, ISO 8601 values, and local date input. It is intended for log inspection, API debugging, scheduled jobs, and any situation where a bare integer needs human context.",
    steps: ["Paste a numeric timestamp or date string, or choose a local date and time.", "Select the matching convert action.", "Compare Unix seconds, milliseconds, UTC ISO output, and the timezone-aware local result."],
    example: { input: "1721044800", output: "2024-07-15T12:00:00.000Z" },
    howItWorks: "Numbers below the normal millisecond range are interpreted as Unix seconds; larger values are interpreted as milliseconds. Date text is parsed by the browser, while ISO output is always shown in UTC.",
    limitations: ["Ambiguous date strings may be interpreted differently across browsers.", "Historical timezone rules depend on the timezone database available on the device."],
    faqs: [
      { question: "Why is local time different from the ISO value?", answer: "ISO output uses UTC, while local output applies the timezone configured on your device." },
      { question: "Are Unix timestamps affected by timezone?", answer: "The timestamp itself is not; only the human-readable display changes with timezone." },
    ],
  },
  "jwt-decoder": {
    intro: "JWT Decoder reveals the readable header and payload inside a JSON Web Token. It helps developers inspect algorithms, subjects, issuers, audiences, and expiration claims without sending a token to a remote decoder.",
    steps: ["Paste a three-part JWT into the token field.", "Select Decode token.", "Inspect the JSON header, payload, and any expiration message without treating the result as verified."],
    example: { input: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI3NyJ9.signature", output: "Header algorithm: HS256; payload subject: 77" },
    howItWorks: "JWT header and payload sections use Base64URL encoding. The tool decodes those two sections as UTF-8 JSON; it does not possess the signing key or validate the cryptographic signature.",
    limitations: ["Decoded claims can be forged and must not be trusted without signature verification.", "Avoid pasting active production tokens on shared or untrusted devices."],
    faqs: [
      { question: "Does a successful decode mean the token is valid?", answer: "No. Decoding only reveals claims. Your application must verify the signature, issuer, audience, expiry, and other rules." },
      { question: "Is the token uploaded?", answer: "The decoder runs in the current browser tab and does not send the token to a 77 Toolkit backend." },
    ],
  },
  base64: {
    intro: "Base64 Encoder converts UTF-8 text to Base64 and back. It is useful for inspecting encoded configuration values, small data fields, and URL-safe tokens where the content is encoding—not encryption.",
    steps: ["Enter plain text and encode it, or paste Base64 and decode it.", "Enable URL-safe mode when the value uses - and _ instead of + and /.", "Review the decoded text before using it in a configuration or request."],
    example: { input: "Hello, 77 Toolkit!", output: "SGVsbG8sIDc3IFRvb2xraXQh" },
    howItWorks: "The browser first converts text to UTF-8 bytes, then maps those bytes to the Base64 alphabet. URL-safe mode substitutes characters that have special meaning in URLs and can omit padding.",
    limitations: ["Base64 does not hide or secure information.", "The text decoder expects valid UTF-8 and may reject arbitrary binary data."],
    faqs: [
      { question: "Is Base64 encryption?", answer: "No. Anyone can decode it without a password or key." },
      { question: "Why does encoded text become longer?", answer: "Base64 represents every three bytes with four characters, so size normally increases by roughly one third." },
    ],
  },
  "regex-tester": {
    intro: "Regex Tester provides a fast place to build and inspect JavaScript regular expressions. Matches are highlighted in context and listed with indexes and capture groups, which makes subtle pattern behavior easier to understand.",
    steps: ["Enter a pattern without surrounding slash delimiters.", "Choose JavaScript flags such as g, i, m, s, u, or y and add representative test text.", "Run the test and inspect highlighted matches, indexes, and captured groups."],
    example: { input: "Pattern: \\btool\\w* · Text: tools, toolkit, task", output: "Matches: tools; toolkit" },
    howItWorks: "The pattern is compiled with the browser's JavaScript RegExp engine. Global matching is enabled for the result list so every occurrence can be shown, while other requested flags are preserved.",
    limitations: ["JavaScript syntax and features can differ from PCRE, Python, Java, or .NET regex engines.", "A poorly designed expression can be slow on large or adversarial text."],
    faqs: [
      { question: "Should I include /pattern/ delimiters?", answer: "No. Enter only the pattern and place flags in the separate flags field." },
      { question: "Why does the pattern work elsewhere but not here?", answer: "The other environment may use a different regex engine or escaping convention." },
    ],
  },
  "uuid-generator": {
    intro: "UUID Generator creates random version 4 identifiers and validates canonical UUID strings. It is suited to test records, client-side identifiers, fixtures, and systems that need identifiers without a central sequence.",
    steps: ["Choose how many UUIDs to create.", "Select uppercase or hyphen formatting if required.", "Generate and copy the values, or paste an existing UUID into the validator."],
    example: { input: "Generate 1 UUID v4", output: "Example shape: 123e4567-e89b-4d3a-a456-426614174000" },
    howItWorks: "Generation uses crypto.randomUUID(), which draws from the browser's cryptographically secure random source and sets the version and variant bits defined for UUID v4.",
    limitations: ["Generated values are random identifiers, not proof of authenticity or creation time.", "Removing hyphens produces a useful transport form but not the canonical textual representation."],
    faqs: [
      { question: "Can two generated UUIDs collide?", answer: "A collision is theoretically possible but extraordinarily unlikely when a secure UUID v4 generator is used correctly." },
      { question: "Does validation prove a UUID exists in my database?", answer: "No. Validation checks format and version bits only." },
    ],
  },
  "hash-generator": {
    intro: "Hash Generator calculates SHA-256, SHA-384, or SHA-512 digests for text and local files. Digests help compare files, check transfer integrity, and reproduce values supplied by a trusted publisher.",
    steps: ["Enter text or select one local file.", "Choose the expected SHA algorithm.", "Calculate the hexadecimal digest and compare every character with the trusted reference."],
    example: { input: "SHA-256 of: hello", output: "2cf24dba5fb0a30e…938b9824" },
    howItWorks: "The browser's Web Crypto API reads the input bytes and calculates a one-way cryptographic digest. The hexadecimal output is a representation of that digest, not the original content.",
    limitations: ["A matching hash proves byte equality only when the reference hash itself is trusted.", "General hashes are not a safe replacement for a password-hashing scheme such as Argon2, scrypt, or bcrypt."],
    faqs: [
      { question: "Can a SHA hash be reversed?", answer: "There is no direct reversal operation, but weak or predictable inputs can still be guessed and compared." },
      { question: "Why does the same-looking text have a different hash?", answer: "Encoding, line endings, invisible whitespace, and Unicode normalization can change the underlying bytes." },
    ],
  },
  "xml-formatter": {
    intro: "XML Formatter validates an XML document with the browser parser, then presents either an indented or compact serialization. It is intended for configuration files, feeds, API payloads, SVG source, and short document fragments where a readable structure makes mismatched elements or unexpected namespaces easier to diagnose.",
    steps: [
      "Paste one complete XML document and select Validate and format.",
      "Read any parser error before using the normalized output.",
      "Review whitespace-sensitive text, namespace declarations, comments, and processing instructions before copying the formatted or minified result.",
    ],
    example: { input: "<catalog><tool id=\"77\"><name>XML Formatter</name></tool></catalog>", output: "<catalog>\n  <tool id=\"77\">\n    <name>XML Formatter</name>\n  </tool>\n</catalog>" },
    howItWorks: "The browser DOMParser reads the source as application/xml. A parser error stops conversion. Valid nodes are serialized back to XML, and the readable view inserts indentation between structural tags without contacting a schema service or fetching external resources.",
    limitations: [
      "Well-formed XML can still violate an XSD, DTD, namespace contract, or application-specific schema.",
      "Pretty printing can add whitespace between elements, so mixed-content and digitally signed documents require special care.",
      "The tool does not resolve external entities, download referenced resources, or execute embedded SVG scripts.",
    ],
    faqs: [
      { question: "Does valid XML mean the data is accepted by my application?", answer: "No. This page checks well-formed syntax only; validate the result against the schema and business rules used by the receiving system." },
      { question: "Why did an empty element change shape?", answer: "Browser serialization may normalize equivalent syntax such as an explicit opening and closing pair versus a self-closing element." },
      { question: "Can I safely format signed XML?", answer: "Do not assume so. Canonicalization and whitespace can affect signatures; use the signing system's approved XML canonicalization workflow." },
    ],
  },
  "cron-inspector": {
    intro: "Cron Expression Inspector checks portable five-field schedules for minute, hour, day of month, month, and day of week. It expands lists, ranges, wildcards, and step values, then previews upcoming runs in the timezone configured on the current device so scheduling mistakes become visible before deployment.",
    steps: [
      "Paste a five-field expression such as 15 9 * * 1-5.",
      "Validate the fields and read the plain-language field summary.",
      "Compare the next run times with the timezone and cron implementation used by the real scheduler.",
    ],
    example: { input: "15 9 * * 1-5", output: "At minute 15 past hour 9 on Monday through Friday; upcoming runs shown in the device timezone" },
    howItWorks: "Each field is parsed into an allowed set of numeric values. The preview advances minute by minute through a bounded future window and applies traditional cron day matching, where restricted day-of-month and day-of-week fields match when either one is satisfied.",
    limitations: [
      "Only classic five-field syntax is supported; seconds, years, L, W, #, ?, @daily, and vendor macros are intentionally rejected.",
      "Cron dialects disagree about day matching, Sunday numbering, daylight-saving transitions, and missed runs.",
      "The preview uses the device timezone and is not a guarantee that a cloud scheduler has the same timezone or retry policy.",
    ],
    faqs: [
      { question: "Why is my six-field expression rejected?", answer: "Some platforms add a seconds field. This tool deliberately accepts only the portable five-field minute-first form." },
      { question: "What happens during daylight-saving changes?", answer: "A local clock time may be skipped or repeated. Confirm the production scheduler's documented behavior and consider scheduling in UTC." },
      { question: "Does 0 0 1 * 1 mean Monday and the first day together?", answer: "Traditional cron commonly treats the two restricted day fields as OR, but some services differ. The tool states the rule it uses so you can compare it with your platform." },
    ],
  },
  "password-generator": {
    intro: "Password Generator creates independent random passwords with the browser cryptography API. Length, quantity, character groups, required-group behavior, and ambiguous-character removal are visible controls, making it useful when an account requires a password that cannot be created directly inside a password manager.",
    steps: [
      "Choose a length, quantity, and at least one character group.",
      "Keep the require-each-group option enabled when the destination enforces composition rules.",
      "Generate, transfer the chosen value directly into a trusted password manager, and clear it from clipboard history where appropriate.",
    ],
    example: { input: "20 characters · upper, lower, numbers, symbols · exclude ambiguous", output: "A fresh password assembled with unbiased cryptographic random selection" },
    howItWorks: "Random bytes come from crypto.getRandomValues. Rejection sampling avoids modulo bias when selecting from a character set, required groups are inserted explicitly, and the final characters are shuffled again with secure random indexes.",
    limitations: [
      "The displayed entropy estimate assumes independent selection from the visible alphabet and is guidance rather than a strength certification.",
      "A compromised browser, extension, operating system, clipboard manager, or screen recorder can still expose generated values.",
      "The tool cannot check whether a site stores passwords correctly or whether a generated value has been reused elsewhere.",
    ],
    faqs: [
      { question: "Is a long password always accepted?", answer: "No. Some services impose maximum lengths or reject particular symbols, so review the site's exact rules without weakening the password more than necessary." },
      { question: "Should I memorize the generated value?", answer: "For most accounts, store a unique value in a reputable password manager and protect that manager with strong authentication." },
      { question: "Can I use this for encryption keys?", answer: "Not automatically. Cryptographic protocols define key sizes and byte formats; use the key-generation method required by that protocol." },
    ],
  },
  "date-calculator": {
    intro: "Date Calculator measures the elapsed span between two date-only values and adds or subtracts calendar units from a starting date. It reports total days, weekdays, weeks plus days, and an inclusive count, while keeping date-only arithmetic separate from clocks and timezone offsets.",
    steps: [
      "Choose a start and end date to measure their signed calendar-day difference.",
      "Review total days, inclusive days, weekdays, and the weeks-plus-days representation.",
      "For calendar arithmetic, select a quantity and unit, then verify how month-end or leap-day clamping affects the result.",
    ],
    example: { input: "Start 2026-01-31 · add 1 month", output: "2026-02-28 because February has no day 31" },
    howItWorks: "Date inputs are converted to UTC calendar components so daylight-saving clock changes do not turn a date-only span into 23 or 25 hours. Month and year operations preserve the intended day when possible and clamp to the last valid day of the target month.",
    limitations: [
      "Weekdays exclude Saturday and Sunday but do not know national, regional, company, or market holidays.",
      "The calculator works with Gregorian date-only values and does not calculate times, durations below one day, or named timezone transitions.",
      "Legal deadlines and billing periods can use domain-specific inclusion rules that differ from the displayed arithmetic.",
    ],
    faqs: [
      { question: "Why are inclusive days one larger?", answer: "Inclusive counting treats both the start and end dates as counted calendar dates; elapsed-day difference measures the boundaries between them." },
      { question: "How are negative spans handled?", answer: "When the end precedes the start, the total is negative while the component summary identifies the direction." },
      { question: "Are public holidays excluded from weekdays?", answer: "No. Use an authoritative holiday calendar for the relevant jurisdiction or organization." },
    ],
  },
  "text-clean": {
    intro: "Text Clean removes common Markdown markers, copied rich-text artifacts, excessive whitespace, and awkward line breaks while keeping paragraphs readable. It is designed for moving text between chat tools, documents, email, and plain-text fields.",
    steps: ["Paste the copied text into the editor.", "Select Clean Format and review the result in place.", "Copy the cleaned text only after checking headings, lists, and intentional spacing."],
    example: { input: "**Important**  text\n\n\nwith extra spacing", output: "Important text\n\nwith extra spacing" },
    howItWorks: "A sequence of browser-side text rules removes known formatting markers and normalizes whitespace. The process does not understand the full meaning of every Markdown or document structure.",
    limitations: ["Formatting that carries meaning, such as nested lists or code indentation, may need manual review.", "The cleaner does not rewrite grammar, facts, tone, or wording."],
    faqs: [
      { question: "Will Text Clean change the meaning of my writing?", answer: "It targets formatting rather than wording, but you should review structured text where whitespace or markers are meaningful." },
      { question: "Is a copy of my text stored?", answer: "No document history is created by 77 Toolkit; the current text exists in the browser tab while you use it." },
    ],
  },
  "text-diff": {
    intro: "Text Diff compares two versions line by line. It is useful for drafts, configuration snippets, generated output, and notes where a full source-control system would be excessive.",
    steps: ["Paste the original and updated versions.", "Choose whether surrounding whitespace should be ignored.", "Compare the texts and read additions, removals, and unchanged line numbers."],
    example: { input: "Original: Fast tools\nUpdated: Fast local tools", output: "1 removed line; 1 added line" },
    howItWorks: "The tool computes a longest common subsequence of lines, then presents unmatched original lines as removals and unmatched updated lines as additions.",
    limitations: ["A changed line is represented as a removal followed by an addition rather than a character-level edit.", "Very large comparisons are limited to protect the browser from excessive memory use."],
    faqs: [
      { question: "Can it ignore all whitespace?", answer: "The current option ignores surrounding whitespace only; internal spaces remain significant." },
      { question: "Does it upload both documents?", answer: "No. Comparison is calculated in the active browser tab." },
    ],
  },
  "case-converter": {
    intro: "Case Converter reshapes words into writing styles and programming identifiers, including title, sentence, camel, Pascal, snake, kebab, constant, upper, and lower case.",
    steps: ["Paste words, a heading, or an existing identifier.", "Choose the target case style.", "Review acronyms and proper names, then copy or reuse the result for another conversion."],
    example: { input: "useful browser tools", output: "camelCase: usefulBrowserTools · snake_case: useful_browser_tools" },
    howItWorks: "The converter detects transitions in camelCase, separates non-letter and non-number characters, normalizes words, and joins them according to the selected style.",
    limitations: ["Automatic title and sentence case cannot reliably identify every acronym or proper noun.", "Punctuation is removed from programming-oriented case formats."],
    faqs: [
      { question: "Why did an acronym lose its capitalization?", answer: "Programming case conversion normalizes detected words before joining them; adjust domain-specific acronyms afterward." },
      { question: "Does it support non-English letters?", answer: "Word detection is Unicode-aware, though language-specific capitalization still depends on browser locale behavior." },
    ],
  },
  "line-processor": {
    intro: "Line Processor performs repeatable operations on lists, copied columns, URL sets, keywords, and other one-item-per-line data. Operations include trimming, blank removal, deduplication, sorting, reversing, numbering, prefixes, and suffixes.",
    steps: ["Paste one item per line.", "Choose an operation and any case or prefix option.", "Process the list, review the count, and move the result back to input if another operation is needed."],
    example: { input: "pear\nApple\npear\nbanana", output: "Deduplicated and sorted: Apple\nbanana\npear" },
    howItWorks: "Each action transforms an in-memory array of lines. Deduplication tracks previously seen values, while sorting uses locale-aware comparison with numeric handling.",
    limitations: ["Operations are applied one at a time; their order can change the final result.", "Case-insensitive deduplication keeps the first spelling encountered."],
    faqs: [
      { question: "How do I trim, deduplicate, and sort together?", answer: "Run Trim, use the result as input, then run Remove duplicates and Sort in the order you prefer." },
      { question: "Are blank lines considered duplicates?", answer: "Yes during deduplication. Use Remove empty lines when you want none in the final list." },
    ],
  },
  "word-counter": {
    intro: "Word Counter reports words, characters, non-space characters, lines, sentences, estimated reading time, and frequent terms as text is entered. It helps with editorial limits, summaries, captions, and early content review.",
    steps: ["Paste or type the text to measure.", "Read the live statistics and estimated reading time.", "Use frequent terms to spot repetition, then edit the source text and watch counts update."],
    example: { input: "77 Toolkit keeps useful tools in the browser.", output: "8 words · 1 sentence · about 1 minute" },
    howItWorks: "Unicode letter and number patterns identify word-like tokens, punctuation boundaries estimate sentences, and reading time uses a 200-word-per-minute baseline.",
    limitations: ["Word and sentence boundaries vary across languages and writing systems.", "Reading time is an estimate and does not account for technical complexity or visual material."],
    faqs: [
      { question: "Are spaces included in the character count?", answer: "The page shows both total characters and a separate count with whitespace removed." },
      { question: "Why is the reading time at least one minute?", answer: "Any non-empty text is rounded up so a short passage is not displayed as zero reading time." },
    ],
  },
  "markdown-preview": {
    intro: "Markdown Preview turns a practical subset of Markdown into a readable local preview and reviewable HTML source. It supports headings, paragraphs, emphasis, strong text, inline code, fenced code blocks, quotations, links, horizontal rules, and ordered or unordered lists without executing raw HTML from the pasted document.",
    steps: [
      "Paste or write Markdown and select Render preview.",
      "Compare the visual result with the generated HTML, especially around nested punctuation and list boundaries.",
      "Copy the HTML only when the destination accepts this supported subset and applies its own sanitization policy.",
    ],
    example: { input: "## Local tools\n\n- Private input\n- Reviewable output\n\n`npm run build`", output: "A level-two heading, two-item list, and inline code rendered as safe DOM nodes" },
    howItWorks: "A small browser-side parser recognizes block structures line by line and creates elements with DOM methods. Inline links are restricted to http, https, mailto, anchors, or relative paths. Raw HTML remains visible as text instead of becoming active markup.",
    limitations: [
      "This is not a complete CommonMark or GitHub Flavored Markdown implementation and does not support tables, task lists, footnotes, nested lists, or embedded HTML.",
      "Ambiguous emphasis and deeply nested inline markup may render differently in another Markdown engine.",
      "Copied HTML still needs contextual sanitization and policy review before accepting untrusted content in a production application.",
    ],
    faqs: [
      { question: "Can pasted script or iframe tags run?", answer: "No. Raw HTML is handled as text, and the preview is assembled with DOM nodes rather than assigning the source to innerHTML." },
      { question: "Why does GitHub render my document differently?", answer: "GitHub supports a larger Markdown dialect. Use its renderer or a maintained CommonMark library when exact compatibility is required." },
      { question: "Is the generated HTML automatically safe everywhere?", answer: "No. The preview avoids executing source HTML here, but every destination must still enforce its own allowed elements, attributes, and URL schemes." },
    ],
  },
  "color-spectrum": {
    intro: "Color Spectrum analyzes an image to surface dominant colors, related families, and individual pixel values. Designers and developers can use the result to build palettes, inspect references, and export reusable color data.",
    steps: ["Choose an image from the device.", "Inspect extracted colors, families, and pixels in the interactive view.", "Copy or export the palette in the format needed by the next design or development task."],
    example: { input: "A landscape image with blue sky and green vegetation", output: "A ranked palette with HEX, RGB, and related color-family information" },
    howItWorks: "The browser samples decoded image pixels, groups nearby colors, and ranks representative values. Results depend on sampling, image resolution, transparency, and the color space decoded by the browser.",
    limitations: ["Extracted colors are representative rather than a complete inventory of every pixel value.", "Browser color management and image profiles can influence displayed values."],
    faqs: [
      { question: "Is my source image uploaded?", answer: "The analyzer processes the selected image in the browser and does not send it to a 77 Toolkit image service." },
      { question: "Why is a small accent color missing?", answer: "Dominant-color ranking favors colors that occupy more sampled pixels; inspect the image directly for small accents." },
    ],
  },
  "image-compressor": {
    intro: "Image Compressor reduces the size of a selected image by re-encoding it as JPEG or WebP with adjustable quality. It is intended for web uploads, messages, documentation, and other cases where a smaller file matters more than lossless preservation.",
    steps: ["Choose an image and select JPEG or WebP.", "Adjust quality, then compress and compare the original and result sizes.", "Inspect the preview at useful zoom levels before downloading the smaller file."],
    example: { input: "2.4 MB JPEG at quality 78", output: "A new JPEG or WebP with its measured size and percentage change" },
    howItWorks: "The browser decodes the source, draws it to a Canvas at its original dimensions, and encodes new bytes using the selected format and quality setting.",
    limitations: ["Compression can introduce blur, ringing, banding, or color shifts.", "A small or already optimized image may become larger after another conversion."],
    faqs: [
      { question: "Which format should I choose?", answer: "WebP often provides smaller web files; JPEG remains widely compatible for photographs. Neither is ideal for every graphic." },
      { question: "Does quality change image dimensions?", answer: "No. This tool preserves width and height; use Image Resizer to change dimensions." },
    ],
  },
  "image-resizer": {
    intro: "Image Resizer creates a new image at exact pixel dimensions. It is useful for thumbnails, profile images, CMS limits, email assets, and responsive-image preparation.",
    steps: ["Choose an image and review its original dimensions.", "Enter a new width or height and keep aspect ratio enabled unless intentional stretching is required.", "Select a format, resize, inspect the preview, and download the result."],
    example: { input: "2400 × 1600 image resized to 1200 px wide", output: "1200 × 800 image when aspect ratio is preserved" },
    howItWorks: "The source is decoded and redrawn onto a Canvas with high-quality image smoothing. The new canvas is then encoded as PNG, JPEG, or WebP.",
    limitations: ["Enlarging an image cannot recreate detail absent from the source.", "Very large output dimensions are limited to protect memory and browser stability."],
    faqs: [
      { question: "Why did the height change when I edited width?", answer: "Keep aspect ratio calculates the matching dimension to prevent stretching." },
      { question: "Does resizing remove metadata?", answer: "Canvas re-encoding normally drops original metadata; use Metadata Remover when that is the explicit goal." },
    ],
  },
  "image-converter": {
    intro: "Image Format Converter changes a browser-readable image into PNG, JPEG, or WebP. It helps meet upload requirements, preserve transparency where supported, or choose a format better suited to a photograph or interface graphic.",
    steps: ["Choose the source image.", "Select PNG, JPEG, or WebP and adjust quality for lossy output.", "Convert, inspect transparency and visual quality, then download the new file."],
    example: { input: "Transparent PNG converted to JPEG", output: "JPEG with transparent areas filled white" },
    howItWorks: "The browser decodes the source pixels, draws them to Canvas, and uses Canvas encoding for the chosen format. JPEG has no alpha channel, so transparency is filled with white.",
    limitations: ["Animation and original metadata are not retained.", "Converting a lossy image to PNG does not restore detail or guarantee a smaller file."],
    faqs: [
      { question: "Which output supports transparency?", answer: "PNG and WebP can preserve transparency. JPEG cannot." },
      { question: "Why is the converted file larger?", answer: "Format efficiency depends on image content, dimensions, quality, and whether lossless storage is used." },
    ],
  },
  "contrast-checker": {
    intro: "Color Contrast Checker measures the readability of foreground and background colors using WCAG contrast ratios. It supports early accessibility decisions for text, buttons, labels, and interface states.",
    steps: ["Enter or pick foreground and background HEX colors.", "Read the contrast ratio and AA or AAA results for normal and large text.", "Adjust either color and retest it in the real component, including hover, focus, and disabled states."],
    example: { input: "Foreground #17212b on background #ffffff", output: "A calculated ratio with WCAG AA and AAA pass or fail badges" },
    howItWorks: "sRGB channels are converted to linear values, combined into relative luminance, and compared with the WCAG contrast-ratio formula from 1:1 to 21:1.",
    limitations: ["A passing ratio does not guarantee overall accessibility or readable typography.", "Logos, gradients, images, transparency, and dynamic backgrounds require testing in context."],
    faqs: [
      { question: "What ratio does normal text need?", answer: "WCAG AA uses 4.5:1 for normal text and 3:1 for large text; AAA uses higher thresholds." },
      { question: "Does this test color blindness?", answer: "No. Contrast is one requirement; information should also avoid relying on color alone." },
    ],
  },
  "metadata-remover": {
    intro: "Image Metadata Remover rebuilds a selected image without its original EXIF, GPS, camera, comment, and application metadata. It is useful before sharing a photograph when embedded details are unnecessary.",
    steps: ["Choose an image and select an output format.", "Remove metadata to create a newly encoded file.", "Preview the result, download it, and verify metadata with a separate trusted inspector when privacy is critical."],
    example: { input: "JPEG containing camera and location EXIF", output: "A newly encoded JPEG, PNG, or WebP without the original metadata blocks" },
    howItWorks: "Only decoded pixels are drawn to a new Canvas. The browser then creates a new file from those pixels instead of copying the source metadata container.",
    limitations: ["Animation, embedded color profiles, orientation tags, and other non-pixel properties may be lost or normalized.", "The tool cannot remove information visibly present in the pixels, such as faces, signs, or a photographed address."],
    faqs: [
      { question: "Does this guarantee anonymous sharing?", answer: "No. It removes embedded metadata, but the image content, filename, account, and sharing service can still reveal information." },
      { question: "Why can file size change?", answer: "The result is newly encoded, so compression settings and container overhead differ from the original." },
    ],
  },
  "url-parser": {
    intro: "URL Parser separates an absolute web address into the fields defined by the browser URL standard. It is useful when a redirect, callback, tracking link, or copied request contains a path, fragment, credentials, port, or repeated query parameters that are difficult to inspect as one line.",
    steps: ["Paste a complete URL including its scheme.", "Parse the address and inspect each structural field and decoded query entry.", "Copy only the component you need, then confirm that rebuilding or normalizing the address did not change its intended destination."],
    example: { input: "https://example.com:8443/search?q=local+tools&q=privacy#results", output: "Host example.com · port 8443 · two q values · fragment results" },
    howItWorks: "The tool uses the browser URL implementation, which applies standard parsing, resolves percent-encoded sequences where appropriate, and preserves repeated query entries through URLSearchParams. It never visits or checks the destination.",
    limitations: ["A syntactically valid URL is not proof that a host is safe, reachable, or owned by the expected organization.", "Normalization can change visual spelling, default ports, dot segments, and Unicode host presentation."],
    faqs: [
      { question: "Does parsing open the website?", answer: "No. The address is interpreted locally and no request is sent to its host." },
      { question: "Why do plus signs become spaces in query values?", answer: "URLSearchParams follows form-style query parsing, where a plus sign commonly represents a space. A literal plus should be percent encoded." },
    ],
  },
  "url-encoder": {
    intro: "URL Encoder applies percent encoding to either one component or a complete URI and can reverse valid encoded text. It helps distinguish a query value from a full address, which matters because separators such as slash, question mark, ampersand, equals, and hash have structural meaning.",
    steps: ["Choose component mode for a single value or full-URI mode for an already structured address.", "Encode or decode the text.", "Review every separator before inserting the result into a link, redirect, request, or configuration file."],
    example: { input: "Component: reports/July & August", output: "reports%2FJuly%20%26%20August" },
    howItWorks: "Component mode uses the JavaScript encodeURIComponent and decodeURIComponent algorithms. Full-URI mode uses encodeURI and decodeURI, which intentionally preserve characters that delimit URL structure.",
    limitations: ["Decoding malformed percent sequences raises an error instead of guessing missing bytes.", "Percent encoding is a transport representation, not encryption, access control, or protection from malicious destinations."],
    faqs: [
      { question: "Should I encode a whole URL as one component?", answer: "Only when the entire URL is itself a parameter value. Otherwise full-URI mode preserves the separators that give the address structure." },
      { question: "Why was a slash encoded in component mode?", answer: "A slash is structural inside a URL path, so component encoding escapes it when the slash is intended to be ordinary data." },
    ],
  },
  "csv-json-converter": {
    intro: "CSV ↔ JSON Converter moves small tabular datasets between delimited rows and arrays of objects. It supports quoted fields, embedded delimiters, escaped quotes, line breaks inside quoted values, and a selectable comma, semicolon, or tab delimiter.",
    steps: ["Choose the delimiter used by the source data.", "Convert CSV with a header row to JSON, or provide a JSON array of flat objects to create CSV.", "Review column names, empty values, numeric-looking text, quoting, and row counts before using the result."],
    example: { input: "name,note\nAda,\"local, private\"", output: "[{\"name\":\"Ada\",\"note\":\"local, private\"}]" },
    howItWorks: "A stateful parser reads quoted and unquoted CSV fields without splitting blindly on commas. CSV values remain strings because the format does not carry reliable type metadata. JSON-to-CSV collects object keys and quotes fields when required.",
    limitations: ["Nested objects and arrays are serialized as JSON text rather than expanded into multiple columns.", "Dialect details such as comments, locale-specific numbers, character encodings, and spreadsheet formulas require destination-specific review."],
    faqs: [
      { question: "Will numbers become JavaScript numbers automatically?", answer: "No. CSV does not reliably distinguish identifiers, dates, numbers, and numeric-looking text, so imported values remain strings." },
      { question: "Can a quoted field contain a newline?", answer: "Yes. A newline inside matching double quotes is retained as part of that field." },
    ],
  },
  "html-entities": {
    intro: "HTML Entity Encoder converts HTML-sensitive characters into character references and decodes named or numeric references back to text. It is intended for inspecting snippets, preparing literal examples, and understanding why text appears differently when interpreted as markup.",
    steps: ["Paste ordinary text to encode or entity text to decode.", "Choose the matching action and compare the source with the result.", "Use a context-aware template or sanitizer in production rather than treating one escaping operation as universal protection."],
    example: { input: "<strong>Tools & privacy</strong>", output: "&lt;strong&gt;Tools &amp; privacy&lt;/strong&gt;" },
    howItWorks: "Encoding replaces ampersand, angle brackets, quotation marks, and apostrophes with explicit references. Decoding delegates named and numeric references to the browser's HTML parser, then reads the resulting text rather than executing it as page markup.",
    limitations: ["HTML text, attribute, URL, CSS, and JavaScript contexts require different defenses.", "Decoding untrusted content does not make it safe to insert with innerHTML or execute in a document."],
    faqs: [
      { question: "Is entity encoding the same as sanitizing HTML?", answer: "No. Encoding can make text literal in a specific HTML context; sanitizing selectively permits safe markup and requires a dedicated, maintained policy." },
      { question: "Will decoding run scripts?", answer: "The tool returns decoded characters as text and does not inject them into the page as executable markup." },
    ],
  },
  "css-unit-converter": {
    intro: "CSS Unit Converter compares px, rem, em, vw, and vh values using explicit root font, element font, and viewport dimensions. It is useful for translating design measurements, checking responsive assumptions, and documenting how a computed size was derived.",
    steps: ["Enter a value and select its source unit.", "Set the root font size, current element font size, viewport width, and viewport height that apply to the design.", "Compare the equivalent values and verify them in the actual component at target zoom levels."],
    example: { input: "24 px with 16 px root font and 1440 × 900 viewport", output: "1.5 rem · 1.667 vw · 2.667 vh" },
    howItWorks: "Every source measurement is first converted to CSS pixels from the supplied assumptions. The pixel value is then divided by the relevant root, element, or viewport basis to calculate the other units.",
    limitations: ["Computed CSS can also depend on nesting, zoom, writing mode, container queries, font metrics, and browser rounding.", "Changing a value to rem or vw does not automatically make a layout accessible or responsive."],
    faqs: [
      { question: "What is the difference between rem and em?", answer: "rem is based on the root element's font size, while em is based on the current element's applicable font size for most length properties." },
      { question: "Why does the vw result change between devices?", answer: "One vw is one percent of the viewport width, so the same vw value represents a different pixel size when the viewport changes." },
    ],
  },
};
