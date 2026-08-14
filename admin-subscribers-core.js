(() => {
  const section = document.querySelector('[data-admin-section="subscribersAdmin"]');
  if (!section || section.dataset.workspaceReady === "true") return;
  section.dataset.workspaceReady = "true";

  const $ = (id) => document.getElementById(id);
  const escLocal = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

  const style = document.createElement("style");
  style.textContent = `
    .subscriberWorkspace{display:grid;gap:18px;margin:18px 0 22px}
    .subscriberStats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .subscriberStat{border:1px solid var(--border);background:rgba(255,255,255,.025);border-radius:16px;padding:14px}
    .subscriberStat strong{display:block;font-size:25px;line-height:1.1;margin-bottom:4px}
    .subscriberStat span{color:var(--muted);font-size:12px}
    .subscriberPanel{border:1px solid var(--border);border-radius:18px;padding:18px;background:rgba(255,255,255,.025)}
    .subscriberPanel h4{margin:0 0 6px;font-size:20px}
    .subscriberPanel p.help{margin:0 0 14px;color:var(--muted);font-size:13px;line-height:1.5}
    .subscriberFilters{display:grid;grid-template-columns:1.4fr .8fr auto;gap:10px;align-items:center}
    .subscriberFilters .field{margin:0}
    .composerGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .composerGrid .full{grid-column:1/-1}
    .composerLabel{display:block;font-size:12px;color:var(--muted);margin:2px 0 6px;font-weight:700;letter-spacing:.02em}
    .mergeTags{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 2px}
    .mergeTag{border:1px solid var(--border);border-radius:999px;background:#111318;color:#fff;padding:7px 10px;font-size:12px;font-weight:700;cursor:pointer}
    .composerActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
    .composerMeta{display:flex;justify-content:space-between;gap:10px;align-items:center;color:var(--muted);font-size:12px;margin-top:8px}
    .newsletterPreview{display:none;margin-top:16px;background:#f4f5f7;border-radius:18px;padding:14px;color:#18181b}
    .newsletterPreview.show{display:block}
    .previewShell{max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.12)}
    .previewHead{background:#08090b;color:#fff;text-align:center;padding:18px;font-weight:800}
    .previewBody{padding:22px;line-height:1.65;white-space:pre-wrap}
    .previewCta{display:inline-block;background:#ff6517;color:#fff!important;text-decoration:none;border-radius:999px;padding:11px 18px;font-weight:800;margin-top:10px}
    .subscriberToolbar2{display:flex;gap:9px;flex-wrap:wrap;margin:12px 0 6px}
    .subscriberCount{font-size:12px;color:var(--muted);margin:8px 0 0}
    .campaignHistory{display:grid;gap:10px;margin-top:12px}
    .campaignItem{border-top:1px solid rgba(255,255,255,.08);padding:12px 0}
    .campaignItem:first-child{border-top:0}
    .campaignTop{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
    .campaignTop strong{font-size:14px}
    .campaignBadge{padding:4px 8px;border-radius:999px;font-size:10px;font-weight:800;text-transform:uppercase;border:1px solid var(--border)}
    .campaignBadge.sent{background:rgba(34,197,94,.12);color:#86efac}
    .campaignBadge.partial{background:rgba(245,158,11,.12);color:#fcd34d}
    .campaignBadge.failed{background:rgba(239,68,68,.12);color:#fca5a5}
    .campaignMeta{color:var(--muted);font-size:12px;margin-top:5px;line-height:1.5}
    .subscriberHidden{display:none!important}
    .subscriberListEmpty{padding:18px;color:var(--muted);text-align:center;border-top:1px solid rgba(255,255,255,.08)}
    @media(max-width:640px){
      .subscriberStats{grid-template-columns:1fr 1fr 1fr}
      .subscriberStat{padding:12px 9px}
      .subscriberStat strong{font-size:21px}
      .subscriberFilters,.composerGrid{grid-template-columns:1fr}
      .composerGrid .full{grid-column:auto}
      .subscriberFilters button{width:100%}
      .composerActions .adminBtn{flex:1 1 100%}
      .campaignTop{display:block}
      .campaignBadge{display:inline-block;margin-top:7px}
    }
  `;
  document.head.appendChild(style);

  const tools = section.querySelector('.subscriberTools');
  const status = $('subscriberStatus');
  const list = $('adminSubscribersList');

  const workspace = document.createElement('div');
  workspace.className = 'subscriberWorkspace';
  workspace.innerHTML = `
    <div class="subscriberStats">
      <div class="subscriberStat"><strong id="subscriberTotalStat">0</strong><span>Total subscribers</span></div>
      <div class="subscriberStat"><strong id="subscriberSelectedStat">0</strong><span>Selected</span></div>
      <div class="subscriberStat"><strong id="subscriberCountryStat">0</strong><span>Countries</span></div>
    </div>

    <div class="subscriberPanel">
      <h4>Audience</h4>
      <p class="help">Search, filter and select exactly who should receive your message.</p>
      <div class="subscriberFilters">
        <input class="field" id="subscriberSearch" type="search" placeholder="Search name, email or country">
        <select class="field" id="subscriberCountryFilter"><option value="">All countries</option></select>
        <button class="adminBtn" id="exportSubscribersCsv" type="button">Export CSV</button>
      </div>
      <div class="subscriberToolbar2">
        <button class="adminBtn" id="selectVisibleSubscribers" type="button">Select Visible</button>
        <button class="adminBtn" id="clearVisibleSubscribers" type="button">Clear Visible</button>
      </div>
      <div class="subscriberCount" id="subscriberVisibleCount">0 visible</div>
    </div>

    <div class="subscriberPanel" id="newsletterComposer">
      <h4>Create Message</h4>
      <p class="help">Write and send a professional Prayer & Fire email without leaving the dashboard. Personalized fields are supported.</p>

      <div class="composerGrid">
        <div>
          <label class="composerLabel" for="newsletterTemplate">Template</label>
          <select class="field" id="newsletterTemplate">
            <option value="">Start from scratch</option>
            <option value="general">General ministry update</option>
            <option value="prayer">Prayer update</option>
            <option value="mission">Mission report</option>
            <option value="event">Event / meeting invitation</option>
            <option value="intercession">Intercession call</option>
          </select>
        </div>
        <div>
          <label class="composerLabel" for="newsletterPreheader">Preview line</label>
          <input class="field" id="newsletterPreheader" maxlength="180" placeholder="Short line shown in the inbox preview">
        </div>

        <div class="full">
          <label class="composerLabel" for="newsletterSubject">Subject</label>
          <input class="field" id="newsletterSubject" maxlength="180" placeholder="Prayer & Fire Global Update">
        </div>

        <div class="full">
          <label class="composerLabel" for="newsletterMessage">Message</label>
          <textarea class="field" id="newsletterMessage" rows="10" maxlength="20000" placeholder="Write your message here..."></textarea>
          <div class="mergeTags">
            <button class="mergeTag" type="button" data-merge="{{first_name}}">+ First name</button>
            <button class="mergeTag" type="button" data-merge="{{name}}">+ Full name</button>
            <button class="mergeTag" type="button" data-merge="{{country}}">+ Country</button>
          </div>
        </div>

        <div>
          <label class="composerLabel" for="newsletterButtonLabel">Button text (optional)</label>
          <input class="field" id="newsletterButtonLabel" maxlength="80" placeholder="Visit Prayer & Fire">
        </div>
        <div>
          <label class="composerLabel" for="newsletterButtonUrl">Button link (optional)</label>
          <input class="field" id="newsletterButtonUrl" type="url" placeholder="https://prayerandfire.org">
        </div>
      </div>

      <div class="composerMeta">
        <span id="newsletterDraftStatus">Draft saved automatically on this device</span>
        <span id="newsletterCharCount">0 characters</span>
      </div>

      <div class="composerActions">
        <button class="adminBtn" id="previewNewsletter" type="button">Preview</button>
        <button class="adminBtn" id="clearNewsletterDraft" type="button">Clear Draft</button>
        <button class="adminBtn primaryBtn" id="sendSelectedNewsletter" type="button">Send to Selected</button>
        <button class="adminBtn primaryBtn" id="sendAllNewsletter" type="button">Send to All Subscribers</button>
      </div>

      <p class="status" id="newsletterSendStatus"></p>

      <div class="newsletterPreview" id="newsletterPreviewBox">
        <div class="previewShell">
          <div class="previewHead">Prayer &amp; Fire Global Movement</div>
          <div class="previewBody">
            <strong id="newsletterPreviewSubject"></strong>
            <div id="newsletterPreviewMessage" style="margin-top:14px"></div>
            <a class="previewCta" id="newsletterPreviewButton" href="#" onclick="return false" style="display:none"></a>
          </div>
        </div>
      </div>
    </div>

    <div class="subscriberPanel">
      <div class="campaignTop">
        <div>
          <h4>Recent Campaigns</h4>
          <p class="help">See what was sent and how many messages were delivered.</p>
        </div>
        <button class="adminBtn" id="refreshCampaignHistory" type="button">Refresh</button>
      </div>
      <div class="campaignHistory" id="campaignHistory"><span class="status">Loading history...</span></div>
    </div>
  `;

  if (tools) tools.before(workspace);
  else if (status) status.before(workspace);
  else section.prepend(workspace);

  const legacyEmailButton = $('emailSubscribers');
  if (legacyEmailButton) legacyEmailButton.style.display = 'none';

  const state = {
    query: '',
    country: '',
    historyLoaded: false,
    sending: false
  };

  const templates = {
    general: {
      subject: 'Prayer & Fire Global Update',
      preheader: 'News and ministry updates from Prayer & Fire Global Movement.',
      message: 'Blessings {{first_name}},\n\nWe are grateful to share a new update from Prayer & Fire Global Movement.\n\nThank you for standing with us in prayer, faith, unity and service among the nations.\n\nMay the Lord bless you and your family.'
    },
    prayer: {
      subject: 'Prayer Update | Prayer & Fire',
      preheader: 'Join us in prayer for what God is doing among the nations.',
      message: 'Peace of the Lord Jesus, {{first_name}}.\n\nWe invite you to join us in prayer for the needs and ministry work before us.\n\nThank you for continuing to pray with Prayer & Fire Global Movement.\n\nIn the name of the Lord Jesus.'
    },
    mission: {
      subject: 'Mission Report | Prayer & Fire Global Movement',
      preheader: 'See how prayer and action are impacting communities.',
      message: 'Blessings {{first_name}},\n\nWe want to share a mission update from Prayer & Fire Global Movement.\n\nYour prayers and support help us continue serving people and communities across nations.\n\nThank you for being part of this global vision.'
    },
    event: {
      subject: 'You Are Invited | Prayer & Fire',
      preheader: 'Join our next Prayer & Fire gathering.',
      message: 'Peace of the Lord Jesus, {{first_name}}.\n\nYou are invited to join our next Prayer & Fire gathering.\n\nWe would be honored to have you with us as we pray, worship and seek the presence of the Lord together.\n\nWe hope to see you there.'
    },
    intercession: {
      subject: 'Intercession Call | Prayer & Fire',
      preheader: 'A call to stand with us in prayer.',
      message: 'Peace of the Lord Jesus, {{first_name}}.\n\nPrayer & Fire is strengthening its network of intercessors and we are inviting committed believers to stand with us in prayer.\n\nThank you for your faithfulness and for helping carry this vision in prayer.'
    }
  };

  function subscribers() {
    try {
      return Array.isArray(subscriberData) ? subscriberData : [];
    } catch (_) {
      return [];
    }
  }

  function selectedCheckboxes() {
    return [...document.querySelectorAll('.subscriberCheckbox:checked')];
  }

  function selectedIds() {
    const emails = new Set(selectedCheckboxes().map(cb => String(cb.dataset.email || '').trim().toLowerCase()).filter(Boolean));
    return subscribers()
      .filter(item => emails.has(String(item.email || '').trim().toLowerCase()))
      .map(item => String(item.id));
  }

  function updateStats() {
    const data = subscribers();
    const countries = new Set(data.map(item => String(item.country || '').trim()).filter(Boolean));
    $('subscriberTotalStat').textContent = String(data.length);
    $('subscriberSelectedStat').textContent = String(selectedCheckboxes().length);
    $('subscriberCountryStat').textContent = String(countries.size);

    const visible = [...list.querySelectorAll('.adminRow')].filter(row => !row.classList.contains('subscriberHidden')).length;
    $('subscriberVisibleCount').textContent = `${visible} visible · ${selectedCheckboxes().length} selected`;
  }

  function rebuildCountryFilter() {
    const select = $('subscriberCountryFilter');
    const current = select.value;
    const countries = [...new Set(subscribers().map(item => String(item.country || '').trim()).filter(Boolean))]
      .sort((a,b) => a.localeCompare(b));
    select.innerHTML = '<option value="">All countries</option>' + countries.map(country => `<option value="${escLocal(country)}">${escLocal(country)}</option>`).join('');
    if (countries.includes(current)) select.value = current;
  }

  function applyFilters() {
    const query = state.query.toLowerCase();
    const country = state.country.toLowerCase();
    const rows = [...list.querySelectorAll('.adminRow')];
    let visible = 0;

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const matchesCountry = !country || text.includes(country);
      const show = matchesQuery && matchesCountry;
      row.classList.toggle('subscriberHidden', !show);
      if (show) visible++;
    });

    const oldEmpty = list.querySelector('.subscriberListEmpty');
    if (rows.length && visible === 0) {
      if (!oldEmpty) {
        const empty = document.createElement('div');
        empty.className = 'subscriberListEmpty';
        empty.textContent = 'No subscribers match this filter.';
        list.appendChild(empty);
      }
    } else if (oldEmpty) {
      oldEmpty.remove();
    }
    updateStats();
  }

  function attachCheckboxListeners() {
    document.querySelectorAll('.subscriberCheckbox').forEach(cb => {
      if (cb.dataset.workspaceBound === 'true') return;
      cb.dataset.workspaceBound = 'true';
      cb.addEventListener('change', updateStats);
    });
  }

  function refreshAudienceUi() {
    rebuildCountryFilter();
    attachCheckboxListeners();
    applyFilters();
  }

  const observer = new MutationObserver(() => refreshAudienceUi());
  observer.observe(list, { childList: true, subtree: true });

  $('subscriberSearch').addEventListener('input', (event) => {
    state.query = event.target.value.trim();
    applyFilters();
  });

  $('subscriberCountryFilter').addEventListener('change', (event) => {
    state.country = event.target.value.trim();
    applyFilters();
  });

  $('selectVisibleSubscribers').onclick = () => {
    [...list.querySelectorAll('.adminRow:not(.subscriberHidden) .subscriberCheckbox')].forEach(cb => cb.checked = true);
    updateStats();
  };

  $('clearVisibleSubscribers').onclick = () => {
    [...list.querySelectorAll('.adminRow:not(.subscriberHidden) .subscriberCheckbox')].forEach(cb => cb.checked = false);
    updateStats();
  };

  const legacySelectAll = $('selectAllSubscribers');
  if (legacySelectAll) legacySelectAll.onclick = () => {
    document.querySelectorAll('.subscriberCheckbox').forEach(cb => cb.checked = true);
    updateStats();
  };

  const legacyClear = $('clearSubscriberSelection');
  if (legacyClear) legacyClear.onclick = () => {
    document.querySelectorAll('.subscriberCheckbox').forEach(cb => cb.checked = false);
    updateStats();
  };

  $('exportSubscribersCsv').onclick = () => {
    const data = subscribers();
    if (!data.length) return;
    const quote = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Name','Email','Country','Subscribed At'],
      ...data.map(item => [item.name || '', item.email || '', item.country || '', item.created_at || ''])
    ];
    const csv = rows.map(row => row.map(quote).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prayer-fire-subscribers-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const draftFields = ['newsletterSubject','newsletterPreheader','newsletterMessage','newsletterButtonLabel','newsletterButtonUrl'];
  const DRAFT_KEY = 'pf_newsletter_draft_v1';

  function saveDraft() {
    try {
      const draft = Object.fromEntries(draftFields.map(id => [id, $(id).value]));
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      $('newsletterDraftStatus').textContent = 'Draft saved automatically on this device';
    } catch (_) {}
  }

  function loadDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
      draftFields.forEach(id => { if (typeof draft[id] === 'string') $(id).value = draft[id]; });
    } catch (_) {}
    updateCharCount();
  }

  function updateCharCount() {
    $('newsletterCharCount').textContent = `${$('newsletterMessage').value.length} characters`;
  }

  draftFields.forEach(id => {
    $(id).addEventListener('input', () => {
      saveDraft();
      updateCharCount();
    });
  });

  $('newsletterTemplate').onchange = (event) => {
    const template = templates[event.target.value];
    if (!template) return;
    const hasContent = $('newsletterSubject').value.trim() || $('newsletterMessage').value.trim();
    if (hasContent && !confirm('Replace the current draft with this template?')) {
      event.target.value = '';
      return;
    }
    $('newsletterSubject').value = template.subject;
    $('newsletterPreheader').value = template.preheader;
    $('newsletterMessage').value = template.message;
    saveDraft();
    updateCharCount();
  };

  document.querySelectorAll('[data-merge]').forEach(button => {
    button.onclick = () => {
      const textarea = $('newsletterMessage');
      const token = button.dataset.merge || '';
      const start = textarea.selectionStart ?? textarea.value.length;
      const end = textarea.selectionEnd ?? textarea.value.length;
      textarea.value = textarea.value.slice(0,start) + token + textarea.value.slice(end);
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + token.length;
      saveDraft();
      updateCharCount();
    };
  });

  $('clearNewsletterDraft').onclick = () => {
    if (!confirm('Clear the current message draft?')) return;
    draftFields.forEach(id => $(id).value = '');
    $('newsletterTemplate').value = '';
    try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
    $('newsletterPreviewBox').classList.remove('show');
    updateCharCount();
    setStatus($('newsletterSendStatus'), 'Draft cleared.', 'ok');
  };

  function previewMessage() {
    const subject = $('newsletterSubject').value.trim() || 'Message subject';
    const message = $('newsletterMessage').value.trim() || 'Your message preview will appear here.';
    const sampleName = subscribers()[0]?.name || 'Friend';
    const sampleCountry = subscribers()[0]?.country || '';
    const personalize = (value) => value
      .replace(/{{\s*first_name\s*}}/gi, sampleName.split(/\s+/)[0] || 'Friend')
      .replace(/{{\s*name\s*}}/gi, sampleName)
      .replace(/{{\s*country\s*}}/gi, sampleCountry);

    $('newsletterPreviewSubject').textContent = personalize(subject);
    $('newsletterPreviewMessage').textContent = personalize(message);
    const label = $('newsletterButtonLabel').value.trim();
    const button = $('newsletterPreviewButton');
    if (label) {
      button.textContent = label;
      button.style.display = 'inline-block';
    } else {
      button.style.display = 'none';
    }
    $('newsletterPreviewBox').classList.add('show');
    $('newsletterPreviewBox').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  $('previewNewsletter').onclick = previewMessage;

  async function invokeNewsletter(body) {
    const s = await getSb();
    const result = await s.functions.invoke('send-newsletter', { body });
    if (result.error) {
      let details = null;
      try { details = await result.error.context?.json(); } catch (_) {}
      if (details) return details;
      throw result.error;
    }
    return result.data || {};
  }

  function validateComposer() {
    const subject = $('newsletterSubject').value.trim();
    const message = $('newsletterMessage').value.trim();
    const buttonUrl = $('newsletterButtonUrl').value.trim();
    const buttonLabel = $('newsletterButtonLabel').value.trim();
    if (!subject) return 'Enter an email subject.';
    if (!message) return 'Write the message before sending.';
    if ((buttonLabel && !buttonUrl) || (!buttonLabel && buttonUrl)) return 'For the email button, enter both the button text and its link.';
    if (buttonUrl) {
      try {
        const url = new URL(buttonUrl);
        if (!['http:','https:'].includes(url.protocol)) return 'The button link must begin with http:// or https://.';
      } catch (_) { return 'Enter a valid button link.'; }
    }
    return '';
  }

  async function sendNewsletter(mode) {
    if (state.sending) return;
    const validation = validateComposer();
    if (validation) {
      setStatus($('newsletterSendStatus'), validation, 'error');
      return;
    }

    const ids = selectedIds();
    const allCount = subscribers().length;
    const targetCount = mode === 'all' ? allCount : ids.length;
    if (!targetCount) {
      setStatus($('newsletterSendStatus'), mode === 'all' ? 'There are no subscribers to email.' : 'Select at least one subscriber first.', 'error');
      return;
    }

    const subject = $('newsletterSubject').value.trim();
    if (!confirm(`Send “${subject}” to ${targetCount} subscriber${targetCount === 1 ? '' : 's'}?`)) return;

    state.sending = true;
    const selectedButton = mode === 'all' ? $('sendAllNewsletter') : $('sendSelectedNewsletter');
    const originalText = selectedButton.textContent;
    selectedButton.disabled = true;
    $('sendSelectedNewsletter').disabled = true;
    $('sendAllNewsletter').disabled = true;
    selectedButton.textContent = 'Sending...';
    setStatus($('newsletterSendStatus'), `Sending to ${targetCount} subscriber${targetCount === 1 ? '' : 's'}...`);

    try {
      const data = await invokeNewsletter({
        action: 'send',
        recipientIds: mode === 'selected' ? ids : [],
        allSubscribers: mode === 'all',
        subject,
        preheader: $('newsletterPreheader').value.trim(),
        message: $('newsletterMessage').value.trim(),
        buttonLabel: $('newsletterButtonLabel').value.trim(),
        buttonUrl: $('newsletterButtonUrl').value.trim()
      });

      const sent = Number(data.sent || 0);
      const failed = Number(data.failedCount || 0);
      if (sent > 0 && failed === 0) {
        setStatus($('newsletterSendStatus'), `Sent successfully to ${sent} subscriber${sent === 1 ? '' : 's'}.`, 'ok');
      } else if (sent > 0) {
        setStatus($('newsletterSendStatus'), `Sent to ${sent}. ${failed} could not be delivered.`, 'error');
      } else {
        setStatus($('newsletterSendStatus'), data.error || 'The message could not be sent.', 'error');
      }
      await loadCampaignHistory();
    } catch (error) {
      console.error(error);
      setStatus($('newsletterSendStatus'), error?.message || 'Unable to send the message right now.', 'error');
    } finally {
      state.sending = false;
      selectedButton.textContent = originalText;
      $('sendSelectedNewsletter').disabled = false;
      $('sendAllNewsletter').disabled = false;
    }
  }

  $('sendSelectedNewsletter').onclick = () => sendNewsletter('selected');
  $('sendAllNewsletter').onclick = () => sendNewsletter('all');

  async function loadCampaignHistory() {
    const box = $('campaignHistory');
    box.innerHTML = '<span class="status">Loading history...</span>';
    try {
      const data = await invokeNewsletter({ action: 'history' });
      const campaigns = Array.isArray(data.campaigns) ? data.campaigns : [];
      if (!campaigns.length) {
        box.innerHTML = '<span class="status">No campaigns have been sent yet.</span>';
        return;
      }
      box.innerHTML = campaigns.map(item => {
        const date = item.created_at ? new Date(item.created_at).toLocaleString() : '';
        const statusClass = ['sent','partial','failed'].includes(item.status) ? item.status : '';
        return `<div class="campaignItem"><div class="campaignTop"><strong>${escLocal(item.subject || 'Untitled message')}</strong><span class="campaignBadge ${statusClass}">${escLocal(item.status || 'sent')}</span></div><div class="campaignMeta">${escLocal(date)} · ${Number(item.sent_count || 0)} sent · ${Number(item.failed_count || 0)} failed · ${Number(item.recipient_count || 0)} recipients</div></div>`;
      }).join('');
    } catch (error) {
      console.error(error);
      box.innerHTML = `<span class="status error">${escLocal(error?.message || 'Unable to load campaign history.')}</span>`;
    }
  }

  $('refreshCampaignHistory').onclick = loadCampaignHistory;

  const tabButton = document.querySelector('[data-tab="subscribersAdmin"]');
  if (tabButton) {
    tabButton.addEventListener('click', () => {
      setTimeout(() => {
        refreshAudienceUi();
        if (!state.historyLoaded) {
          state.historyLoaded = true;
          loadCampaignHistory();
        }
      }, 120);
    });
  }

  loadDraft();
  refreshAudienceUi();
})();