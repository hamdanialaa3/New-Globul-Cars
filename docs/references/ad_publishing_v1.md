# Ad Publishing Rules (v1)
ID: ad_publishing_v1
Version: 1.0.0
Last Updated: 2026-02-05

## Purpose
Reference document for AI-generated vehicle advertisement content.
This document is stored separately and referenced by ID - NOT embedded in prompts.

## Content Guidelines

### Language
- Primary: Bulgarian (BG)
- Secondary: English (EN)
- No mixed languages in single output

### Tone
- Professional and informative
- Highlight key features concisely
- Avoid aggressive sales language
- No superlatives without evidence ("best", "cheapest")

### Prohibited Content
- Competitor mentions or comparisons
- Personal seller information in descriptions
- Placeholder text (Lorem ipsum, TBD, etc.)
- Unverified claims about vehicle history
- Price predictions or guarantees

### Required Elements
1. **Title**: Make, model, year, key highlight (max 80 chars)
2. **Short Description**: For cards (max 160 chars)
3. **Full Description**: Detailed features (100-2000 chars)
4. **Meta Description**: SEO optimized (max 155 chars)
5. **Hashtags**: 3-10 relevant tags
6. **Highlights**: 2-5 key selling points

## Image Guidelines

### Quality Requirements
- Minimum resolution: 400x300 pixels
- No excessive blur or noise
- No watermarks from other platforms

### Flagging Criteria
- `blur`: Image clarity score < 0.5
- `low_resolution`: Below minimum dimensions
- `inappropriate`: Non-vehicle content
- `watermark`: Visible third-party branding
- `plate_visible`: License plate readable (privacy concern)

## Quality Scoring

| Score | Meaning |
|-------|---------|
| 90-100 | Excellent - auto-publish ready |
| 70-89 | Good - minor review suggested |
| 50-69 | Fair - requires human review |
| 0-49 | Poor - regenerate or manual rewrite |

## Review Triggers
- Quality score < 70
- Any flagged images
- Missing required fields
- Unusual vehicle data

## Usage
```
System: Use doc_id=ad_publishing_v1 for rules. Generate JSON per schema.
```

