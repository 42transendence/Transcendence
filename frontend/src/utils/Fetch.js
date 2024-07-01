import TokenManager from '@/utils/TokenManager';

class Fetch {
  static #BASE_URL = import.meta.env.VITE_BASE_URL;

  static #headers = new Headers({ 'Content-Type': 'application/json' });

  static #credentials = 'include';

  static #retry = 1;

  static #loadingDelay = 150;

  static init() {
    const accessToken = TokenManager.getAccessToken();
    if (accessToken) {
      this.#headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
      this.#headers.delete('Authorization');
    }
  }

  static showLoading() {
    return setTimeout(() => {
      document.getElementById('loading').classList.remove('d-none');
    }, this.#loadingDelay);
  }

  static hideLoading(timer) {
    clearTimeout(timer);
    document.getElementById('loading').classList.add('d-none');
  }

  static isAuth(url) {
    return !url.startsWith('/login') || url === '/login/logout/';
  }

  static async get(url, retry = 1) {
    const timer = this.showLoading();
    const response = await fetch(`${this.#BASE_URL}${url}`, {
      method: 'GET',
      headers: this.#headers,
      credentials: this.#credentials,
    });
    this.hideLoading(timer);
    if (!response.ok) {
      if (this.isAuth(url) && response.status === 401 && retry <= this.#retry) {
        await TokenManager.reissueAccessToken();
        return this.get(url, retry + 1);
      }
      return response.json().then((err) => {
        console.error(`GET(${url}) ERROR:`, err);
        throw new Error(err.error || err.detail || '');
      });
    }
    return response.json();
  }

  static async post(url, body = {}, retry = 1) {
    const timer = this.showLoading();
    const response = await fetch(`${this.#BASE_URL}${url}`, {
      method: 'POST',
      headers: this.#headers,
      credentials: this.#credentials,
      body: JSON.stringify(body),
    });
    this.hideLoading(timer);
    if (!response.ok) {
      if (this.isAuth(url) && response.status === 401 && retry <= this.#retry) {
        await TokenManager.reissueAccessToken();
        return this.post(url, body, retry + 1);
      }
      return response.json().then((err) => {
        console.error(`POST(${url}) ERROR:`, err);
        throw new Error(err.error || err.detail || '');
      });
    }
    return response.json().catch(() => '');
  }

  static async patch(url, body = {}, type = '', retry = 1) {
    const timer = this.showLoading();
    const header =
      type !== 'image'
        ? this.#headers
        : { Authorization: `Bearer ${TokenManager.getAccessToken()}` };
    const reqBody = type === 'image' ? body : JSON.stringify(body);
    const response = await fetch(`${this.#BASE_URL}${url}`, {
      method: 'PATCH',
      headers: header,
      credentials: this.#credentials,
      body: reqBody,
    });
    this.hideLoading(timer);
    if (!response.ok) {
      if (this.isAuth(url) && response.status === 401 && retry <= this.#retry) {
        await TokenManager.reissueAccessToken();
        return this.patch(url, body, type, retry + 1);
      }
      return response.json().then((err) => {
        console.error(`PATCH(${url}) ERROR:`, err);
        throw new Error(err.error || err.detail || '');
      });
    }
    const data = await response.json().catch(() => '');
    return { status: response.status, data };
  }
}

export default Fetch;
