import { Response } from 'express';

import { Optional } from '../types';
import { ValidationError } from '../errors';

const setCookie = (res: Response, params: {
  name: string,
  value: string,
  expiresAt?: Optional<Date>,
  path?: string,
}) => {
  params.path = params.path || '/';
  if (params.expiresAt) {
    try {
      params.expiresAt = new Date(params.expiresAt);
    } catch (error) {
      throw new ValidationError(`Invalid expiresAt: ${error}`);
    }
  }

  let cookie = `${params.name}=${params.value}; Path=${params.path}; HttpOnly; SameSite=Strict`;
  if (params.expiresAt) {
    cookie += `; Expires=${params.expiresAt.toUTCString()}`;
  }

  res.setHeader('Set-Cookie', cookie);
}

const clearCookie = (res: Response, name: string) => {
  setCookie(res, {
    name,
    value: '',
    expiresAt: new Date(0),
  });
}

export {
  clearCookie,
  setCookie,
};
