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
          </div>
        </div>`;
      }).join('');

      box.querySelectorAll('[data-campaign-action]').forEach(button => {
        button.addEventListener('click', async () => {
          const id = button.dataset.campaignId || '';
          const action = button.dataset.campaignAction || '';
          if (!id || !['hide','show'].includes(action)) return;
          const verb = action === 'hide' ? 'hide' : 'restore';
          if (!confirm(`${verb === 'hide' ? 'Hide' : 'Restore'} this campaign in the dashboard history?`)) return;
          button.disabled = true;
          const old = button.textContent;
          button.textContent = action === 'hide' ? 'Hiding...' : 'Restoring...';
          try {
            await invokeCampaigns({ action, id });
            await loadEnhancedHistory();
          } catch (error) {
            console.error(error);
            alert(error?.message || `Unable to ${verb} this campaign.`);
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