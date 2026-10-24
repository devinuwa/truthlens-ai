# Dataset manifest

No dataset file is committed in this repository. Training refuses to run until `ml/data/raw/messages.csv` exists, and it does not invent accuracy numbers.

## Candidates that were considered

These were named in the project brief. They were not bulk-downloaded into the repository.

| Source | What it contains | Decision for this build |
| --- | --- | --- |
| [PhishTrap](https://github.com/instax-dutta/PhishTrap) | A phishing-URL research repository | Not used to train the message checker. A URL dataset must not be treated as labelled scam messages. Confirm that repository's licence before copying any file. |
| [flwrlabs/fed-phishing-urls](https://huggingface.co/datasets/flwrlabs/fed-phishing-urls) | Federated phishing URL data | Not downloaded. It is URL data, so it cannot train the message classifier. Read the dataset card and licence before any future URL-model experiment. |
| [Sting9 scam, phishing, and smishing messages](https://sting9.org/dataset) | Message-level scam data | Not downloaded in this build. Inspect the current licence, fields, and attribution terms on the dataset page before placing a file in `data/raw`. |

## If you add a file

Record the source URL, the date you downloaded it, the licence, the label meanings, and the preprocessing you applied. Keep the raw file out of git. `ml/data/raw/` is ignored.

Expected columns for the message trainer:

- `text`
- `label` with values such as `suspicious` / `legitimate`, or `spam` / `ham`, or `1` / `0`

The trainer deduplicates normalised text, uses a stratified 70/15/15 split with `random_state=42`, fits TF-IDF on the training split only, and writes test metrics to `ml/models/evaluation.json`. That file is gitignored. Quote a number from it only after you have produced it yourself.

Synthetic rows may be used in unit tests of the metric function. Those tests are not a model evaluation and must not be copied into the README as accuracy.
