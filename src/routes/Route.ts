import { Express, Request, Response } from 'express';

import {
  BadRequest,
  Forbidden,
  NotFound,
  Unauthorized,
} from '../errors';

import { AuthInfo } from '../auth';
import { Optional, RequestHandler } from '../types';
import { logRequest } from '../helpers/logging';

abstract class Route {
  protected readonly path: string;
  // Method -> Handler mapping
  public static preRequestHandlers: Record<string, RequestHandler> = {};

  constructor(path: string) {
    this.path = path;
  }

  protected static NotAllowed(res: Response) {
    res.status(405).send('Method Not Allowed');
  }

  protected static ServerError(req: Request, res: Response, error: Error) {
    console.error(`Unhandled error in ${req.method} ${req.path}: ${error}`);
    res.status(500).send('Internal Server Error');
  }

  protected static handleError(req: Request, res: Response, error: Error) {
    if (error instanceof Unauthorized) {
      const redirect = req.query?.redirect || '/';
      res.redirect(`/login?redirect=${redirect}`);
      return;
    }

    if (error instanceof Forbidden) {
      res.status(403).send(error.message);
      return;
    }

    if (error instanceof NotFound) {
      res.status(404).send(error.message);
      return;
    }

    if (error instanceof BadRequest) {
      res.status(400).send(error.message);
      return;
    }

    Route.ServerError(req, res, error);
  }

  private handleRequest = async (
    req: Request,
    res: Response,
    handlerName: string,
  ) => {
    logRequest(req);
    // @ts-expect-error
    const handler = (this[handlerName]) as ((req: Request, res: Response, auth: AuthInfo) => Promise<void>);
    const preRequestHandler = (<typeof Route> this.constructor).preRequestHandlers[handlerName];

    try {
      let authInfo: Optional<AuthInfo>
      if (preRequestHandler) {
        authInfo = await preRequestHandler(req, res);
      }

      handler(req, res, authInfo!);
    } catch (error) {
      (<typeof Route> this.constructor).handleError(req, res, error);
    }
  }

  private getRoute = async (req: Request, res: Response) => {
    await this.handleRequest(req, res, 'get');
  }

  private postRoute = async (req: Request, res: Response) => {
    await this.handleRequest(req, res, 'post');
  }

  private putRoute = async (req: Request, res: Response) => {
    await this.handleRequest(req, res, 'put');
  }

  private deleteRoute = async (req: Request, res: Response) => {
    await this.handleRequest(req, res, 'delete');
  }

  private patchRoute = async (req: Request, res: Response) => {
    await this.handleRequest(req, res, 'patch');
  }

  public get = async (_: Request, res: Response, __: Optional<AuthInfo> = null) => {
    Route.NotAllowed(res);
    return Promise.resolve();
  }

  public post = async (_: Request, res: Response, __: Optional<AuthInfo> = null) => {
    Route.NotAllowed(res);
    return Promise.resolve();
  }

  public put = async (_: Request, res: Response, __: Optional<AuthInfo> = null) => {
    Route.NotAllowed(res);
    return Promise.resolve();
  }

  public delete = async (_: Request, res: Response, __: Optional<AuthInfo> = null) => {
    Route.NotAllowed(res);
    return Promise.resolve();
  }

  public patch = async (_: Request, res: Response, __: Optional<AuthInfo> = null) => {
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
