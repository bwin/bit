import { Request, Response, Route } from '@teambit/express';
import mime from 'mime';
import type { Component } from '@teambit/component';
import { noPreview, serverError } from '@teambit/ui-foundation.ui.pages.static-error';
import type { Logger } from '@teambit/logger';

import { PreviewMain } from './preview.main.runtime';
import { PreviewArtifact } from './preview-artifact';

type UrlParams = {
  /** `/preview/:previewPath(*)` */
  previewPath?: string;
};

export class PreviewRoute implements Route {
  constructor(
    /**
     * preview extension.
     */
    private preview: PreviewMain,
    private logger: Logger
  ) {}

  route = `/preview/:previewPath(*)`;
  method = 'get';

  middlewares = [
    async (req: Request<UrlParams>, res: Response) => {
      try {
        // @ts-ignore TODO: @guy please fix.
        const component = req.component as Component | undefined;
        if (!component) return res.status(404).send(noPreview());

        let artifact: PreviewArtifact | undefined;
        // TODO - prevent error `getVinylsAndImportIfMissing is not a function` #4680
        try {
          artifact = await this.preview.getPreview(component);
        } catch (e: any) {
          return res.status(404).send(noPreview());
        }
        // TODO: please fix file path concatenation here.
        let file = artifact?.getFileEndsWith('index.html');
        if (req.params.previewPath) {
          const matchedFile =
            artifact?.getFileEndsWith(`public/${req.params.previewPath}`) ||
            artifact?.getFileEndsWith(`${req.params.previewPath}`);
          file = matchedFile || file;
        }
        if (!file) return res.status(404).send(noPreview());

        const contents = file.contents;
        const str = `${file.cwd}/${file.path}`;
        const contentType = mime.getType(str);
        if (contentType) res.set('Content-Type', contentType);
        return res.send(contents);
      } catch (e: any) {
        this.logger.error('failed getting preview', e);
        return res.status(500).send(serverError());
      }
    },
  ];
}
