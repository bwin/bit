import { NextFunction, Request, Response, Route } from '@teambit/express';
import type { Component } from '@teambit/component';
import { noPreview, serverError } from '@teambit/ui-foundation.ui.pages.static-error';
import type { Logger } from '@teambit/logger';

import { PreviewMain } from './preview.main.runtime';
import { PreviewArtifact } from './preview-artifact';
import { getArtifactFileMiddleware, PreviewUrlParams } from './artifact-file-middleware';

export class PreviewRoute implements Route {
  constructor(
    /**
     * preview extension.
     */
    private preview: PreviewMain,
    private logger: Logger
  ) {}

  route = `/preview/:previewName?/:previewPath(*)`;
  method = 'get';

  middlewares = [
    async (req: Request<PreviewUrlParams>, res: Response, next: NextFunction) => {
      try {
        let isLegacyPath = false;
        // @ts-ignore TODO: @guy please fix.
        const component = req.component as Component | undefined;
        if (!component) return res.status(404).send(noPreview());

        let artifact: PreviewArtifact | undefined;
        // TODO - prevent error `getVinylsAndImportIfMissing is not a function` #4680
        try {
          // Taking the env template by default
          artifact = await this.preview.getEnvTemplateFromComponentEnv(component);
          // If there is no env template artifact, consider it a legacy
          if (!artifact) {
            isLegacyPath = true;
            artifact = await this.preview.getPreview(component);
          }
        } catch (e: any) {
          return res.status(404).send(noPreview());
        }
        // @ts-ignore
        req.artifact = artifact;
        // @ts-ignore
        req.isLegacyPath = isLegacyPath;
        return next();
      } catch (e: any) {
        this.logger.error('failed getting preview', e);
        return res.status(500).send(serverError());
      }
    },
    getArtifactFileMiddleware(this.logger),
  ];
}
