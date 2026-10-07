<!-- Start SDK Example Usage [usage] -->
```typescript
import { TddApp } from "tdd-app";

const tddApp = new TddApp();

async function run() {
  const result = await tddApp.health.getHealth();

  console.log(result);
}

run();

```
<!-- End SDK Example Usage [usage] -->