# S02: Business Operations — LLC, Pricing, Payment, GTM, Ops — UAT

**Milestone:** M005
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S02 produces five static markdown documents. There are no running services, APIs, or UI to exercise. Verification is file existence, content correctness, cross-document consistency, and grounded data quality.

## Preconditions

- S01 outputs exist at `~/Desktop/driftless/` (00-vision-strategy.md, 03-product-strategy.md, 04-product-requirements.md)
- Protected files exist: `~/Desktop/driftless/pro-tier-features.md` and `~/Desktop/driftless/m004-launch-playbook.md`
- Terminal access to run `ls`, `grep`, `md5`, `wc` commands

## Smoke Test

Run `ls ~/Desktop/driftless/02-business-structure.md ~/Desktop/driftless/05-pricing-model.md ~/Desktop/driftless/06-payment-infrastructure.md ~/Desktop/driftless/07-gtm-plan.md ~/Desktop/driftless/08-operations-playbook.md` — all five files listed without errors.

## Test Cases

### 1. File existence and Mermaid diagrams

1. Run `ls ~/Desktop/driftless/0{2,5,6,7,8}*.md`
2. **Expected:** All five files listed: 02-business-structure.md, 05-pricing-model.md, 06-payment-infrastructure.md, 07-gtm-plan.md, 08-operations-playbook.md
3. Run `grep -c 'mermaid' ~/Desktop/driftless/0{2,5,6,7,8}*.md`
4. **Expected:** Every file shows count ≥1. No file shows `:0`.

### 2. Cross-document ICP consistency

1. Run `grep -l 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/0{2,5,6,7,8}*.md`
2. **Expected:** Returns all five S02 filenames. If any file is missing, the canonical ICP phrase was paraphrased or omitted.

### 3. Phase timeline consistency

1. Run `grep 'Q1–Q3 2026' ~/Desktop/driftless/0{2,5,6,7,8}*.md`
2. **Expected:** Phase 1 timeline appears in at least pricing (05), GTM (07), and operations (08). All references use the same "Q1–Q3 2026" format.
3. Run `grep 'Q4 2026' ~/Desktop/driftless/0{5,7}*.md`
4. **Expected:** Phase 2 timeline referenced in pricing and GTM docs.

### 4. Feature label consistency

1. Run `grep 'Knowledge Base + Agent Skill' ~/Desktop/driftless/0{5,7}*.md`
2. **Expected:** Feature (a) label appears in both pricing model and GTM plan with identical wording.

### 5. LLC guide — Albany RA as primary recommendation

1. Open `~/Desktop/driftless/02-business-structure.md`
2. Search for "Albany" — should appear prominently (in flowchart, Step 2, Step 5)
3. Search for "PRIMARY RECOMMENDATION" or equivalent emphasis
4. **Expected:** Albany RA strategy is presented as the primary path, not a footnote. Cost comparison clearly shows $150–$350 Albany vs $1,000–$2,000+ NYC.

### 6. LLC guide — NYLTA domestic exemption

1. Run `grep -i 'domestic.*exempt\|does not apply.*domestic\|exempt.*domestic' ~/Desktop/driftless/02-business-structure.md`
2. **Expected:** Returns text stating domestic LLCs are exempt, referencing Hochul's December 2025 veto.
3. Verify the document does NOT say domestic LLCs must comply with NYLTA.

### 7. LLC guide — Operating agreement requirement

1. Run `grep -i 'operating agreement' ~/Desktop/driftless/02-business-structure.md | grep -i 'required\|must\|mandatory'`
2. **Expected:** Returns text stating the operating agreement is legally required (within 90 days), citing LLCL §417.

### 8. LLC guide — URLs and actionable steps

1. Run `grep -c 'http' ~/Desktop/driftless/02-business-structure.md`
2. **Expected:** Returns ≥10 (actual: 18). Each of the 8 formation steps should have at least one URL.
3. Manually scan the document for dollar amounts — each step should show an exact cost (e.g., "$200", "$0", "$150–350").

### 9. Pricing model — Three revenue scenarios

1. Run `grep -c 'conservative\|moderate\|aggressive' ~/Desktop/driftless/05-pricing-model.md`
2. **Expected:** Returns ≥3 (actual: 3+ including section headings and scenario tables).
3. Open the file and verify each scenario has explicit assumptions: OSS user count, growth rate, free→trial conversion, trial→paid conversion, churn rate, ARPU.
4. **Expected:** No scenario uses vague language like "moderate growth" without a specific number.

