(() => {
  'use strict';
  const form = document.getElementById('xsap-form');
  const titles = [
    { tag: 'בואו נכיר', title: 'הדרך שלך מתחילה כאן', description: 'כמה פרטים קטנים, כדי שנכיר אותך ונתאים לך את האימונים שהכי נכונים עבורך.' },
    { tag: 'הקצב שלך', title: 'נעים להכיר אותך קצת יותר', description: 'כל אחת ואחד מתחילים ממקום אחר. אנחנו כאן כדי למצוא את מה שעובד בשבילך.' },
    { tag: 'מסיימים ומתחילים', title: 'אז מה הכי מתאים לך?', description: 'עוד שלוש תשובות קטנות ואנחנו מוכנים לצאת לדרך.' }
  ];
  const steps = [...document.querySelectorAll('.form-step')];
  const back = document.getElementById('back-button');
  const next = document.getElementById('next-button');
  const submit = document.getElementById('submit-button');
  const generalError = document.getElementById('submit-error');
  let currentStep = 0;
  let submitting = false;

  const q = (name) => document.querySelector(`input[name="${name}"]:checked`);
  const qs = (name) => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(el => el.value);
  const value = (id) => document.getElementById(id).value.trim();
  const selected = (name) => q(name)?.value || '';
  const show = (id, on) => { document.getElementById(id).hidden = !on; };

  function clearError(key) {
    const field = document.querySelector(`[data-field="${key}"]`);
    if (field) field.classList.remove('invalid');
    const el = document.getElementById(`err-${key}`);
    if (el) el.textContent = '';
  }
  function setError(key, message) {
    const field = document.querySelector(`[data-field="${key}"]`);
    field?.classList.add('invalid');
    const el = document.getElementById(`err-${key}`);
    if (el) el.textContent = message;
  }
  function updateStep(scroll = true) {
    steps.forEach((el, i) => { el.hidden = i !== currentStep; el.classList.toggle('active', i === currentStep); });
    const t = titles[currentStep];
    document.getElementById('step-tag').textContent = t.tag;
    document.getElementById('step-title').innerHTML = `${t.title}<span class="accent-dot">.</span>`;
    document.getElementById('step-description').textContent = t.description;
    document.getElementById('step-current').textContent = String(currentStep + 1).padStart(2, '0');
    document.querySelector('.progress-indicator').style.width = `${((currentStep + 1) / 3) * 100}%`;
    document.getElementById('progress').setAttribute('aria-valuenow', String(currentStep + 1));
    back.hidden = currentStep === 0;
    next.hidden = currentStep === 2;
    submit.hidden = currentStep !== 2;
    generalError.hidden = true;
    if (scroll) {
      const top = document.getElementById('form-panel').getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }

  function validateStep(i) {
    const errs = [];
    if (i === 0) {
      if (value('fullName').length < 2) errs.push(['fullName', 'נשמח לקבל שם מלא.']);
      const age = Number(value('age'));
      if (!Number.isInteger(age) || age < 10 || age > 110) errs.push(['age', 'נא להזין גיל תקין.']);
      if (!selected('activity')) errs.push(['activity', 'כדאי לבחור תשובה אחת.']);
    }
    if (i === 1) {
      if (!qs('experience').length) errs.push(['experience', 'צריך לבחור לפחות אפשרות אחת.']);
      if (qs('experience').includes('אחר') && !value('experienceOther')) errs.push(['experience', 'אם בחרת "אחר", נשמח לפירוט קצר.']);
      if (!selected('medical')) errs.push(['medical', 'נא לבחור כן או לא.']);
      if (selected('medical') === 'כן' && !value('medicalDetails')) errs.push(['medical', 'אפשר לכתוב בקצרה מה חשוב שנדע, בלי מידע רגיש.']);
    }
    if (i === 2) {
      if (!qs('interests').length) errs.push(['interests', 'צריך לבחור לפחות אפשרות אחת.']);
      if (!selected('times')) errs.push(['times', 'כדאי לבחור מועד נוח.']);
      if (!selected('source')) errs.push(['source', 'נשמח לדעת איך הגעת אלינו.']);
    }
    steps[i].querySelectorAll('.field-error').forEach(el => el.textContent = '');
    steps[i].querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    errs.forEach(([key, message]) => setError(key, message));
    if (errs.length) document.querySelector(`[data-field="${errs[0][0]}"]`).scrollIntoView({ behavior: 'smooth', block: 'center' });
    return !errs.length;
  }

  next.addEventListener('click', () => { if (validateStep(currentStep)) { currentStep++; updateStep(); } });
  back.addEventListener('click', () => { if (currentStep > 0) { currentStep--; updateStep(); } });

  document.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
      const inputs = [...document.querySelectorAll(`input[name="${input.name}"]`)];
      if (input.checked) {
        if (input.dataset.exclusive) inputs.filter(el => el !== input).forEach(el => { el.checked = false; });
        else inputs.filter(el => !!el.dataset.exclusive).forEach(el => { el.checked = false; });
      }
      show('experience-other-wrap', qs('experience').includes('אחר'));
      clearError(input.name);
    });
  });
  document.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => {
      if (input.name === 'medical') show('medical-details-wrap', selected('medical') === 'כן');
      clearError(input.name);
    });
  });
  form.querySelectorAll('input[type="text"],input[type="number"],textarea').forEach(input => {
    input.addEventListener('input', () => clearError(input.id === 'medicalDetails' ? 'medical' : input.id === 'experienceOther' ? 'experience' : input.id));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (!validateStep(currentStep)) return;
    const payload = {
      fullName: value('fullName'), age: Number(value('age')), activity: selected('activity'),
      experience: qs('experience'), experienceOther: qs('experience').includes('אחר') ? value('experienceOther') : '',
      medical: selected('medical'), medicalDetails: selected('medical') === 'כן' ? value('medicalDetails') : '',
      interests: qs('interests'), times: selected('times'), source: selected('source'),
      website: document.getElementById('website')?.value || ''
    };
    submitting = true;
    submit.disabled = true;
    submit.innerHTML = 'שולחים את התשובות...';
    generalError.hidden = true;
    try {
      const response = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('submit_failed');
      document.getElementById('form-panel').hidden = true;
      document.getElementById('form-panel').style.display = 'none';
      document.getElementById('success-panel').hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      generalError.textContent = 'לא הצלחנו לשלוח את השאלון כרגע. הפרטים נשמרו במסך ואפשר לנסות שוב.';
      generalError.hidden = false;
    } finally {
      submitting = false;
      submit.disabled = false;
      submit.innerHTML = 'שולחים את השאלון <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 5-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
  });
  updateStep(false);
})();
