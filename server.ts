import express from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
// NOTE: 'vite' is intentionally NOT imported at the top level.
// It is only used in local development (see dynamic import below) and must
// never be bundled into the Vercel serverless function, since it can crash
// the function at cold start and break every API route (including login).
import { SEED_CUSTOMERS, SEED_PROJECTS } from './src/data/seedData.js';
import { SEED_QA_CRITERIA, SEED_QA_REVIEWS, SEED_RSE_RECORDS } from './src/data/qaSeedData.js';

const app = express();
const PORT = 3000;

const KEYS_FILE = process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'api-keys.json')
  : path.join(process.cwd(), 'src', 'data', 'api-keys.json');

// Server-side audit logging helper
async function serverAddLog(user: string, action: string, details: string) {
  try {
    const configSnap = await firestoreDbInstance.collection('globals').doc('config').get();
    const configData = configSnap.exists ? configSnap.data() : null;
    const settings = configData?.settings || {};
    if (settings.logConfig && settings.logConfig[action] === false) {
      return;
    }

    const logId = 'log-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    const newLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      user,
      action,
      details
    };

    await firestoreDbInstance.collection('logs').doc(logId).set(newLog);
  } catch (err) {
    console.error('Error writing server audit log:', err);
  }
}
const PORTAL_DB_FILE = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'portal-db.json')
  : path.join(process.cwd(), 'src', 'data', 'portal-db.json');

// Ensure parent directory of database exists
const dbDir = path.dirname(PORTAL_DB_FILE);
try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create database directory, continuing:', e);
}

const hashPasswordWithSalt = (password: string, salt: string): string => {
  if (/^[a-f0-9]{128}$/i.test(password)) {
    return password;
  }
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
};

const DEFAULT_APP_USERS = [
  {
    id: 'usr-marcelo',
    username: 'marcelo.timpone@exedconsulting.com',
    name: 'Marcelo Timpone de Oliveira',
    role: 'PMO ADM',
    password: 'PMO2026',
    active: true,
    email: 'marcelo.timpone@exedconsulting.com',
    isFirstLogin: false
  },
  {
    id: 'usr-demo',
    username: 'demonstrativo@exedconsulting.com',
    name: 'Usuário Demonstrativo',
    role: 'Demonstrativo',
    password: 'PMO2026',
    active: true,
    email: 'demonstrativo@exedconsulting.com',
    isFirstLogin: false
  },
  {
    id: 'usr-pmo',
    username: 'pmo@exedconsulting.com',
    name: 'Consultor PMO',
    role: 'PMO',
    password: 'PMO2026',
    active: true,
    email: 'pmo@exedconsulting.com',
    isFirstLogin: false
  },
  {
    id: 'usr-adm',
    username: 'pmo_adm@exedconsulting.com',
    name: 'PMO Administrador',
    role: 'PMO ADM',
    password: 'PMO2026',
    active: true,
    email: 'pmo_adm@exedconsulting.com',
    isFirstLogin: false
  }
];

import { initializeApp as initAdminApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Handle Firebase initialization gracefully and allow full local database fallback.
// We use the Firebase ADMIN SDK (service account) instead of the client SDK, because:
//   1. It authenticates as a trusted server, bypassing Firestore security rules entirely
//      (so firestore.rules can safely deny all direct/browser access).
//   2. It never needs a public Firebase Auth session — perfect for this server-as-proxy pattern.
let adminDb: Firestore | null = null;
let firebaseConfig: any = null;

try {
  // Service account credentials, provided via environment variables (set these in
  // Vercel Project Settings > Environment Variables — never commit real credentials to git).
  //   FIREBASE_PROJECT_ID
  //   FIREBASE_CLIENT_EMAIL
  //   FIREBASE_PRIVATE_KEY        (paste with real newlines; we un-escape \n below)
  // Optional:
  //   FIREBASE_FIRESTORE_DATABASE_ID  (defaults to "(default)")
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && rawPrivateKey) {
    firebaseConfig = {
      projectId,
      firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || '(default)',
    };
    const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

    if (!getApps().length) {
      initAdminApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    }
    adminDb = getFirestore();
    console.log('Firebase Admin initialized successfully for Firestore backend.');
  } else {
    console.log('Firebase service account not configured. Running in local JSON storage mode.');
  }
} catch (err) {
  console.warn('Firebase initialization error. Running in local JSON storage mode:', err);
}

let localDbState: any = null;

