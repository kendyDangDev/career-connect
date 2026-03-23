export interface VietnamProvince {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
}

export const normalizeVietnamProvinceName = (name: string) =>
  name.replace(/^(Thành phố|Tỉnh)\s+/i, '').trim();

interface GetVietnamProvincesOptions {
  signal?: AbortSignal;
}

const VIETNAM_PROVINCES_API_URL = 'https://provinces.open-api.vn/api/v2/p/';

export const vietnamProvincesKeys = {
  all: ['vietnam-provinces'] as const,
};

export const vietnamProvincesApi = {
  getAll: async ({
    signal,
  }: GetVietnamProvincesOptions = {}): Promise<VietnamProvince[]> => {
    const response = await fetch(VIETNAM_PROVINCES_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Vietnam provinces (${response.status})`);
    }

    return response.json();
  },
};
