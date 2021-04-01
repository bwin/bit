import { GeneratorContext, ComponentTemplate } from '@teambit/generator';
import { indexFile } from './files/index';
import { docFile } from './files/doc';
import { extensionFile } from './files/extension';

export const reactNativeTemplate: ComponentTemplate = {
  name: 'react-native-env',
  description: 'customize the base React Native env with your configs and tools',
  generateFiles: (context: GeneratorContext) => {
    return [
      {
        relativePath: 'index.ts',
        content: indexFile(context),
        isMain: true,
      },
      {
        relativePath: `${context.componentName}.docs.mdx`,
        content: docFile(),
      },
      {
        relativePath: `${context.componentName}.extension.ts`,
        content: extensionFile(context),
      },
    ];
  },
};