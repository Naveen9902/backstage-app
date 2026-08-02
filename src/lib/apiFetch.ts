export const apiFetch = async (url: string | URL | Request, options?: RequestInit) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sessionToken') : null;
  const opts = options || {};
  opts.credentials = opts.credentials || 'include';
  
  if (opts.headers instanceof Headers) {
    if (token) opts.headers.set('Authorization', 'Bearer ' + token);
    opts.headers.set('X-Backstage-Client', 'true');
  } else {
    opts.headers = {
      ...opts.headers,
      'X-Backstage-Client': 'true',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    };
  }
  
  return fetch(url, opts);
};
