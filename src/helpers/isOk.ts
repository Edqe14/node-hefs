/**
 * Checks if a response code is OK (2xx)
 * @param code Response code
 *
 * @returns A boolean indicating if is OK
 */
const isOk = (code: number): boolean => {
  return code >= 200 && code <= 299;
};

export default isOk;
