import { Express, Request, Response } from 'express';

import { logRequest } from '../helpers/logging';

abstract class Route {
  protected readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  protected static NotAllowed(res: Response) {
    res.status(405).send('Method Not Allowed');
  }

  private getRoute: (req: Request, res: Response) => Promise<void> = async (req, res) => {
    logRequest(req);
    return await this.get(req, res);
  }

  private postRoute: (req: Request, res: Response) => Promise<void> = async (req, res) => {
    logRequest(req);
    return await this.post(req, res);
  }

  private putRoute: (req: Request, res: Response) => Promise<void> = async (req, res) => {
    logRequest(req);
    return await this.put(req, res);
  }

  private deleteRoute: (req: Request, res: Response) => Promise<void> = async (req, res) => {
    logRequest(req);
    return await this.delete(req, res);
  }

  private patchRoute: (req: Request, res: Response) => Promise<void> = async (req, res) => {
    logRequest(req);
    return await this.patch(req, res);
  }

  public get: (req: Request, res: Response) => Promise<void> = async (_, res) => {
    Route.NotAllowed(res);
    return Promise.resolve();
  }

  public post: (req: Request, res: Response) => Promise<void> = async (_, res) => {
    Route.NotAllowed(res);
    return Promise.resolve();
  }

  public put: (req: Request, res: Response) => Promise<void> = async (_, res) => {
    Route.NotAllowed(res);
    return Promise.resolve();
  }

  public delete: (req: Request, res: Response) => Promise<void> = async (_, res) => {
    Route.NotAllowed(res);
    return Promise.resolve();
  }

  public patch: (req: Request, res: Response) => Promise<void> = async (_, res) => {
    Route.NotAllowed(res);
    return Promise.resolve();
  }

  public register(app: Express) {
    app.get(this.path, this.getRoute);
    app.post(this.path, this.postRoute);
    app.put(this.path, this.putRoute);
    app.delete(this.path, this.deleteRoute);
    app.patch(this.path, this.patchRoute);
  }
}

export default Route;