const loadLocalDatabase = () => {
  if (localDbState) return localDbState;
  try {
    if (fs.existsSync(PORTAL_DB_FILE)) {
      const raw = fs.readFileSync(PORTAL_DB_FILE, 'utf-8');
      localDbState = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading local portal-db.json:', err);
  }
  
  if (!localDbState) {
    localDbState = {};
  }
  // Ensure all required fields exist
  const fields = ['users', 'customers', 'projects', 'criteria', 'reviews', 'rseRecords', 'logs', 'notifications', 'sessions'];
  fields.forEach(f => {
    if (!localDbState[f] || !Array.isArray(localDbState[f])) {
      localDbState[f] = [];
    }
  });

  // Synchronous fallback seeding if empty (crucial for stateless environments like Vercel)
  if (localDbState.users.length === 0) {
    DEFAULT_APP_USERS.forEach((u) => {
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = hashPasswordWithSalt(u.password, salt);
      localDbState.users.push({ ...u, salt, password: hashedPassword });
    });
  }
  if (localDbState.customers.length === 0) {
    localDbState.customers = [...SEED_CUSTOMERS];
  }
  if (localDbState.projects.length === 0) {
    localDbState.projects = [...SEED_PROJECTS];
  }
  if (localDbState.criteria.length === 0) {
    localDbState.criteria = [...SEED_QA_CRITERIA];
  }
  if (localDbState.reviews.length === 0) {
    localDbState.reviews = [...SEED_QA_REVIEWS];
  }
  if (localDbState.rseRecords.length === 0) {
    localDbState.rseRecords = [...SEED_RSE_RECORDS];
  }
  if (!localDbState.gps || !Array.isArray(localDbState.gps)) {
    localDbState.gps = [
      'Felipe Beni', 'Danilo Santos', 'Bruno Lemos', 'Rafael Candido', 
      'Andrei Scheiner', 'Tiago Perez', 'Guilherme Dayoub', 'Luis Branco', 
      'Aline Olive', 'Fernando Costa', 'Pedro Nunes', 'Sheila Hozmann', 'Helen Passos'
    ];
  }
  if (!localDbState.settings || typeof localDbState.settings !== 'object') {
    localDbState.settings = {
      theme: 'dark',
      excelMapping: {
        clientName: 'A',
        line: 'B',
        projectName: 'C',
        phase: 'D',
        manager: 'E',
        status: 'F',
        adherence: 'G',
        validationDate: 'H',
        pmoObservations: 'I',
        pendencyCount: 'J',
        nextQaRequired: 'K'
      },
      qaExcelTemplate: '',
      qaCellMapping: {},
      logConfig: {
        'Lançar RSE': true,
        'Editar RSE': true,
        'Excluir RSE': true,
        'Registrar QA': true,
        'Editar QA': true,
        'Excluir QA': true,
        'Criar Projeto': true,
        'Editar Projeto': true,
        'Excluir Projeto': true,
        'Criar Cliente': true,
        'Editar Cliente': true,
        'Excluir Cliente': true,
        'Alteração de senha': true,
        'Criar Usuário': true,
        'Atualizar Usuário': true,
        'Excluir Usuário': true,
        'Configuração do Sistema': true,
        'Importar Backlog': true,
        'Exportar Backlog': true,
        'Gerar Apresentação': true,
        'Login realizado': true,
        'Login simplificado': true,
        'Limpeza de Logs': true
      },
      userSettings: {}
    };
  }
  return localDbState;
};

const saveLocalDatabase = () => {
  try {
    fs.writeFileSync(PORTAL_DB_FILE, JSON.stringify(localDbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local portal-db.json:', err);
  }
};

const collectionMap: { [key: string]: string } = {
  users: 'users',
  customers: 'customers',
  projects: 'projects',
  criteria: 'criteria',
  reviews: 'reviews',
  rse_records: 'rseRecords',
  logs: 'logs',
  notifications: 'notifications',
  sessions: 'sessions'
};

const getLocalArray = (collectionName: string): any[] => {
  const local = loadLocalDatabase();
  const key = collectionMap[collectionName] || collectionName;
  if (!local[key] || !Array.isArray(local[key])) {
    local[key] = [];
  }
  return local[key];
};

const localSetDoc = (collectionName: string, docId: string, data: any) => {
  const local = loadLocalDatabase();
  
  if (collectionName === 'globals' && docId === 'config') {
    if (data.gps) local.gps = data.gps;
    if (data.settings) {
      local.settings = { ...local.settings, ...data.settings };
    }
    saveLocalDatabase();
    return;
  }
  
  const key = collectionMap[collectionName] || collectionName;
  if (!local[key] || !Array.isArray(local[key])) {
    local[key] = [];
  }
  
  const idx = local[key].findIndex((item: any) => item.id === docId);
  if (idx > -1) {
    local[key][idx] = { ...local[key][idx], ...data };
  } else {
    local[key].push({ id: docId, ...data });
  }
  saveLocalDatabase();
};

const localDeleteDoc = (collectionName: string, docId: string) => {
  const local = loadLocalDatabase();
  const key = collectionMap[collectionName] || collectionName;
  if (!local[key] || !Array.isArray(local[key])) {
    return;
  }
  local[key] = local[key].filter((item: any) => item.id !== docId);
  saveLocalDatabase();
};

const firestoreDbInstance = {
  collection(collectionName: string) {
    return {
      limit(n: number) {
        return {
          async get() {
            if (adminDb) {
              try {
                const snap = await adminDb.collection(collectionName).limit(n).get();
                return {
                  empty: snap.empty,
                  forEach(callback: (doc: any) => void) {
                    snap.forEach(callback);
                  },
                  docs: snap.docs
                };
              } catch (err) {
                console.warn(`Firestore read limit error in ${collectionName}, falling back to local:`, err);
              }
            }
            const localArr = getLocalArray(collectionName).slice(0, n);
            const docs = localArr.map(item => ({
              id: item.id || '',
              exists: true,
              data() { return item; }
            }));
            return {
              empty: docs.length === 0,
              forEach(callback: (doc: any) => void) {
                docs.forEach(callback);
              },
              docs
            };
          }
        };
      },
      where(field: string, op: any, value: any) {
        let adminQuery = adminDb ? adminDb.collection(collectionName).where(field, op, value) : null;
        const builder = {
          where(f: string, o: any, v: any) {
            if (adminQuery) adminQuery = adminQuery.where(f, o, v);
            return builder;
          },
          async get() {
            if (adminQuery) {
              try {
                const snap = await adminQuery.get();
                return {
                  empty: snap.empty,
                  forEach(callback: (doc: any) => void) {
                    snap.forEach(callback);
                  },
                  docs: snap.docs
                };
              } catch (err) {
                console.warn(`Firestore read query error in ${collectionName}, falling back to local:`, err);
              }
            }
            const localArr = getLocalArray(collectionName).filter((item: any) => {
              if (field === 'username' || field === 'email') {
                return String(item[field]).trim().toLowerCase() === String(value).trim().toLowerCase();
              }
              return item[field] === value;
            });
            const docs = localArr.map(item => ({
              id: item.id || '',
              exists: true,
              data() { return item; }
            }));
            return {
              empty: docs.length === 0,
              forEach(callback: (doc: any) => void) {
                docs.forEach(callback);
              },
              docs
            };
          }
        };
        return builder;
      },
      doc(docId: string) {
        const docRef = adminDb ? adminDb.collection(collectionName).doc(docId) : null;
        return {
          ref: docRef || { parent: { id: collectionName }, id: docId },
          async get() {
            if (docRef) {
              try {
                const snap = await docRef.get();
                if (snap.exists) {
                  return {
                    exists: true,
                    data() { return snap.data(); }
                  };
                }
              } catch (err) {
                console.warn(`Firestore read doc error in ${collectionName}/${docId}, falling back to local:`, err);
              }
            }
            
            const local = loadLocalDatabase();
            if (collectionName === 'globals' && docId === 'config') {
              return {
                exists: true,
                data() {
                  return {
                    gps: local.gps,
                    settings: local.settings
                  };
                }
              };
            }
            const localArr = getLocalArray(collectionName);
            const found = localArr.find((item: any) => item.id === docId);
            return {
              exists: !!found,
              data() { return found; }
            };
          },
          async set(data: any, options?: any) {
            localSetDoc(collectionName, docId, data);
            if (docRef) {
              try {
                if (options && options.merge) {
                  await docRef.set(data, { merge: true });
                } else {
                  await docRef.set(data);
                }
              } catch (err) {
                console.error(`Firestore write doc error in ${collectionName}/${docId}:`, err);
              }
            }
          },
          async delete() {
            localDeleteDoc(collectionName, docId);
            if (docRef) {
              try {
                await docRef.delete();
              } catch (err) {
                console.error(`Firestore delete doc error in ${collectionName}/${docId}:`, err);
              }
            }
          }
        };
      },
      async get() {
        if (adminDb) {
          try {
            const snap = await adminDb.collection(collectionName).get();
            return {
              empty: snap.empty,
              forEach(callback: (doc: any) => void) {
                snap.forEach(callback);
              },
              docs: snap.docs
            };
          } catch (err) {
            console.warn(`Firestore read collection error in ${collectionName}, falling back to local:`, err);
          }
        }
        const localArr = getLocalArray(collectionName);
        const docs = localArr.map(item => ({
          id: item.id || '',
          exists: true,
          data() { return item; }
        }));
        return {
          empty: docs.length === 0,
          forEach(callback: (doc: any) => void) {
            docs.forEach(callback);
          },
          docs
        };
      }
    };
  },
  batch() {
    const b = adminDb ? adminDb.batch() : null;
    const localOps: Array<{ type: 'set' | 'delete', collectionName: string, docId: string, data?: any }> = [];
    
    return {
      set(docRefWrapper: any, data: any, options?: any) {
        if (docRefWrapper && docRefWrapper.ref) {
          const colName = docRefWrapper.ref.parent?.id;
          const dId = docRefWrapper.ref.id;
          if (colName && dId) {
            localOps.push({ type: 'set', collectionName: colName, docId: dId, data });
          }
        }
        if (b && docRefWrapper && docRefWrapper.ref) {
          try {
            if (options && options.merge) {
              b.set(docRefWrapper.ref, data, { merge: true });
            } else {
              b.set(docRefWrapper.ref, data);
            }
          } catch (err) {
            console.error('Firestore batch set error queued:', err);
          }
        }
      },
      delete(docRefWrapper: any) {
        if (docRefWrapper && docRefWrapper.ref) {
          const colName = docRefWrapper.ref.parent?.id;
          const dId = docRefWrapper.ref.id;
          if (colName && dId) {
            localOps.push({ type: 'delete', collectionName: colName, docId: dId });
          }
        }
        if (b && docRefWrapper && docRefWrapper.ref) {
          try {
            b.delete(docRefWrapper.ref);
          } catch (err) {
            console.error('Firestore batch delete error queued:', err);
          }
        }
      },
      async commit() {
        localOps.forEach(op => {
          if (op.type === 'set') {
            localSetDoc(op.collectionName, op.docId, op.data);
          } else if (op.type === 'delete') {
            localDeleteDoc(op.collectionName, op.docId);
          }
        });
        if (b) {
          try {
            await b.commit();
          } catch (err) {
            console.error('Firestore batch commit failed:', err);
          }
        }
      }
    };
  }
};

// Load entire database from native collections
const loadDatabaseFromFirestore = async () => {
  const local = loadLocalDatabase();
  try {
    const [
      usersSnap,
      customersSnap,
      projectsSnap,
      criteriaSnap,
      reviewsSnap,
      rseRecordsSnap,
      logsSnap,
      notificationsSnap,
      sessionsSnap,
      configSnap
    ] = await Promise.all([
      firestoreDbInstance.collection('users').get(),
      firestoreDbInstance.collection('customers').get(),
      firestoreDbInstance.collection('projects').get(),
      firestoreDbInstance.collection('criteria').get(),
      firestoreDbInstance.collection('reviews').get(),
      firestoreDbInstance.collection('rse_records').get(),
      firestoreDbInstance.collection('logs').get(),
      firestoreDbInstance.collection('notifications').get(),
      firestoreDbInstance.collection('sessions').get(),
      firestoreDbInstance.collection('globals').doc('config').get()
    ]);

    const users: any[] = [];
    usersSnap.forEach(doc => users.push(doc.data()));

    const customers: any[] = [];
    customersSnap.forEach(doc => customers.push(doc.data()));

    const projects: any[] = [];
    projectsSnap.forEach(doc => projects.push(doc.data()));

    const criteria: any[] = [];
    criteriaSnap.forEach(doc => criteria.push(doc.data()));

    const reviews: any[] = [];
    reviewsSnap.forEach(doc => reviews.push(doc.data()));

    const rseRecords: any[] = [];
    rseRecordsSnap.forEach(doc => rseRecords.push(doc.data()));

    const logs: any[] = [];
    logsSnap.forEach(doc => logs.push(doc.data()));

    const notifications: any[] = [];
    notificationsSnap.forEach(doc => notifications.push(doc.data()));

    const sessions: any[] = [];
    sessionsSnap.forEach(doc => sessions.push(doc.data()));

    const configData = configSnap.exists ? configSnap.data() : {};

    // Sort logs by timestamp descending so newest logs are first
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const result = {
      users: users.length > 0 ? users : local.users,
      customers: customers.length > 0 ? customers : local.customers,
      projects: projects.length > 0 ? projects : local.projects,
      criteria: criteria.length > 0 ? criteria : local.criteria,
      reviews: reviews.length > 0 ? reviews : local.reviews,
      rseRecords: rseRecords.length > 0 ? rseRecords : local.rseRecords,
      logs: logs.length > 0 ? logs : local.logs,
      notifications: notifications.length > 0 ? notifications : local.notifications,
      sessions: sessions.length > 0 ? sessions : local.sessions,
      gps: configData?.gps || local.gps,
      settings: configData?.settings || local.settings
    };

    // Update in-memory state and save local DB to file
    localDbState = result;
    saveLocalDatabase();

    return result;
  } catch (err) {
    console.error('Error loading database from Firestore, falling back to local storage:', err);
    return local;
  }
};

// Seed Firestore native collections if they are empty
const seedFirestoreDatabaseIfEmpty = async () => {
  try {
    const usersSnap = await firestoreDbInstance.collection('users').limit(1).get();
    if (usersSnap.empty) {
      console.log('Seeding default users into native Firestore collection...');
      const batch = firestoreDbInstance.batch();
      DEFAULT_APP_USERS.forEach((u) => {
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = hashPasswordWithSalt(u.password, salt);
        const docRef = firestoreDbInstance.collection('users').doc(u.id);
        batch.set(docRef, { ...u, salt, password: hashedPassword });
      });
      await batch.commit();
    }

    const customersSnap = await firestoreDbInstance.collection('customers').limit(1).get();
    if (customersSnap.empty) {
      console.log('Seeding customers into native Firestore collection...');
      const batch = firestoreDbInstance.batch();
      SEED_CUSTOMERS.forEach((c) => {
        const docRef = firestoreDbInstance.collection('customers').doc(c.id);
        batch.set(docRef, c);
      });
      await batch.commit();
    }

    const projectsSnap = await firestoreDbInstance.collection('projects').limit(1).get();
    if (projectsSnap.empty) {
      console.log('Seeding projects into native Firestore collection...');
      let batch = firestoreDbInstance.batch();
      let count = 0;
      for (const p of SEED_PROJECTS) {
        const docRef = firestoreDbInstance.collection('projects').doc(p.id);
        batch.set(docRef, p);
        count++;
        if (count === 400) {
          await batch.commit();
          batch = firestoreDbInstance.batch();
          count = 0;
        }
      }
      if (count > 0) {
        await batch.commit();
      }
    }

    const criteriaSnap = await firestoreDbInstance.collection('criteria').limit(1).get();
    if (criteriaSnap.empty) {
      console.log('Seeding QA criteria into native Firestore collection...');
      const batch = firestoreDbInstance.batch();
      SEED_QA_CRITERIA.forEach((c) => {
        const docRef = firestoreDbInstance.collection('criteria').doc(c.id);
        batch.set(docRef, c);
      });
      await batch.commit();
    }

    const reviewsSnap = await firestoreDbInstance.collection('reviews').limit(1).get();
    if (reviewsSnap.empty) {
      console.log('Seeding 30 QA reviews into native Firestore collection...');
      let batch = firestoreDbInstance.batch();
      let count = 0;
      for (const r of SEED_QA_REVIEWS) {
        const docRef = firestoreDbInstance.collection('reviews').doc(r.id);
        batch.set(docRef, r);
        count++;
        if (count === 400) {
          await batch.commit();
          batch = firestoreDbInstance.batch();
          count = 0;
        }
      }
      if (count > 0) {
        await batch.commit();
      }
    }

    const rseRecordsSnap = await firestoreDbInstance.collection('rse_records').limit(1).get();
    if (rseRecordsSnap.empty) {
      console.log('Seeding 10 RSE records into native Firestore collection...');
      const batch = firestoreDbInstance.batch();
      SEED_RSE_RECORDS.forEach((r) => {
        const docRef = firestoreDbInstance.collection('rse_records').doc(r.id);
        batch.set(docRef, r);
      });
      await batch.commit();
    }

    const configDoc = await firestoreDbInstance.collection('globals').doc('config').get();
    if (!configDoc.exists) {
      console.log('Seeding globals configuration document into native Firestore...');
      const defaultGps = [
        'Felipe Beni', 'Danilo Santos', 'Bruno Lemos', 'Rafael Candido', 
        'Andrei Scheiner', 'Tiago Perez', 'Guilherme Dayoub', 'Luis Branco', 
        'Aline Olive', 'Fernando Costa', 'Pedro Nunes', 'Sheila Hozmann', 'Helen Passos'
      ];
      const defaultSettings = {
        theme: 'dark',
        excelMapping: {
          clientName: 'A',
          line: 'B',
          projectName: 'C',
          phase: 'D',
          manager: 'E',
          status: 'F',
          adherence: 'G',
          validationDate: 'H',
          pmoObservations: 'I',
          pendencyCount: 'J',
          nextQaRequired: 'K'
        },
        qaExcelTemplate: '',
        qaCellMapping: {},
        logConfig: {
          'Lançar RSE': true,
          'Editar RSE': true,
          'Excluir RSE': true,
          'Registrar QA': true,
          'Editar QA': true,
          'Excluir QA': true,
          'Criar Projeto': true,
          'Editar Projeto': true,
          'Excluir Projeto': true,
          'Criar Cliente': true,
          'Editar Cliente': true,
          'Excluir Cliente': true,
          'Alteração de senha': true,
          'Criar Usuário': true,
          'Atualizar Usuário': true,
          'Excluir Usuário': true,
          'Configuração do Sistema': true,
          'Importar Backlog': true,
          'Exportar Backlog': true,
          'Gerar Apresentação': true,
          'Login realizado': true,
          'Login simplificado': true,
          'Limpeza de Logs': true
        },
        userSettings: {}
      };
      await firestoreDbInstance.collection('globals').doc('config').set({
        gps: defaultGps,
        settings: defaultSettings
      });
    }
    console.log('Firestore native collections successfully verified/seeded.');
  } catch (err) {
    console.error('Error seeding native Firestore collections:', err);
  }
};

// Commit operations in chunks of 400 to respect Firestore transaction bounds
const commitInBatches = async <T>(items: T[], operation: (batch: any, item: T) => void) => {
  let batch = firestoreDbInstance.batch();
  let count = 0;
  for (const item of items) {
    operation(batch, item);
    count++;
    if (count === 400) {
      await batch.commit();
      batch = firestoreDbInstance.batch();
      count = 0;
    }
  }
  if (count > 0) {
    await batch.commit();
  }
};

// Parse cookies manually for Express
function getCookie(req: express.Request, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(';').map(c => c.trim().split('='));
  const match = cookies.find(([k]) => k === name);
  return match ? decodeURIComponent(match[1]) : undefined;
}

// Retrieve per-user session helper
async function getUserSession(req: express.Request) {
  const userToken = (req.headers['x-user-session'] as string) || getCookie(req, 'exed_user_token');
  if (!userToken) return null;
  
  try {
    const sessionDoc = await firestoreDbInstance.collection('sessions').doc(userToken).get();
    if (!sessionDoc.exists) return null;
    const session = sessionDoc.data();
    if (!session || session.type !== 'user') return null;
    if (session.expiresAt < Date.now()) {
      await firestoreDbInstance.collection('sessions').doc(userToken).delete();
      return null;
    }
    return session;
  } catch (err) {
    console.error('Error fetching session from Firestore:', err);
    return null;
  }
}

// Rate Limiting helper
const loginAttempts = new Map<string, { count: number, blockUntil: number }>();

function checkRateLimit(key: string): { allowed: boolean, remainingTime?: number } {
  const record = loginAttempts.get(key);
  if (!record) return { allowed: true };
  
  if (Date.now() < record.blockUntil) {
    return { allowed: false, remainingTime: Math.ceil((record.blockUntil - Date.now()) / 1000) };
  }
  
  if (Date.now() > record.blockUntil && record.count >= 5) {
    loginAttempts.delete(key);
    return { allowed: true };
  }
  
  return { allowed: true };
}

function recordFailedAttempt(key: string) {
  const record = loginAttempts.get(key) || { count: 0, blockUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.blockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes block
  }
  loginAttempts.set(key, record);
}

function clearFailedAttempts(key: string) {
  loginAttempts.delete(key);
}

console.log("Verifying and seeding native Firestore collections...");
seedFirestoreDatabaseIfEmpty().then(() => {
  console.log("Database verification and seeding completed successfully.");
}).catch(err => {
  console.error("Database verification and seeding failed:", err);
});

  // 1. Session / Authentication Gate Middleware
  // Must be registered FIRST before any routes so we prevent bypass of specific endpoints.
  app.use(async (req, res, next) => {
    // Exempt user login and public routes from global auth gate
    if (req.path === '/api/auth/login' || req.path.startsWith('/api/public/')) {
      return next();
    }

    // For any other API paths, verify user session
    if (req.path.startsWith('/api/')) {
      const userSession = await getUserSession(req);
      if (!userSession) {
        return res.status(401).json({ success: false, message: 'Não autorizado. Sessão expirada ou inválida.' });
      }
      return next();
    }

    // For non-API frontend static files/routes, allow them to load directly so the React App is served
    return next();
  });

  // Per-User Login with rate limiting, salt check, and random user session token
  app.post('/api/auth/login', express.json(), async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
      }

      const emailInput = username.trim().toLowerCase();
      const ip = req.ip || 'unknown';
      const limitCheck = checkRateLimit(`${ip}_${emailInput}`);
      if (!limitCheck.allowed) {
        return res.status(429).json({ success: false, message: `Muitas tentativas para esta conta. Tente novamente em ${limitCheck.remainingTime} segundos.` });
      }

      // Query user in Firestore
      const userQuery = await firestoreDbInstance.collection('users')
        .where('username', '==', emailInput)
        .get();
      
      let foundUserDoc = userQuery.docs[0];
      if (!foundUserDoc) {
        // Fallback search by email
        const emailQuery = await firestoreDbInstance.collection('users')
          .where('email', '==', emailInput)
          .get();
        foundUserDoc = emailQuery.docs[0];
      }

      if (!foundUserDoc) {
        recordFailedAttempt(`${ip}_${emailInput}`);
        return res.status(401).json({ success: false, message: 'E-mail corporativo não cadastrado.' });
      }

      const foundUser = foundUserDoc.data() as any;

      if (!foundUser.active) {
        return res.status(401).json({ success: false, message: 'Sua conta está inativa.' });
      }

      // Lazy-initialize dynamic salt if missing
      if (!foundUser.salt) {
        foundUser.salt = crypto.randomBytes(16).toString('hex');
        foundUser.password = hashPasswordWithSalt(foundUser.password || 'PMO2026', foundUser.salt);
        await firestoreDbInstance.collection('users').doc(foundUser.id).set(foundUser, { merge: true });
      }

      const inputHash = hashPasswordWithSalt(password, foundUser.salt);
      if (foundUser.password !== inputHash) {
        recordFailedAttempt(`${ip}_${emailInput}`);
        return res.status(401).json({ success: false, message: 'Senha incorreta.' });
      }

      clearFailedAttempts(`${ip}_${emailInput}`);

      // Generate random cryptographically secure user-specific session token
      const userToken = crypto.randomBytes(32).toString('hex');
      const sessionObj = {
        token: userToken,
        type: 'user',
        userId: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days
      };

      await firestoreDbInstance.collection('sessions').doc(userToken).set(sessionObj);

      // Set cookie for iframe/general support
      res.cookie('exed_user_token', userToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 30
      });

      const { password: _, ...safeUser } = foundUser;
      return res.json({ success: true, user: safeUser, userToken });
    } catch (err: any) {
      console.error('Auth login error:', err);
      res.status(500).json({ success: false, message: 'Erro interno ao realizar login.' });
    }
  });

  // Per-User Logout
  app.post('/api/auth/logout', async (req, res) => {
    const userToken = (req.headers['x-user-session'] as string) || getCookie(req, 'exed_user_token') || '';
    if (userToken) {
      try {
        await firestoreDbInstance.collection('sessions').doc(userToken).delete();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    res.clearCookie('exed_user_token');
    return res.json({ success: true });
  });

  // Gemini Portfolio Analysis - Sanitize errors to prevent leaks
  app.post('/api/gemini/analyze', express.json(), async (req, res) => {
    try {
      const { data } = req.body;
      const { GoogleGenAI } = await import('@google/genai');
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Você é o PMO Corporativo especialista em SAP S/4HANA da Exed Consulting.
Analise os seguintes dados consolidados das reuniões de QA e do Playbook de projetos:
${JSON.stringify(data, null, 2)}

Por favor, forneça um relatório em formato JSON com a seguinte estrutura exata:
{
  "resumoGeral": "Texto resumido em português sobre a situação atual de conformidade e governança do portfólio",
  "riscosCriticos": [
    { "projeto": "Nome do Projeto/Onda", "descricao": "Detalhamento em português do risco metodológico identificado", "impact": "Alto" }
  ],
  "pendenciasUrgentes": [
    { "projeto": "Nome do Projeto/Onda", "descricao": "Detalhamento da pendência metodológica ou atraso", "gp": "Nome do GP responsável" }
  ],
  "recomendacoesPMO": [
    "Recomendação estratégica 1 para o portfólio", "Recomendação 2"
  ]
}

Não inclua nenhuma introdução, marcações de código markdown ou explicações fora do JSON. Retorne estritamente o objeto JSON.`,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '{}';
      res.json(JSON.parse(text));
    } catch (err: any) {
      console.error('Gemini analysis error:', err);
      // Generic secure 500 error to avoid leaks
      res.status(500).json({ error: 'Erro interno ao processar a análise com o Gemini. Tente novamente.' });
    }
  });

  // API Keys Helpers
  const readKeys = (): any[] => {
    try {
      if (fs.existsSync(KEYS_FILE)) {
        return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
      }
    } catch (e) {
      console.error('Error reading keys file:', e);
    }
    return [];
  };

  const writeKeys = (keys: any[]) => {
    try {
      fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing keys file:', e);
    }
  };

  // API Keys Management (PMO ADM only)
  app.get('/api/admin/api-keys', async (req, res) => {
    const userSession = await getUserSession(req);
    if (!userSession || userSession.role !== 'PMO ADM') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores do PMO podem listar chaves de API.' });
    }

    const keys = readKeys();
    res.json(keys);
  });

  app.post('/api/admin/api-keys', express.json(), async (req, res) => {
    const userSession = await getUserSession(req);
    if (!userSession || userSession.role !== 'PMO ADM') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores do PMO podem gerar chaves de API.' });
    }

    const { label } = req.body;
    if (!label) {
      return res.status(400).json({ error: 'Label é obrigatório' });
    }
    
    const keys = readKeys();
    const token = 'exed_pub_' + crypto.randomBytes(24).toString('hex');
    const newKey = {
      id: 'key-' + Date.now(),
      label,
      key: token,
      createdAt: new Date().toISOString()
    };
    
    keys.push(newKey);
    writeKeys(keys);
    res.json(newKey);
  });

  app.delete('/api/admin/api-keys/:id', async (req, res) => {
    const userSession = await getUserSession(req);
    if (!userSession || userSession.role !== 'PMO ADM') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores do PMO podem revogar chaves de API.' });
    }

    const { id } = req.params;
    let keys = readKeys();
    keys = keys.filter(k => k.id !== id);
    writeKeys(keys);
    res.json({ success: true });
  });
  app.get('/api/db/load', async (req, res) => {
    try {
      const db = await loadDatabaseFromFirestore();
      const safeUsers = db.users.map((u: any) => {
        const { password, salt, ...rest } = u;
        return rest;
      });
      res.json({ ...db, users: safeUsers });
    } catch (err: any) {
      console.error('Load DB error:', err);
      res.status(500).json({ error: 'Erro ao carregar banco de dados' });
    }
  });

  // Central Database Sync Endpoint (with role-based access controls, upsert merging, and secure append-only audit logs)
  app.post('/api/db/sync', express.json({ limit: '50mb' }), async (req, res) => {
    try {
      const clientData = req.body;
      const userSession = await getUserSession(req);
      if (!userSession) {
        return res.status(401).json({ success: false, error: 'Sessão inválida ou expirada. Efetue login novamente.' });
      }

      if (userSession.role === 'Demonstrativo') {
        return res.status(403).json({ success: false, error: 'Acesso negado. Usuários demonstrativos não possuem permissão de gravação.' });
      }

      const isAdm = userSession.role === 'PMO ADM';
      const deletedIds = clientData.deletedIds || {};

      // 1. Merge Customers
      if (clientData.customers && Array.isArray(clientData.customers)) {
        await commitInBatches(clientData.customers, (batch, cc: any) => {
          const docRef = firestoreDbInstance.collection('customers').doc(cc.id);
          batch.set(docRef, cc);
        });
      }
      if (deletedIds.customers && Array.isArray(deletedIds.customers)) {
        await commitInBatches(deletedIds.customers, (batch, id: any) => {
          const docRef = firestoreDbInstance.collection('customers').doc(id);
          batch.delete(docRef);
        });
      }

      // 2. Merge Projects
      if (clientData.projects && Array.isArray(clientData.projects)) {
        await commitInBatches(clientData.projects, (batch, cp: any) => {
          const docRef = firestoreDbInstance.collection('projects').doc(cp.id);
          batch.set(docRef, cp);
        });
      }
      if (deletedIds.projects && Array.isArray(deletedIds.projects)) {
        await commitInBatches(deletedIds.projects, (batch, id: any) => {
          const docRef = firestoreDbInstance.collection('projects').doc(id);
          batch.delete(docRef);
        });
      }

      // 3. Merge Reviews (QA Control) + Server-Side Audit Logs
      if (clientData.reviews && Array.isArray(clientData.reviews)) {
        await commitInBatches(clientData.reviews, (batch, cr: any) => {
          const docRef = firestoreDbInstance.collection('reviews').doc(cr.id);
          batch.set(docRef, cr);
        });
        for (const cr of clientData.reviews) {
          const existingSnap = await firestoreDbInstance.collection('reviews').doc(cr.id).get();
          if (!existingSnap.exists) {
            await serverAddLog(userSession.username, 'Registrar QA', `QA registrado para o projeto "${cr.projectName}" com aderência de ${Math.round(cr.adherence || 0)}%.`);
          } else {
            const existing = existingSnap.data();
            if (JSON.stringify(existing) !== JSON.stringify(cr)) {
              await serverAddLog(userSession.username, 'Editar QA', `QA atualizado para o projeto "${cr.projectName}" com nova aderência de ${Math.round(cr.adherence || 0)}%.`);
            }
          }
        }
      }
      if (deletedIds.reviews && Array.isArray(deletedIds.reviews)) {
        for (const id of deletedIds.reviews) {
          const existingSnap = await firestoreDbInstance.collection('reviews').doc(id).get();
          if (existingSnap.exists) {
            const existing = existingSnap.data();
            await serverAddLog(userSession.username, 'Excluir QA', `Qualificação de Quality Gate excluída para o projeto "${existing?.projectName}".`);
          }
        }
        await commitInBatches(deletedIds.reviews, (batch, id: any) => {
          const docRef = firestoreDbInstance.collection('reviews').doc(id);
          batch.delete(docRef);
        });
      }

      // 4. Merge RSE Records + Server-Side Audit Logs
      if (clientData.rseRecords && Array.isArray(clientData.rseRecords)) {
        await commitInBatches(clientData.rseRecords, (batch, cr: any) => {
          const docRef = firestoreDbInstance.collection('rse_records').doc(cr.id);
          batch.set(docRef, cr);
        });
        for (const cr of clientData.rseRecords) {
          const existingSnap = await firestoreDbInstance.collection('rse_records').doc(cr.id).get();
          if (!existingSnap.exists) {
            await serverAddLog(userSession.username, 'Lançar RSE', `Relatório RSE lançado para o projeto "${cr.projectName}" (Atrasado: ${cr.delayed}, Pendências: ${cr.pendencies}).`);
          } else {
            const existing = existingSnap.data();
            if (JSON.stringify(existing) !== JSON.stringify(cr)) {
              await serverAddLog(userSession.username, 'Editar RSE', `Relatório RSE atualizado para o projeto "${cr.projectName}" (Atrasado: ${cr.delayed}, Pendências: ${cr.pendencies}).`);
            }
          }
        }
      }
      if (deletedIds.rseRecords && Array.isArray(deletedIds.rseRecords)) {
        for (const id of deletedIds.rseRecords) {
          const existingSnap = await firestoreDbInstance.collection('rse_records').doc(id).get();
          if (existingSnap.exists) {
            const existing = existingSnap.data();
            await serverAddLog(userSession.username, 'Excluir RSE', `Relatório RSE excluído para o projeto "${existing?.projectName}".`);
          }
        }
        await commitInBatches(deletedIds.rseRecords, (batch, id: any) => {
          const docRef = firestoreDbInstance.collection('rse_records').doc(id);
          batch.delete(docRef);
        });
      }

      // 4.5. Merge Notifications
      if (clientData.notifications && Array.isArray(clientData.notifications)) {
        await commitInBatches(clientData.notifications, (batch, cn: any) => {
          const docRef = firestoreDbInstance.collection('notifications').doc(cn.id);
          batch.set(docRef, cn);
        });
      }
      if (deletedIds.notifications && Array.isArray(deletedIds.notifications)) {
        await commitInBatches(deletedIds.notifications, (batch, id: any) => {
          const docRef = firestoreDbInstance.collection('notifications').doc(id);
          batch.delete(docRef);
        });
      }

      // 5. Merge Criteria (PMO ADM only) + Server-Side Audit Logs
      if (clientData.criteria && Array.isArray(clientData.criteria)) {
        if (isAdm) {
          await commitInBatches(clientData.criteria, (batch, cc: any) => {
            const docRef = firestoreDbInstance.collection('criteria').doc(cc.id);
            batch.set(docRef, cc);
          });
          for (const cc of clientData.criteria) {
            const existingSnap = await firestoreDbInstance.collection('criteria').doc(cc.id).get();
            if (!existingSnap.exists) {
              await serverAddLog(userSession.username, 'Criar Critério', `Critério de playbook cadastrado: nº ${cc.number} - "${cc.text}" (Peso: ${cc.weight}, Tipo: ${cc.type}).`);
            } else {
              const existing = existingSnap.data();
              if (JSON.stringify(existing) !== JSON.stringify(cc)) {
                await serverAddLog(userSession.username, 'Editar Critério', `Critério de playbook nº ${cc.number} modificado para peso ${cc.weight}.`);
              }
            }
          }
        } else {
          console.warn(`User ${userSession.username} tried to update criteria without admin role. Denied.`);
        }
      }
      if (isAdm && deletedIds.criteria && Array.isArray(deletedIds.criteria)) {
        for (const id of deletedIds.criteria) {
          const existingSnap = await firestoreDbInstance.collection('criteria').doc(id).get();
          if (existingSnap.exists) {
            const existing = existingSnap.data();
            await serverAddLog(userSession.username, 'Excluir Critério', `Critério de playbook nº ${existing?.number} removido da matriz.`);
          }
        }
        await commitInBatches(deletedIds.criteria, (batch, id: any) => {
          const docRef = firestoreDbInstance.collection('criteria').doc(id);
          batch.delete(docRef);
        });
      }

      // 6. Handle Logs Clear
      if (isAdm && clientData.clearLogs) {
        const logsSnap = await firestoreDbInstance.collection('logs').get();
        const batch = firestoreDbInstance.batch();
        logsSnap.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        await serverAddLog(userSession.username, 'Limpeza de Logs', 'Histórico completo de auditoria limpo pelo administrador.');
      }

      // 7. Merge Users and settings (PMO ADM only)
      if (isAdm) {
        if (clientData.users && Array.isArray(clientData.users)) {
          for (const clientUser of clientData.users) {
            const userDocRef = firestoreDbInstance.collection('users').doc(clientUser.id);
            const userSnap = await userDocRef.get();
            if (userSnap.exists) {
              const existingUser = userSnap.data() as any;
              let salt = existingUser.salt || crypto.randomBytes(16).toString('hex');
              let password = existingUser.password;

              if (clientUser.password && clientUser.password !== 'PMO2026' && clientUser.password !== existingUser.password) {
                password = hashPasswordWithSalt(clientUser.password, salt);
                await serverAddLog(userSession.username, 'Alteração de senha', `Senha do usuário "${clientUser.name}" alterada.`);
              } else if (clientUser.password === 'PMO2026') {
                password = hashPasswordWithSalt('PMO2026', salt);
              }
              
              const safeExisting = { ...existingUser, password: '', salt: '' };
              const safeClient = { ...clientUser, password: '', salt: '' };
              if (JSON.stringify(safeExisting) !== JSON.stringify(safeClient)) {
                await serverAddLog(userSession.username, 'Atualizar Usuário', `Conta de usuário "${clientUser.name}" modificada.`);
              }

              await userDocRef.set({ ...clientUser, salt, password });
            } else {
              const salt = crypto.randomBytes(16).toString('hex');
              const password = clientUser.password ? hashPasswordWithSalt(clientUser.password, salt) : hashPasswordWithSalt('PMO2026', salt);
              await serverAddLog(userSession.username, 'Criar Usuário', `Conta de usuário criada para "${clientUser.name}" (login: ${clientUser.username}, perfil: ${clientUser.role}).`);
              await userDocRef.set({ ...clientUser, salt, password });
            }
          }
        }
        if (deletedIds.users && Array.isArray(deletedIds.users)) {
          for (const id of deletedIds.users) {
            const userDocRef = firestoreDbInstance.collection('users').doc(id);
            const userSnap = await userDocRef.get();
            if (userSnap.exists) {
              const existing = userSnap.data();
              await serverAddLog(userSession.username, 'Excluir Usuário', `Conta de usuário "${existing?.name}" (${existing?.username}) excluída permanentemente.`);
            }
            await userDocRef.delete();
          }
        }

        const configRef = firestoreDbInstance.collection('globals').doc('config');
        const configDoc = await configRef.get();
        const configData = configDoc.exists ? configDoc.data() : { settings: {}, gps: [] };
        let changedConfig = false;

        if (clientData.settings) {
          configData.settings = { ...configData.settings, ...clientData.settings };
          changedConfig = true;
        }
        if (clientData.gps && Array.isArray(clientData.gps)) {
          configData.gps = clientData.gps;
          changedConfig = true;
        }
        if (changedConfig) {
          await configRef.set(configData, { merge: true });
        }
      } else {
        // Standard user can only modify their personal preferences inside settings.userSettings
        if (clientData.settings && clientData.settings.userSettings) {
          const configRef = firestoreDbInstance.collection('globals').doc('config');
          const configDoc = await configRef.get();
          if (configDoc.exists) {
            const configData = configDoc.data() || {};
            if (!configData.settings) configData.settings = {};
            if (!configData.settings.userSettings) configData.settings.userSettings = {};
            configData.settings.userSettings[userSession.userId] = clientData.settings.userSettings[userSession.userId];
            await configRef.set(configData, { merge: true });
          }
        }
      }

      const db = await loadDatabaseFromFirestore();
      const safeUsers = db.users.map((u: any) => {
        const { password, salt, ...rest } = u;
        return rest;
      });

      res.json({ 
        success: true, 
        projects: db.projects,
        reviews: db.reviews,
        rseRecords: db.rseRecords,
        criteria: db.criteria,
        customers: db.customers,
        users: safeUsers,
        gps: db.gps || [],
        logs: db.logs,
        notifications: db.notifications,
        settings: db.settings,
        timestamp: new Date().toISOString() 
      });
    } catch (err: any) {
      console.error('Database sync error:', err);
      res.status(500).json({ error: 'Erro ao sincronizar banco de dados' });
    }
  });

  // Secure User password update route (prevents arbitrary updates)
  app.post('/api/auth/update-password', express.json(), async (req, res) => {
    try {
      const { userId, password } = req.body;
      if (!userId || !password) {
        return res.status(400).json({ success: false, message: 'Id do usuário e senha são obrigatórios' });
      }

      const userSession = await getUserSession(req);
      if (!userSession) {
        return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada. Efetue login novamente.' });
      }

      // Check authorization: users can update their own, or PMO ADM can update anyone's
      if (userSession.role !== 'PMO ADM' && userSession.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Acesso negado. Permissão insuficiente para atualizar esta senha.' });
      }

      const userDocRef = firestoreDbInstance.collection('users').doc(userId);
      const userSnap = await userDocRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }

      const userData = userSnap.data() || {};
      let salt = userData.salt;
      if (!salt) {
        salt = crypto.randomBytes(16).toString('hex');
      }

      const hashedPassword = hashPasswordWithSalt(password, salt);
      await userDocRef.set({
        salt,
        password: hashedPassword,
        isFirstLogin: false
      }, { merge: true });

      return res.json({ success: true });
    } catch (err: any) {
      console.error('Update password error:', err);
      res.status(500).json({ success: false, message: 'Erro ao salvar nova senha.' });
    }
  });

  // Load user specific settings
  app.get('/api/user/settings/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const userSession = await getUserSession(req);
      if (!userSession || (userSession.role !== 'PMO ADM' && userSession.userId !== userId)) {
        return res.status(403).json({ error: 'Acesso negado. Sessão inválida.' });
      }

      const configSnap = await firestoreDbInstance.collection('globals').doc('config').get();
      const configData = configSnap.exists ? configSnap.data() : {};
      const userSettings = configData?.settings?.userSettings || {};
      const settings = userSettings[userId] || { theme: 'dark', favorites: [], chartVisibility: {} };
      res.json(settings);
    } catch (err: any) {
      console.error('Get user settings error:', err);
      res.status(500).json({ error: 'Erro ao carregar preferências do usuário' });
    }
  });

  // Save user specific settings
  app.post('/api/user/settings/:userId', express.json(), async (req, res) => {
    try {
      const { userId } = req.params;
      const userSession = await getUserSession(req);
      if (!userSession || (userSession.role !== 'PMO ADM' && userSession.userId !== userId)) {
        return res.status(403).json({ error: 'Acesso negado. Sessão inválida.' });
      }

      const { theme, favorites, chartVisibility } = req.body;
      const configRef = firestoreDbInstance.collection('globals').doc('config');
      const configDoc = await configRef.get();
      const configData = configDoc.exists ? configDoc.data() || {} : {};
      
      if (!configData.settings) {
        configData.settings = {};
      }
      if (!configData.settings.userSettings) {
        configData.settings.userSettings = {};
      }
      
      configData.settings.userSettings[userId] = {
        theme: theme || 'dark',
        favorites: favorites || [],
        chartVisibility: chartVisibility || {}
      };

      await configRef.set(configData, { merge: true });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Post user settings error:', err);
      res.status(500).json({ error: 'Erro ao salvar preferências do usuário' });
    }
  });

  // Secure External Public API (needs API key)
  app.get('/api/public/portfolio', async (req, res) => {
    const authHeader = req.headers['authorization'];
    let token = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = (req.query.api_key as string) || (req.headers['x-api-key'] as string) || '';
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Chave de API não informada. Utilize o cabeçalho Authorization: Bearer <SUA_CHAVE> ou X-API-Key.' 
      });
    }

    const keys = readKeys();
    const validKey = keys.find(k => k.key === token);

    if (!validKey) {
      return res.status(401).json({ 
        success: false, 
        error: 'Acesso negado. Chave de API inválida ou revogada.' 
      });
    }

    try {
      const state = await loadDatabaseFromFirestore();
      const activeProjects = state.projects.filter((p: any) => p.status === 'APPROVED');
      const totalReviews = state.reviews.length;
      
      const avgAdherence = state.reviews.length > 0
        ? state.reviews.reduce((sum: number, r: any) => sum + r.adherence, 0) / state.reviews.length
        : 0;

      res.json({
        success: true,
        authorizedClient: validKey.label,
        extractedAt: new Date().toISOString(),
        summary: {
          portfolioName: "Exed S/4 Public Quality Gates Portfolio",
          totalActiveProjects: activeProjects.length,
          totalAuditsConducted: totalReviews,
          portfolioComplianceIndex: `${avgAdherence.toFixed(1)}%`,
          activeRSERecords: state.rseRecords.length
        },
        projects: activeProjects.map((p: any) => {
          const pReviews = state.reviews.filter((r: any) => r.projectName === p.name);
          const latestReview = pReviews.sort((a: any, b: any) => new Date(b.validationDate).getTime() - new Date(a.validationDate).getTime())[0];
          
          return {
            id: p.id,
            name: p.name,
            client: p.clientName,
            solution: p.solution,
            type: p.type,
            manager: p.manager,
            startDate: p.startDate,
            endDate: p.endDate,
            sapProjectId: p.sapProjectId,
            auditStatus: latestReview ? latestReview.status : 'Pendente de Auditoria',
            playbookAdherence: latestReview ? `${latestReview.adherence}%` : 'N/A',
            lastAuditDate: latestReview ? latestReview.validationDate : null
          };
        }),
        recentAudits: state.reviews.slice(0, 5).map((r: any) => ({
          projectName: r.projectName,
          client: r.client,
          phase: r.phase,
          manager: r.manager,
          adherence: `${r.adherence}%`,
          status: r.status,
          date: r.validationDate
        }))
      });
    } catch (err: any) {
      console.error('Public API retrieval error:', err);
      res.status(500).json({ success: false, error: 'Erro interno ao processar dados do portfólio' });
    }
  });

  // Serve static UI assets or mount Vite in development
  if (process.env.NODE_ENV !== "production") {
    import('vite').then(({ createServer: createViteServer }) => {
      return createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
    }).then(vite => {
      app.use(vite.middlewares);
    }).catch(err => {
      console.error('Vite development server initialization failed:', err);
    });
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

export default app;
