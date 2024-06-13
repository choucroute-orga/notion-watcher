import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { ApiError } from './types';
import { API_URL } from '../constants';

type UseApiProps<Req, Res> = {
  method: HTTPMethod;
  path: string;
  requestType: Req;
  // responseType: Res;
  requestSchema: z.ZodType<Req>;
  responseSchema: z.ZodType<Res>;
};

export const httpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

export type HTTPMethod = (typeof httpMethod)[keyof typeof httpMethod];

export default function api<Request, Response>({
  method,
  path,
  requestSchema,
  responseSchema,
}: {
  method: HTTPMethod;
  path: string;
  requestSchema: z.ZodType<Request>;
  responseSchema: z.ZodType<Response>;
}): (data: Request) => Promise<Response> {
  return function (requestData: Request) {
    requestSchema.parse(requestData);

    async function apiCall() {
      const response = await axios({
        baseURL: API_URL,
        method,
        url: path,
        [method === httpMethod.GET ? 'params' : 'data']: requestData,
      });

      // if (true) {
      //   responseSchema.safeParseAsync(response.data).then((result) => {
      //     if (!result.success) {
      //       console.log('error');
      //       // TODO: Send error to sentry or other error reporting service
      //     }
      //   });

      //   return response.data as Response;
      // }

      return responseSchema.parse(response.data);
    }

    return apiCall();
  };
}
