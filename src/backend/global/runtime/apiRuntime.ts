import { Inject, Injectable } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { TokenService } from '../auth/service/token.service';
import { RateLimitService } from '../rateLimit/rateLimit.service';
import { trackHttpResponse } from '../monitoring/httpMetrics.mjs';
import { writeErrorResponse } from '../apiPayload/errors';
import { authenticateApiRequest } from '../auth/guard/jwt.guard';

@Injectable()
export class ApiRuntime {
  constructor(@Inject(TokenService) private readonly tokens: TokenService) {}
  prepare(app: INestApplication, rateLimit: RateLimitService, metrics: boolean) {
    app.use((request: Request, response: Response, nextRoute: NextFunction) => {
      if (metrics) trackHttpResponse(request, response);
      if (rateLimit.handleRequest(request, response)) return;
      const path = new URL(request.url || '/', 'http://localhost').pathname;
      if (['/api/docs', '/api/docs/', '/api/docs/index.html'].includes(path)) {
        try { authenticateApiRequest(request, this.tokens); }
        catch (error) { writeErrorResponse(response, error); return; }
      }
      nextRoute();
    });
  }
}
