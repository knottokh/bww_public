export function EncodeSpacialC(str: string) {
  return str.replace(/\+/g,'xMl3Jk').replace(/\//g,'Por21Ld').replace(/\=/g,'Ml32');
}
export function DecodeSpacialC(str: string) {
  return str.replace(/xMl3Jk/g, '+' ).replace(/Por21Ld/g, '/').replace(/Ml32/g, '=');
}
