import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {database} from './local-db.mjs';
import {createService} from './service.mjs';
const folder=process.env.SHOP_DATA_DIR || join(process.env.LOCALAPPDATA || process.env.HOME,'AETERNUS','commerce-preview');
const db=database(join(folder,'test-orders.sqlite'));
try {
  const service=createService({...process.env,MODE:process.env.MODE || 'simulation',ADMIN_TOKEN:process.env.ADMIN_TOKEN || randomBytes(32).toString('hex'),DB:db});
  console.log(JSON.stringify({processed:await service.processQueue(),mode:process.env.MODE || 'simulation'}));
} finally {db.close();}