### 10. Pricing model — Competitor benchmark table

1. Open `~/Desktop/driftless/05-pricing-model.md` and find the competitor table
2. **Expected:** Table includes Pendo, WalkMe, Whatfix, Appcues with specific pricing figures (not "contact sales" without estimated ranges). Figures should match S01's product strategy document.

### 11. Payment infrastructure — Lemon Squeezy rationale

1. Open `~/Desktop/driftless/06-payment-infrastructure.md`
2. **Expected:** MoR (Merchant of Record) rationale clearly stated — LS handles tax registration, sales tax collection, and compliance. Fee breakdown on $99/mo subscription showing per-transaction and effective rates.
3. Verify Stripe migration section exists with triggers (e.g., revenue threshold, international mix) and effort estimate.

### 12. GTM plan — Three phases, zero spend in Phases 1–2

1. Open `~/Desktop/driftless/07-gtm-plan.md`
2. **Expected:** Phase 1 (OSS awareness) and Phase 2 (Pro launch) are executable by one person with $0 paid marketing spend. Phase 3 introduces paid acquisition.
3. Verify m004-launch-playbook.md is referenced as Phase 1 foundation (not duplicated).

### 13. Operations playbook — Concise and actionable

1. Run `wc -l ~/Desktop/driftless/08-operations-playbook.md`
2. **Expected:** ≤150 lines (actual: 94). This is a checklist, not an essay.
3. Verify monthly checklist covers: LLC maintenance (biennial statement, annual filing), financial ops (Mercury, LS payouts, tax), product ops (churn, metrics, support).
4. Verify scaling triggers exist with concrete thresholds (e.g., customer count, MRR level, international percentage).

### 14. Protected file integrity

1. Run `md5 ~/Desktop/driftless/pro-tier-features.md`
2. **Expected:** MD5 = f93972b6985ec540a93df5fe3e120153
3. Run `md5 ~/Desktop/driftless/m004-launch-playbook.md`
4. **Expected:** MD5 = 6dc7ac0fa7b45c5d3f37671655530441
5. Any mismatch means S02 work accidentally modified a protected file.

## Edge Cases

### NYLTA legislative change

1. If future legislation extends NYLTA to domestic LLCs, the exemption section in 02-business-structure.md becomes incorrect.
2. **Expected:** The document clearly states the exemption is based on the Dec 2025 Hochul veto, making the temporal context explicit for future readers.

### Pricing evolution clarity

1. Read 05-pricing-model.md section on $99/mo early adopter pricing.
2. Check 03-product-strategy.md (S01) section on $200–$500/mo positioning.
3. **Expected:** The pricing model explicitly bridges these two figures — $99 is the early adopter entry, $199–$299 is the standard evolution, $200–$500 is the competitive positioning range. No apparent contradiction.

### Revenue scenario assumptions

1. Review the conservative scenario's trial→paid conversion rate.
2. **Expected:** Should be at or below industry benchmarks (e.g., ≤2% for conservative). If it shows 10%+ for "conservative," the scenarios aren't meaningfully differentiated.

## Failure Signals

- Any file missing from `ls` output → document not written
- Any `:0` in Mermaid count → document lacks required diagram
- Canonical ICP grep returning fewer than 5 files → cross-doc consistency broken
- MD5 mismatch on protected files → accidental file modification
- LLC guide with 0 URLs → guide is not actionable
- Revenue scenarios without explicit per-scenario numbers → generic boilerplate, not grounded analysis

## Requirements Proved By This UAT

- None — M005 S02 capabilities are outside the existing requirement contract (M005 introduces new business capability areas)

## Not Proven By This UAT

- Actual LLC formation success (operational — requires real filing)
- Revenue projection accuracy (requires Pro tier to ship and generate actual revenue data)
- Lemon Squeezy integration working (requires account setup and API testing in M006+)
- GTM channel effectiveness (requires execution over months)

## Notes for Tester

- All grep commands use the en-dash (–) in "50–500" and "Q1–Q3 2026." If your terminal doesn't render it, copy from the document.
- The pricing model intentionally has TWO price points that coexist: $99/mo (early adopter) and $199–$299/mo (standard). This is not a bug — it's the evolution strategy. Verify the document makes this transition explicit.
- The operations playbook is deliberately short (~94 lines). If it reads like a 2-page checklist, that's correct. If it reads like a 10-page operations manual, scope crept.
