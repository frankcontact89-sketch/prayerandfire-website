(() => {
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let showHidden = false;
  let busy = false;
  let initialized = false;

  async function invokeCampaigns(body) {
    const s = await getSb();
    const result = await s.functions.invoke('newsletter-campaign-actions', { body });
    if (result.error) {
      let details = null;
      try { details = await result.error.context?.json(); } catch (_) {}
      if (details?.error) throw new Error(details.error);
      throw result.error;
    }
    if (result.data?.error) throw new Error(result.data.error);
    return result.data || {};
  }

  function ensureStyles() {
    if (document.getElementById('campaignActionStyles')) return;
    const style = document.createElement('style');
    style.id = 'campaignActionStyles';
    style.textContent = `
      .campaignHistoryControls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}
      .campaignActionBtn{min-height:34px;padding:7px 12px;border-radius:999px;border:1px solid var(--border);background:#17191e;color:#fff;font-size:11px;font-weight:800;cursor:pointer}
      .campaignActionBtn:hover{background:#22252c}
      .campaignActionBtn.hide{color:#fca5a5;border-color:rgba(239,68,68,.35)}
      .campaignActionBtn.show{color:#86efac;border-color:rgba(34,197,94,.35)}
      .campaignActionBtn.delete{color:#fecaca;border-color:rgba(239,68,68,.55);background:rgba(127,29,29,.18)}
      .campaignActionBtn.delete:hover{background:rgba(127,29,29,.34)}
      .campaignItem.isHidden{opacity:.62}
      .campaignHiddenTag{display:inline-flex;margin-left:7px;padding:3px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.16);color:var(--muted);font-size:9px;font-weight:800;text-transform:uppercase;vertical-align:middle}
      .campaignToolbarEnhanced{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .campaignToolbarEnhanced .adminBtn{min-height:40px;padding:9px 14px}
      @media(max-width:640px){.campaignHistoryControls{margin-top:9px}.campaignActionBtn{width:100%;justify-content:center}.campaignToolbarEnhanced .adminBtn{flex:1 1 100%}}
    `;
    document.head.appendChild(style);
  }

  function setMessage(box, text, error = false) {
    box.innerHTML = `<span class="status${error ? ' error' : ''}">${esc(text)}</span>`;
  }

  function setCampaignError(message) {
    const panel = document.getElementById('campaignHistory')?.closest('.subscriberPanel');
    if (!panel) return;
    let status = panel.querySelector('#campaignActionStatus');
    if (!status) {
      status = document.createElement('p');
      status.id = 'campaignActionStatus';
      status.className = 'status error';
      panel.querySelector('#campaignHistory')?.before(status);
    }
    status.textContent = message;
  }

  function requestConfirmation(message) {
    return new Promise(resolve => {
      const panel = document.getElementById('campaignHistory')?.closest('.subscriberPanel');
      if (!panel) return resolve(false);
      let area = panel.querySelector('#campaignConfirmArea');
      if (!area) {
        area = document.createElement('div');
        area.id = 'campaignConfirmArea';
        area.style.cssText = 'border:1px solid #bb8542;border-radius:14px;padding:14px;margin:12px 0;background:#242024';
        const line = document.createElement('p'); line.id='campaignConfirmQuestion';
        line.style.cssText='font-weight:700;margin:0 0 12px';
        const yes = document.createElement('button'); yes.type='button';yes.textContent='Confirm';yes.className='adminBtn primaryBtn';
        const no = document.createElement('button');no.type='button';no.textContent='Cancel';no.className='adminBtn';
        area.append(line,yes,no);
        panel.querySelector('#campaignHistory')?.before(area);
      }
      const buttons = area.querySelectorAll('button');
      area.querySelector('#campaignConfirmQuestion').textContent = message;
      area.hidden = false; area.style.display='block';
      buttons[0].onclick = () => { area.hidden=true;area.style.display='none';resolve(true); };
      buttons[1].onclick = () => { area.hidden=true;area.style.display='none';resolve(false); };
      area.scrollIntoView({block:'nearest',behavior:'smooth'});
    });
  }

  async function loadEnhancedHistory() {
    if (busy) return;
    const box = document.getElementById('campaignHistory');
    if (!box) return;
    busy = true;
    setMessage(box, 'Loading history...');
    try {
      const data = await invokeCampaigns({ action: 'history', includeHidden: showHidden });
      const campaigns = Array.isArray(data.campaigns) ? data.campaigns : [];
      if (!campaigns.length) {
        setMessage(box, showHidden ? 'No campaigns are available.' : 'No visible campaigns. Use “Show Hidden” to view hidden history.');
        return;
      }
      box.innerHTML = campaigns.map(item => {
        const date = item.created_at ? new Date(item.created_at).toLocaleString() : '';
        const statusClass = ['sent','partial','failed'].includes(item.status) ? item.status : '';
        const hidden = item.hidden === true;
        return `<div class="campaignItem${hidden ? ' isHidden' : ''}" data-campaign-id="${esc(item.id)}">
          <div class="campaignTop">
            <strong>${esc(item.subject || 'Untitled message')}${hidden ? '<span class="campaignHiddenTag">Hidden</span>' : ''}</strong>
            <span class="campaignBadge ${statusClass}">${esc(item.status || 'sent')}</span>
          </div>
          <div class="campaignMeta">${esc(date)} · ${Number(item.sent_count || 0)} sent · ${Number(item.failed_count || 0)} failed · ${Number(item.recipient_count || 0)} recipients</div>
          <div class="campaignHistoryControls">
            <button type="button" class="campaignActionBtn ${hidden ? 'show' : 'hide'}" data-campaign-action="${hidden ? 'show' : 'hide'}" data-campaign-id="${esc(item.id)}">${hidden ? 'Restore' : 'Hide'}</button>
            <button type="button" class="campaignActionBtn delete" data-campaign-action="delete" data-campaign-id="${esc(item.id)}">Delete</button>
          </div>
        </div>`;
      }).join('');

      box.querySelectorAll('[data-campaign-action]').forEach(button => {
        button.addEventListener('click', async () => {
          const id = button.dataset.campaignId || '';
          const action = button.dataset.campaignAction || '';
          if (!id || !['hide','show','delete'].includes(action)) return;

          const verb = action === 'hide' ? 'Hide' : action === 'show' ? 'Restore' : 'Delete permanently';
          const approved = await requestConfirmation(verb + ' this campaign?' + (action === 'delete' ? ' This cannot be undone.' : ''));
          if (!approved) return;

          button.disabled = true;
          const old = button.textContent;
          button.textContent = action === 'hide' ? 'Hiding...' : action === 'show' ? 'Restoring...' : 'Deleting...';
          try {
            await invokeCampaigns({ action, id });
            setTimeout(() => loadEnhancedHistory(), 0);
          } catch (error) {
            console.error(error);
            setCampaignError(error?.message || `Unable to ${action} this campaign.`);
            button.disabled = false;
            button.textContent = old;
          }
        });
      });
    } catch (error) {
      console.error(error);
      setMessage(box, error?.message || 'Unable to load campaign history.', true);
    } finally {
      busy = false;
    }
  }

  function enhancePanel() {
    const box = document.getElementById('campaignHistory');
    const refresh = document.getElementById('refreshCampaignHistory');
    if (!box || !refresh) return false;
    ensureStyles();

    const panel = box.closest('.subscriberPanel');
    if (panel && !panel.querySelector('.campaignToolbarEnhanced')) {
      const toolbar = document.createElement('div');
      toolbar.className = 'campaignToolbarEnhanced';
      toolbar.innerHTML = '<button class="adminBtn" id="toggleHiddenCampaigns" type="button">Show Hidden</button>';
      const header = panel.querySelector('.campaignTop');
      if (header) header.after(toolbar);
      else box.before(toolbar);
      document.getElementById('toggleHiddenCampaigns').onclick = async () => {
        showHidden = !showHidden;
        document.getElementById('toggleHiddenCampaigns').textContent = showHidden ? 'Hide Hidden' : 'Show Hidden';
        await loadEnhancedHistory();
      };
    }

    refresh.onclick = loadEnhancedHistory;

    if (!box.dataset.enhancedHistoryObserver) {
      box.dataset.enhancedHistoryObserver = 'true';
      const observer = new MutationObserver(() => {
        if (busy) return;
        const hasActions = !!box.querySelector('[data-campaign-action]');
        const isLoading = box.textContent.includes('Loading history');
        if (!hasActions && !isLoading) setTimeout(loadEnhancedHistory, 80);
      });
      observer.observe(box, { childList: true, subtree: true });
    }

    if (!initialized) {
      initialized = true;
      loadEnhancedHistory();
    }
    return true;
  }

  const timer = setInterval(() => {
    if (enhancePanel()) clearInterval(timer);
  }, 180);
  setTimeout(() => clearInterval(timer), 15000);

  document.addEventListener('click', (event) => {
    const tab = event.target.closest?.('[data-tab="subscribersAdmin"]');
    if (tab) setTimeout(() => { enhancePanel(); loadEnhancedHistory(); }, 180);
  });
})();