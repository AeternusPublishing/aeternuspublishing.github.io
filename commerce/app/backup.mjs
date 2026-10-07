import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {database} from './local-db.mjs';
const folder=process.env.SHOP_DATA_DIR || join(process.env.LOCALAPPDATA || process.env.HOME,'AETERNUS','commerce-preview');
mkdirSync(join(folder,'backups'),{recursive:true});
const db=database(join(folder,'test-orders.sqlite'));
const destination=join(folder,'backups',`test-orders-${new Date().toISOString().replace(/[:.]/g,'-')}.sqlite`);
db.backup(destination);db.close();console.log(`Local backup created: ${destination}`);
