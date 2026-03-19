/**
 * Xác thực xem một chuỗi có phải là UUID hợp lệ hay không
 * UUID phải có định dạng: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 * với X là các ký tự hex (0-9, a-f)
 */
export const isValidUUID = (id: string): boolean => {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
};
