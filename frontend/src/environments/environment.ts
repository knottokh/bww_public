// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const BASE_URL = 'http://localhost:3000';
const SUB_PATH = 'bww';
const node_ver = '12.16.0';
export const environment = {
  production: false,
  baseUrl: `${BASE_URL}${SUB_PATH ? '/' : ''}${SUB_PATH}`,
  apiUrl: `${BASE_URL}${SUB_PATH ? '/' : ''}${SUB_PATH}/api`,
  encPassword: 'z49bGVNwtPmU',
  chatUrl:  BASE_URL,
  chatPath: `${SUB_PATH ? '/' : ''}${SUB_PATH}/api/chat/bww-chat.io`,
  routeRoot: SUB_PATH,
  routeSubpath: `${SUB_PATH}${SUB_PATH ? '/' : ''}`,
  assetsSubpath: `${SUB_PATH ? '/' : ''}${SUB_PATH}`
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
