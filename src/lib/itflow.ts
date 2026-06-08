export interface ITFlowConfig {
  apiUrl: string;
  apiKey: string;
}

export type ITFlowPayload = Record<string, string | number | boolean | null | undefined>;

export class ITFlowClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(config: ITFlowConfig) {
    this.apiUrl = config.apiUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  private async request<TResponse = unknown>(
    module: string,
    action: string,
    method: string,
    data?: ITFlowPayload
  ): Promise<TResponse> {
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
        Object.entries(data).forEach(([key, value]) => {
          if (value == null) return;
          url += `&${key}=${encodeURIComponent(String(value))}`;
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

    return response.json() as Promise<TResponse>;
  }

  async getItems<TResponse = unknown>(module: string, params?: ITFlowPayload) {
    return this.request<TResponse>(module, 'read', 'GET', params);
  }

  async createItem<TResponse = unknown>(module: string, data: ITFlowPayload) {
    return this.request<TResponse>(module, 'create', 'POST', data);
  }

  async updateItem<TResponse = unknown>(module: string, data: ITFlowPayload) {
    return this.request<TResponse>(module, 'update', 'POST', data); // ITFlow often uses POST for updates
  }

  async deleteItem<TResponse = unknown>(module: string, data: ITFlowPayload) {
    // ITFlow often uses archive/unarchive, but we'll try a generic delete or archive action
    // Many modules in ITFlow use archive.php
    return this.request<TResponse>(module, 'archive', 'POST', data); 
  }
}
