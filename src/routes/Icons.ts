import { Request, Response } from 'express';

import Route from './Route';
import Routes from './Routes';

const circleSVGTemplate = `
  <circle class="{{CLASS}}" cx="50" cy="34.902" r="18.597"></circle>
`

const poiSVGTemplate = `<?xml version="1.0" encoding="utf-8"?>
<svg width="{{SIZE}}" height="{{SIZE}}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="{{CLASS}}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <style type="text/css">
      .with-border path {
        background-size: cover;
        box-sizing: border-box;
        stroke: #{{BORDER}};
        stroke-width: 1px;
        stroke-dasharray: none;
        stroke-linejoin: round;
      }

      .with-fill circle {
        fill: #{{FILL}};
      }
    </style>
  </defs>
  <path d="M50.002 0C30.763 0 15 15.718 15 34.902c0 7.432 2.374 14.34 6.392 20.019L45.73 96.994c3.409 4.453 5.675 3.607 8.51-.235l26.843-45.683c.542-.981.967-2.026 1.338-3.092A34.446 34.446 0 0 0 85 34.902C85 15.718 69.24 0 50.002 0zm0 16.354c10.359 0 18.597 8.218 18.597 18.548c0 10.33-8.238 18.544-18.597 18.544c-10.36 0-18.601-8.215-18.601-18.544c0-10.33 8.241-18.548 18.6-18.548z" fill="#{{COLOR}}"></path>{{CIRCLE}}
</svg>
`

class PoiIconRoute extends Route {
  protected version: string;

  constructor() {
    super('/icons/poi.svg');
  }

  get = async (req: Request, res: Response) => {
    const { color, size, classes, border, fill } = req.query;
    let classesArray = new Set(classes?.toString().split(' ') || []);

    if (border) {
      classesArray.add('with-border');
    }

    if (fill) {
      classesArray.add('with-fill');
    }

    const svg = poiSVGTemplate
      .replaceAll('{{COLOR}}', color?.toString() || '000000')
      .replaceAll('{{SIZE}}', size?.toString() || '100')
      .replaceAll('{{CLASS}}', classesArray.size ? Array.from(classesArray).join(' ') : '')
      .replaceAll('{{BORDER}}', border?.toString() || '000000')
      .replaceAll('{{FILL}}', fill?.toString() || '000000')
      .replaceAll('{{CIRCLE}}', fill ? circleSVGTemplate : '');

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  }
}

class IconRoutes extends Routes {
  public routes = [new PoiIconRoute()];
}

export default IconRoutes;
