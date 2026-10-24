# Project specification

TruthLens AI is a digital-safety web application for HIASFEST 2027, Category K. It helps a young person answer four questions:

1. Does this message show signs of a scam, phishing, a fake opportunity, a payment ask, pressure, harassment, or manipulation?
2. Does this link have suspicious structural characteristics?
3. Where are educational opportunities listed, and how do I know whether the listing has been checked?
4. What should I do next?

## Decisions

- The product teaches recognition. It does not ask the user to trust a score.
- Core checks run in the Next.js server so a demo works without a paid model or a separate Python host.
- A FastAPI service can add a model score later. Until a model file exists, it says the model is unavailable.
- Guest mode is first-class. Accounts exist for private history.
- Saved reports omit the source text unless the user opts in, and then only 280 characters are kept.
- Opportunity cards shipped in the repo are fictional and labelled demonstration data.
- Pasted links are not opened. Private and loopback addresses are flagged and never requested.

## Implemented

Landing page, dashboard, message check, link check, opportunity search and detail, bookmarks, Academy lessons and quizzes, sign-up and sign-in through Supabase, private reports, admin insert of opportunities, SQL migration with RLS, tests, and the model training script.

## Experimental

The TF-IDF classifier is experimental until a licensed dataset is evaluated. Harassment and manipulation checks are rule baselines, not clinical judgements.

## Not implemented

Live scholarship ingestion, a hosted threat-intelligence lookup, a trained URL classifier, and a confirmed production deployment.
