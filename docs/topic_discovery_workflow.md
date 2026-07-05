# Topic Discovery Workflow

Goal: when a user enters a broad direction, the system proposes timely, evidence-first video briefs that can be traced to official sources, reputable reporting, public datasets, or reviewable public-video references.

## Inputs

- `direction`: broad category such as AI video tools, public health, consumer technology, education, finance, or math animation.
- `locale` and `language`.
- `audience`: practitioners, executives, students, general viewers.
- `risk_tolerance`: low, medium, high.
- `required_source_types`: official report, regulator page, academic paper, company docs, public video, social lead.

## Discovery stages

1. Collect leads from search/news/social/video platforms or offline fixtures when internet access is unavailable.
2. Score leads for recency, source authority, public interest, visual explainability, and rights/privacy risk.
3. Map the lead to the channel's teaching objective: what useful concept can this event introduce?
4. Create a source candidate list with official or primary sources first; secondary reporting may explain context but should not be the only evidence.
5. Produce topic briefs for human review before capture or rendering.

## Offline interface contract

If a cloud agent has no reliable internet, it must not pretend to have fetched live trends. It should write briefs from checked-in fixtures under `examples/` or user-provided URLs and mark `discovery_mode: offline_fixture`.

## Topic brief schema

```json
{
  "topic": "short title",
  "hook": "opening tension or viewer question",
  "why_now": "recency or evergreen reason",
  "source_candidates": [
    {"title": "", "url": "", "source_type": "official_report", "priority": 1, "evidence_expected": ""}
  ],
  "video_angle": "how the event leads to our explanation",
  "evidence_needed": ["specific screenshots, PDF pages, quote clips, data points"],
  "risk_notes": ["copyright, privacy, policy, factual uncertainty"],
  "discovery_mode": "online_live | offline_fixture | user_supplied"
}
```

## Review gate

A topic brief is not a script. It becomes production-ready only after the source candidates are captured, bbox/highlight targets are verified, rights risks are logged, and a reviewer accepts the angle.
