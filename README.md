# LeadScout — AI B2B Outreach Agent

Describe a product and your ideal customer, and LeadScout proposes matching B2B creators/influencers, **scores each on fit with a reason**, ranks them, and drafts **personalized outreach + follow-ups** you can export to CSV.

🔗 **Live:** https://leadscout-mushaim-s-projects.vercel.app

## Why it exists
Finding and qualifying the right creators for a B2B partnership is slow, manual research — you read dozens of profiles, guess at fit, and write cold messages from scratch. I productized that workflow (originally a freelance lead-gen project) into a self-serve agent so the tedious 90% is automated and a human just reviews and sends.

## What makes it interesting (engineering)
- **Structured output, not a wall of text.** The agent returns a typed shortlist — `{ handle, matchScore, why }` — via a Claude tool/JSON-schema call, so every candidate is *actionable* (a number + a reason you can verify), not prose you have to parse.
- **Scoring with reasons.** Each match explains *why* it fits the product/ICP, which is what makes the ranking trustworthy enough to act on.
- **Two-stage agentic flow:** discover candidates → score & rank → draft tailored outreach + follow-ups, each step a focused model call.
- **Honest by design.** Real creator discovery needs creator-data APIs; this generates plausible example candidates rather than scraping (no ToS games), so it faithfully shows the *scoring + outreach pipeline* with the data layer cleanly swappable.

## Stack
Next.js (App Router) · Anthropic Claude API (structured tool use) · TypeScript · Tailwind · Vercel.

## Run locally
```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev   # http://localhost:3000
```

## What I'd add next
Real creator-data integration (e.g. a social API) behind the same scoring interface, saved lists, and an outreach-sent tracker.
