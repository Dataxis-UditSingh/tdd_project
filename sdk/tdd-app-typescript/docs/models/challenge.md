# Challenge

## Example Usage

```typescript
import { Challenge } from "tdd-app/models";

let value: Challenge = {
  id: "react-counter",
  title: "Build a Counter",
  description:
    "Create a counter by starting with behavior tests, then implement the smallest solution.",
  difficulty: "Beginner",
  concepts: [
    "React state",
    "Events",
    "Component tests",
  ],
  steps: [
    "Write the failing test",
    "Implement the counter",
    "Refactor",
  ],
};
```

## Fields

| Field                                                                                   | Type                                                                                    | Required                                                                                | Description                                                                             | Example                                                                                 |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `id`                                                                                    | *string*                                                                                | :heavy_check_mark:                                                                      | Unique identifier of the challenge.                                                     | react-counter                                                                           |
| `title`                                                                                 | *string*                                                                                | :heavy_check_mark:                                                                      | Challenge title.                                                                        | Build a Counter                                                                         |
| `description`                                                                           | *string*                                                                                | :heavy_check_mark:                                                                      | Description of the challenge.                                                           | Create a counter by starting with behavior tests, then implement the smallest solution. |
| `difficulty`                                                                            | [models.Difficulty](../models/difficulty.md)                                            | :heavy_check_mark:                                                                      | Difficulty level of the challenge.                                                      | Beginner                                                                                |
| `concepts`                                                                              | *string*[]                                                                              | :heavy_check_mark:                                                                      | Concepts covered by the challenge.                                                      | [<br/>"React state",<br/>"Events",<br/>"Component tests"<br/>]                          |
| `steps`                                                                                 | *string*[]                                                                              | :heavy_check_mark:                                                                      | Steps involved in completing the challenge.                                             | [<br/>"Write the failing test",<br/>"Implement the counter",<br/>"Refactor"<br/>]       |