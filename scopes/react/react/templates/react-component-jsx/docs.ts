import { GeneratorContext } from '@teambit/generator';

export const docsFile = (context: GeneratorContext) => {
  const { name, namePascalCase: Name } = context;

  return {
    relativePath: `${name}.docs.mdx`,
    content: `---
labels: ['react', 'jsx', '${name}']
description: 'A ${Name} component.'
---

import { ${Name} } from './${name}';

${Name} example:

A simple ${Name} component with some text

Code Snippet:
\`\`\`js
<${Name}>hello from ${Name}</${Name}>
\`\`\`


Live Playground:
\`\`\`js live
<${Name}>hello from ${Name}</${Name}>
\`\`\`
`,
  };
};