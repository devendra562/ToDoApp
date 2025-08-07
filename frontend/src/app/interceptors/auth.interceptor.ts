import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');  
  const apiKey = 'user_auth_rest_api';

  req = req.clone({
    setHeaders: {
      'api-key': apiKey,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });

  return next(req);
};
