
import { describe, expect, it } from 'vitest';
import { validateYamlDocuments } from './devops-output-validator.js';

describe('validateYamlDocuments', () => {
  it('accepts syntactically valid YAML', () => {
    const output = [
      '```yaml',
      'apiVersion: v1',
      'kind: Service',
      'metadata:',
      '  name: example',
      '```',
    ].join('\n');

    expect(validateYamlDocuments(output)).toMatchObject({
      valid: true,
      errors: [],
    });
  });

  it('rejects malformed YAML', () => {
    const output = [
      '```yaml',
      'metadata:',
      '  name: [invalid',
      '```',
    ].join('\n');

    expect(validateYamlDocuments(output).valid).toBe(false);
  });

  it('rejects responses without YAML blocks', () => {
    expect(
      validateYamlDocuments('Here is your deployment explanation.'),
    ).toMatchObject({
      valid: false,
      errors: ['No YAML code block found in the response.'],
    });
  });
});
