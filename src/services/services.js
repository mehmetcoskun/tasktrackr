import axios from 'axios';

const request = (url, method = 'GET', data = null) => {
  return axios({
    method,
    url,
    data,
  })
    .then((res) => res.data)
    .then((res) => res);
};

const get = (url, method = 'GET') => request(url, method);
const post = (url, method = 'POST', data = null) => request(url, method, data);
const put = (url, method = 'PUT', data = null) => request(url, method, data);

export { get, post, put };
