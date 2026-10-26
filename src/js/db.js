/**
 * Zero Buy v4.0 — Point.Zero Commercial Edition
 * Module: db.js (Hybrid Multi-User IndexedDB + Supabase Cloud Sync)
 * 100% Zero-Emoji Architecture
 */

(function(window) {
  'use strict';

  const DB_NAME = 'zero_buy_pointzero_db';
  const DB_VERSION = 3;

  const STORE_USERS = 'users';
  const STORE_PROFILE = 'user_profile';
  const STORE_CATEGORIES = 'categories';
  const STORE_GOALS = 'financial_goals';
  const STORE_EVALUATIONS = 'evaluations';
  const STORE_SYNCED_CART = 'synced_cart';
  const STORE_CONFIG = 'cloud_config';

  let dbInstance = null;
  const CURRENT_USER_KEY = 'pointzero_current_user';

  // Seed Kategori Standar
  const DEFAULT_CATEGORIES = [
    {
      id: 'kebutuhan',
      name: 'Kebutuhan Pokok',
      description: 'Pangan, obat, sewa, tagihan listrik, dan sandang esensial',
      cooling_hours: 24,
      score_weight: 25,
      icon: 'shield',
      is_default: true
    },
    {
      id: 'produktif',
      name: 'Kerja & Produktif',
      description: 'Peralatan kerja, kursus keahlian, dan piranti lunak berpenghasilan',
      cooling_hours: 48,
      score_weight: 20,
      icon: 'tool',
      is_default: true
    },
    {
      id: 'keinginan',
      name: 'Gaya Hidup & Keinginan',
      description: 'Aksesoris sekunder, fashion gaya, dekorasi, dan hobi',
      cooling_hours: 72,
      score_weight: 12,
      icon: 'heart',
      is_default: true
    },
    {
      id: 'hiburan',
      name: 'Hiburan & Konsumtif',
      description: 'Game, kuliner mewah, nongkrong santai, dan kesenangan sesaat',
      cooling_hours: 72,
      score_weight: 6,
      icon: 'sparkle',
      is_default: true
    }
  ];

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (dbInstance) {
        return resolve(dbInstance);
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function(e) {
        const db = e.target.result;

        if (!db.objectStoreNames.contains(STORE_USERS)) {
          const userStore = db.createObjectStore(STORE_USERS, { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains(STORE_PROFILE)) {
          db.createObjectStore(STORE_PROFILE, { keyPath: 'user_id' });
        }

        if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
          const catStore = db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
          catStore.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_GOALS)) {
          const goalStore = db.createObjectStore(STORE_GOALS, { keyPath: 'id', autoIncrement: true });
          goalStore.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_EVALUATIONS)) {
          const evalStore = db.createObjectStore(STORE_EVALUATIONS, { keyPath: 'id', autoIncrement: true });
          evalStore.createIndex('user_id', 'user_id', { unique: false });
          evalStore.createIndex('created_at', 'created_at', { unique: false });
          evalStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_SYNCED_CART)) {
          const cartStore = db.createObjectStore(STORE_SYNCED_CART, { keyPath: 'id' });
          cartStore.createIndex('user_id', 'user_id', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_CONFIG)) {
          db.createObjectStore(STORE_CONFIG, { keyPath: 'key' });
        }
      };

      request.onsuccess = function(e) {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };

      request.onerror = function(e) {
        reject(e.target.error);
      };
    });
  }

  // --- AUTENTIKASI MULTI-USER POINT.ZERO ---
  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  async function loginDemoUser() {
    const demoUser = {
      id: 'usr_demo_pointzero',
      email: 'demo@pointzero.id',
      username: 'DemoUser',
      full_name: 'Pengguna Point.Zero',
      is_demo: true,
      last_login: new Date().toISOString()
    };
    await saveUserRecord(demoUser);
    setCurrentUser(demoUser);
    await seedUserInitialData(demoUser.id);
    return demoUser;
  }

  async function registerUser(email, pinOrPass, fullName) {
    const db = await openDatabase();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (fullName || cleanEmail.split('@')[0] || 'User').trim();
    const userId = 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const userObj = {
      id: userId,
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      full_name: cleanName,
      pin_code: pinOrPass || '1234',
      is_demo: false,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_USERS], 'readwrite');
      const store = tx.objectStore(STORE_USERS);
      const req = store.add(userObj);
      req.onsuccess = async () => {
        setCurrentUser(userObj);
        await seedUserInitialData(userId);
        resolve(userObj);
      };
      req.onerror = () => {
        // Jika email sudah ada, coba login
        reject(new Error('Email atau akun ini sudah terdaftar. Silakan login.'));
      };
    });
  }

  async function loginUser(email, pinOrPass) {
    const db = await openDatabase();
    const cleanEmail = (email || '').trim().toLowerCase();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_USERS], 'readonly');
      const store = tx.objectStore(STORE_USERS);
      const index = store.index('email');
      const req = index.get(cleanEmail);

      req.onsuccess = async (e) => {
        const user = e.target.result;
        if (!user) {
          return reject(new Error('Akun tidak ditemukan. Silakan daftar akun baru.'));
        }
        if (user.pin_code && user.pin_code !== pinOrPass) {
          return reject(new Error('PIN atau kata sandi tidak cocok.'));
        }
        user.last_login = new Date().toISOString();
        await saveUserRecord(user);
        setCurrentUser(user);
        await seedUserInitialData(user.id);
        resolve(user);
      };

      req.onerror = () => reject(new Error('Gagal mengakses database pengguna.'));
    });
  }

  async function saveUserRecord(user) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_USERS], 'readwrite');
      const store = tx.objectStore(STORE_USERS);
      const req = store.put(user);
      req.onsuccess = () => resolve(user);
      req.onerror = () => reject(req.error);
    });
  }

  async function seedUserInitialData(userId) {
    const profile = await getUserProfile(userId);
    if (!profile) {
      await saveUserProfile({
        user_id: userId,
        income_frequency: 'monthly',
        income_amount: 8000000,
        work_hours_day: 8,
        work_days_week: 5,
        monthly_obligations: 3000000,
        hourly_rate: 28848,
        disposable_hourly_rate: 28848,
        onboarding_completed: false,
        theme: 'light',
        pin_code: '1234',
        updated_at: new Date().toISOString()
      });
    }

    const categories = await getCategories(userId);
    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await saveCategory({
          ...cat,
          id: `${userId}_${cat.id}`,
          user_id: userId
        });
      }
    }
  }

  // --- PROFIL PENGGUNA ---
  async function getUserProfile(userId) {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_PROFILE], 'readonly');
      const store = tx.objectStore(STORE_PROFILE);
      const req = store.get(userId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async function saveUserProfile(profile) {
    const db = await openDatabase();
    profile.updated_at = new Date().toISOString();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PROFILE], 'readwrite');
      const store = tx.objectStore(STORE_PROFILE);
      const req = store.put(profile);
      req.onsuccess = () => resolve(profile);
      req.onerror = () => reject(req.error);
    });
  }

  // --- KATEGORI KUSTOM ---
  async function getCategories(userId) {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_CATEGORIES], 'readonly');
      const store = tx.objectStore(STORE_CATEGORIES);
      const index = store.index('user_id');
      const req = index.getAll(userId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async function saveCategory(category) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_CATEGORIES], 'readwrite');
      const store = tx.objectStore(STORE_CATEGORIES);
      const req = store.put(category);
      req.onsuccess = () => resolve(category);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteCategory(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_CATEGORIES], 'readwrite');
      const store = tx.objectStore(STORE_CATEGORIES);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // --- TARGET FINANSIAL & DEBT ---
  async function getGoals(userId) {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_GOALS], 'readonly');
      const store = tx.objectStore(STORE_GOALS);
      const index = store.index('user_id');
      const req = index.getAll(userId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async function saveGoal(goal) {
    const db = await openDatabase();
    if (!goal.created_at) {
      goal.created_at = new Date().toISOString();
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_GOALS], 'readwrite');
      const store = tx.objectStore(STORE_GOALS);
      const req = store.put(goal);
      req.onsuccess = (e) => {
        goal.id = e.target.result;
        resolve(goal);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteGoal(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_GOALS], 'readwrite');
      const store = tx.objectStore(STORE_GOALS);
      const req = store.delete(Number(id));
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async function allocateSavedMoneyToGoal(goalId, amount) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_GOALS], 'readwrite');
      const store = tx.objectStore(STORE_GOALS);
      const getReq = store.get(Number(goalId));

      getReq.onsuccess = () => {
        const goal = getReq.result;
        if (!goal) return reject(new Error('Target finansial tidak ditemukan'));
        goal.current_amount = (goal.current_amount || 0) + Number(amount);
        const putReq = store.put(goal);
        putReq.onsuccess = () => resolve(goal);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  // --- EVALUASI KEPUTUSAN ---
  async function getEvaluations(userId) {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_EVALUATIONS], 'readonly');
      const store = tx.objectStore(STORE_EVALUATIONS);
      const index = store.index('user_id');
      const req = index.getAll(userId);
      req.onsuccess = () => {
        const results = req.result || [];
        // Urutkan dari yang terbaru
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        resolve(results);
      };
      req.onerror = () => resolve([]);
    });
  }

  async function saveEvaluation(evaluation) {
    const db = await openDatabase();
    if (!evaluation.created_at) {
      evaluation.created_at = new Date().toISOString();
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_EVALUATIONS], 'readwrite');
      const store = tx.objectStore(STORE_EVALUATIONS);
      const req = store.add(evaluation);
      req.onsuccess = (e) => {
        evaluation.id = e.target.result;
        resolve(evaluation);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function updateEvaluation(id, changes) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_EVALUATIONS], 'readwrite');
      const store = tx.objectStore(STORE_EVALUATIONS);
      const getReq = store.get(Number(id));

      getReq.onsuccess = () => {
        const record = getReq.result;
        if (!record) return reject(new Error('Data evaluasi tidak ditemukan'));
        Object.assign(record, changes);
        const putReq = store.put(record);
        putReq.onsuccess = () => resolve(record);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function deleteEvaluation(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_EVALUATIONS], 'readwrite');
      const store = tx.objectStore(STORE_EVALUATIONS);
      const req = store.delete(Number(id));
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // --- SINKRONISASI KERANJANG OLSHOP ACCESSIBILITY ---
  async function getSyncedCart(userId) {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_SYNCED_CART], 'readonly');
      const store = tx.objectStore(STORE_SYNCED_CART);
      const index = store.index('user_id');
      const req = index.getAll(userId);
      req.onsuccess = () => {
        const list = req.result || [];
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        resolve(list);
      };
      req.onerror = () => resolve([]);
    });
  }

  async function saveSyncedCartItem(item) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_SYNCED_CART], 'readwrite');
      const store = tx.objectStore(STORE_SYNCED_CART);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  }

  async function removeSyncedCartItem(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_SYNCED_CART], 'readwrite');
      const store = tx.objectStore(STORE_SYNCED_CART);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async function clearSyncedCart(userId) {
    const items = await getSyncedCart(userId);
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_SYNCED_CART], 'readwrite');
      const store = tx.objectStore(STORE_SYNCED_CART);
      items.forEach(it => store.delete(it.id));
      tx.oncomplete = () => resolve(true);
    });
  }

  // --- CADANGAN DATA JSON (OFFLINE ARCHIVE) ---
  async function exportBackupJson(userId) {
    const profile = await getUserProfile(userId);
    const categories = await getCategories(userId);
    const goals = await getGoals(userId);
    const evaluations = await getEvaluations(userId);

    const payload = {
      app: 'Zero Buy',
      platform: 'Point.Zero Commercial Edition',
      version: '4.0.0',
      exported_at: new Date().toISOString(),
      user_id: userId,
      profile,
      categories,
      financial_goals: goals,
      evaluations
    };
    return JSON.stringify(payload, null, 2);
  }

  async function importBackupJson(jsonString, userId) {
    const data = JSON.parse(jsonString);
    if (!data.profile && !data.evaluations) {
      throw new Error('Format berkas cadangan Point.Zero tidak valid.');
    }

    if (data.profile) {
      data.profile.user_id = userId;
      await saveUserProfile(data.profile);
    }
    if (Array.isArray(data.categories)) {
      for (const cat of data.categories) {
        cat.user_id = userId;
        await saveCategory(cat);
      }
    }
    if (Array.isArray(data.financial_goals)) {
      for (const g of data.financial_goals) {
        delete g.id;
        g.user_id = userId;
        await saveGoal(g);
      }
    }
    if (Array.isArray(data.evaluations)) {
      for (const ev of data.evaluations) {
        delete ev.id;
        ev.user_id = userId;
        await saveEvaluation(ev);
      }
    }
    return true;
  }

  // --- CLOUD CONFIG & SUPABASE REST MULTI-USER SYNC ---
  async function getCloudConfig() {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_CONFIG], 'readonly');
      const store = tx.objectStore(STORE_CONFIG);
      const req = store.get('supabase');
      req.onsuccess = () => resolve(req.result || {
        key: 'supabase',
        url: '',
        anon_key: '',
        enabled: false,
        last_synced: null
      });
      req.onerror = () => resolve({
        key: 'supabase',
        url: '',
        anon_key: '',
        enabled: false,
        last_synced: null
      });
    });
  }

  async function saveCloudConfig(config) {
    const db = await openDatabase();
    config.key = 'supabase';
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_CONFIG], 'readwrite');
      const store = tx.objectStore(STORE_CONFIG);
      const req = store.put(config);
      req.onsuccess = () => resolve(config);
      req.onerror = () => reject(req.error);
    });
  }

  async function syncWithSupabase(userId, customConfig) {
    const config = customConfig || await getCloudConfig();
    const url = (config.url || '').trim().replace(/\/+$/, '');
    const key = (config.anon_key || '').trim();

    if (!url || !key) {
      throw new Error('URL dan Anon Key Supabase harus diisi.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'x-user-id': userId,
      'Prefer': 'return=minimal'
    };

    // 1. Sync User Profile
    const profile = await getUserProfile(userId);
    if (profile) {
      const pRes = await fetch(`${url}/rest/v1/user_profile`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({
          user_id: userId,
          income_frequency: profile.income_frequency || 'monthly',
          income_amount: profile.income_amount || 0,
          monthly_obligations: profile.monthly_obligations || 0,
          work_hours_day: profile.work_hours_day || 8,
          work_days_week: profile.work_days_week || 5,
          hourly_rate: profile.hourly_rate || 0,
          disposable_hourly_rate: profile.disposable_hourly_rate || 0,
          onboarding_completed: Boolean(profile.onboarding_completed),
          theme: profile.theme || 'light',
          updated_at: new Date().toISOString()
        })
      });
      if (!pRes.ok) {
        const errText = await pRes.text();
        throw new Error(`Gagal sync profil ke Supabase: ${pRes.status} ${errText}`);
      }
    }

    // 2. Sync Evaluations
    const evals = await getEvaluations(userId);
    if (evals.length > 0) {
      const cleanEvals = evals.map(e => ({
        user_id: userId,
        item_name: e.item_name,
        item_price: e.item_price,
        category_id: String(e.category_id || ''),
        work_hours: e.work_hours || 0,
        score: e.score || 0,
        status: e.status || 'cooling',
        reason: e.reason || '',
        cooling_hours: e.cooling_hours || 48,
        cooling_until: e.cooling_until || null,
        is_saved: Boolean(e.is_saved),
        is_bought: Boolean(e.is_bought),
        saved_at: e.saved_at || null,
        bought_at: e.bought_at || null,
        created_at: e.created_at || new Date().toISOString()
      }));

      const eRes = await fetch(`${url}/rest/v1/evaluations`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(cleanEvals)
      });
      if (!eRes.ok) {
        const errText = await eRes.text();
        throw new Error(`Gagal sync evaluasi ke Supabase: ${eRes.status} ${errText}`);
      }
    }

    // 3. Sync Financial Goals
    const goals = await getGoals(userId);
    if (goals.length > 0) {
      const cleanGoals = goals.map(g => ({
        user_id: userId,
        name: g.name,
        target_amount: g.target_amount || 0,
        current_amount: g.current_amount || 0,
        category: g.category || 'savings',
        is_primary: Boolean(g.is_primary),
        created_at: g.created_at || new Date().toISOString()
      }));

      const gRes = await fetch(`${url}/rest/v1/financial_goals`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(cleanGoals)
      });
      if (!gRes.ok) {
        const errText = await gRes.text();
        throw new Error(`Gagal sync target finansial: ${gRes.status} ${errText}`);
      }
    }

    // Simpan status sukses
    config.enabled = true;
    config.last_synced = new Date().toISOString();
    await saveCloudConfig(config);

    return {
      success: true,
      profileSynced: Boolean(profile),
      evalCount: evals.length,
      goalCount: goals.length,
      timestamp: config.last_synced
    };
  }

  // Ekspor API Database Global
  window.ZeroBuyDB = {
    openDatabase,
    getCurrentUser,
    setCurrentUser,
    loginDemoUser,
    loginUser,
    registerUser,
    getUserProfile,
    saveUserProfile,
    getCategories,
    saveCategory,
    deleteCategory,
    getGoals,
    saveGoal,
    deleteGoal,
    allocateSavedMoneyToGoal,
    getEvaluations,
    saveEvaluation,
    updateEvaluation,
    deleteEvaluation,
    getSyncedCart,
    saveSyncedCartItem,
    removeSyncedCartItem,
    clearSyncedCart,
    exportBackupJson,
    importBackupJson,
    getCloudConfig,
    saveCloudConfig,
    syncWithSupabase
  };

})(window);
