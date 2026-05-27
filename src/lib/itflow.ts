export interface ITFlowConfig {
  apiUrl: string;
  apiKey: string;
}

export class ITFlowClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(config: ITFlowConfig) {
    this.apiUrl = config.apiUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  private async request(module: string, action: string, method: string, data?: any) {
    const apiPath = this.apiUrl.endsWith('/api') ? `/v1/${module}/${action}.php` : `/api/v1/${module}/${action}.php`;
    
    let url = `${this.apiUrl}${apiPath}`;
    const options: RequestInit = {
      method,
      headers: {
        "Accept": "application/json",
      }
    };

    if (method === 'GET' || method === 'DELETE') {
      url += `?api_key=${this.apiKey}`;
      if (data) {
        Object.keys(data).forEach(key => {
          url += `&${key}=${encodeURIComponent(data[key])}`;
        });
      }
    } else {
      options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify({
        api_key: this.apiKey,
        ...data
      });
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`ITFlow API error (${response.status}): ${response.statusText}`);
    }

    return response.json();
  }

  async getItems(module: string, params?: any) {
    return this.request(module, 'read', 'GET', params);
  }

  async createItem(module: string, data: any) {
    return this.request(module, 'create', 'POST', data);
  }

  async updateItem(module: string, data: any) {
    return this.request(module, 'update', 'POST', data); // ITFlow often uses POST for updates
  }

  async deleteItem(module: string, data: any) {
    // ITFlow often uses archive/unarchive, but we'll try a generic delete or archive action
    // Many modules in ITFlow use archive.php
    return this.request(module, 'archive', 'POST', data); 
  }
}
