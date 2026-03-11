/* ============================================================
   JAPANESE GC CLEANING — Main Script
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Current Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2. Navbar Styling & Scroll Reveal
  const navbar = document.getElementById('navbar');
  const reveals = document.querySelectorAll('.reveal');

  const checkScroll = () => {
    // Navbar
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Reveals
    const viewBottom = window.scrollY + window.innerHeight;
    reveals.forEach(el => {
      const elTop = el.offsetTop;
      if (elTop < viewBottom - 100) {
        el.classList.add('visible');
      }
    });
  };

  window.addEventListener('scroll', checkScroll);
  // Optional: Trigger once on load
  setTimeout(checkScroll, 100);

  // 3. Mobile Navigation
  const btnHam = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const btnClose = document.getElementById('mobile-nav-close');
  const navLinks = mobileNav.querySelectorAll('a');

  const toggleNav = () => {
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  };

  if (btnHam) btnHam.addEventListener('click', toggleNav);
  if (btnClose) btnClose.addEventListener('click', toggleNav);
  navLinks.forEach(link => link.addEventListener('click', toggleNav));


  // ==========================================================
  // 4. BEFORE / AFTER SLIDER
  // ==========================================================
  const slider = document.getElementById('comparison-slider');
  if (slider) {
    const handle = document.getElementById('slider-handle');
    const beforeWrap = document.getElementById('before-wrap');
    const beforeImg = document.getElementById('before-img');

    // Maintain inner image size
    const updateSize = () => {
      beforeImg.style.width = `${slider.offsetWidth}px`;
    };
    window.addEventListener('resize', updateSize);
    updateSize();

    let isSliding = false;
    const startSlide = (e) => { isSliding = true; e.preventDefault(); };
    const stopSlide = () => { isSliding = false; };

    const moveSlide = (e) => {
      if (!isSliding) return;
      const rect = slider.getBoundingClientRect();
      const x = (e.type.includes('mouse') ? e.pageX : e.touches[0].pageX) - rect.left - window.scrollX;
      let pos = (x / rect.width) * 100;
      if (pos < 0) pos = 0;
      if (pos > 100) pos = 100;

      handle.style.left = `${pos}%`;
      beforeWrap.style.width = `${pos}%`;
    };

    handle.addEventListener('mousedown', startSlide);
    window.addEventListener('mouseup', stopSlide);
    window.addEventListener('mousemove', moveSlide);

    handle.addEventListener('touchstart', startSlide, { passive: false });
    window.addEventListener('touchend', stopSlide);
    window.addEventListener('touchmove', moveSlide, { passive: false });
  }


  // ==========================================================
  // 4b. DEEP CLEANING CHECKLIST TABS
  // ==========================================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });


  // ==========================================================
  // 5. PRICING CALCULATOR
  // ==========================================================
  const radioInputs = document.querySelectorAll('input[name="service-type"]');
  const checkboxInputs = document.querySelectorAll('.extra-item input[type="checkbox"]');

  // Elements
  const elBedCount = document.getElementById('bed-count');
  const elBathCount = document.getElementById('bath-count');
  const elBedRate = document.getElementById('bed-rate-label');
  const elBathRate = document.getElementById('bath-rate-label');

  const bdBase = document.getElementById('bd-base');
  const bdBeds = document.getElementById('bd-beds');
  const bdBaths = document.getElementById('bd-baths');
  const bdExtras = document.getElementById('bd-extras');
  const bdTotal = document.getElementById('bd-total');
  const resPrice = document.getElementById('result-price');
  const bdExtrasRow = document.getElementById('bd-extras-row');

  // Multipliers
  let rateBed = 40;
  let rateBath = 30;
  let basePrice = 150;

  // Counts
  let countBeds = 1;
  let countBaths = 1;

  // Render Prices
  const calculateTotal = () => {
    // Get Service Values
    const checkedService = document.querySelector('input[name="service-type"]:checked');
    if (checkedService) {
      basePrice = parseInt(checkedService.dataset.base);
      rateBed = parseInt(checkedService.dataset.bed);
      rateBath = parseInt(checkedService.dataset.bath);
    }

    elBedRate.textContent = `+$${rateBed} each`;
    elBathRate.textContent = `+$${rateBath} each`;

    // Rooms logic
    // Usually a 1B/1B is covered in base, so extra beds are (count - 1)*rate?
    // Based on the docs provided: 
    // "1 Bed / 1 Bath: $150. Extra bed: +$40. Extra bath: +$30"
    // So if 2Bed/2Bath: $150 + 40 + 30 = $220. 
    // Which means multiplier is applied strictly on extra rooms beyond the first.

    let extraBeds = Math.max(0, countBeds - 1);
    let extraBaths = Math.max(0, countBaths - 1);

    let bedCost = extraBeds * rateBed;
    let bathCost = extraBaths * rateBath;

    // Extras logic
    let extraCost = 0;
    checkboxInputs.forEach(cb => {
      if (cb.checked) {
        extraCost += parseInt(cb.dataset.price);
      }
    });

    // Total
    let total = basePrice + bedCost + bathCost + extraCost;

    // Update UI
    resPrice.textContent = total;
    bdBase.textContent = `$${basePrice}`;
    bdBeds.textContent = bedCost > 0 ? `+$${bedCost}` : `$0`;
    bdBaths.textContent = bathCost > 0 ? `+$${bathCost}` : `$0`;

    if (extraCost > 0) {
      bdExtrasRow.style.display = 'flex';
      bdExtras.textContent = `+$${extraCost}`;
    } else {
      bdExtrasRow.style.display = 'none';
      bdExtras.textContent = `$0`;
    }

    bdTotal.textContent = `$${total}+`;
  };

  // Bind Buttons
  const setupCounter = (btnMinus, btnPlus, labelVal, countRef) => {
    document.getElementById(btnMinus).addEventListener('click', () => {
      if (count[countRef] > 1) { count[countRef]--; }
      document.getElementById(labelVal).textContent = count[countRef];
      calculateTotal();
    });
    document.getElementById(btnPlus).addEventListener('click', () => {
      if (count[countRef] < 10) { count[countRef]++; }
      document.getElementById(labelVal).textContent = count[countRef];
      calculateTotal();
    });
  };

  let count = { beds: countBeds, baths: countBaths };
  setupCounter('bed-minus', 'bed-plus', 'bed-count', 'beds');
  setupCounter('bath-minus', 'bath-plus', 'bath-count', 'baths');

  // Change mapping logic to update local variables used in calculateTotal
  document.getElementById('bed-minus').addEventListener('click', () => { if (countBeds > 1) { countBeds--; elBedCount.textContent = countBeds; calculateTotal(); } });
  document.getElementById('bed-plus').addEventListener('click', () => { if (countBeds < 10) { countBeds++; elBedCount.textContent = countBeds; calculateTotal(); } });
  document.getElementById('bath-minus').addEventListener('click', () => { if (countBaths > 1) { countBaths--; elBathCount.textContent = countBaths; calculateTotal(); } });
  document.getElementById('bath-plus').addEventListener('click', () => { if (countBaths < 10) { countBaths++; elBathCount.textContent = countBaths; calculateTotal(); } });


  // Bind Radios & Checkboxes
  radioInputs.forEach(el => el.addEventListener('change', calculateTotal));
  checkboxInputs.forEach(el => el.addEventListener('change', calculateTotal));

  // Initial Init
  calculateTotal();


  // ==========================================================
  // 6. CONTACT FORM SUBMISSION (Formspree)
  // ==========================================================
  const contactForm = document.getElementById('contact-form-el');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      const successBox = document.getElementById('success-box');

      // Simple validation
      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const msg = document.getElementById('cf-message').value.trim();

      if (!name || !email || !msg) {
        alert("Please fill in Name, Email and Message.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          // Success
          contactForm.style.display = 'none';
          successBox.style.display = 'block';
        } else {
          throw new Error('Submission failed');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        alert("Sorry, an error occurred while sending. Please try again or email us directly at contact@mgcleansolutions.com.");
      }
    });
  }


  // ==========================================================
  // 7. BILINGUAL SUPPORT (Static i18n)
  // ==========================================================
  const translations = {
    en: {
      nav_sub: "Gold Coast, QLD",
      nav_services: "Services",
      nav_results: "Results",
      nav_calculator: "Estimate",
      nav_contact: "Contact",
      nav_cta: "Get a Quote",
      hero_badge: "Gold Coast Wide — Japanese Standard",
      hero_title_1: "Japanese Standard",
      hero_title_2: "Quality Cleaning",
      hero_desc: "Insured, Police Checked, and 100% Satisfaction Guaranteed. Attention to detail. The Japanese way.",
      hero_cta_calc: "Calculate Your Price",
      hero_cta_contact: "Get in Touch",
      trust_police: "Police Checked",
      trust_police_sub: "Verified & Background Checked",
      trust_insured: "Fully Insured",
      trust_insured_sub: "Public Liability Covered",
      trust_bond: "Bond Back Guarantee",
      trust_bond_sub: "100% Confidence on Move-out",
      trust_abn: "ABN Registered",
      about_label: "Why Choose Us",
      about_badge: "Bond Back Guarantee",
      about_title: "The Japanese Way of Cleaning",
      about_desc: "We bring the Japanese philosophy of 'Omotenashi' to every home. It's not just cleaning — it's an attention to detail that goes beyond what the eye can see.",
      value1_title: "Attention to Detail",
      value1_desc: "Skirting boards, door handles, behind appliances — the places others miss are where we shine.",
      value2_title: "Punctual & Reliable",
      value2_desc: "We arrive on time, every time. Before and after photos provided for your peace of mind.",
      value3_title: "Fully Insured & Verified",
      value3_desc: "Police checked, Public Liability Insurance covered. Your home is in safe, trusted hands.",
      services_label: "Our Services",
      services_title: "What We Offer",
      services_desc: "From regular maintenance to full bond cleans — tailored to your needs across Gold Coast.",
      services_popular: "Most Popular",
      services_recommended: "Bond Back Guaranteed",
      services_airbnb: "Airbnb Ready",
      service1_name: "General Clean",
      service1_desc: "Regular maintenance clean to keep your home spotless. Perfect for ongoing hygiene.",
      service2_name: "Bond Cleaning",
      service2_desc: "Professional-grade bond clean with our 100% Bond Back Guarantee.",
      service3_name: "Spring / Deep Cleaning",
      service3_desc: "Thorough top-to-bottom clean. Perfect for seasonal cleaning or special occasions.",
      service4_name: "Airbnb / Holiday Home",
      service4_desc: "Fast, reliable turnover cleaning. Trusted by GC hosts for 5-star reviews.",
      from: "From",
      service1_price_suffix: "~ / 1 Bed, 1 Bath",
      service2_price_suffix: "~ / 1 Bed, 1 Bath",
      contact_for_quote: "Contact for Quote",
      results_label: "Our Results",
      results_title: "See the Difference",
      results_desc: "Drag the slider to reveal the before and after. This is the MG clean Solutions standard.",
      before_label: "BEFORE",
      after_label: "AFTER",
      calc_label: "Instant Estimate",
      calc_title: "Calculate Your Price",
      calc_desc: "Select your service and property size for an instant estimate. No obligation.",
      calc_step1: "Step 1: Type of Cleaning",
      svc_general: "General Clean",
      svc_general_desc: "Regular maintenance",
      svc_bond: "Bond Cleaning",
      svc_bond_desc: "Bond back guarantee",
      svc_spring: "Spring / Deep Cleaning",
      svc_spring_desc: "Deep thorough clean",
      svc_airbnb: "Airbnb Cleaning",
      svc_airbnb_desc: "Fast turnover",
      calc_step2: "Step 2: Property Size",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      calc_step3: "Step 3: Add-On Services (Optional)",
      extra_carpet: "Carpet Steam Cleaning",
      extra_ac: "AC Cleaning",
      extra_oven: "Oven Internal Cleaning",
      extra_fridge: "Inside Fridge Cleaning",
      extra_windows: "Window Cleaning (inside, up to 6)",
      extra_balcony: "Balcony Pressure Wash",
      calc_step4: "Step 4: Frequency",
      freq_once: "One-off",
      freq_weekly: "Weekly",
      freq_fortnightly: "Fortnightly",
      freq_monthly: "Monthly",
      result_heading: "Estimated Price",
      result_disclaimer: "Starting estimate — final price confirmed on-site.",
      breakdown_base: "Base Service",
      breakdown_bedrooms: "Bedrooms",
      breakdown_bathrooms: "Bathrooms",
      breakdown_extras: "Add-ons",
      breakdown_total: "Total Estimate",
      result_cta: "Get Detailed Quote",
      result_note: "No obligation. We'll confirm the final price.",
      contact_label: "Get In Touch",
      contact_title: "Request a Quote",
      contact_desc: "Fill in your details and we'll get back to you within 24 hours.",
      contact_info_title: "We'd Love to Help",
      contact_info_desc: "Whether it's a regular, bond, or Airbnb clean — we'll make it shine.",
      contact_area_label: "Service Area",
      contact_area: "Gold Coast Wide (QLD) — up to 20km from Surfers Paradise",
      contact_response_label: "Response Time",
      contact_response: "Within 24 hours",
      contact_payment_label: "Payment Methods",
      contact_payment: "Bank Transfer / Square",
      form_name: "Full Name *",
      form_email: "Email *",
      form_phone: "Phone",
      form_date: "Preferred Date",
      form_message: "Inquiry Details *",
      form_submit: "Send Message",
      success_title: "Message Sent!",
      success_desc: "Thank you for your inquiry. We'll be in touch within 24 hours.",
      footer_desc: "Bringing Japanese attention to detail to Gold Coast homes. Professional, reliable cleaning.",
      footer_services: "Services",
      footer_contact: "Contact",
      deep_label: "Service Details",
      deep_title: "Spring / Deep Cleaning Checklist",
      deep_tab_rooms: "Bedrooms & Living",
      deep_tab_kitchen: "Kitchen",
      deep_tab_bath: "Bathroom & Laundry",
      deep_tab_extras: "Additional Options",
      deep_room_1: "Remove dust from ceilings and walls",
      deep_room_2: "Wipe down skirting boards",
      deep_room_3: "Clean doors, door frames, and handles",
      deep_room_4: "Clean all built-in wardrobes: shelves, doors, tracks",
      deep_room_5: "Clean all blinds (venetian, roller, vertical, timber)",
      deep_room_6: "Clean windows, window frames, and tracks (brush + vacuum + wipe)",
      deep_room_7: "Clean both sides of all window glass (outside where accessible)",
      deep_room_8: "Dust curtains and rails",
      deep_room_9: "Clean power outlets and light switch panels",
      deep_room_10: "Wipe down all light fittings and coverings",
      deep_room_11: "Clean air-con external surfaces and washable filters (where possible)",
      deep_room_12: "Full vacuum of all floors, including corners and under furniture",
      deep_room_13: "Mop hard floors (tiles / timber / vinyl)",
      deep_kit_gen: "Kitchen General",
      deep_kit_1: "Remove grease, dirt, fingerprints from all surfaces",
      deep_kit_2: "Clean and sanitise benchtops",
      deep_kit_3: "Clean inside and outside of all cupboards and drawers",
      deep_kit_4: "Clean sink: remove water stains, limescale, polish to shine",
      deep_kit_5: "Polish taps and fixtures",
      deep_kit_6: "Clean splashback (tile or glass), removing oil and grime",
      deep_kit_cook: "Cooktop (Gas / Electric / Ceramic)",
      deep_kit_7: "Clean drip trays and grates (gas)",
      deep_kit_8: "Wipe and polish cooktop surface",
      deep_kit_9: "Clean control knobs and surrounding areas",
      deep_kit_hood: "Rangehood",
      deep_kit_10: "Degrease external hood surface",
      deep_kit_11: "Clean light and switches",
      deep_bath_gen: "Bathroom",
      deep_bath_1: "Remove soap scum and limescale from shower screens",
      deep_bath_2: "Clean wall tiles, remove mould in grout",
      deep_bath_3: "Clean sink and vanity",
      deep_bath_4: "Clean and streak-free shine on mirrors",
      deep_bath_5: "Clean inside and outside of cabinets",
      deep_bath_6: "Polish taps and metal fittings",
      deep_bath_7: "Clean drain areas",
      deep_bath_8: "Deep clean toilet: bowl, seat, hinges, base",
      deep_bath_9: "Dust and wipe exhaust fan (external)",
      deep_laun_gen: "Laundry",
      deep_laun_1: "Clean laundry tub and tap fixtures",
      deep_laun_2: "Wipe walls and splashback areas",
      deep_laun_3: "Clean washing machine space and surrounding dust",
      deep_laun_4: "Wipe exhaust vents and surrounding areas",
      deep_ext_title: "Additional / Optional Services",
      deep_ext_1: "Carpet steam cleaning",
      deep_ext_2: "Wall mark removal (light to medium)",
      deep_ext_3: "Oven cleaning",
      deep_ext_4: "Garage cleaning",
      deep_ext_5: "Balcony / outdoor area (wipe handrails, mop tiled balcony areas)",
      deep_ext_6: "Wipe remaining furniture (if any)",
      deep_ext_7: "Wiping down the inside of the refrigerator",
      gen_inc_title: "Regular Cleaning Includes:",
      gen_area: "General Areas",
      gen_area_1: "Dusting all accessible surfaces",
      gen_area_2: "Wiping benches, tables and shelves",
      gen_area_3: "Vacuuming carpets and rugs",
      gen_area_4: "Mopping hard floors",
      gen_area_5: "Emptying bins",
      gen_area_6: "Spot cleaning of fingerprints and marks (doors & light switches)",
      gen_kit: "Kitchen",
      gen_kit_1: "Wiping down kitchen benchtops",
      gen_kit_2: "Cleaning exterior of cupboards and drawers",
      gen_kit_3: "Cleaning sink and taps",
      gen_kit_4: "Wiping exterior of appliances (fridge, oven, microwave, dishwasher)",
      gen_kit_5: "Cleaning stovetop",
      gen_kit_6: "Emptying rubbish and replacing liner",
      gen_bath: "Bathrooms & Toilets",
      gen_bath_1: "Cleaning and sanitising toilet",
      gen_bath_2: "Cleaning shower screen and bathtub",
      gen_bath_3: "Cleaning vanity, sink and taps",
      gen_bath_4: "Wiping mirrors",
      gen_bath_5: "Mopping bathroom floors",
      gen_bed: "Bedrooms",
      gen_bed_1: "Dusting surfaces and furniture",
      gen_bed_2: "Vacuuming floors",
      gen_bed_3: "Making beds (if fresh linen is provided)",
      gen_exc_title: "Not Included (unless requested)",
      gen_exc_1: "Deep cleaning / heavy build-up",
      gen_exc_2: "Inside oven, fridge or cupboards",
      gen_exc_3: "Wall, skirting board wipes",
      gen_exc_4: "Ceiling fans & high areas",
      gen_exc_5: "Window cleaning",
      gen_exc_6: "Carpet steam cleaning",
      view_details: "View Details",
      hide_details: "Hide Details",
      onsite_quote: "On-site Quote Required",
      onsite_desc: "Because the condition of properties can vary significantly, we require an on-site inspection before providing a detailed checklist and accurate quote."
    },
    ja: {
      nav_sub: "オーストラリア ゴールドコースト",
      nav_services: "サービス",
      nav_results: "ビフォーアフター",
      nav_calculator: "お見積り",
      nav_contact: "お問い合わせ",
      nav_cta: "お見積り依頼",
      hero_badge: "ゴールドコースト全域 — 安心の日本人品質",
      hero_title_1: "Japanese Standard",
      hero_title_2: "Quality Cleaning",
      hero_desc: "警察証明取得・賠償保険加入済み。細部への徹底したこだわりと時間厳守で、日本人ならではの丁寧な清掃を提供します。",
      hero_cta_calc: "かんたんお見積り",
      hero_cta_contact: "お問い合わせ",
      trust_police: "Police Checked",
      trust_police_sub: "安心の身元証明済み（無犯罪証明）",
      trust_insured: "Fully Insured",
      trust_insured_sub: "万が一の破損も保険でカバー",
      trust_bond: "Bond Back Guarantee",
      trust_bond_sub: "退去清掃のボンド返金100%保証",
      trust_abn: "ABN Registered",
      about_label: "当社の強み",
      about_badge: "ボンド返金保証",
      about_title: "徹底した「日本人クオリティ」",
      about_desc: "「おもてなし」の心をすべての清掃に。目に見える場所だけでなく、普段気づかない細部まで徹底的にクリーニングします。",
      value1_title: "細部へのこだわり (Attention to Detail)",
      value1_desc: "巾木やドアの取手、家電の裏など、ローカル業者が逃しがちな「小さな汚れ」を逃しません。",
      value2_title: "時間厳守と信頼 (Punctual & Reliable)",
      value2_desc: "オーストラリアでも常に時間厳守。作業の前と後の写真を必ずお送りし、安心をお届けします。",
      value3_title: "完全保険・警察証明 (Fully Insured)",
      value3_desc: "賠償責任保険加入、無犯罪証明（Police Check）取得済み。お客様の家を安全にお守りします。",
      services_label: "サービス内容",
      services_title: "提供メニュー",
      services_desc: "日常の定期清掃から、プロ仕様の退去清掃まで。お客様のニーズに合わせ対応します。",
      services_popular: "人気メニュー",
      services_recommended: "返金保証付き",
      services_airbnb: "ホスト向け",
      service1_name: "定期清掃 (General Cleaning)",
      service1_desc: "日常の汚れを落とし、お家を常に清潔に保ちます。",
      service2_name: "退去時清掃 (Bond Cleaning)",
      service2_desc: "不動産屋の厳しいチェックをクリアするプロ仕様。100%ボンド返金保証付きで安心。",
      service3_name: "大掃除・深層清掃 (Spring / Deep Cleaning)",
      service3_desc: "普段手の届かない場所まで徹底的にクリーニングします。",
      service4_name: "民泊清掃 (Airbnb Cleaning)",
      service4_desc: "素早く確実な清掃で、常に高評価（5つ星）のレビュー獲得をサポートします。",
      from: "基本",
      service1_price_suffix: "〜 / 1 Bed, 1 Bath",
      service2_price_suffix: "〜 / 1 Bed, 1 Bath",
      contact_for_quote: "お問い合わせください",
      results_label: "清掃実績",
      results_title: "Before & After",
      results_desc: "真ん中のバーを左右にスワイプして、圧倒的な違いを体感してください。",
      before_label: "清掃前",
      after_label: "清掃後",
      calc_label: "かんたんシミュレーター",
      calc_title: "概算お見積り(無料)",
      calc_desc: "清掃タイプと部屋数を選ぶだけで、その場で概算金額がわかります。",
      calc_step1: "ステップ1: 清掃の種類",
      svc_general: "定期清掃 (General Cleaning)",
      svc_general_desc: "日常清掃",
      svc_bond: "退去時清掃 (Bond Cleaning)",
      svc_bond_desc: "ボンド返金保証",
      svc_spring: "大掃除・深層清掃 (Spring / Deep Cleaning)",
      svc_spring_desc: "徹底的な清掃",
      svc_airbnb: "民泊清掃 (Airbnb Cleaning)",
      svc_airbnb_desc: "迅速な対応",
      calc_step2: "ステップ2: お部屋の広さ",
      bedrooms: "ベッドルームの数",
      bathrooms: "バスルーム(トイレ含)の数",
      calc_step3: "ステップ3: 追加オプション",
      extra_carpet: "カーペット・スチーム洗浄",
      extra_ac: "エアコンクリーニング",
      extra_oven: "オーブン内部清掃",
      extra_fridge: "冷蔵庫内部清掃",
      extra_windows: "窓掃除 (内側のみ・6枚まで)",
      extra_balcony: "高圧洗浄（バルコニー・外壁など）",
      calc_step4: "ステップ4: 頻度",
      freq_once: "1回のみ",
      freq_weekly: "週一",
      freq_fortnightly: "２週に一回",
      freq_monthly: "月一",
      result_heading: "概算お見積り金額",
      result_disclaimer: "※これは概算です。正確な料金は現地の状態により変動します。",
      breakdown_base: "基本料金",
      breakdown_bedrooms: "ベッドルーム追加",
      breakdown_bathrooms: "バスルーム追加",
      breakdown_extras: "オプション追加",
      breakdown_total: "概算合計金額",
      result_cta: "この内容で申し込む",
      result_note: "まだ予約は確定しません。後ほど正確な金額をご提示します。",
      contact_label: "お問い合わせ",
      contact_title: "お見積りご依頼",
      contact_desc: "以下のフォームに必要事項を記入してください。24時間以内に折り返しご連絡いたします。",
      contact_info_title: "お気軽にご相談ください",
      contact_info_desc: "定期清掃、退去清掃、Airbnbなど、ご要望に合わせて柔軟に対応いたします。",
      contact_area_label: "対応エリア",
      contact_area: "ゴールドコースト全域（サーファーズパラダイスから20km圏内）",
      contact_response_label: "返信の目安",
      contact_response: "24時間以内にご返信いたします",
      contact_payment_label: "お支払い方法",
      contact_payment: "銀行振込 (Bank Transfer) / クレジットカード決済 (Square)",
      form_name: "お名前 (フルネーム) *",
      form_email: "メールアドレス *",
      form_phone: "お電話番号",
      form_date: "清掃ご希望日時",
      form_message: "お問い合わせ・ご相談詳細 *",
      form_submit: "メッセージを送信する",
      success_title: "送信完了しました！",
      success_desc: "お問い合わせありがとうございます。内容を確認の上、24時間以内にご返信いたします。",
      footer_desc: "ゴールドコーストに、日本品質の輝きを。細部にまでこだわったプロフェッショナルな清掃サービスを提供します。",
      footer_services: "メニュー",
      footer_contact: "連絡先",
      deep_label: "サービス詳細",
      deep_title: "大掃除・深層清掃 チェックリスト",
      deep_tab_rooms: "寝室・リビング・全室",
      deep_tab_kitchen: "キッチン",
      deep_tab_bath: "バスルーム・ランドリー",
      deep_tab_extras: "追加オプション",
      deep_room_1: "天井と壁のホコリ除去",
      deep_room_2: "幅木（巾木）の拭き掃除",
      deep_room_3: "ドア、ドア枠、取っ手の拭き上げ",
      deep_room_4: "備え付けクローゼットの清掃（棚、ドア、レール）",
      deep_room_5: "全ブラインドの清掃",
      deep_room_6: "窓、窓枠、サッシのレールの清掃（ブラシ・掃除機・拭き掃除）",
      deep_room_7: "全窓ガラスの両面清掃（手が届く範囲の外側）",
      deep_room_8: "カーテンとレールのホコリ除去",
      deep_room_9: "コンセントとスイッチパネルの清掃",
      deep_room_10: "照明器具とカバーの拭き上げ",
      deep_room_11: "エアコン外装とフィルターの清掃（可能な場合）",
      deep_room_12: "全床の徹底的な掃除機掛け（隅、家具の下を含む）",
      deep_room_13: "床のモップ掛け（タイル・木材・ビニール）",
      deep_kit_gen: "キッチン全般",
      deep_kit_1: "全表面の油汚れ、泥、指紋の除去",
      deep_kit_2: "調理台の清掃と除菌",
      deep_kit_3: "全ての戸棚と引き出しの内外の清掃",
      deep_kit_4: "シンクの清掃（水垢除去、磨き上げ）",
      deep_kit_5: "蛇口と金具の磨き上げ",
      deep_kit_6: "飛び散り防止壁（タイル・ガラス）の油汚れ除去",
      deep_kit_cook: "コンロ（ガス・電気・IH）",
      deep_kit_7: "五徳の清掃（ガス）",
      deep_kit_8: "コンロ表面の拭き掃除と磨き上げ",
      deep_kit_9: "操作ノブと周辺の清掃",
      deep_kit_hood: "レンジフード（換気扇）",
      deep_kit_10: "フード外装の油汚れ除去",
      deep_kit_11: "照明とスイッチの清掃",
      deep_bath_gen: "バスルーム",
      deep_bath_1: "シャワースクリーンの石鹸カス・水垢の除去",
      deep_bath_2: "壁タイルの清掃、目地のカビ除去",
      deep_bath_3: "洗面台・洗面化粧台の清掃",
      deep_bath_4: "鏡の拭き跡が残らない磨き上げ",
      deep_bath_5: "棚の中と外の清掃",
      deep_bath_6: "蛇口と金具の磨き上げ",
      deep_bath_7: "排水溝周辺の清掃",
      deep_bath_8: "トイレの徹底清掃（便器、便座、ヒンジ、土台）",
      deep_bath_9: "換気扇外部のホコリ除去と拭き掃除",
      deep_laun_gen: "ランドリー（洗濯室）",
      deep_laun_1: "洗濯槽（シンク）と蛇口の清掃",
      deep_laun_2: "壁と水はね部分の拭き掃除",
      deep_laun_3: "洗濯機置き場周辺のホコリ・清掃",
      deep_laun_4: "換気口と周辺の拭き掃除",
      deep_ext_title: "追加 / オプションサービス",
      deep_ext_1: "カーペット・スチーム洗浄",
      deep_ext_2: "壁の汚れ落とし（軽度〜中度）",
      deep_ext_3: "オーブン内部清掃",
      deep_ext_4: "ガレージ清掃",
      deep_ext_5: "バルコニー・屋外エリア（手すりの拭き掃除、タイル床のモップ掛けなど）",
      deep_ext_6: "残る家具があれば拭き上げ",
      deep_ext_7: "冷蔵庫の内部清掃",
      gen_inc_title: "清掃内容 (レギュラー):",
      gen_area: "共用エリア・全体",
      gen_area_1: "手の届く範囲のホコリ取り",
      gen_area_2: "ベンチ、テーブル、棚の拭き掃除",
      gen_area_3: "カーペット・ラグの掃除機掛け",
      gen_area_4: "ハードフロアのモップ掛け",
      gen_area_5: "ゴミ箱の回収",
      gen_area_6: "ドアやスイッチの指紋・汚れの部分拭き",
      gen_kit: "キッチン",
      gen_kit_1: "キッチンの調理台拭き",
      gen_kit_2: "戸棚・引き出しの外側の清掃",
      gen_kit_3: "シンクと蛇口の清掃",
      gen_kit_4: "家電（冷蔵庫、オーブン、レンジ、食洗機）の外側拭き",
      gen_kit_5: "コンロの表面清掃",
      gen_kit_6: "ゴミ回収とゴミ袋の交換",
      gen_bath: "バスルーム＆トイレ",
      gen_bath_1: "トイレの清掃・除菌",
      gen_bath_2: "シャワースクリーンとバスタブの清掃",
      gen_bath_3: "洗面台、シンク、蛇口の清掃",
      gen_bath_4: "鏡の拭き掃除",
      gen_bath_5: "バスルーム床のモップ掛け",
      gen_bed: "ベッドルーム",
      gen_bed_1: "表面と家具のホコリ取り",
      gen_bed_2: "床の掃除機掛け",
      gen_bed_3: "ベッドメイキング（新しいリネンが用意されている場合）",
      gen_exc_title: "含まれないもの（オプション）",
      gen_exc_1: "深層清掃 / 頑固な汚れの除去",
      gen_exc_2: "オーブン、冷蔵庫、戸棚の「内側」",
      gen_exc_3: "壁、幅木の拭き掃除",
      gen_exc_4: "シーリングファン、高所の清掃",
      gen_exc_5: "窓ガラス清掃",
      gen_exc_6: "カーペットスチーム洗浄",
      view_details: "詳細を見る",
      hide_details: "閉じる",
      onsite_quote: "現地お見積りが必要です",
      onsite_desc: "お部屋の状況によって清掃内容や料金が大きく変動するため、実際に現地を拝見した上で、正確なお見積りと清掃内容をご提案させていただきます。"
    }
  };

  let currentLang = localStorage.getItem('jgcc_lang') || 'en';

  const applyLang = (lang) => {
    // text replacements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // Special logic for HTML replacments (e.g. <br> inside)
    if (lang === 'en') {
      document.querySelector('[data-i18n="hero_title_1"]').innerHTML = "Japanese Standard";
      document.querySelector('[data-i18n="hero_title_2"]').innerHTML = "Quality Cleaning";
      document.getElementById('lang-toggle').textContent = "日本語";
      if (document.getElementById('lang-toggle-mobile')) document.getElementById('lang-toggle-mobile').textContent = "日本語";
    } else {
      document.querySelector('[data-i18n="hero_title_1"]').innerHTML = "Japanese Standard";
      document.querySelector('[data-i18n="hero_title_2"]').innerHTML = "Quality Cleaning";
      document.getElementById('lang-toggle').textContent = "English";
      if (document.getElementById('lang-toggle-mobile')) document.getElementById('lang-toggle-mobile').textContent = "English";
    }

    document.documentElement.lang = lang;
  };

  applyLang(currentLang);

  const toggleLang = () => {
    currentLang = currentLang === 'en' ? 'ja' : 'en';
    localStorage.setItem('jgcc_lang', currentLang);
    applyLang(currentLang);
  };

  const btnToggle = document.getElementById('lang-toggle');
  if (btnToggle) btnToggle.addEventListener('click', toggleLang);
  const btnToggleMob = document.getElementById('lang-toggle-mobile');
  if (btnToggleMob) btnToggleMob.addEventListener('click', () => {
    toggleLang();
    toggleNav(); // close mobile menu on switch
  });


});

// Global Function for Calculator Handoff
window.proceedToContact = () => {
  const serviceEl = document.querySelector('input[name="service-type"]:checked');
  const service = serviceEl ? serviceEl.value : 'Unknown';
  const beds = document.getElementById('bed-count').textContent;
  const baths = document.getElementById('bath-count').textContent;
  const total = document.getElementById('result-price').textContent;

  let extras = [];
  document.querySelectorAll('.extra-item input[type="checkbox"]:checked').forEach(cb => {
    extras.push(cb.value);
  });

  const msgBox = document.getElementById('cf-message');
  if (msgBox) {
    let msg = `[Automated Estimate Request]\n`;
    msg += `Service: ${service}\n`;
    msg += `Size: ${beds} Bed(s), ${baths} Bath(s)\n`;
    const freqEl = document.getElementById('freq-select');
    const freq = freqEl ? freqEl.options[freqEl.selectedIndex].text : 'N/A';

    msg += `Extras: ${extras.length > 0 ? extras.join(', ') : 'None'}\n`;
    msg += `Frequency: ${freq}\n`;
    msg += `Estimated Total: $${total}\n\n`;
    msg += `Please provide any additional details here...`;

    msgBox.value = msg;

    // Scroll down to contact
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  }
};
