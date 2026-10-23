
import { parseAllDocuments } from 'yaml';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateYamlDocuments(
  output: string,
): ValidationResult {
  const yamlBlocks = [
    ...output.matchAll(
      /```(?:yaml|yml)\s*\n([\s\S]*?)```/gi,
    ),
  ];

  if (yamlBlocks.length === 0) {
    return {
      valid: false,
      errors: ['No YAML code block found in the response.'],
    };
  }

  const errors: string[] = [];

  for (const [index, block] of yamlBlocks.entries()) {
    const source = block[1];

    if (!source?.trim()) {
      errors.push(`YAML block ${index + 1} is empty.`);
      continue;
    }

    const documents = parseAllDocuments(source);

    for (const [docIndex, document] of documents.entries()) {
      if (document.errors.length > 0) {
        errors.push(
          ...document.errors.map(
            (error) =>
              `Block ${index + 1}, document ${docIndex + 1}: ${error.message}`,
          ),
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
