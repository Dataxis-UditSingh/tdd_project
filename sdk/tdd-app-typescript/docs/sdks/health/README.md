# Health

## Overview

API health operations

### Available Operations

* [getHealth](#gethealth) - Check API health

## getHealth

Returns the current health status of the API.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="getHealth" method="get" path="/api/health" -->
```typescript
import { TddApp } from "tdd-app";

const tddApp = new TddApp();

async function run() {
  const result = await tddApp.health.getHealth();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { TddAppCore } from "tdd-app/core.js";
import { healthGetHealth } from "tdd-app/funcs/health-get-health.js";

// Use `TddAppCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const tddApp = new TddAppCore();

async function run() {
  const res = await healthGetHealth(tddApp);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("healthGetHealth failed:", res.error);
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

**Promise\<[models.HealthResponse](../../models/health-response.md)\>**

### Errors

| Error Type                | Status Code               | Content Type              |
| ------------------------- | ------------------------- | ------------------------- |
| errors.ErrorResponse      | 500                       | application/json          |
| errors.TddAppDefaultError | 4XX, 5XX                  | \*/\*                     |