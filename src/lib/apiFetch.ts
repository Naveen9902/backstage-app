export const apiFetch = async (url: string | URL | Request, options?: RequestInit) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sessionToken') : null;
  const opts = options || {};
  opts.credentials = opts.credentials || 'include';
  
  if (token) {
    if (opts.headers instanceof Headers) {
      opts.headers.set('Authorization', 'Bearer ' + token);
    } else {
      opts.headers = {
        ...opts.headers,
        'Authorization': 'Bearer ' + token
      };
    }
  }
  
  return fetch(url, opts);
};
