# Challenges

## Overview

TDD challenge operations

### Available Operations

* [listChallenges](#listchallenges) - Get all challenges
* [getChallenge](#getchallenge) - Get challenge by ID

## listChallenges

Returns all available TDD challenges.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="listChallenges" method="get" path="/api/challenges" -->
```typescript
import { TddApp } from "tdd-app";

const tddApp = new TddApp();

async function run() {
  const result = await tddApp.challenges.listChallenges();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TddAppCore } from "tdd-app/core.js";
import { challengesListChallenges } from "tdd-app/funcs/challenges-list-challenges.js";

// Use `TddAppCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const tddApp = new TddAppCore();

async function run() {
  const res = await challengesListChallenges(tddApp);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("challengesListChallenges failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.Challenge[]](../../models/.md)\>**

### Errors

| Error Type                | Status Code               | Content Type              |
| ------------------------- | ------------------------- | ------------------------- |
| errors.ErrorResponse      | 500                       | application/json          |
| errors.TddAppDefaultError | 4XX, 5XX                  | \*/\*                     |

## getChallenge

Returns a single TDD challenge using its string ID.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="getChallenge" method="get" path="/api/challenges/{id}" -->
```typescript
import { TddApp } from "tdd-app";

const tddApp = new TddApp();

async function run() {
  const result = await tddApp.challenges.getChallenge({
    id: "react-counter",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TddAppCore } from "tdd-app/core.js";
import { challengesGetChallenge } from "tdd-app/funcs/challenges-get-challenge.js";

// Use `TddAppCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const tddApp = new TddAppCore();

async function run() {
  const res = await challengesGetChallenge(tddApp, {
    id: "react-counter",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("challengesGetChallenge failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetChallengeRequest](../../models/operations/get-challenge-request.md)                                                                                             | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.Challenge](../../models/challenge.md)\>**

### Errors

| Error Type                | Status Code               | Content Type              |
| ------------------------- | ------------------------- | ------------------------- |
| errors.ErrorResponse      | 404                       | application/json          |
| errors.ErrorResponse      | 500                       | application/json          |
| errors.TddAppDefaultError | 4XX, 5XX                  | \*/\*                     |