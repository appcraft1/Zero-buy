/**
 * Zero Buy v4.0 — Point.Zero Commercial Edition
 * Module: app.js (Application Controller, Piko Mascot, Full-Screen Quiz & Cart Sync)
 * 100% Pure Inline SVG Architecture — Absolutely Zero Emojis
 */

(function(window) {
  'use strict';

  // State Utama Aplikasi
  const state = {
    user: null,
    profile: null,
    categories: [],
    goals: [],
    evaluations: [],
    syncedCart: [],
    activeTab: 'viewDashboard',
    currentQuiz: {
      itemName: '',
      itemPrice: 0,
      category: null,
      currentStep: 1,
      answers: {
        q1_desired_14d: false,
        q2_disruptive: false,
        q3_essential: false,
        q4_emergency_ok: false
      }
    },
    latestVerdict: null,
    pendingAllocationAmount: 0
  };

  // Cache Elemen DOM
  const dom = {};

  function cacheDom() {
    dom.body = document.body;
    dom.html = document.documentElement;

    // Overlays & Screens
    dom.splashOverlay = document.getElementById('splashOverlay');
    dom.authScreen = document.getElementById('authScreen');
    dom.onboardingScreen = document.getElementById('onboardingScreen');
    dom.fullScreenQuiz = document.getElementById('fullScreenQuiz');
    dom.fullScreenVerdict = document.getElementById('fullScreenVerdict');

    // Modals
    dom.allocateModal = document.getElementById('allocateModal');
    dom.permissionModal = document.getElementById('permissionModal');
    dom.categoryModal = document.getElementById('categoryModal');
    dom.goalModal = document.getElementById('goalModal');
    dom.profileModal = document.getElementById('profileModal');
    dom.olshopModal = document.getElementById('olshopModal');

    // Form Inputs
    dom.itemName = document.getElementById('itemName');
    dom.itemPrice = document.getElementById('itemPrice');
    dom.itemCategory = document.getElementById('itemCategory');
    dom.workHoursPill = document.getElementById('workHoursPill');
    dom.workHoursText = document.getElementById('workHoursText');
    dom.workHoursIcon = document.getElementById('workHoursIcon');

    // Buttons
    dom.btnStartQuiz = document.getElementById('btnStartQuiz');
    dom.btnCancelQuiz = document.getElementById('btnCancelQuiz');
    dom.btnOpenOlshopModal = document.getElementById('btnOpenOlshopModal');
    dom.btnToggleTheme = document.getElementById('btnToggleTheme');
    dom.btnOpenPermissions = document.getElementById('btnOpenPermissions');
    dom.btnOpenProfile = document.getElementById('btnOpenProfile');
    dom.btnManageCategories = document.getElementById('btnManageCategories');
    dom.btnOpenAddGoal = document.getElementById('btnOpenAddGoal');
    dom.btnClearCart = document.getElementById('btnClearCart');
    dom.btnActivateCartReader = document.getElementById('btnActivateCartReader');

    // Containers
    dom.cartItemsContainer = document.getElementById('cartItemsContainer');
    dom.cartAccessibilityNotice = document.getElementById('cartAccessibilityNotice');
    dom.wishlistContainer = document.getElementById('wishlistContainer');
    dom.goalsContainer = document.getElementById('goalsContainer');
    dom.historyContainer = document.getElementById('historyContainer');
    dom.categoryListContainer = document.getElementById('categoryListContainer');

    // Hero & Metrics
    dom.heroSavedAmount = document.getElementById('heroSavedAmount');
    dom.heroSavedCount = document.getElementById('heroSavedCount');
    dom.heroGoalWrap = document.getElementById('heroGoalWrap');
    dom.heroGoalName = document.getElementById('heroGoalName');
    dom.heroGoalPct = document.getElementById('heroGoalPct');
    dom.heroGoalFill = document.getElementById('heroGoalFill');
    dom.metricHourlyRate = document.getElementById('metricHourlyRate');
    dom.metricActiveCooling = document.getElementById('metricActiveCooling');
    dom.wishlistDot = document.getElementById('wishlistDot');

    // Bottom Nav
    dom.navItems = document.querySelectorAll('.bottom-nav .nav-item');
    dom.viewSections = document.querySelectorAll('.view-section');
  }

  // --- RENDER IKON STATIC DUOTONE KE DOM ---
  function renderStaticIcons() {
    const iconMap = {
      brandIconBox: Piko.icon('shield'),
      iconThemeBox: Piko.icon('sun'),
      iconPermBox: Piko.icon('accessibility'),
      iconUserBox: Piko.icon('user'),
      heroShieldIcon: Piko.icon('shield'),
      iconMetricClock: Piko.icon('timer'),
      iconMetricCart: Piko.icon('cart'),
      iconZapBypass: Piko.icon('zap'),
      iconFormEval: Piko.icon('shield'),
      workHoursIcon: Piko.icon('timer'),
      navIconEval: Piko.icon('shield'),
      navIconCart: Piko.icon('cart'),
      navIconWait: Piko.icon('timer'),
      navIconGoal: Piko.icon('target'),
      navIconHistory: Piko.icon('history'),
      iconCloseQuiz: Piko.icon('close'),
      iconQ1A: Piko.icon('calendar'),
      iconQ1B: Piko.icon('zap'),
      iconQ2A: Piko.icon('alert'),
      iconQ2B: Piko.icon('vault'),
      iconQ3A: Piko.icon('tool'),
      iconQ3B: Piko.icon('heart'),
      iconQ4A: Piko.icon('vault'),
      iconQ4B: Piko.icon('shield'),
      iconInvestGrowth: Piko.icon('wallet'),
      iconClosePerm: Piko.icon('close'),
      iconCloseCat: Piko.icon('close'),
      iconCloseGoal: Piko.icon('close'),
      iconCloseProf: Piko.icon('close'),
      iconCloseOlshop: Piko.icon('close'),
      iconCartNotice: Piko.icon('accessibility'),
      iconFreqMonth: Piko.icon('calendar'),
      iconFreqWeek: Piko.icon('timer'),
      iconFreqDay: Piko.icon('wallet'),
      iconFreqHour: Piko.icon('zap'),
      iconEyeAuthPin: Piko.icon('eye'),
      iconCloudBox: Piko.icon('cloud'),
      iconSyncBtnBox: Piko.icon('sync')
    };

    for (const [id, svg] of Object.entries(iconMap)) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = svg;
    }
  }

  // --- FORMATTER MATA UANG RUPIAH DENGAN PEMISAH TITIK ---
  function parseRawNumber(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const clean = String(val || '').replace(/\D/g, '');
    return Number(clean) || 0;
  }

  function formatNumberWithDots(val) {
    const num = parseRawNumber(val);
    return num > 0 ? num.toLocaleString('id-ID') : '';
  }

  function attachCurrencyFormatter(inputEl, onChangeCallback) {
    if (!inputEl) return;
    inputEl.addEventListener('input', (e) => {
      const raw = parseRawNumber(e.target.value);
      e.target.value = raw > 0 ? raw.toLocaleString('id-ID') : '';
      if (typeof onChangeCallback === 'function') {
        onChangeCallback(raw);
      }
    });
  }

  function showToast(msg) {
    let toast = document.getElementById('pikoMiniToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pikoMiniToast';
      toast.style.cssText = 'position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:rgba(30,41,59,0.92); color:#FFF; padding:8px 18px; border-radius:20px; font-size:0.8rem; z-index:999999; font-family:var(--font-brand); transition:opacity 0.3s; box-shadow:0 4px 14px rgba(0,0,0,0.25); text-align:center; pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1';
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, 2500);
  }

  // --- TAMPILKAN POSE PIKO PADA ELEMEN TERTENTU ---
  function renderPikoTo(containerId, pose = 'happy', size = 80) {
    const el = document.getElementById(containerId);
    if (el) {
      el.innerHTML = Piko.render(pose, size);
    }
  }

  // --- TEMA CERAH (DEFAULT) & GELAP ---
  function applyTheme(theme) {
    const targetTheme = (theme === 'dark') ? 'dark' : 'light';
    dom.html.setAttribute('data-theme', targetTheme);
    const themeIconBox = document.getElementById('iconThemeBox');
    if (themeIconBox) {
      themeIconBox.innerHTML = (targetTheme === 'dark') ? Piko.icon('sun') : Piko.icon('moon');
    }
    if (state.profile) {
      state.profile.theme = targetTheme;
      ZeroBuyDB.saveUserProfile(state.profile);
    }
  }

  function toggleTheme() {
    const current = dom.html.getAttribute('data-theme') || 'light';
    const next = (current === 'dark') ? 'light' : 'dark';
    applyTheme(next);
  }

  // --- INISIALISASI UTAMA APLIKASI ---
  async function initApp() {
    cacheDom();
    renderStaticIcons();

    // Tampilkan Piko di Layar Pembuka
    renderPikoTo('splashPikoBox', 'happy', 110);
    renderPikoTo('authPikoBox', 'detective', 90);
    renderPikoTo('pikoGreetingBox', 'happy', 68);

    // Cek Pengguna Aktif
    state.user = ZeroBuyDB.getCurrentUser();

    setTimeout(async () => {
      if (dom.splashOverlay) {
        dom.splashOverlay.style.display = 'none';
      }

      if (!state.user) {
        // Tampilkan Layar Login Multi-User
        dom.authScreen.classList.add('active');
      } else {
        await loadUserData(state.user.id);
      }
    }, 900);

    bindEventListeners();
    initCurrencyInputs();
    startCountdownTicker();
  }

  function initCurrencyInputs() {
    attachCurrencyFormatter(dom.itemPrice, () => updateWorkHoursPill());
    attachCurrencyFormatter(document.getElementById('obIncomeAmount'), () => updateOnboardRatePreview());
    attachCurrencyFormatter(document.getElementById('obObligations'), () => updateOnboardDisposablePreview());
    attachCurrencyFormatter(document.getElementById('obGoalAmount'));
    attachCurrencyFormatter(document.getElementById('goalAmount'));
    attachCurrencyFormatter(document.getElementById('profAmount'));
    attachCurrencyFormatter(document.getElementById('profObligations'));
  }

  // --- LOAD DATA PENGGUNA TEROTENTIKASI ---
  async function loadUserData(userId) {
    state.profile = await ZeroBuyDB.getUserProfile(userId);
    applyTheme(state.profile ? state.profile.theme : 'light');

    // Cek apakah sudah menyelesaikan Onboarding Interview wajib
    if (!state.profile || !state.profile.onboarding_completed) {
      launchOnboardingWizard();
      return;
    }

    // Muat data dari IndexedDB
    state.categories = await ZeroBuyDB.getCategories(userId);
    state.goals = await ZeroBuyDB.getGoals(userId);
    state.evaluations = await ZeroBuyDB.getEvaluations(userId);

    // Sinkronkan keranjang dari native accessibility service
    await syncNativeCartItems();

    // Render Komponen
    populateCategorySelect();
    renderDashboardMetrics();
    renderWishlist();
    renderGoals();
    renderHistory();
    renderCart();

    // Cek pending intent olshop share dari Android
    if (window.__pendingSharedData) {
      handleSharedShopData(window.__pendingSharedData);
      window.__pendingSharedData = null;
    }
  }

  // --- ONBOARDING INTERVIEW WIZARD (MANDATORY) ---
  let onboardFreq = 'monthly';

  function launchOnboardingWizard() {
    dom.onboardingScreen.classList.add('active');
    renderPikoTo('onboardPikoBox', 'detective', 110);
    const obInc = document.getElementById('obIncomeAmount');
    if (obInc && !obInc.value) obInc.value = formatNumberWithDots(localStorage.getItem('ob_inc') || 8000000);
    const obObl = document.getElementById('obObligations');
    if (obObl && !obObl.value) obObl.value = formatNumberWithDots(localStorage.getItem('ob_obl') || 3000000);
    const obGoal = document.getElementById('obGoalAmount');
    if (obGoal && !obGoal.value) obGoal.value = formatNumberWithDots(localStorage.getItem('ob_goal') || 15000000);
    
    const savedStep = Number(localStorage.getItem('zero_buy_onboard_step')) || 1;
    setupOnboardStep(savedStep);
  }

  function setupOnboardStep(step) {
    try { localStorage.setItem('zero_buy_onboard_step', step); } catch (_) {}
    const speechEl = document.getElementById('onboardSpeech');
    const badgeEl = document.getElementById('onboardStepBadge');
    if (badgeEl) badgeEl.innerText = `Langkah ${step}/4`;

    for (let i = 1; i <= 4; i++) {
      const seg = document.getElementById(`onboardSeg${i}`);
      const stepDiv = document.getElementById(`onboardStep${i}`);
      if (seg) seg.classList.toggle('filled', i <= step);
      if (stepDiv) stepDiv.style.display = (i === step) ? 'flex' : 'none';
    }

    switch (step) {
      case 1:
        renderPikoTo('onboardPikoBox', 'detective', 110);
        speechEl.innerText = "Halo! Piko ingin tahu, bagaimana caramu menerima penghasilan?";
        break;
      case 2:
        renderPikoTo('onboardPikoBox', 'happy', 110);
        speechEl.innerText = "Bagus! Sekarang berapa nominal pendapatanmu dan jam kerjamu?";
        updateOnboardRatePreview();
        break;
      case 3:
        renderPikoTo('onboardPikoBox', 'shock', 110);
        speechEl.innerText = "Ada cicilan utang atau tagihan rutin bulanan? Piko akan menghitung upah bersih bebasmu.";
        updateOnboardDisposablePreview();
        break;
      case 4:
        renderPikoTo('onboardPikoBox', 'party', 110);
        speechEl.innerText = "Terakhir! Apa target finansial atau impian terbesar yang ingin kamu capai?";
        break;
    }
  }

  function updateOnboardRatePreview() {
    const amount = parseRawNumber(document.getElementById('obIncomeAmount').value) || 8000000;
    const hDay = Number(document.getElementById('obWorkHoursDay').value) || 8;
    const dWeek = Number(document.getElementById('obWorkDaysWeek').value) || 5;

    const conv = ZeroBuyEngine.convertIncomeToHourlyRate(onboardFreq, amount, hDay, dWeek, 0);
    const prev = document.getElementById('obCalcHourlyPreview');
    if (prev) {
      prev.innerText = `Estimasi Upah Kotor: Rp${conv.grossHourlyRate.toLocaleString('id-ID')} / jam kerja`;
    }
  }

  function updateOnboardDisposablePreview() {
    const amount = parseRawNumber(document.getElementById('obIncomeAmount').value) || 8000000;
    const hDay = Number(document.getElementById('obWorkHoursDay').value) || 8;
    const dWeek = Number(document.getElementById('obWorkDaysWeek').value) || 5;
    const obligations = parseRawNumber(document.getElementById('obObligations').value) || 0;

    const conv = ZeroBuyEngine.convertIncomeToHourlyRate(onboardFreq, amount, hDay, dWeek, obligations);
    const prev = document.getElementById('obCalcDisposablePreview');
    if (prev) {
      prev.innerText = `Upah Jam Bebas (Real Rate): Rp${conv.disposableHourlyRate.toLocaleString('id-ID')} / jam kerja`;
    }
  }

  async function finishOnboarding() {
    const amount = parseRawNumber(document.getElementById('obIncomeAmount').value) || 8000000;
    const hDay = Number(document.getElementById('obWorkHoursDay').value) || 8;
    const dWeek = Number(document.getElementById('obWorkDaysWeek').value) || 5;
    const obligations = parseRawNumber(document.getElementById('obObligations').value) || 0;

    const conv = ZeroBuyEngine.convertIncomeToHourlyRate(onboardFreq, amount, hDay, dWeek, obligations);

    const goalName = document.getElementById('obGoalName').value.trim() || 'Pelunasan Utang Prioritas';
    const goalAmount = parseRawNumber(document.getElementById('obGoalAmount').value) || 15000000;
    const goalCategory = document.getElementById('obGoalCategory').value || 'debt';

    // Simpan Target Finansial Pertama
    await ZeroBuyDB.saveGoal({
      user_id: state.user.id,
      name: goalName,
      target_amount: goalAmount,
      current_amount: 0,
      category: goalCategory,
      deadline: '2027-12-31',
      is_primary: true
    });

    // Simpan Profil Ter-update
    state.profile = {
      ...state.profile,
      user_id: state.user.id,
      income_frequency: onboardFreq,
      income_amount: amount,
      work_hours_day: hDay,
      work_days_week: dWeek,
      monthly_obligations: obligations,
      hourly_rate: conv.disposableHourlyRate,
      disposable_hourly_rate: conv.disposableHourlyRate,
      onboarding_completed: true
    };
    await ZeroBuyDB.saveUserProfile(state.profile);

    try {
      localStorage.removeItem('zero_buy_onboard_step');
      localStorage.removeItem('ob_inc');
      localStorage.removeItem('ob_obl');
      localStorage.removeItem('ob_goal');
    } catch (_) {}

    dom.onboardingScreen.classList.remove('active');
    await loadUserData(state.user.id);

    // Auto-sync ke Supabase Cloud
    try {
      await ZeroBuyDB.syncWithSupabase(state.user.id);
    } catch (_) {}

    // Tampilkan panduan izin jika belum aktif di HP
    checkAndPromptSystemPermissions();
  }

  // --- SINKRONISASI NATIVE CART ACCESSIBILITY SERVICE ---
  async function syncNativeCartItems() {
    if (window.PointZeroBridge && window.PointZeroBridge.getSyncedCartItems) {
      try {
        const raw = window.PointZeroBridge.getSyncedCartItems();
        const nativeItems = JSON.parse(raw);
        if (Array.isArray(nativeItems) && nativeItems.length > 0) {
          for (const item of nativeItems) {
            item.user_id = state.user.id;
            await ZeroBuyDB.saveSyncedCartItem(item);
          }
        }
      } catch (e) {
        console.warn('Gagal membaca sinkronisasi keranjang native:', e);
      }
    }
    state.syncedCart = await ZeroBuyDB.getSyncedCart(state.user.id);
  }

  // --- DETEKSI & TAMPILKAN APLIKASI OLSHOP TERPASANG ---
  function renderInstalledOlshops() {
    const container = document.getElementById('installedOlshopsBar');
    const chipsBox = document.getElementById('installedOlshopsChips');
    if (!container || !chipsBox) return;

    if (!window.PointZeroBridge || !window.PointZeroBridge.getInstalledOlshops) {
      container.style.display = 'none';
      return;
    }

    try {
      const raw = window.PointZeroBridge.getInstalledOlshops();
      const apps = JSON.parse(raw);
      if (Array.isArray(apps) && apps.length > 0) {
        container.style.display = 'block';
        chipsBox.innerHTML = apps.map(app => {
          let icon = Piko.icon('cart');
          const nameLower = (app.name || '').toLowerCase();
          if (nameLower.includes('tokopedia')) icon = Piko.icon('tokopedia');
          else if (nameLower.includes('shopee')) icon = Piko.icon('shopee');
          else if (nameLower.includes('tiktok')) icon = Piko.icon('tiktok');
          else if (nameLower.includes('lazada')) icon = Piko.icon('lazada');

          return `
            <button type="button" class="btn-3d subtle" style="width:auto; padding:6px 12px; font-size:0.78rem; display:inline-flex; align-items:center; gap:6px;" onclick="window.openInstalledOlshop('${app.pkg}')">
              ${icon}
              <span>Buka ${escapeHtml(app.name)}</span>
            </button>
          `;
        }).join('');
      } else {
        container.style.display = 'none';
      }
    } catch (e) {
      container.style.display = 'none';
    }
  }

  window.openInstalledOlshop = function(pkg) {
    if (window.PointZeroBridge && window.PointZeroBridge.openOlshop) {
      window.PointZeroBridge.openOlshop(pkg);
    }
  };

  // --- RENDER DAFTAR KERANJANG OLSHOP ---
  function renderCart() {
    if (!dom.cartItemsContainer) return;
    renderInstalledOlshops();

    // Periksa status izin aksesibilitas
    const hasBridge = Boolean(window.PointZeroBridge);
    const isAccessActive = hasBridge ? window.PointZeroBridge.isAccessibilityEnabled() : false;
    if (dom.cartAccessibilityNotice) {
      dom.cartAccessibilityNotice.style.display = (!hasBridge || isAccessActive) ? 'none' : 'block';
    }

    if (state.syncedCart.length === 0) {
      dom.cartItemsContainer.innerHTML = `
        <div class="card" style="text-align:center; padding:36px 20px;">
          <div id="cartEmptyPikoBox" style="margin:0 auto 12px;"></div>
          <div style="font-family:var(--font-brand); font-size:1.15rem; font-weight:700; color:var(--text-primary);">
            Keranjang Masih Bersih
          </div>
          <p style="font-size:0.82rem; color:var(--text-secondary); max-width:320px; margin:6px auto 0;">
            Saat kamu membuka aplikasi Shopee, Tokopedia, atau TikTok Shop dan melihat keranjang, barang akan otomatis terdeteksi di sini untuk kamu uji bersama Piko.
          </p>
        </div>
      `;
      renderPikoTo('cartEmptyPikoBox', 'detective', 85);
      return;
    }

    const rate = state.profile ? state.profile.disposable_hourly_rate : 28848;

    dom.cartItemsContainer.innerHTML = state.syncedCart.map(item => {
      const workCalc = ZeroBuyEngine.calculateWorkHours(item.price, rate);
      let storeIcon = Piko.icon('cart');
      const platLower = (item.platform || '').toLowerCase();
      if (platLower.includes('shopee')) storeIcon = Piko.icon('shopee');
      else if (platLower.includes('tokopedia')) storeIcon = Piko.icon('tokopedia');
      else if (platLower.includes('tiktok')) storeIcon = Piko.icon('tiktok');
      else if (platLower.includes('lazada')) storeIcon = Piko.icon('lazada');

      return `
        <div class="cart-item-card">
          <div class="cart-item-header">
            <span class="store-pill">
              ${storeIcon}
              <span>${item.platform || 'Online Shop'}</span>
            </span>
            <button type="button" class="icon-btn" style="width:30px; height:30px; border:none; box-shadow:none; color:var(--color-danger);" onclick="window.removeCartItem('${item.id}')">
              ${Piko.icon('trash')}
            </button>
          </div>

          <div class="cart-item-title">${escapeHtml(item.title)}</div>

          <div class="cart-item-price-row">
            <span class="cart-price-num">Rp${Number(item.price).toLocaleString('id-ID')}</span>
            <span class="cart-hours-sub">Setara ${workCalc.labelText}</span>
          </div>

          <button type="button" class="btn-3d" style="padding:10px; font-size:0.88rem;" onclick="window.testCartItem('${item.id}')">
            Uji Barang Ini bersama Piko
          </button>
        </div>
      `;
    }).join('');
  }

  window.removeCartItem = async function(id) {
    await ZeroBuyDB.removeSyncedCartItem(id);
    if (window.PointZeroBridge && window.PointZeroBridge.removeSyncedCartItem) {
      window.PointZeroBridge.removeSyncedCartItem(id);
    }
    await syncNativeCartItems();
    renderCart();
  };

  window.testCartItem = function(id) {
    const item = state.syncedCart.find(i => i.id === id);
    if (!item) return;

    dom.itemName.value = item.title;
    dom.itemPrice.value = formatNumberWithDots(item.price);
    updateWorkHoursPill();

    // Beralih ke Tab Evaluasi dan Langsung Buka Kuis Full-Screen
    switchTab('viewDashboard');
    startFullScreenQuiz();
  };

  // --- REAKTIF BEBAN JAM KERJA DI FORM EVALUASI ---
  function updateWorkHoursPill() {
    const price = parseRawNumber(dom.itemPrice.value) || 0;
    const rate = state.profile ? state.profile.disposable_hourly_rate : 28848;

    if (price >= 1000) {
      const calc = ZeroBuyEngine.calculateWorkHours(price, rate);
      dom.workHoursText.innerText = `Setara ${calc.labelText}`;
      dom.workHoursPill.classList.add('active');

      // Reaksi Pose Piko
      if (calc.hoursDecimal >= 8) {
        renderPikoTo('pikoGreetingBox', 'shock', 68);
        document.getElementById('pikoGreetingText').innerText =
          `Wah! ${dom.itemName.value ? dom.itemName.value : 'Barang ini'} seharga ${calc.labelText}! Yakin mau mengorbankan keringatmu?`;
      } else {
        renderPikoTo('pikoGreetingBox', 'happy', 68);
        document.getElementById('pikoGreetingText').innerText =
          `Harga ${calc.labelText} cukup proporsional. Tapi coba kita uji dulu bareng Piko!`;
      }
    } else {
      dom.workHoursPill.classList.remove('active');
      renderPikoTo('pikoGreetingBox', 'happy', 68);
    }
  }

  // --- FULL-SCREEN DEDICATED QUIZ SCREEN ---
  function startFullScreenQuiz() {
    const name = dom.itemName.value.trim();
    const price = parseRawNumber(dom.itemPrice.value) || 0;

    if (!name) {
      alert('Tuliskan nama barang yang ingin kamu beli terlebih dahulu.');
      dom.itemName.focus();
      return;
    }
    if (price < 1000) {
      alert('Masukkan nominal harga barang yang valid.');
      dom.itemPrice.focus();
      return;
    }

    const catId = dom.itemCategory.value;
    const cat = state.categories.find(c => c.id === catId) || state.categories[0];

    state.currentQuiz = {
      itemName: name,
      itemPrice: price,
      category: cat,
      currentStep: 1,
      answers: {
        q1_desired_14d: false,
        q2_disruptive: false,
        q3_essential: false,
        q4_emergency_ok: false
      }
    };

    const rate = state.profile ? state.profile.disposable_hourly_rate : 28848;
    const work = ZeroBuyEngine.calculateWorkHours(price, rate);

    document.getElementById('quizItemChip').innerText = `${name} • Rp${price.toLocaleString('id-ID')} • ${work.labelText}`;
    dom.fullScreenQuiz.classList.add('active');
    setupQuizStep(1);
  }

  function setupQuizStep(step) {
    state.currentQuiz.currentStep = step;
    document.getElementById('quizStepLabel').innerText = `${step} / 4`;

    for (let i = 1; i <= 4; i++) {
      const seg = document.getElementById(`quizSeg${i}`);
      const stepDiv = document.getElementById(`quizStep${i}`);
      if (seg) seg.classList.toggle('filled', i <= step);
      if (stepDiv) stepDiv.style.display = (i === step) ? 'flex' : 'none';
    }

    const speechEl = document.getElementById('quizSpeechText');

    switch (step) {
      case 1:
        renderPikoTo('quizPikoBox', 'detective', 110);
        speechEl.innerText = "Kapan kamu pertama kali menginginkan barang ini?";
        break;
      case 2:
        renderPikoTo('quizPikoBox', 'strict', 110);
        speechEl.innerText = "Awas! Apakah pembelian ini mengganggu cicilan utang atau operasional hidup pokokmu?";
        break;
      case 3:
        renderPikoTo('quizPikoBox', 'shock', 110);
        speechEl.innerText = "Jujur ya, barang ini murni kebutuhan produktif atau cuma sekadar gengsi/FOMO?";
        break;
      case 4:
        renderPikoTo('quizPikoBox', 'happy', 110);
        speechEl.innerText = "Terakhir! Apakah kamu sudah punya tabungan dana darurat minimal 3 bulan?";
        break;
    }
  }

  function handleQuizAnswer(questionIndex, value) {
    switch (questionIndex) {
      case 1:
        state.currentQuiz.answers.q1_desired_14d = (value === 'true');
        setupQuizStep(2);
        break;
      case 2:
        state.currentQuiz.answers.q2_disruptive = (value === 'true');
        setupQuizStep(3);
        break;
      case 3:
        state.currentQuiz.answers.q3_essential = (value === 'true');
        setupQuizStep(4);
        break;
      case 4:
        state.currentQuiz.answers.q4_emergency_ok = (value === 'true');
        dom.fullScreenQuiz.classList.remove('active');
        showVerdictScreen();
        break;
    }
  }

  // --- FULL-SCREEN VERDICT SCREEN ---
  function showVerdictScreen() {
    const q = state.currentQuiz;
    const scoreResult = ZeroBuyEngine.calculateScore(q.itemPrice, q.category, q.answers, state.profile);
    const invest = ZeroBuyEngine.simulateInvestment(q.itemPrice);

    state.latestVerdict = {
      item_name: q.itemName,
      item_price: q.itemPrice,
      category_id: q.category.id,
      category_name: q.category.name,
      work_hours: scoreResult.workHours.hoursDecimal,
      work_label: scoreResult.workHours.labelText,
      score: scoreResult.totalScore,
      status: scoreResult.status,
      status_label: scoreResult.statusLabel,
      advice: scoreResult.advice,
      cooling_hours: scoreResult.coolingHours,
      invest
    };

    // Render Verdict Elements
    const circle = document.getElementById('verdictScoreCircle');
    circle.innerText = scoreResult.totalScore;
    circle.className = `score-circle ${scoreResult.status}`;

    const pill = document.getElementById('verdictStatusPill');
    pill.innerText = scoreResult.statusLabel;

    document.getElementById('verdictItemTitle').innerText = q.itemName;
    document.getElementById('verdictAdvice').innerText = scoreResult.advice;
    document.getElementById('verdictPrice').innerText = `Rp${q.itemPrice.toLocaleString('id-ID')}`;
    document.getElementById('verdictHours').innerText = scoreResult.workHours.labelText;
    document.getElementById('verdictCooling').innerText = `${scoreResult.coolingHours} Jam Pendinginan`;

    document.getElementById('invest1y').innerText = `Rp${invest.val1y.toLocaleString('id-ID')} (+Rp${invest.profit1y.toLocaleString('id-ID')})`;
    document.getElementById('invest3y').innerText = `Rp${invest.val3y.toLocaleString('id-ID')} (+Rp${invest.profit3y.toLocaleString('id-ID')})`;

    if (scoreResult.status === 'danger') {
      renderPikoTo('verdictPikoBox', 'strict', 110);
    } else if (scoreResult.status === 'warning') {
      renderPikoTo('verdictPikoBox', 'detective', 110);
    } else {
      renderPikoTo('verdictPikoBox', 'happy', 110);
    }

    dom.fullScreenVerdict.classList.add('active');
  }

  // --- TINDAKAN VERDICT: BATAL BELI & SIMPAN UANG ---
  async function saveMoneyFromVerdict() {
    const v = state.latestVerdict;
    if (!v) return;

    await ZeroBuyDB.saveEvaluation({
      user_id: state.user.id,
      item_name: v.item_name,
      item_price: v.item_price,
      category_id: v.category_id,
      work_hours: v.work_hours,
      score: v.score,
      status: 'saved',
      reason: v.advice,
      cooling_hours: v.cooling_hours,
      is_saved: true,
      is_bought: false
    });

    state.evaluations = await ZeroBuyDB.getEvaluations(state.user.id);
    renderDashboardMetrics();
    renderHistory();

    dom.fullScreenVerdict.classList.remove('active');

    // Buka Modal Alokasi ke Target Finansial
    promptGoalAllocation(v.item_price);
  }

  function promptGoalAllocation(amount) {
    state.pendingAllocationAmount = amount;
    document.getElementById('allocateAmountText').innerText = `Rp${Number(amount).toLocaleString('id-ID')}`;
    renderPikoTo('allocatePikoBox', 'party', 90);

    const select = document.getElementById('allocateGoalSelect');
    if (state.goals.length === 0) {
      select.innerHTML = '<option value="">Belum ada target finansial</option>';
    } else {
      select.innerHTML = state.goals.map(g => `
        <option value="${g.id}">${escapeHtml(g.name)} (Terkumpul Rp${Number(g.current_amount || 0).toLocaleString('id-ID')})</option>
      `).join('');
    }

    dom.allocateModal.classList.add('active');
  }

  async function confirmGoalAllocation() {
    const goalId = document.getElementById('allocateGoalSelect').value;
    if (goalId && state.pendingAllocationAmount > 0) {
      await ZeroBuyDB.allocateSavedMoneyToGoal(goalId, state.pendingAllocationAmount);
      state.goals = await ZeroBuyDB.getGoals(state.user.id);
      renderGoals();
      renderDashboardMetrics();
    }
    dom.allocateModal.classList.remove('active');
    state.pendingAllocationAmount = 0;
  }

  // --- TINDAKAN VERDICT: MULAI MASA TUNDA (COOLING-OFF) ---
  async function startCoolingOff() {
    const v = state.latestVerdict;
    if (!v) return;

    const coolingMs = v.cooling_hours * 3600 * 1000;
    const until = new Date(Date.now() + coolingMs).toISOString();

    await ZeroBuyDB.saveEvaluation({
      user_id: state.user.id,
      item_name: v.item_name,
      item_price: v.item_price,
      category_id: v.category_id,
      work_hours: v.work_hours,
      score: v.score,
      status: 'cooling',
      reason: v.advice,
      cooling_hours: v.cooling_hours,
      cooling_until: until,
      is_saved: false,
      is_bought: false
    });

    state.evaluations = await ZeroBuyDB.getEvaluations(state.user.id);
    renderDashboardMetrics();
    renderWishlist();

    dom.fullScreenVerdict.classList.remove('active');
    switchTab('viewWishlist');
  }

  // --- RENDER DASHBOARD METRICS ---
  function renderDashboardMetrics() {
    let savedTotal = 0;
    let savedCount = 0;
    let coolingCount = 0;

    const now = Date.now();

    for (const ev of state.evaluations) {
      if (ev.is_saved || ev.status === 'saved') {
        savedTotal += Number(ev.item_price) || 0;
        savedCount++;
      } else if (ev.status === 'cooling') {
        if (ev.cooling_until && new Date(ev.cooling_until).getTime() > now) {
          coolingCount++;
        }
      }
    }

    dom.heroSavedAmount.innerText = `Rp${savedTotal.toLocaleString('id-ID')}`;
    dom.heroSavedCount.innerText = `${savedCount} barang berhasil batal dibeli berkat pertimbangan matang.`;
    dom.metricActiveCooling.innerText = `${coolingCount} Barang`;

    const rate = state.profile ? state.profile.disposable_hourly_rate : 28848;
    dom.metricHourlyRate.innerText = `Rp${rate.toLocaleString('id-ID')}`;

    if (dom.wishlistDot) {
      dom.wishlistDot.style.display = (coolingCount > 0) ? 'block' : 'none';
    }

    // Dynamic Primary Goal Progress
    const primaryGoal = state.goals.find(g => g.is_primary) || state.goals[0];
    if (primaryGoal && dom.heroGoalWrap) {
      dom.heroGoalWrap.style.display = 'block';
      const current = Number(primaryGoal.current_amount) || 0;
      const target = Number(primaryGoal.target_amount) || 1;
      const pct = Math.min(100, Math.round((current / target) * 1000) / 10);

      dom.heroGoalName.innerText = `${primaryGoal.name} (Rp${current.toLocaleString('id-ID')} / Rp${target.toLocaleString('id-ID')})`;
      dom.heroGoalPct.innerText = `${pct.toFixed(1)}%`;
      dom.heroGoalFill.style.width = `${pct}%`;
    } else if (dom.heroGoalWrap) {
      dom.heroGoalWrap.style.display = 'none';
    }
  }

  // --- RENDER WISHLIST (MASA TUNDA) ---
  function renderWishlist() {
    if (!dom.wishlistContainer) return;
    const now = Date.now();
    const activeList = state.evaluations.filter(e => e.status === 'cooling' && !e.is_bought && !e.is_saved);

    if (activeList.length === 0) {
      dom.wishlistContainer.innerHTML = `
        <div class="card" style="text-align:center; padding:32px 20px;">
          <div id="wishlistEmptyPikoBox" style="margin:0 auto 12px;"></div>
          <div style="font-family:var(--font-brand); font-size:1.15rem; font-weight:700;">Tidak Ada Masa Tunda</div>
          <p style="font-size:0.82rem; color:var(--text-secondary); margin-top:4px;">
            Setiap kamu menguji barang dan memilih masa tunda, timer pendinginan emosi akan berjalan di sini.
          </p>
        </div>
      `;
      renderPikoTo('wishlistEmptyPikoBox', 'happy', 80);
      return;
    }

    dom.wishlistContainer.innerHTML = activeList.map(item => {
      const until = item.cooling_until ? new Date(item.cooling_until).getTime() : 0;
      const remainingMs = Math.max(0, until - now);
      const hoursLeft = Math.floor(remainingMs / (3600 * 1000));
      const minsLeft = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
      const isExpired = remainingMs <= 0;

      return `
        <div class="card" style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div>
              <div style="font-family:var(--font-brand); font-size:1.05rem; font-weight:700;">${escapeHtml(item.item_name)}</div>
              <div style="font-family:var(--font-mono); font-size:0.85rem; color:var(--piko-dark-orange); font-weight:700;">
                Rp${Number(item.item_price).toLocaleString('id-ID')}
              </div>
            </div>
            <span class="brand-pill" style="background:${isExpired ? 'var(--color-safe-bg)' : 'var(--piko-cream)'}; color:${isExpired ? 'var(--color-safe-dark)' : 'var(--piko-shadow)'};">
              ${isExpired ? 'Masa Tunda Selesai' : `${hoursLeft}j ${minsLeft}m`}
            </span>
          </div>

          <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:12px;">
            ${escapeHtml(item.reason || '')}
          </div>

          <div style="display:flex; gap:8px;">
            <button type="button" class="btn-3d emerald" style="flex:1; padding:10px; font-size:0.85rem;" onclick="window.markWishlistSaved(${item.id})">
              Batal Beli (Selamat)
            </button>
            <button type="button" class="btn-3d subtle" style="flex:1; padding:10px; font-size:0.85rem;" onclick="window.markWishlistBought(${item.id})">
              Sudah Dibeli
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.markWishlistSaved = async function(id) {
    const item = state.evaluations.find(e => e.id === id);
    if (!item) return;

    await ZeroBuyDB.updateEvaluation(id, {
      status: 'saved',
      is_saved: true,
      saved_at: new Date().toISOString()
    });
    state.evaluations = await ZeroBuyDB.getEvaluations(state.user.id);
    renderDashboardMetrics();
    renderWishlist();
    promptGoalAllocation(item.item_price);
  };

  window.markWishlistBought = async function(id) {
    await ZeroBuyDB.updateEvaluation(id, {
      status: 'bought',
      is_bought: true,
      bought_at: new Date().toISOString()
    });
    state.evaluations = await ZeroBuyDB.getEvaluations(state.user.id);
    renderDashboardMetrics();
    renderWishlist();
  };

  // --- RENDER TARGET FINANSIAL (CRUD) ---
  function renderGoals() {
    if (!dom.goalsContainer) return;
    if (state.goals.length === 0) {
      dom.goalsContainer.innerHTML = `
        <div class="card" style="text-align:center; padding:32px 20px;">
          <div style="font-family:var(--font-brand); font-size:1.15rem; font-weight:700;">Belum Ada Target Finansial</div>
          <p style="font-size:0.82rem; color:var(--text-secondary); margin:4px 0 16px;">
            Buat target pelunasan utang atau tabungan impian agar uang yang kamu selamatkan bisa dialokasikan ke sini.
          </p>
          <button type="button" class="btn-3d" onclick="document.getElementById('btnOpenAddGoal').click()" style="width:auto; padding:8px 16px;">
            + Buat Target Sekarang
          </button>
        </div>
      `;
      return;
    }

    dom.goalsContainer.innerHTML = state.goals.map(g => {
      const cur = Number(g.current_amount) || 0;
      const tgt = Number(g.target_amount) || 1;
      const pct = Math.min(100, Math.round((cur / tgt) * 1000) / 10);

      return `
        <div class="card" style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-family:var(--font-brand); font-size:1.02rem; font-weight:700;">${escapeHtml(g.name)}</span>
            <button type="button" class="icon-btn" style="width:28px; height:28px; border:none; box-shadow:none; color:var(--color-danger);" onclick="window.deleteFinancialGoal(${g.id})">
              ${Piko.icon('trash')}
            </button>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:var(--text-secondary); margin-bottom:6px;">
            <span>Terkumpul: <strong>Rp${cur.toLocaleString('id-ID')}</strong></span>
            <span>Target: Rp${tgt.toLocaleString('id-ID')}</span>
          </div>

          <div class="progress-track" style="margin-bottom:6px;">
            <div class="progress-fill primary" style="width:${pct}%;"></div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted);">
            <span>Kategori: ${escapeHtml(g.category || 'Tabungan')}</span>
            <span style="font-weight:700; color:var(--color-safe);">${pct.toFixed(1)}%</span>
          </div>
        </div>
      `;
    }).join('');
  }

  window.deleteFinancialGoal = async function(id) {
    if (confirm('Hapus target finansial ini?')) {
      await ZeroBuyDB.deleteGoal(id);
      state.goals = await ZeroBuyDB.getGoals(state.user.id);
      renderGoals();
      renderDashboardMetrics();
    }
  };

  // --- RENDER RIWAYAT & FILTER ---
  let historyFilter = 'all';

  function renderHistory() {
    if (!dom.historyContainer) return;

    let list = state.evaluations;
    if (historyFilter === 'saved') list = list.filter(e => e.is_saved || e.status === 'saved');
    else if (historyFilter === 'cooling') list = list.filter(e => e.status === 'cooling' && !e.is_saved && !e.is_bought);
    else if (historyFilter === 'bought') list = list.filter(e => e.is_bought || e.status === 'bought');

    if (list.length === 0) {
      dom.historyContainer.innerHTML = `
        <div class="card" style="text-align:center; padding:32px 20px;">
          <div style="font-family:var(--font-brand); font-size:1.05rem; color:var(--text-muted);">
            Tidak ada riwayat pada kategori ini.
          </div>
        </div>
      `;
      return;
    }

    dom.historyContainer.innerHTML = list.map(ev => {
      let statusTag = 'Diselamatkan';
      let tagBg = 'var(--color-safe-bg)';
      let tagColor = 'var(--color-safe-dark)';

      if (ev.is_bought || ev.status === 'bought') {
        statusTag = 'Sudah Dibeli';
        tagBg = 'var(--bg-elevated)';
        tagColor = 'var(--text-secondary)';
      } else if (ev.status === 'cooling') {
        statusTag = 'Dalam Tunda';
        tagBg = 'var(--color-warn-bg)';
        tagColor = 'var(--color-warn-dark)';
      }

      return `
        <div class="card" style="margin-bottom:10px; padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
            <div style="font-family:var(--font-brand); font-weight:700; font-size:0.95rem;">${escapeHtml(ev.item_name)}</div>
            <span class="status-pill" style="background:${tagBg}; color:${tagColor};">
              ${statusTag}
            </span>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-secondary); margin-bottom:4px;">
            <span>Rp${Number(ev.item_price).toLocaleString('id-ID')}</span>
            <span>Skor: ${ev.score}/100</span>
          </div>

          <div style="font-size:0.75rem; color:var(--text-muted);">
            ${new Date(ev.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      `;
    }).join('');
  }

  // --- KATEGORI KUSTOM POPULATION ---
  function populateCategorySelect() {
    if (!dom.itemCategory) return;
    dom.itemCategory.innerHTML = state.categories.map(c => `
      <option value="${c.id}">${escapeHtml(c.name)} (${c.cooling_hours} Jam Tunda)</option>
    `).join('');
  }

  // --- NATIVE SHARE TARGET LISTENER (SHOPEE / TOKOPEDIA / TIKTOK) ---
  window.handleSharedShopData = function(sharedText) {
    if (!sharedText) return;
    const parsed = ZeroBuyEngine.parseOnlineShopText(sharedText);
    if (parsed) {
      if (parsed.title) dom.itemName.value = parsed.title;
      if (parsed.price) dom.itemPrice.value = parsed.price;
      updateWorkHoursPill();

      switchTab('viewDashboard');
      renderPikoTo('pikoGreetingBox', 'detective', 68);
      document.getElementById('pikoGreetingText').innerText =
        `Tautan dari ${parsed.platform} berhasil dibaca! Yuk kita uji kelayakannya bareng Piko.`;
    }
  };

  // --- PERMISSION CENTER REAL-TIME CHECK ---
  function checkAndPromptSystemPermissions() {
    if (!window.PointZeroBridge) return;
    try {
      const isNotif = window.PointZeroBridge.isNotificationPermissionGranted();
      const isBattery = window.PointZeroBridge.isBatteryOptimizationIgnored();
      const isAccess = window.PointZeroBridge.isAccessibilityEnabled();

      const btnNotif = document.getElementById('btnReqNotif');
      if (btnNotif) {
        btnNotif.innerText = isNotif ? 'Aktif' : 'Izinkan';
        btnNotif.className = isNotif ? 'btn-3d subtle' : 'btn-3d';
      }

      const btnBat = document.getElementById('btnReqBattery');
      if (btnBat) {
        btnBat.innerText = isBattery ? 'Aktif' : 'Bebaskan';
        btnBat.className = isBattery ? 'btn-3d subtle' : 'btn-3d';
      }

      const btnAcc = document.getElementById('btnReqAccess');
      if (btnAcc) {
        btnAcc.innerText = isAccess ? 'Aktif' : 'Buka Setelan';
        btnAcc.className = isAccess ? 'btn-3d subtle' : 'btn-3d';
      }
    } catch (e) {}
  }

  // --- BIND EVENT LISTENERS ---
  function bindEventListeners() {
    // Theme Switcher
    if (dom.btnToggleTheme) {
      dom.btnToggleTheme.addEventListener('click', toggleTheme);
    }

    // Permission Modal Open
    if (dom.btnOpenPermissions) {
      dom.btnOpenPermissions.addEventListener('click', () => {
        checkAndPromptSystemPermissions();
        dom.permissionModal.classList.add('active');
      });
    }
    const btnClosePermModal = document.getElementById('btnClosePermModal');
    const btnClosePermDone = document.getElementById('btnClosePermDone');
    if (btnClosePermModal) btnClosePermModal.addEventListener('click', () => dom.permissionModal.classList.remove('active'));
    if (btnClosePermDone) btnClosePermDone.addEventListener('click', () => dom.permissionModal.classList.remove('active'));

    // Native Permission Buttons with Direct Feedback
    const btnReqNotif = document.getElementById('btnReqNotif');
    if (btnReqNotif) {
      btnReqNotif.addEventListener('click', () => {
        if (window.PointZeroBridge && window.PointZeroBridge.requestNotificationPermission) {
          window.PointZeroBridge.requestNotificationPermission();
          showToast('Membuka setelan izin notifikasi...');
        } else {
          alert('Fitur Native: Buka Pengaturan HP > Aplikasi > Zero Buy > Izinkan Notifikasi.');
        }
        setTimeout(checkAndPromptSystemPermissions, 1000);
      });
    }
    const btnReqBattery = document.getElementById('btnReqBattery');
    if (btnReqBattery) {
      btnReqBattery.addEventListener('click', () => {
        if (window.PointZeroBridge && window.PointZeroBridge.openBatteryOptimizationSettings) {
          window.PointZeroBridge.openBatteryOptimizationSettings();
          showToast('Membuka optimasi baterai (Pilih Tidak Ada Batasan)...');
        } else {
          alert('Fitur Native: Buka Pengaturan HP > Baterai > Hemat Baterai Aplikasi > Zero Buy > Pilih Tidak Ada Batasan.');
        }
        setTimeout(checkAndPromptSystemPermissions, 1000);
      });
    }
    const btnReqAccess = document.getElementById('btnReqAccess');
    if (btnReqAccess) {
      btnReqAccess.addEventListener('click', () => {
        if (window.PointZeroBridge && window.PointZeroBridge.openAccessibilitySettings) {
          window.PointZeroBridge.openAccessibilitySettings();
          showToast('Membuka setelan Aksesibilitas Android...');
        } else {
          alert('Fitur Native: Buka Pengaturan HP > Aksesibilitas > Layanan Terunduh > Aktifkan Zero Buy.');
        }
        setTimeout(checkAndPromptSystemPermissions, 1000);
      });
    }
    if (dom.btnActivateCartReader) {
      dom.btnActivateCartReader.addEventListener('click', () => {
        if (window.PointZeroBridge && window.PointZeroBridge.openAccessibilitySettings) {
          window.PointZeroBridge.openAccessibilitySettings();
          showToast('Membuka setelan Aksesibilitas Android...');
        } else {
          alert('Fitur Native: Buka Pengaturan HP > Aksesibilitas > Layanan Terunduh > Aktifkan Zero Buy.');
        }
        setTimeout(checkAndPromptSystemPermissions, 1000);
      });
    }

    // Toggle Password Visibility Eye Icon
    const btnToggleAuthPin = document.getElementById('btnToggleAuthPin');
    const authPin = document.getElementById('authPin');
    const iconEyeAuthPin = document.getElementById('iconEyeAuthPin');
    if (btnToggleAuthPin && authPin) {
      btnToggleAuthPin.addEventListener('click', () => {
        const isPass = (authPin.type === 'password');
        authPin.type = isPass ? 'text' : 'password';
        if (iconEyeAuthPin) {
          iconEyeAuthPin.innerHTML = isPass ? Piko.icon('eyeOff') : Piko.icon('eye');
        }
      });
    }

    // Re-check permissions and sync native cart when user resumes application
    const onAppForegroundResume = async () => {
      checkAndPromptSystemPermissions();
      if (state.user && state.user.id) {
        await syncNativeCartItems();
        if (state.activeTab === 'viewCart') {
          renderCart();
        }
      }
    };
    window.addEventListener('focus', onAppForegroundResume);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) onAppForegroundResume();
    });

    // Auth Screen Handlers
    document.getElementById('btnAuthLogin').addEventListener('click', async () => {
      const email = document.getElementById('authEmail').value.trim();
      const pin = document.getElementById('authPin').value.trim();
      if (!email) return alert('Masukkan email atau ID lisensi Anda.');
      try {
        const user = await ZeroBuyDB.loginUser(email, pin);
        state.user = user;
        dom.authScreen.classList.remove('active');
        await loadUserData(user.id);
      } catch (err) {
        alert(err.message);
      }
    });

    document.getElementById('btnAuthRegister').addEventListener('click', async () => {
      const email = document.getElementById('authEmail').value.trim();
      const pin = document.getElementById('authPin').value.trim();
      if (!email) return alert('Masukkan email Anda.');
      try {
        const user = await ZeroBuyDB.registerUser(email, pin);
        state.user = user;
        dom.authScreen.classList.remove('active');
        await loadUserData(user.id);
      } catch (err) {
        alert(err.message);
      }
    });

    document.getElementById('btnAuthDemo').addEventListener('click', async () => {
      const user = await ZeroBuyDB.loginDemoUser();
      state.user = user;
      dom.authScreen.classList.remove('active');
      await loadUserData(user.id);
    });

    // Onboarding Wizard Navigation
    document.querySelectorAll('#onboardStep1 .quiz-choice-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('#onboardStep1 .quiz-choice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        onboardFreq = card.getAttribute('data-freq') || 'monthly';
      });
    });

    document.getElementById('btnOnboardNext1').addEventListener('click', () => setupOnboardStep(2));
    document.getElementById('btnOnboardBack2').addEventListener('click', () => setupOnboardStep(1));
    document.getElementById('btnOnboardNext2').addEventListener('click', () => setupOnboardStep(3));
    document.getElementById('btnOnboardBack3').addEventListener('click', () => setupOnboardStep(2));
    document.getElementById('btnOnboardNext3').addEventListener('click', () => setupOnboardStep(4));
    document.getElementById('btnOnboardBack4').addEventListener('click', () => setupOnboardStep(3));
    document.getElementById('btnOnboardFinish').addEventListener('click', finishOnboarding);

    document.getElementById('obIncomeAmount').addEventListener('input', updateOnboardRatePreview);
    document.getElementById('obWorkHoursDay').addEventListener('input', updateOnboardRatePreview);
    document.getElementById('obWorkDaysWeek').addEventListener('input', updateOnboardRatePreview);
    document.getElementById('obObligations').addEventListener('input', updateOnboardDisposablePreview);

    // Form Reactive Work Hours
    dom.itemPrice.addEventListener('input', updateWorkHoursPill);
    dom.itemName.addEventListener('input', updateWorkHoursPill);

    // Start Quiz
    dom.btnStartQuiz.addEventListener('click', startFullScreenQuiz);
    dom.btnCancelQuiz.addEventListener('click', () => dom.fullScreenQuiz.classList.remove('active'));

    // Quiz Options Click Handlers
    document.querySelectorAll('.quiz-choice-card[data-q]').forEach(card => {
      card.addEventListener('click', () => {
        const qIndex = Number(card.getAttribute('data-q'));
        const val = card.getAttribute('data-val');
        handleQuizAnswer(qIndex, val);
      });
    });

    // Verdict Action Handlers
    document.getElementById('btnVerdictSaveMoney').addEventListener('click', saveMoneyFromVerdict);
    document.getElementById('btnVerdictStartCooling').addEventListener('click', startCoolingOff);
    document.getElementById('btnVerdictClose').addEventListener('click', () => dom.fullScreenVerdict.classList.remove('active'));

    // Goal Allocation Handlers
    document.getElementById('btnConfirmAllocate').addEventListener('click', confirmGoalAllocation);
    document.getElementById('btnSkipAllocate').addEventListener('click', () => dom.allocateModal.classList.remove('active'));

    // Tab Navigation
    dom.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        switchTab(target);
      });
    });

    // History Filter Buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        historyFilter = btn.getAttribute('data-filter');
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.add('subtle'));
        btn.classList.remove('subtle');
        renderHistory();
      });
    });

    // Refresh Cart
    const btnRefreshCart = document.getElementById('btnRefreshCart');
    if (btnRefreshCart) {
      btnRefreshCart.addEventListener('click', async () => {
        await syncNativeCartItems();
        renderCart();
      });
    }

    // Clear Cart
    if (dom.btnClearCart) {
      dom.btnClearCart.addEventListener('click', async () => {
        if (confirm('Bersihkan seluruh daftar keranjang tersinkron?')) {
          await ZeroBuyDB.clearSyncedCart(state.user.id);
          if (window.PointZeroBridge && window.PointZeroBridge.clearSyncedCartItems) {
            window.PointZeroBridge.clearSyncedCartItems();
          }
          await syncNativeCartItems();
          renderCart();
        }
      });
    }

    // Modal Olshop Bypass
    dom.btnOpenOlshopModal.addEventListener('click', () => {
      dom.olshopModal.classList.add('active');
    });
    document.getElementById('btnCloseOlshopModal').addEventListener('click', () => {
      dom.olshopModal.classList.remove('active');
    });
    document.getElementById('btnProcessOlshopText').addEventListener('click', () => {
      const text = document.getElementById('olshopRawInput').value;
      if (!text.trim()) return;
      handleSharedShopData(text);
      dom.olshopModal.classList.remove('active');
      document.getElementById('olshopRawInput').value = '';
    });

    // Modal Target Finansial
    dom.btnOpenAddGoal.addEventListener('click', () => dom.goalModal.classList.add('active'));
    document.getElementById('btnCloseGoalModal').addEventListener('click', () => dom.goalModal.classList.remove('active'));
    document.getElementById('btnSaveGoal').addEventListener('click', async () => {
      const name = document.getElementById('goalName').value.trim();
      const amount = parseRawNumber(document.getElementById('goalAmount').value) || 0;
      const category = document.getElementById('goalCategory').value;

      if (!name || amount < 10000) {
        return alert('Isi nama dan nominal target yang valid.');
      }
      await ZeroBuyDB.saveGoal({
        user_id: state.user.id,
        name,
        target_amount: amount,
        current_amount: 0,
        category,
        is_primary: state.goals.length === 0
      });
      state.goals = await ZeroBuyDB.getGoals(state.user.id);
      renderGoals();
      renderDashboardMetrics();
      dom.goalModal.classList.remove('active');
      document.getElementById('goalName').value = '';
      document.getElementById('goalAmount').value = '';
    });

    // Modal Kategori Kustom
    dom.btnManageCategories.addEventListener('click', () => {
      renderCategoryList();
      dom.categoryModal.classList.add('active');
    });
    document.getElementById('btnCloseCategoryModal').addEventListener('click', () => dom.categoryModal.classList.remove('active'));
    document.getElementById('btnAddCategory').addEventListener('click', async () => {
      const name = document.getElementById('newCatName').value.trim();
      const hours = Number(document.getElementById('newCatHours').value) || 48;
      const weight = Number(document.getElementById('newCatWeight').value) || 15;

      if (!name) return alert('Tuliskan nama kategori.');
      const id = `${state.user.id}_cat_${Date.now()}`;
      await ZeroBuyDB.saveCategory({
        id,
        user_id: state.user.id,
        name,
        description: 'Kategori kustom buatan pengguna',
        cooling_hours: hours,
        score_weight: weight,
        icon: 'tool',
        is_default: false
      });
      state.categories = await ZeroBuyDB.getCategories(state.user.id);
      populateCategorySelect();
      renderCategoryList();
      document.getElementById('newCatName').value = '';
    });

    // Modal Profil & Setelan
    dom.btnOpenProfile.addEventListener('click', async () => {
      if (state.profile) {
        document.getElementById('profEmail').value = state.user.email || 'Mode Demo';
        document.getElementById('profFreq').value = state.profile.income_frequency || 'monthly';
        document.getElementById('profAmount').value = formatNumberWithDots(state.profile.income_amount || 8000000);
        document.getElementById('profObligations').value = formatNumberWithDots(state.profile.monthly_obligations || 0);
        document.getElementById('profWorkHours').value = state.profile.work_hours_day || 8;
        document.getElementById('profWorkDays').value = state.profile.work_days_week || 5;
      }
      // Muat Konfigurasi Supabase Cloud
      const cloudCfg = await ZeroBuyDB.getCloudConfig();
      document.getElementById('profCloudUrl').value = cloudCfg.url || '';
      document.getElementById('profCloudKey').value = cloudCfg.anon_key || '';
      const badge = document.getElementById('cloudStatusBadge');
      if (badge) {
        if (cloudCfg.enabled && cloudCfg.last_synced) {
          badge.innerText = 'Tersambung';
          badge.style.background = 'var(--color-safe-bg)';
          badge.style.color = 'var(--color-safe-dark)';
        } else {
          badge.innerText = 'Offline';
          badge.style.background = 'var(--bg-elevated)';
          badge.style.color = 'var(--text-muted)';
        }
      }
      dom.profileModal.classList.add('active');
    });
    document.getElementById('btnCloseProfileModal').addEventListener('click', () => dom.profileModal.classList.remove('active'));
    document.getElementById('btnSaveProfileSettings').addEventListener('click', async () => {
      const freq = document.getElementById('profFreq').value;
      const amount = parseRawNumber(document.getElementById('profAmount').value) || 0;
      const obligations = parseRawNumber(document.getElementById('profObligations').value) || 0;
      const hDay = Number(document.getElementById('profWorkHours').value) || 8;
      const dWeek = Number(document.getElementById('profWorkDays').value) || 5;

      const conv = ZeroBuyEngine.convertIncomeToHourlyRate(freq, amount, hDay, dWeek, obligations);

      state.profile = {
        ...state.profile,
        income_frequency: freq,
        income_amount: amount,
        monthly_obligations: obligations,
        work_hours_day: hDay,
        work_days_week: dWeek,
        hourly_rate: conv.disposableHourlyRate,
        disposable_hourly_rate: conv.disposableHourlyRate
      };
      await ZeroBuyDB.saveUserProfile(state.profile);
      renderDashboardMetrics();
      dom.profileModal.classList.remove('active');
      alert('Perubahan profil dan tarif jam kerja berhasil disimpan.');
    });

    // Supabase Cloud Sync Button
    const btnSyncCloudNow = document.getElementById('btnSyncCloudNow');
    if (btnSyncCloudNow) {
      btnSyncCloudNow.addEventListener('click', async () => {
        const url = document.getElementById('profCloudUrl').value.trim();
        const key = document.getElementById('profCloudKey').value.trim();
        const badge = document.getElementById('cloudStatusBadge');

        if (!url || !key) {
          return alert('Harap isi URL Project dan Anon Key Supabase terlebih dahulu.');
        }

        btnSyncCloudNow.disabled = true;
        btnSyncCloudNow.innerText = 'Menyinkronkan ke Cloud...';

        try {
          const res = await ZeroBuyDB.syncWithSupabase(state.user.id, { url, anon_key: key });
          alert(`Sinkronisasi Supabase Sukses!\n• Profil: Terhubung\n• Evaluasi: ${res.evalCount} barang\n• Target: ${res.goalCount} target`);
          if (badge) {
            badge.innerText = 'Tersambung';
            badge.style.background = 'var(--color-safe-bg)';
            badge.style.color = 'var(--color-safe-dark)';
          }
        } catch (err) {
          alert('Gagal menyinkronkan ke Supabase: ' + err.message);
          if (badge) {
            badge.innerText = 'Gagal';
            badge.style.background = 'var(--color-danger-bg)';
            badge.style.color = 'var(--color-danger-dark)';
          }
        } finally {
          btnSyncCloudNow.disabled = false;
          btnSyncCloudNow.innerHTML = `${Piko.icon('sync')} <span>Tes & Sinkronkan Cloud Sekarang</span>`;
        }
      });
    }

    document.getElementById('btnLogoutUser').addEventListener('click', () => {
      if (confirm('Keluar dari sesi akun ini?')) {
        ZeroBuyDB.setCurrentUser(null);
        window.location.reload();
      }
    });

    // Cadangan JSON
    document.getElementById('btnExportBackup').addEventListener('click', async () => {
      const json = await ZeroBuyDB.exportBackupJson(state.user.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PointZero_ZeroBuy_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    });

    const fileInput = document.getElementById('backupFileInput');
    document.getElementById('btnImportBackup').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          await ZeroBuyDB.importBackupJson(evt.target.result, state.user.id);
          alert('Data cadangan berhasil dipulihkan.');
          window.location.reload();
        } catch (err) {
          alert('Gagal memulihkan cadangan: ' + err.message);
        }
      };
      reader.readAsText(file);
    });

    // Auto-refresh sinkronisasi keranjang & izin saat aplikasi kembali aktif (misal dari Tokopedia/Shopee)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkAndPromptSystemPermissions();
        syncNativeCartItems().then(() => {
          if (state.activeTab === 'viewCart') renderCart();
        });
      }
    });

    window.addEventListener('focus', () => {
      syncNativeCartItems().then(() => {
        if (state.activeTab === 'viewCart') renderCart();
      });
    });
  }

  function renderCategoryList() {
    dom.categoryListContainer.innerHTML = state.categories.map(c => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-elevated); padding:10px 12px; border-radius:12px; margin-bottom:8px;">
        <div>
          <div style="font-family:var(--font-brand); font-weight:700; font-size:0.9rem;">${escapeHtml(c.name)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${c.cooling_hours} Jam Tunda • Bobot ${c.score_weight}</div>
        </div>
        ${!c.is_default ? `
          <button type="button" class="icon-btn" style="width:28px; height:28px; border:none; box-shadow:none; color:var(--color-danger);" onclick="window.removeCategory('${c.id}')">
            ${Piko.icon('trash')}
          </button>
        ` : '<span style="font-size:0.7rem; color:var(--text-muted); font-family:var(--font-brand);">Bawaan</span>'}
      </div>
    `).join('');
  }

  window.removeCategory = async function(id) {
    if (confirm('Hapus kategori kustom ini?')) {
      await ZeroBuyDB.deleteCategory(id);
      state.categories = await ZeroBuyDB.getCategories(state.user.id);
      populateCategorySelect();
      renderCategoryList();
    }
  };

  // --- TAB NAVIGATION SWITCHER ---
  function switchTab(targetId) {
    state.activeTab = targetId;
    dom.viewSections.forEach(sec => {
      sec.classList.toggle('active', sec.id === targetId);
    });
    dom.navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-target') === targetId);
    });

    if (targetId === 'viewCart') syncNativeCartItems().then(renderCart);
    else if (targetId === 'viewWishlist') renderWishlist();
    else if (targetId === 'viewGoals') renderGoals();
    else if (targetId === 'viewHistory') renderHistory();
  }

  // --- COUNTDOWN TIMER TICKER ---
  function startCountdownTicker() {
    setInterval(() => {
      if (state.activeTab === 'viewWishlist') {
        renderWishlist();
      }
    }, 30000); // Perbarui setiap 30 detik
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // Jalankan saat dokumen siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})(window);
