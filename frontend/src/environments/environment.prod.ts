const BASE_URL = '';
const SUB_PATH = '';
export const environment = {
  production: true,
  baseUrl: `${BASE_URL}${SUB_PATH ? '/' : ''}${SUB_PATH}`,
  apiUrl: `${BASE_URL}${SUB_PATH ? '/' : ''}${SUB_PATH}/api`,
  encPassword: 'z49bGVNwtPmU',
  chatUrl:  BASE_URL,
  chatPath: `${SUB_PATH ? '/' : ''}${SUB_PATH}/api/chat/bww-chat.io`,
  routeRoot: SUB_PATH,
  routeSubpath: '',
  assetsSubpath: `${SUB_PATH ? '/' : ''}${SUB_PATH}`
};
