/**
 * Zero Buy v4.0 — Point.Zero Commercial Edition
 * Module: engine.js (Anti-Impulsive Decision Engine & Smart Olshop Parser)
 * 100% Zero-Emoji Architecture
 */

(function(window) {
  'use strict';

  // 1. Konversi Multi-Frekuensi Pendapatan Menjadi Tarif Jam Bersih Bebas
  function convertIncomeToHourlyRate(frequency, amount, hoursPerDay = 8, daysPerWeek = 5, monthlyObligations = 0) {
    const rawAmount = Math.max(0, Number(amount) || 0);
    const hDay = Math.max(1, Math.min(24, Number(hoursPerDay) || 8));
    const dWeek = Math.max(1, Math.min(7, Number(daysPerWeek) || 5));
    const obligations = Math.max(0, Number(monthlyObligations) || 0);

    const hoursPerWeek = hDay * dWeek;
    const monthlyWorkHours = hoursPerWeek * 4.333;

    let monthlyGrossIncome = 0;
    let grossHourlyRate = 0;

    switch (frequency) {
      case 'hourly':
        grossHourlyRate = rawAmount;
        monthlyGrossIncome = rawAmount * monthlyWorkHours;
        break;
      case 'daily':
        grossHourlyRate = rawAmount / hDay;
        monthlyGrossIncome = rawAmount * (dWeek * 4.333);
        break;
      case 'weekly':
        grossHourlyRate = rawAmount / hoursPerWeek;
        monthlyGrossIncome = rawAmount * 4.333;
        break;
      case 'monthly':
      default:
        monthlyGrossIncome = rawAmount;
        grossHourlyRate = rawAmount / monthlyWorkHours;
        break;
    }

    const disposableMonthly = Math.max(10000, monthlyGrossIncome - obligations);
    const disposableHourly = Math.max(1000, Math.round(disposableMonthly / monthlyWorkHours));

    return {
      frequency,
      rawAmount,
      hoursPerDay: hDay,
      daysPerWeek: dWeek,
      hoursPerWeek,
      monthlyWorkHours: parseFloat(monthlyWorkHours.toFixed(1)),
      monthlyGrossIncome: Math.round(monthlyGrossIncome),
      monthlyObligations: obligations,
      disposableMonthly: Math.round(disposableMonthly),
      grossHourlyRate: Math.round(grossHourlyRate),
      disposableHourlyRate: disposableHourly
    };
  }

  // 2. Konversi Harga Barang ke Beban Jam Kerja
  function calculateWorkHours(price, hourlyRate) {
    const p = Math.max(0, Number(price) || 0);
    const rate = Math.max(1, Number(hourlyRate) || 1);
    const hoursDecimal = p / rate;

    const totalMinutes = Math.round(hoursDecimal * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const workDays8h = (hoursDecimal / 8).toFixed(1);

    let labelText = '';
    if (hoursDecimal < 1) {
      labelText = `${totalMinutes} Menit Kerja`;
    } else if (hoursDecimal < 24) {
      labelText = `${hours} Jam ${minutes > 0 ? minutes + ' Menit' : ''} Kerja`;
    } else {
      labelText = `${workDays8h} Hari Kerja (${hours} Jam)`;
    }

    return {
      hoursDecimal: parseFloat(hoursDecimal.toFixed(2)),
      totalMinutes,
      hours,
      minutes,
      workDays8h,
      labelText
    };
  }

  // 3. Bobot Rasio Jam Kerja (Maks 35 Poin)
  function getWorkHoursScore(hoursDecimal) {
    if (hoursDecimal < 4) {
      return 35;
    } else if (hoursDecimal >= 4 && hoursDecimal <= 10) {
      return 25;
    } else if (hoursDecimal > 10 && hoursDecimal <= 25) {
      return 15;
    } else {
      return 5;
    }
  }

  // 4. Evaluasi Psikologi & VETO Hard-Stop (Maks 40 Poin)
  function evaluateQuiz(quizAnswers) {
    let score = 0;
    const isVeto = Boolean(quizAnswers.q2_disruptive);

    if (quizAnswers.q1_desired_14d) {
      score += 10;
    }
    if (!quizAnswers.q2_disruptive) {
      score += 10;
    }
    if (quizAnswers.q3_essential) {
      score += 10;
    }
    if (quizAnswers.q4_emergency_ok) {
      score += 10;
    }

    return {
      quizScore: score,
      isVeto
    };
  }

  // 5. Kalkulator Skor Kelayakan Finansial Komprehensif (Skala 0 - 100)
  function calculateScore(itemPrice, category, quizAnswers, profile) {
    const hourlyRate = profile.disposable_hourly_rate || profile.hourly_rate || 25000;
    const workCalc = calculateWorkHours(itemPrice, hourlyRate);
    const workScore = getWorkHoursScore(workCalc.hoursDecimal);

    const catWeight = Number(category.score_weight) || 15;
    const quizResult = evaluateQuiz(quizAnswers);

    let totalScore = workScore + catWeight + quizResult.quizScore;

    // Aturan VETO Mutlak: Jika operasional/utang terganggu, skor dikunci maksimal 40
    let status = 'safe';
    let statusLabel = 'AMAN DIBELI';
    let advice = '';
    let coolingHours = category.cooling_hours || 48;

    if (quizResult.isVeto) {
      totalScore = Math.min(40, totalScore);
      status = 'danger';
      statusLabel = 'BAHAYA - VETO AKTIF';
      advice = 'Piko Menghentikanmu: Pembelian ini berisiko mengganggu cicilan utang atau operasional hidup pokokmu. Batalkan sekarang dan selamatkan uangmu.';
    } else if (totalScore < 50) {
      status = 'danger';
      statusLabel = 'TIDAK DIREKOMENDASIKAN';
      advice = 'Piko Menilai: Nilai barang ini terlalu menguras jam kerjamu dibanding manfaat nyatanya. Masukkan ke masa tunda pendinginan.';
    } else if (totalScore >= 50 && totalScore <= 74) {
      status = 'warning';
      statusLabel = 'PERTIMBANGKAN KEMBALI';
      advice = 'Piko Menyarankan: Masuk akal, tetapi jangan terburu-buru. Masukkan ke masa tunda selama ' + coolingHours + ' jam untuk memastikan bukan euforia sesaat.';
    } else {
      status = 'safe';
      statusLabel = 'LAYAK DIBELI';
      advice = 'Piko Menyetujui: Pembelian ini proporsional dengan kemampuan uang bebasmu dan kebutuhan nyata sudah teruji matang.';
    }

    return {
      totalScore,
      workScore,
      catWeight,
      quizScore: quizResult.quizScore,
      isVeto: quizResult.isVeto,
      workHours: workCalc,
      status,
      statusLabel,
      advice,
      coolingHours
    };
  }

  // 6. Simulasi Alternatif Investasi (Reksa Dana / Emas 6% p.a.)
  function simulateInvestment(nominal) {
    const p = Math.max(0, Number(nominal) || 0);
    const r = 0.06;

    const val1y = Math.round(p * (1 + r));
    const profit1y = val1y - p;

    const val3y = Math.round(p * Math.pow(1 + r, 3));
    const profit3y = val3y - p;

    return {
      principal: p,
      val1y,
      profit1y,
      val3y,
      profit3y
    };
  }

  // 7. Smart Online Shop Link & Clipboard Parser (Shopee, Tokped, TikTok, Lazada)
  function parseOnlineShopText(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return null;
    }
    const text = rawText.trim();
    if (!text) return null;

    let detectedPlatform = 'Online Shop';
    if (/shopee\.co\.id|shp\.ee/i.test(text)) {
      detectedPlatform = 'Shopee';
    } else if (/tokopedia\.com|tokopedia\.link/i.test(text)) {
      detectedPlatform = 'Tokopedia';
    } else if (/tiktok\.com|shop\.tiktok/i.test(text)) {
      detectedPlatform = 'TikTok Shop';
    } else if (/lazada\.co\.id|lazada/i.test(text)) {
      detectedPlatform = 'Lazada';
    } else if (/bukalapak\.com/i.test(text)) {
      detectedPlatform = 'Bukalapak';
    } else if (/blibli\.com/i.test(text)) {
      detectedPlatform = 'Blibli';
    }

    // Ekstraksi URL
    const urlMatch = text.match(/https?:\/\/[^\s\)]+/i);
    const url = urlMatch ? urlMatch[0] : '';

    // Ekstraksi Harga Rupiah
    let price = 0;
    const pricePatterns = [
      /(?:Rp|IDR)\.?\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)/i,
      /harga\s*:?\s*(?:Rp|IDR)?\.?\s*([0-9]{1,3}(?:[.,][0-9]{3})*)/i,
      /([0-9]{1,3}(?:\.[0-9]{3})+)/
    ];

    for (const pat of pricePatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        const cleanDigits = match[1].replace(/[.,]/g, '');
        const parsed = parseInt(cleanDigits, 10);
        if (parsed >= 1000 && parsed <= 500000000) {
          price = parsed;
          break;
        }
      }
    }

    // Ekstraksi Nama Barang
    let title = '';
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      if (line.startsWith('http://') || line.startsWith('https://')) continue;
      if (/^(nikmati|dapatkan|beli|checkout|promo|diskon|voucher|gratis ongkir|ayo|kunjungi)/i.test(line)) continue;
      if (line.length > 5 && line.length < 100) {
        title = line.replace(/https?:\/\/[^\s]+/g, '').replace(/[|•-]\s*(Shopee|Tokopedia|TikTok|Lazada).*/i, '').trim();
        if (title.length >= 4) break;
      }
    }

    if (!title && lines.length > 0) {
      title = lines[0].substring(0, 60);
    }
    if (!title) {
      title = 'Produk ' + detectedPlatform;
    }

    return {
      platform: detectedPlatform,
      url,
      title,
      price,
      rawText: text
    };
  }

  // 8. Fetch Metadata Online Shop (Microlink API Fallback)
  async function fetchOlshopMetadata(url) {
    if (!url || !url.startsWith('http')) return null;
    try {
      const apiEndpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}&palette=true`;
      const response = await fetch(apiEndpoint, { method: 'GET' });
      if (!response.ok) return null;
      const json = await response.json();
      if (json && json.status === 'success' && json.data) {
        return {
          title: json.data.title || '',
          description: json.data.description || '',
          image: (json.data.image && json.data.image.url) ? json.data.image.url : '',
          publisher: json.data.publisher || ''
        };
      }
    } catch (e) {
      // Offline fallback
    }
    return null;
  }

  window.ZeroBuyEngine = {
    convertIncomeToHourlyRate,
    calculateWorkHours,
    getWorkHoursScore,
    evaluateQuiz,
    calculateScore,
    simulateInvestment,
    parseOnlineShopText,
    fetchOlshopMetadata
  };

})(window);
