# CSV Column Observations

Columns across the 5 main game CSVs (flags, crusade, capitals, cities, breeds).

## Column Matrix

| Column | flags | crusade | capitals | cities | breeds |
|--------|-------|---------|----------|--------|--------|
| **id/code** | `code` | `id` | `code` | `id` | `code` |
| **question** | *(implicit: "what flag is this?")* | `question` | *(implicit: "what's the capital of X?")* | `question` | *(implicit: "what breed is this?")* |
| **answer** | `name` | `answer` | `capital` | `answer` | `breed_name` |
| **wrong1–3** | *(none — generated from pool)* | `wrong1,wrong2,wrong3` | *(none — generated from pool)* | `wrong1,wrong2,wrong3` | *(none — generated from pool)* |
| **difficulty** | `difficulty` | `difficulty` | `difficulty` | `difficulty` | `difficulty` |
| **reveal** | *(none)* | `reveal` | `reveal` | `reveal` | `reveal` |
| **type** | *(none)* | `type` | *(none)* | `type` | `question_type` |
| **image** | *(flag derived from `code`)* | *(none)* | *(none)* | `image` | `image_url` |
| **map coords** | *(hardcoded in JS)* | *(none)* | *(none)* | `cx,cy` | *(none)* |
| **extra** | — | — | `country` | — | `fact` |

## Key Observations

1. **id/code** — inconsistent (`id` vs `code`). Could unify to `id`.
2. **answer field** — each game uses a different column name (`name`, `answer`, `capital`, `answer`, `breed_name`). Could unify to `answer`.
3. **wrongs** — flags, capitals, and breeds don't store distractors (generated at runtime from the pool); crusade and cities store them explicitly. This is a real structural split — pool-based vs. explicit.
4. **reveal** — present in 4/5 (flags has none). Easy to add.
5. **type** — crusade and cities have it, named differently (`type` vs `question_type`). Could unify to `type`.
6. **image** — flags derive from `code`, breeds use a full URL (`image_url`), cities use a local asset name (`image`). Three different approaches.
7. **country** in capitals is redundant with code — could drop it.
8. **fact** in breeds is unique — a second text field beyond `reveal`.

## Proposed Unified Schema

```
id, answer, difficulty, reveal, type, wrong1, wrong2, wrong3, image
```

- Game-specific extras stay as additional columns (e.g. `cx,cy` for cities, `question` for crusade/cities).
- Pool-based games (flags, capitals, breeds) leave `wrong1–3` blank.
