import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  Grid3X3,
  Lock,
  Merge,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Workflow,
  Cpu,
  Fingerprint,
  RefreshCcw,
  Zap,
  Sliders,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';

export const brand = {
  name: 'Veracity',
  logo: '/Logo_of_data_managment_service.png',
  tagline: 'Pre-Ingestion Data Hygiene for Outbound & CRM Stacks',
  description:
    'An automated, air-gapped data hygiene engine. Deduplicate, format, and sanitize chaotic lead lists in 30 seconds before burning Clay credits or poisoning your HubSpot CRM.',
  url: 'https://veracity.io',
  email: 'contact@veracity.io',
  supportEmail: 'support@veracity.io',
  founder: {
    name: 'RevOps Leadership',
    role: 'Lead RevOps Architecture',
    bio: 'Dedicated RevOps engineering and air-gapped pre-ingestion data intelligence for modern B2B revenue teams.',
  },
};

export const ecosystemTools = [
  { name: 'Clay', benefit: 'Preserve Enrichment Credits', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { name: 'Apollo.io', benefit: 'Scraped List Sanitation', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { name: 'Smartlead', benefit: 'Protect Domain Reputation', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { name: 'Instantly', benefit: 'Zero-Bounce Deliverability', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { name: 'HubSpot', benefit: 'Clean 1-Click Ingestion', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { name: 'Salesforce', benefit: 'Enterprise Golden Records', color: 'bg-sky-50 text-sky-800 border-sky-200' },
  { name: 'n8n / Zapier', benefit: 'Headless Pipeline Webhooks', color: 'bg-rose-50 text-rose-800 border-rose-200' },
];

export const agencyGtmContent = {
  badge: 'BUILT FOR OUTBOUND AGENCIES & FRACTIONAL REVOPS',
  title: 'Stop Wasting Billable Hours & Software Credits on Dirty Data.',
  subtitle:
    'High-performing GTM agencies and RevOps consultants don’t have time to clean spreadsheets by hand. Veracity automates the entire pre-flight checklist before campaigns touch client tools.',
  pillars: [
    {
      title: 'Stop Burning Clay & Waterfall Credits',
      description:
        'Clay charges per enrichment row. Feeding 10,000 raw scraped leads with 2,500 duplicates burns 25% of your client’s budget on nothing. Veracity eliminates duplicates and invalid formats before enrichment runs.',
      metric: 'Save ~25-30%',
      metricLabel: 'On waterfall API spend',
    },
    {
      title: 'Smartlead & Instantly Deliverability Armor',
      description:
        'A 5% bounce rate from invalid syntax or malformed company names can burn secondary domains overnight. Veracity scrubs email syntax, normalizes E.164 phone numbers, and flags catch-alls automatically.',
      metric: '< 1.5%',
      metricLabel: 'Target campaign bounce rate',
    },
    {
      title: 'Zero-Effort CRM Ingestion for HubSpot & SFDC',
      description:
        'Never overwrite SDR notes or create 4 duplicate company entities when importing a trade-show or cold outbound batch. Veracity generates clean CSVs that map natively to CRM contact properties.',
      metric: '0 Records Lost',
      metricLabel: 'RFC 6902 reverse-patch audit',
    },
    {
      title: 'Headless Webhooks & Instant File Drop',
      description:
        'No complicated dashboard required for day-to-day work. Send lists via private drop URL, automated email, or connect your n8n / Zapier workflows directly to our REST API.',
      metric: '60 Seconds',
      metricLabel: 'Turnaround on 10k records',
    },
  ],
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; description: string; icon: LucideIcon }[];
};

export const navItems: NavItem[] = [
  {
    label: 'Core Engine',
    href: '#services',
    children: [
      { label: 'Dedup & Merge', href: '#services', description: 'Fellegi-Sunter entity resolution with 1-click undo', icon: Merge },
      { label: 'Clean & Standardize', href: '#services', description: 'Sub-syntactic byte pre-wash and E.164 telecom normalizer', icon: Sparkles },
      { label: 'Magical Import', href: '#services', description: 'Air-gapped staging sandbox & zero-config schema mapper', icon: Upload },
      { label: 'Enrich & Segment', href: '#services', description: 'Waterfall arbitrage & dynamic ICP cohort routing', icon: Search },
    ],
  },
  { label: 'For Agencies & GTM', href: '#agency' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About Us', href: '#about' },
  { label: 'Contact Us', href: '#contact' },
];

export type ServicePillar = {
  title: string;
  badge?: string;
  description: string;
  points: string[];
};

export type ServiceFeature = {
  id: string;
  tabLabel: string;
  icon: LucideIcon;
  headline: string;
  subheadline: string;
  problem: string;
  solution: string;
  pipelineSteps: { step: string; detail: string }[];
  pillars: ServicePillar[];
  comparison?: {
    feature: string;
    legacy: string;
    veracity: string;
  }[];
  deliverables: string[];
  visual: 'merge' | 'clean' | 'governance' | 'enrich';
};

export const serviceFeatures: ServiceFeature[] = [
  {
    id: 'dedup-merge',
    tabLabel: '1. Dedup & Merge',
    icon: Merge,
    headline: 'Non-Destructive Deduplication & Merge',
    subheadline: 'Air-Gapped Entity Resolution with O(1) Constant-Time Undo',
    problem:
      'In traditional CRMs and legacy tools (like DemandTools, Insycle, or native dedupe rules), deduplication is a "Wrecking Ball": they find two records with similar fields, blindly smash them together, permanently overwrite deal history, erase SDR call notes, and offer zero undo capability.',
    solution:
      'Veracity replaces this with an Air-Gapped, Non-Destructive Entity Resolution Engine. Instead of deleting or corrupting records, Veracity uses the Fellegi-Sunter mathematical model to detect true identities, synthesizes a pristine Golden Record with intelligent field survivorship, shields active customers from accidental cold outreach, and backs every single mutation with an RFC 6902 audit ledger for instant 1-Click Undo in O(1) time.',
    pipelineSteps: [
      { step: 'Incoming Data Batch', detail: 'Ingested into ephemeral RAM void' },
      { step: 'Fellegi-Sunter Matching', detail: 'Disjoint-set Union-Find clustering across 3 vectors' },
      { step: 'Field Survivorship', detail: 'Attribution lock + recency of truth + empty field coalesce' },
      { step: 'Compliance & Anti-Collision', detail: 'Most Restrictive Wins privacy lock + active client shield' },
      { step: 'Golden Record Minting', detail: 'Raw child records preserved non-destructively' },
      { step: 'RFC 6902 Reverse Patch', detail: '1-Click atomic rollback ledger in O(1) time' },
    ],
    pillars: [
      {
        title: '1. Probabilistic Entity Resolution (Beyond Exact-Match)',
        description: 'Legacy tools only match when strings are 100% identical. Veracity groups duplicates across three independent vectors using disjoint-set Union-Find algorithms:',
        points: [
          'Exact Normalized Email Root matching',
          'E.164 Sanitized Phone Number + Phonetic Last Name (Soundex / Metaphone)',
          'Corporate Domain Canonicalization (emea.acme.com -> acme.com) + Full Name (Jaro-Winkler distance)',
          'Algorithmic confidence score on every cluster (e.g. 94.2%); ambiguous records routed to Merge Studio without guessing',
        ],
      },
      {
        title: '2. Non-Destructive "Golden Record" Synthesis',
        description: 'When Veracity identifies 2, 5, or 10 duplicate records for the same person or company, it never destroys the raw child data:',
        points: [
          'Parent-Child Lineage: Raw child records are preserved with status CONSOLIDATED pointing to a newly minted Master_Golden_UUID',
          'Attribution Lock: Retains the oldest creation timestamp to preserve first-touch marketing attribution and rep source credit',
          'Recency of Truth: Retains the most recently verified contact vector (live SMTP mailbox, active E.164 mobile number)',
          'Intelligent Field Coalescing: Blanks are filled from duplicate records without overwriting valid data',
        ],
      },
      {
        title: '3. The "Most Restrictive Wins" Compliance Guard',
        description: 'Never risk GDPR or TCPA violations from an automated merge that accidentally re-subscribes an opted-out contact:',
        points: [
          'If even one duplicate in a cluster has "Do Not Call = TRUE" or "Unsubscribed = TRUE", the opt-out status is permanently locked into the Golden Record',
          'Sales reps are mathematically prevented from violating telemarketing regulations or spam laws due to a bad merge',
        ],
      },
      {
        title: '4. The CRM Anti-Collision Shield',
        description: 'Eliminates the embarrassment of an SDR cold-calling an active enterprise customer or open late-stage deal:',
        points: [
          'Pre-flight cross-referencing against your in-memory CRM Seed Database (active customers, open opportunities, key accounts)',
          'Collisions are tagged as CRM_COLLISION_ACTIVE_CLIENT and physically isolated into a Quarantine Bucket',
          'Hard-blocked from outbound cadence exports',
        ],
      },
      {
        title: '5. RFC 6902 Reverse-Patch Ledger & 1-Click Undo',
        description: 'Mass merges in standard CRMs cannot be reversed without weeks of manual database backup restoration:',
        points: [
          'Forensic Cell-Level Ledger (Tab 04): Every cell mutation is recorded with pre-merge value, post-merge value, rule ID, and timestamp',
          '1-Click Rollback in O(1) Time: Restore all 50,000 records to their original pre-merge state instantly with zero database corruption',
        ],
      },
    ],
    comparison: [
      { feature: 'Pricing Model', legacy: 'Database Size Tax (Charges on entire historical CRM size)', veracity: 'Flat Volume-Based ($150/mo for 30k records processed)' },
      { feature: 'Data Safety', legacy: 'Wrecking Ball (Blind destructive overwrites in live CRM)', veracity: 'Air-Gapped Golden Record (Raw records preserved non-destructively)' },
      { feature: 'Undo / Rollback', legacy: 'Impossible (Requires manual database backup restores)', veracity: '1-Click Instant Rollback (O(1) time via RFC 6902 reverse patch)' },
      { feature: 'Fuzzy Matching', legacy: 'Rigid rules or opaque black-box machine learning', veracity: 'Fellegi-Sunter Probabilistic with explainable confidence weights' },
      { feature: 'Opt-Out Safety', legacy: 'Overwrites unsubscribes with active child status', veracity: 'Most Restrictive Wins (GDPR/CCPA privacy lock)' },
      { feature: 'Active Shield', legacy: 'No active client collision protection', veracity: 'CRM Anti-Collision Guard (Blocks cold calls to live clients)' },
      { feature: 'Deliverable', legacy: 'Direct destructive write to CRM', veracity: '7-Tab Forensic Excel Workbook + Executive SCQA PDF' },
    ],
    deliverables: [
      'The Approved Golden Batch: Clean, single-source-of-truth records ready for CRM upload or outbound sequencing.',
      'Tab 03 (Dedup Clusters): Grouped view of every cluster showing the primary Golden Record and its children.',
      'Tab 04 (Forensic Audit Trail): Line-by-line receipt documenting every field merged, coalesced, or standardized.',
      'Interactive Merge Studio Access: Visual side-by-side cockpit allowing RevOps managers to review diffs and override winners with 1 click.',
    ],
    visual: 'merge',
  },
  {
    id: 'clean-standardize',
    tabLabel: '2. Clean & Standardize',
    icon: Sparkles,
    headline: 'Sub-Syntactic Pre-Ingestion Sanitization Engine',
    subheadline: 'Byte-Level Sanitization, E.164 Normalization, & The Two-Bucket Partition',
    problem:
      'Raw lead lists from web forms, event CSVs, and legacy databases are riddled with invisible errors: trailing spaces, stringified nulls ("N/A"), keyboard smashes ("asdfghj"), and broken phone formats that cause sales dialers to crash.',
    solution:
      'Veracity intercepts data at the byte level before it ever touches your live CRM. It repairs malformed syntax, canonicalizes global telecom vectors to international standards, eliminates fake form fills using mathematical Shannon entropy algorithms, and enforces our "Do No Harm" Two-Bucket Partition.',
    pipelineSteps: [
      { step: 'Byte-Level Pre-Wash', detail: 'Strips zero-width bytes, non-printable tabs, BOM, and formula macro payloads' },
      { step: 'Smart Title Casing', detail: 'Repairs screaming caps, Celtic/Scottish names, and inverted directory names' },
      { step: 'Global E.164 Telecom', detail: 'Normalizes to ITU-T standards (+15555550199) and extracts extensions' },
      { step: 'Shannon Entropy Filter', detail: 'Traps dummy data, numpad walks, and form-evasion loops' },
      { step: 'Two-Bucket Partition', detail: '100% mutually exclusive split: Approved Bucket vs Quarantine Bucket' },
    ],
    pillars: [
      {
        title: '1. Sub-Syntactic Byte Sanitization & Pre-Wash',
        description: 'Traditional tools do crude find-and-replace string matching. Veracity inspects data down to the raw byte layer:',
        points: [
          'Invisible Character Stripping: Removes zero-width spaces (\\u200b–\\u200d), byte order marks (\\ufeff), vertical tabs (\\x0b), and control bytes',
          'Direct-Mail Safe Whitespace: Cleans trailing spaces while preserving multi-line carriage returns on physical addresses and sales notes',
          'Anti-Hacker Formula Shield: Detects and neutralizes malicious spreadsheet macro payloads (=cmd|\' /C calc\'!A0 or -2+3+cmd) so teams open exports safely',
        ],
      },
      {
        title: '2. Smart Title Casing & Corporate Entity Normalization',
        description: 'Protects sales credibility by eliminating embarrassing email greetings like "Hi JOHN" or "Hi john":',
        points: [
          'Case Correction: Converts screaming all-caps ("JOHN SMITH") and typo casing ("jOhn smIth") into proper title case ("John Smith")',
          'Celtic & Cultural Name Patterns: Preserves authentic capitalizations ("mcdonald" -> "McDonald", "o\'connor" -> "O\'Connor", "d\'angelo" -> "D\'Angelo")',
          'Inverted Name Repair: Detects backwards directory exports ("Smith, John") and automatically flips them to "John Smith"',
          'Corporate Entity Whitelist: Standardizes legal suffixes ("Acme L.L.C." -> "Acme LLC") while protecting uppercase acronyms (AWS, SaaS, RevOps, IBM)',
        ],
      },
      {
        title: '3. ITU-T Global E.164 Telecom Normalization',
        description: 'Fixes phone numbers formatted with extensions or parenthesis that crash auto-dialers (Orum, Kixie, Dialpad, HubSpot/Salesforce CTI):',
        points: [
          'Canonical E.164 Standard: Formats phone numbers into international telecom standards (+15555550199)',
          'Extension Splitting: Isolates extensions ("ext 402") into a dedicated Phone_Extension column so dialers connect without DTMF tone failures',
          'Country Code Anchoring: Recognizes international carrier roots (UK +44, Germany +49, India +91, Australia +61) without blindly prepending US +1',
        ],
      },
      {
        title: '4. The "Sentinel Trap" & Shannon Entropy Filter',
        description: 'B2B web forms are constantly filled with evasion tactics by people seeking gated content:',
        points: [
          'Mathematical Entropy Detection: Uses the Shannon Entropy Model H(X) = -Σ P(x) log2 P(x) from AT&T Bell Labs research to evaluate character unpredictability',
          'Traps Dummy Data & Keyboard Mashes: Catches low-entropy filler ("9999999999", "1234567890"), keyboard walks ("asdfghjkl"), and dummy emails ("test@test.com")',
          'Onomastic Protection: Shields authentic international names with high consonant density (Polish "Szczepanski", Welsh "Llewellyn") from false positives',
        ],
      },
      {
        title: '5. The "Do No Harm" Two-Bucket Partition',
        description: 'Unlike standard tools that blindly push mixed data into your CRM, Veracity enforces physical separation:',
        points: [
          'The Approved Bucket: 100% pristine, dialer-ready, standardized records safe to import directly into your CRM or outbound sales sequencer',
          'The Quarantine Bucket: Records with fatal syntax errors isolated with clear diagnostic reasons (SYNTAX_INVALID_EMAIL, TELECOM_DUMMY_STRING)',
          'Zero Silent Drops: Every single row is accounted for with plain-English remediation notes',
        ],
      },
    ],
    deliverables: [
      'Approved Bucket: 100% CRM-ready records with standardized casing and verified E.164 phone formats.',
      'Quarantine Bucket: Detailed triage instructions explaining the exact defect reason for every quarantined row.',
      'Defect Audit Matrix: Field-level error density distribution revealing which lead channels submit the highest rate of bad data.',
    ],
    visual: 'clean',
  },
  {
    id: 'magical-import',
    tabLabel: '3. Magical Import',
    icon: Upload,
    headline: 'The Pre-Flight Ingestion Firewall',
    subheadline: 'Air-Gapped Staging Sandbox, AI Schema Mapping, & Ephemeral Zero-Storage',
    problem:
      'Uploading raw CSVs or vendor lists directly into a live CRM is an operational hazard. Mismatched column encodings, shifted delimiters, multi-line notes, and restricted picklist rejections often corrupt live data, reset routing queues, or silently drop thousands of leads.',
    solution:
      'Veracity’s Magical Import acts as an air-gapped, zero-storage staging sandbox. It sits between unvetted external files and your production database. It autonomously detects schemas, aligns multi-line files, forks leads into Contacts, Accounts, and Deals, and intercepts errors into a Dead Letter Queue before a single byte reaches your live CRM.',
    pipelineSteps: [
      { step: 'Byte Sniffer & Header Locator', detail: 'Scans rows 0-9 to find true header row, strips BOM, harmonizes encodings to UTF-8' },
      { step: 'Dual-Layer Schema Mapper', detail: 'Lexical alias ontology + semantic value-entropy fingerprinting across entire file' },
      { step: 'Multi-Object Entity Forker', detail: 'Forks 1 flat row into Contact, Account, and Deal objects with relational keys' },
      { step: 'Restricted Picklist Guard', detail: 'Standardizes values against CRM picklists and flags ambiguous date formats' },
      { step: 'Dead Letter Queue (DLQ)', detail: 'Critical schema violations intercepted with line-by-line remediation receipts' },
      { step: 'Ephemeral Zero-Storage Void', detail: 'Volatile RAM DuckDB execution with cryptographic AES-256 shredding upon export' },
    ],
    pillars: [
      {
        title: '1. Autonomous Parser & Encoding Harmonization',
        description: 'Never wrestle with broken delimiters or unreadable characters again:',
        points: [
          'True Header Row Detection: Scans the first 10 rows using entropy scoring to pinpoint true column headers even under title banners or empty rows',
          'Encoding Harmonizer: Converts corrupted encodings (Windows-1252, Latin-1, Shift-JIS) into clean UTF-8 so accented names are never mangled',
          'Adaptive Delimiter & Quoting Engine: Sniffs comma, tab, pipe, or semicolon delimiters and handles embedded quotes without row shifts',
        ],
      },
      {
        title: '2. Dual-Layer AI Schema Mapper (Zero-Config Mapping)',
        description: 'You do not have to manually match 40 columns to CRM fields:',
        points: [
          'Layer 1 (Lexical Alias Ontology): Pre-trained library across Salesforce, HubSpot, Dynamics, and Marketo (maps "fname", "given_name", "first" to First Name)',
          'Layer 2 (Semantic Value Fingerprinting): Evaluates underlying data values to infer field types even with generic headers like "Column A" or "Field_3"',
          'Reservoir Sampling (Vitter Algorithm R): Samples records uniformly across the entire file to detect late-column schema drift',
        ],
      },
      {
        title: '3. Multi-Object Entity Forking & Relational Linking',
        description: 'A raw outbound list is a flat spreadsheet, but your CRM is a relational database:',
        points: [
          'Contact Object: First Name, Last Name, Direct Email, Mobile Phone, Job Title',
          'Account / Company Object: Company Name, Corporate Root Domain, Industry, Employee Count',
          'Deal / Opportunity Object: Lead Stage, Pipeline Amount, Campaign Source',
          'Relational Association: Automatically maps parent-child keys so contacts link correctly to companies upon ingestion',
        ],
      },
      {
        title: '4. Restricted Picklist Projection & Syntax Trapping',
        description: 'Prevents silent CRM API rejections when fields do not match allowed picklists:',
        points: [
          'Semantic Projection: Maps incoming values to exact allowed picklist entries (e.g. "Calif." -> "California", "US" -> "USA")',
          'Locale-Aware Date Blocker: Detects ambiguous dates (04/05/2026 — April 5 or May 4?) and flags them for confirmation before deal close dates corrupt',
        ],
      },
      {
        title: '5. The Dead Letter Queue (DLQ) & Zero Silent Drops',
        description: 'Standard CRM bulk upload tools drop corrupted records into a black hole:',
        points: [
          'Diagnostic Interception: Critical violations (e.g. text in currency fields) are caught in a dedicated Dead Letter Queue',
          'Plain-English Remediation: Explains exactly what row and field failed (e.g. ERROR_INVALID_CURRENCY_FIELD: \'TBD\' found on row 412)',
        ],
      },
      {
        title: '6. InfoSec "Zero-Storage" Guarantee (Ephemeral DuckDB)',
        description: 'Enterprise CISOs demand absolute customer data privacy:',
        points: [
          'Volatile RAM Execution: Data processing takes place in an in-memory, air-gapped staging void powered by DuckDB',
          'No Disk Persistence: Customer PII and lead lists are never stored in permanent databases',
          'Cryptographic Shredding: Upon export, memory micro-shards are shredded (AES-256 DEK disposal), leaving zero digital residue',
        ],
      },
    ],
    deliverables: [
      'Multi-Object Mapped Export: Ready-to-import CSV packages for Contacts, Accounts, and Deals.',
      'Dead Letter Queue (DLQ) Ledger: Line-by-line audit of any rejected row with exact remediation instructions.',
      'Zero-Storage Cryptographic Certificate: Proof of ephemeral processing with zero server-side retention.',
    ],
    visual: 'governance',
  },
  {
    id: 'enrich-segment',
    tabLabel: '4. Enrich & Segment',
    icon: Search,
    headline: 'Waterfall Enrichment Arbitrage & Dynamic Cohorts',
    subheadline: 'Multi-Tier Cost Arbitrage, Trie Honeypot Sieve, & Dynamic ICP Routing',
    problem:
      'Legacy enrichment vendors (ZoomInfo, Apollo, Clearbit) lock revenue teams into expensive annual contracts, charge flat fees regardless of match quality, and push stale cached records. Worst of all, they burn expensive API credits blindly—querying a $1.00 premium endpoint for every raw lead, even when basic data was already available or the email was a dead spam trap.',
    solution:
      'Veracity replaces dumb API querying with Waterfall Enrichment Arbitrage and Dynamic Cohort Routing. We triage data through multi-tiered verification pools (saving up to 80% on credit costs), filter out toxic spam traps with an O(k) Trie sieve before credits are burned, and dynamically route enriched records into hyper-targeted outbound tiers based on verified ICP telemetry.',
    pipelineSteps: [
      { step: 'Honeypot & Catch-All Sieve', detail: 'Trie-based filtering of spam traps, disposable domains, and dead mailboxes' },
      { step: 'Tier 1 Ephemeral Cache ($0.00)', detail: 'Internal verified domain dictionary and normalized metadata lookup' },
      { step: 'Tier 2 Fast Commodity APIs ($0.02)', detail: 'High-speed firmographics, generic phone routing, and MX validation' },
      { step: 'Tier 3 Premium Direct-Dial ($0.50-$1.00)', detail: 'Invoked only if Tiers 1 and 2 fail to find verified mobile numbers' },
      { step: 'Technographic Telemetry', detail: 'Firmographics, tech stack fingerprinting, ARR brackets, funding stage' },
      { step: 'Dynamic Cohort Routing', detail: 'Tier 1 VIP AE cadence vs Tier 2 SDR cadence vs Tier 3 PLG drip' },
    ],
    pillars: [
      {
        title: '1. Honeypot & Catch-All Sieve (honeypot_trie.py)',
        description: 'Stop burning money on dead leads and protect domain reputation:',
        points: [
          'Prefix-Tree Domain Filtering: Evaluates email domains in O(k) time against global blocklists of disposable mailboxes and spam traps',
          'Credit Shield: Halts enrichment on invalid or honeypot domains so you never spend a credit verifying a toxic email',
          'Sender Reputation Armor: Prevents bounce rate spikes above the 3% Google/Microsoft blacklist cliff',
        ],
      },
      {
        title: '2. Waterfall Enrichment Arbitrage (Up to 80% Cost Reduction)',
        description: 'Why pay $1.00 for data you could acquire for $0.02 or free? Veracity operates an intelligent 3-tier cascade:',
        points: [
          'Tier 1 (Ephemeral Cache / $0.00): Internal verified domain dictionary lookup consumes zero credits',
          'Tier 2 (Commodity APIs / $0.01–$0.02): Low-cost verification engines for basic firmographics and MX validation',
          'Tier 3 (Premium Specialized / $0.50–$1.00): Only invoked if Tiers 1 & 2 fail to find direct mobile numbers',
          'Cuts data vendor expenditure from $15,000 down to $2,500 – $3,500 for a 15,000-record batch',
        ],
      },
      {
        title: '3. Technographic & Firmographic Telemetry (entity_splitter.py)',
        description: 'Equip sales reps with surgical account context before picking up the phone:',
        points: [
          'Clean Entity Separation: Isolates Person attributes (Direct Dial, LinkedIn, Seniority) from Company attributes (Domain, ARR, Headcount)',
          'Technographic Fingerprinting: Detects live tech stack (Salesforce, HubSpot, Marketo, AWS, Shopify Plus, Snowflake)',
          'Funding & Growth Telemetry: Tags accounts with recent funding rounds, headcount growth trajectory, and buying windows',
        ],
      },
      {
        title: '4. Dynamic Cohort Routing & ICP Prioritization',
        description: 'No more flat lead lists. Route records where they drive the most revenue:',
        points: [
          'Tier 1 Enterprise VIP (>$50M ARR, Verified Mobile, C-Suite): Routed to Senior AE High-Touch Cadence (Loom + Direct Call)',
          'Tier 2 Mid-Market Growth ($10M-$50M ARR, Work Email, Director): Enrolled in Automated SDR Multichannel Sequence',
          'Tier 3 Long-Tail PLG (<$10M ARR, Individual Contributor, Free Webmail): Enrolled in Product-Led Self-Serve Drip',
          'Quarantine: Disqualified domains or broken phones isolated with remediation reason',
        ],
      },
      {
        title: '5. Forensic Lineage & Non-Destructive Delta Merging',
        description: 'Total data accountability with zero risk to existing sales notes:',
        points: [
          'Attribute-Level Sourcing: Tab 04 documents exact vendor source (Cache_T1, Clearbit_T2, ZoomInfo_T3), timestamp, and confidence score',
          'Non-Destructive Delta Patching: Never overwrites human-verified sales notes or custom CRM fields',
        ],
      },
    ],
    deliverables: [
      'Enriched Master Cohorts: Segmented lists partitioned by ICP tier and automated sales action.',
      'Tab 04 Cost & Lineage Ledger: Line-by-line proof of which data vendor supplied each field and credit cost.',
      'Verified Direct-Dial Sheet: High-confidence mobile numbers for senior decision makers.',
    ],
    visual: 'enrich',
  },
];

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  volume: string;
  status: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge: string;
  ctaText: string;
  overage: string;
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'The Outbound Sentry',
    price: '$150',
    period: '/month',
    volume: '30,000 Records / mo',
    overage: '+$10 per 2,000 rows overage',
    status: 'Full Engine Unlocked • Available Now',
    description:
      'Our dedicated pre-ingestion firewall for growing outbound sales teams and boutique agencies. Pure processed volume billing with zero feature gating.',
    features: [
      '30,000 Processed Rows / mo (+$10 per 2k overage)',
      '100% Full-Stack Engine Unlocked (All 4 Services)',
      'Multi-Vector Fuzzy Deduplication & Golden Record Merging',
      'E.164 Phone Normalization & Smart Name Title Casing',
      'The 7-Tab Master Excel Workbook & SCQA PDF Assessment',
      'Unlimited Free Re-Exports & In-Memory Draft Previews',
    ],
    highlighted: false,
    badge: 'STARTER VOLUME',
    ctaText: 'Claim Sentry Plan ($150/mo)',
  },
  {
    name: 'The Command Cockpit',
    price: '$349',
    period: '/month',
    volume: '100,000 Records / mo',
    overage: '+$10 per 3,000 rows overage',
    status: 'Full Engine Unlocked • Best Value',
    description:
      'Engineered for scaling B2B teams (5–15 SDRs) and mid-market RevOps managers handling heavy lead influx with high-density fuzzy clustering.',
    features: [
      '100,000 Processed Rows / mo (+$10 per 3k overage)',
      '100% Full-Stack Engine Unlocked (All 4 Services)',
      'Multi-Vector Fuzzy Deduplication & Custom Survivorship Rules',
      'Enrich & Segment (ICP Scoring, Seniority Taxonomy)',
      'Entity Master Data Management (B2B Corporate Mode)',
      'The 7-Tab Master Excel Workbook & CFO ROI Audit Report',
      'Priority Email & Queue Support',
    ],
    highlighted: true,
    badge: 'MOST POPULAR',
    ctaText: 'Get Command Cockpit ($349/mo)',
  },
  {
    name: 'The Agency Scale',
    price: '$749',
    period: '/month',
    volume: '300,000 Records / mo',
    overage: '+$10 per 4,000 rows overage',
    status: 'Full Engine Unlocked • High Volume',
    description:
      'Built for lead generation agencies managing multiple client campaigns simultaneously and enterprise database migration operations.',
    features: [
      '300,000 Processed Rows / mo (+$10 per 4k overage)',
      '100% Full-Stack Engine Unlocked (All 4 Services)',
      'Mass Bulk Ingestion with Air-Gapped High-Speed Processing',
      'Multi-Vector Fuzzy Deduplication & Cluster Matrix Override',
      'Custom Deterministic Transformation Recipes',
      'Dedicated Slack/WhatsApp Channel with RevOps Leadership',
      'Enterprise SLA & 1-Hour Ticket Response',
    ],
    highlighted: false,
    badge: 'AGENCY SCALE',
    ctaText: 'Deploy Agency Scale ($749/mo)',
  },
];

export const quarterlyCharter = {
  name: 'The 90-Day Quarterly Charter',
  price: '$399',
  period: '/quarter',
  effectiveMonthly: '$133/month effective',
  volume: '90,000 Rows Rolling Pool',
  badge: 'ELIMINATES MONTHLY CHURN',
  description:
    'Tailored for B2B sales teams running 90-day campaign cycles. Pay once per quarter with a rolling 90,000-row volume bucket that carries over across the entire 3-month cycle.',
  features: [
    '90,000 Processed Rows across the 90-day quarter',
    'Unused rows roll over across Months 1, 2, and 3',
    '100% Full-Stack Engine Unlocked on Day 1',
    'Multi-Vector Fuzzy Deduplication & Golden Record Merging',
    'The 7-Tab Master Excel Workbook & SCQA Executive Memo',
    'Save 11% compared to standard monthly billing ($133/mo effective)',
  ],
  ctaText: 'Lock In Quarterly Charter ($399/qtr)',
};

export const oneTimePasses = [
  {
    name: 'Quick Sprint',
    price: '$79',
    volume: '10,000 records',
    badge: 'SINGLE LIST SCRUB',
    description: 'Clean a single event list, trade-show export, or targeted outbound batch with zero recurring commitment.',
    features: [
      '10,000 Records Processed (One-Time)',
      'Full-Stack Engine (Clean, Dedup & Standardize)',
      'E.164 Phone Normalization & Email Syntax Check',
      'Download Clean CSV + 7-Tab Master Excel',
      '100% credited toward subscription if you upgrade within 14 days',
    ],
    ctaText: 'Buy Quick Sprint ($79)',
  },
  {
    name: 'Campaign Overhaul',
    price: '$199',
    volume: '50,000 records',
    badge: 'POPULAR PROJECT',
    highlighted: true,
    description: 'Purge duplicate clusters and format large lists pulled from Apollo, ZoomInfo, or scraped databases.',
    features: [
      '50,000 Records Processed (One-Time)',
      'Full-Stack Engine (Clean, Dedup, Merge & Enrich)',
      'Multi-Vector Fuzzy Deduplication & Golden Record Merging',
      'Executive SCQA ROI PDF Assessment + 7-Tab Excel Master',
      '100% credited toward subscription if you upgrade within 14 days',
    ],
    ctaText: 'Buy Campaign Overhaul ($199)',
  },
  {
    name: 'Enterprise Migration',
    price: '$449',
    volume: '150,000 records',
    badge: 'FULL DATABASE OVERHAUL',
    description: 'Complete pre-migration database sanitize before pushing historical data into Salesforce or HubSpot.',
    features: [
      '150,000 Records Processed (One-Time)',
      'Full-Stack Engine with Entity MDM Mode',
      'Multi-Vector Cluster Matrix with Custom Survivorship',
      'CFO ROI Audit Workbook & Line-by-Line Reverse Patch Ledger',
      '100% credited toward subscription if you upgrade within 14 days',
    ],
    ctaText: 'Buy Database Migration ($449)',
  },
];

export const customSetupAddons = [
  {
    tier: 'Quick Recipe Tuning',
    price: '$49',
    description: 'Single custom CSV column mapping & bespoke phone/name regex rules tailored to your unique spreadsheet headers.',
    features: [
      'Custom CSV header-to-canonical mapping profile',
      '1 custom regex cleaning rule (e.g. specialized country phones)',
      'Delivered in 24 hours',
    ],
  },
  {
    tier: 'Advanced Policy Setup',
    price: '$149',
    description: 'Configure custom ICP point scoring, specialized seniority taxonomies, and custom corporate domain blacklists.',
    features: [
      'Custom ICP point scoring formula',
      'Custom seniority tier classification taxonomy',
      'Corporate competitor & dummy email domain blacklists',
      'Delivered in 48 hours',
    ],
  },
  {
    tier: 'Full CRM Recipe Implementation',
    price: '$299',
    recommended: true,
    description: 'Bespoke survivorship rules, multi-vector tie-breakers, and a 1-on-1 concierge strategy walkthrough.',
    features: [
      'Complete custom duplicate survivorship rule design',
      'Multi-vector tie-breaker formulas (Newest vs Oldest vs Most Populated)',
      '45-minute 1-on-1 strategy walkthrough with Lead RevOps Architect',
      'Delivered in 48 hours',
    ],
  },
  {
    tier: 'Enterprise MDM Architecture',
    price: '$450',
    description: 'Full custom entity schema modeling, multi-team rules, bespoke loan/partner vectors, and ongoing direct VIP channel.',
    features: [
      'Custom corporate entity & portfolio schema modeling',
      'Multi-org governance & rule synchronization',
      'Private direct WhatsApp/Slack VIP channel with RevOps Leadership',
      'FREE for Annual Founding Cohort members!',
    ],
  },
];

export const foundingOffer = {
  hookHeadline: 'Full Engine Unlocked. Pay by Volume, Not Database Size.',
  hookBody:
    'Every single plan includes 100% of our enterprise engine: Magical Import, Clean & Standardize, Multi-Vector Fuzzy Deduplication, Enrich & Segment, and Forensic Excel Workbooks. Zero feature gating.',
  founderHeadline: 'Strict Cap: 10 Founding Member Licenses.',
  founderBody:
    'We are opening exactly 10 Founding Member licenses to partner closely with select RevOps teams and outbound agencies. Lock in our exclusive $99/mo rate for life, unlock 50,000 rows/month (a 20,000-row free bonus), and receive our $450 Enterprise Custom Setup Add-On completely free.',
  founderPricingAnnual: '$99 / month (Billed Annually at $1,188)',
  founderPricingQuarterly: '$149 / month (Billed Quarterly at $447)',
  lifetimeAddOns: [
    'Lifetime Price Lock: $99/mo locked in forever (never pay future price increases)',
    '50,000 Processed Rows / month (20,000 extra rows free every single month)',
    'FREE $450 Enterprise Custom Setup Add-On included at zero cost',
    '100% Full-Stack Engine Unlocked on Day 1 (All 4 Core Services)',
    'Direct Concierge Access: Private WhatsApp / DM channel with RevOps Leadership',
    'Custom CRM Recipe Configuration tailored to your exact spreadsheet edge cases',
  ],
  ctaHeadline: 'Claim 1 of 10 Founding Licenses.',
  ctaBody:
    'Lock in enterprise-grade data infrastructure at startup pricing. Secure your data. Protect your CRM domains. Zero database size taxes.',
};

export const aboutUsContent = {
  badge: 'RevOps Engineering Without the Data Tax',
  title: 'Built by Engineers Who Refused to Accept the "Wrecking Ball".',
  narrative1:
    'For two decades, B2B data providers have imposed an unfair tax on growing companies. Legacy tools charge enterprise rates on the entire historical size of your CRM—even if 70% of those contacts are dormant or you only need to sanitize a single trade-show list.',
  narrative2:
    'Worse, when these legacy tools clean your database, they act like a wrecking ball: blindly smashing records together, permanently overwriting deal histories, erasing SDR notes, and offering zero rollback capability.',
  narrative3:
    'We built Veracity to bring mathematical rigor and air-gapped safety to Revenue Operations. Operating in an ephemeral zero-storage RAM void powered by DuckDB, Veracity proves every change with forensic receipts, preserves raw records non-destructively, and delivers enterprise-grade data intelligence at a flat volume rate.',
  principles: [
    {
      title: 'Do No Harm',
      desc: 'Clean data and broken data never mix. Approved records and quarantined records are physically partitioned.',
      icon: ShieldCheck,
    },
    {
      title: 'Zero-Storage Privacy',
      desc: 'We process data in high-speed volatile RAM and cryptographically shred workspace shards upon download.',
      icon: Lock,
    },
    {
      title: '1-Click Undo Ledger',
      desc: 'Every merge is backed by an RFC 6902 reverse-patch ledger for instant O(1) constant-time rollback.',
      icon: RefreshCcw,
    },
    {
      title: 'Volume-Based Economics',
      desc: 'Pay strictly for the records you sanitize. Never pay a tax on the total size of your CRM.',
      icon: DollarSign,
    },
  ],
};

export type InfoZone = {
  id: string;
  badge: string;
  title: string;
  description: string;
  bullets: { text: string; icon: LucideIcon }[];
  visual: 'workflow' | 'analytics' | 'automation' | 'security';
  reverse?: boolean;
};

export const infoZones: InfoZone[] = [
  {
    id: 'deliverables',
    badge: 'What You Receive',
    title: 'A Forensic Deliverable, Not a Black Box',
    description:
      'Every run ends with an approved Golden Batch and a clear operational record. Your team gets clean data ready for CRM upload or outbound sequencing, plus the evidence to understand every decision.',
    bullets: [
      { text: '7-Tab Master Excel Workbook', icon: FileSpreadsheet },
      { text: 'Executive SCQA ROI PDF Assessment', icon: FileText },
      { text: 'Dedup clusters and forensic audit trail', icon: ClipboardCheck },
      { text: 'Interactive Merge Studio access', icon: Grid3X3 },
    ],
    visual: 'analytics',
  },
  {
    id: 'safety',
    badge: 'Data Safety by Design',
    title: 'Protect Revenue Before You Automate It',
    description:
      'Veracity keeps raw records non-destructive, locks restrictive consent states, quarantines CRM collisions, and exposes a cell-level lineage trail so your team can move faster without risking customer history.',
    bullets: [
      { text: 'Golden Record with parent-child lineage', icon: Database },
      { text: 'Active-client anti-collision shield', icon: ShieldCheck },
      { text: 'Most Restrictive Wins opt-out guard', icon: Lock },
      { text: '1-click rollback through reverse patches', icon: CheckCircle2 },
    ],
    visual: 'security',
    reverse: true,
  },
  {
    id: 'cockpit',
    badge: 'Coming Soon',
    title: 'The Command Cockpit Is Being Engineered',
    description:
      'The next frontier brings direct CRM integrations and visual control over your data operations. Founding members secure a lifetime upgrade from the Sentry Plan when the Cockpit launches.',
    bullets: [
      { text: 'Interactive Grid Studio visual editing', icon: Grid3X3 },
      { text: 'Direct HubSpot and Salesforce push', icon: Network },
      { text: 'Live CRM seed anti-collision guard', icon: ShieldCheck },
      { text: 'Mass relational routing and orchestration', icon: Workflow },
    ],
    visual: 'workflow',
  },
];

export const testimonials = [
  {
    quote: 'Veracity gives our revenue operations team a mathematically defensible answer to the question: what changed, why did it change, and can we undo it in 1 click?',
    author: 'VP of Revenue Operations',
    role: 'Enterprise B2B SaaS',
    company: 'Early Access Cohort',
    initials: 'RO',
  },
  {
    quote: 'The value is not just cleaner data. It is knowing that active customers, GDPR opt-outs, and first-touch attribution are protected before a single record reaches our live CRM.',
    author: 'Director of Marketing Operations',
    role: 'High-Growth Tech',
    company: 'Early Access Cohort',
    initials: 'MO',
  },
  {
    quote: 'Paying $150/month strictly for processed volume instead of a tax on our entire 300,000-contact historical database saved our department over $22,000 this year alone.',
    author: 'Head of Growth & Enablement',
    role: 'Outbound Agency',
    company: 'Founding Member',
    initials: 'GA',
  },
];
