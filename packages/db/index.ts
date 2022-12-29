import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Crossword } from '@crossword/backend/entities/crossword';
import { CONFIG } from '@crossword/config';

let MutableAppDataSource: DataSource;
const entities = [Crossword];
const subscribers = [];
const migrations = [];

if (CONFIG.STAGE === 'production') {
   MutableAppDataSource = new DataSource({
      type: 'oracle',
      port: 1521,
      username: 'admin',
      password: 'nhwaOAhsc4a2',
      extra: {
         connectString:
            '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-phoenix-1.oraclecloud.com))(connect_data=(service_name=g9d823141ae4a7a_crossword_medium.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)(ssl_server_cert_dn="CN=adwc.uscom-east-1.oraclecloud.com, OU=Oracle BMCS US, O=Oracle Corporation, L=Redwood City, ST=California, C=US")))',
      },
      synchronize: true,
      logging: false,
      entities,
      subscribers,
      migrations,
   });
} else {
   MutableAppDataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities,
      subscribers,
      migrations,
      synchronize: true,
      logging: true,
   });
}
const AppDataSource = MutableAppDataSource;
export { AppDataSource };
