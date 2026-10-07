import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {verifyAccess} from '../access.mjs';
test('private Access accepts only a signed, current token for the configured operator and app',async()=>{
  const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
  const jwk={...publicKey.export({format:'jwk'}),kid:'fixture-key'};
  const env={ACCESS_ISSUER:'https://fixture.cloudflareaccess.com',ACCESS_AUDIENCE:'fixture-app',ACCESS_ALLOWED_EMAILS:'kontakt@aeternus-verlag.de'};
  const seconds=Math.floor(Date.now()/1000);
  const claims={iss:env.ACCESS_ISSUER,aud:[env.ACCESS_AUDIENCE],email:'kontakt@aeternus-verlag.de',iat:seconds,exp:seconds+60};
  const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
  const token=payload=>{const raw=encode({alg:'RS256',kid:jwk.kid})+'.'+encode(payload);return raw+'.'+sign('sha256',Buffer.from(raw),privateKey).toString('base64url');};
  let calls=0;
  const fetcher=async url=>{calls++;assert.equal(url,env.ACCESS_ISSUER+'/cdn-cgi/access/certs');return new Response(JSON.stringify({keys:[jwk]}));};
  assert.equal(await verifyAccess(token(claims),env,fetcher),true);
  for(const changed of [{email:'other@example.invalid'},{aud:['other']},{iss:'https://other.cloudflareaccess.com'},{exp:seconds-1},{iat:seconds+120}])
    assert.equal(await verifyAccess(token({...claims,...changed}),env,fetcher),false);
  assert.equal(calls,1);
  const original=token(claims).split('.');original[1]=encode({...claims,exp:seconds+600});
  assert.equal(await verifyAccess(original.join('.'),env,fetcher),false);
  assert.equal(await verifyAccess(token(claims),{...env,ACCESS_ALLOWED_EMAILS:''},fetcher),false);
});
