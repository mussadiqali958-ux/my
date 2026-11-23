'use strict';

(() => {
  const trigger = document.getElementById('open-rsvp');
  const dialog = document.getElementById('reply');
  const form = document.getElementById('reply-form');
  const close = document.getElementById('close-rsvp');
  const draft = form.elements.text;
  const name = form.elements.guest;
  const count = form.elements.count;

  // The plain WhatsApp link also works when dialogs or scripting are unavailable.
  form.action = trigger.href;
  trigger.addEventListener('click', event => {
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    dialog.showModal();
    close.focus();
  });
  close.addEventListener('click', () => dialog.close());

  function updateDraft() {
    const attending = form.elements.attending.value;
    count.disabled = attending === 'no';
    if (count.disabled) count.value = '0';
    else if (count.value === '0') count.value = '1';
    name.setCustomValidity(name.value && !name.value.trim() ? 'Please enter your name.' : '');
    const response = attending === 'yes'
      ? 'Accepts with pleasure. Guests attending: ' + count.value
      : 'Declines with regret.';
    draft.value = form.dataset.occasion + '\n' + name.value.trim() + ' — ' + response;
  }

  form.addEventListener('input', updateDraft);
  form.addEventListener('change', updateDraft);
  form.addEventListener('submit', event => {
    updateDraft();
    if (!form.reportValidity()) event.preventDefault();
  });
  // WhatsApp needs a single text parameter. Keep native navigation for app links.
  form.addEventListener('formdata', event => {
    for (const field of ['guest', 'attending', 'count']) event.formData.delete(field);
  });
})();
