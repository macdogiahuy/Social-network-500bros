import axiosInstance, { endpoints } from '@/utils/axios';

import { IApiResponse } from '@/interfaces/api-response';
import { Media } from '@/interfaces/media';

//--------------------------------------------------------------------------------------------

export const uploadImage = async (file: File): Promise<IApiResponse<Media>> => {
  const form = new FormData();
  form.append('file', file);

  const response = await axiosInstance.post(endpoints.media.upload, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
