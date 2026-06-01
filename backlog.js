// backlog.js — Discord Backlog tab extension
// Patches into App after app.js loads

(function() {
  App.renderBacklog = function() {
    const tbody = document.getElementById('backlog-table');
    if (!tbody) return;

    const raw = this.data.backlog;
    const candidates = raw?.candidates || [];
    const countEl = document.getElementById('backlog-count');

    if (!candidates.length) {
      const placeholder = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 6;
      td.className = 'py-8 text-center text-gray-500';
      td.textContent = 'No backlog candidates — run generate_backlog.py to populate';
      placeholder.appendChild(td);
      tbody.replaceChildren(placeholder);
      return;
    }

    // Populate country filter (once)
    const countrySelect = document.getElementById('backlog-filter-country');
    if (countrySelect && countrySelect.options.length === 1) {
      const countries = [...new Set(candidates.map(c => c.country).filter(Boolean).sort())];
      countries.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        countrySelect.appendChild(opt);
      });
    }

    const renderRows = () => {
      const search = (document.getElementById('backlog-search')?.value || '').toLowerCase();
      const countryFilter = document.getElementById('backlog-filter-country')?.value || '';

      const filtered = candidates.filter(c => {
        if (countryFilter && c.country !== countryFilter) return false;
        if (search) {
          const haystack = [c.name, c.country, c.role, c.contacts?.discord].join(' ').toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      });

      const rows = filtered.map(c => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-[#1a1a2e] transition-colors';

        // Name + verified badge
        const tdName = document.createElement('td');
        tdName.className = 'py-3 px-2';
        const nameLink = document.createElement('a');
        nameLink.href = c.ytjobsUrl || '#';
        nameLink.target = '_blank';
        nameLink.className = 'text-purple-400 hover:text-purple-300 font-medium';
        nameLink.textContent = c.name || 'Unknown';
        tdName.appendChild(nameLink);
        if (c.verified) {
          const badge = document.createElement('span');
          badge.className = 'ml-1 text-xs bg-blue-900/50 text-blue-300 px-1 rounded';
          badge.textContent = '✓';
          tdName.appendChild(badge);
        }

        // Role
        const tdRole = document.createElement('td');
        tdRole.className = 'py-3 px-2 text-gray-400 text-xs max-w-xs truncate';
        tdRole.textContent = (typeof c.role === 'string' ? c.role : '') || '—';

        // Country
        const tdCountry = document.createElement('td');
        tdCountry.className = 'py-3 px-2 text-gray-300 text-xs';
        tdCountry.textContent = (c.flag || '') + ' ' + (c.country || 'Unknown');

        // Discord — click to copy
        const tdDiscord = document.createElement('td');
        tdDiscord.className = 'py-3 px-2 text-xs';
        const discord = c.contacts?.discord;
        if (discord) {
          const code = document.createElement('code');
          code.className = 'bg-[#252540] text-indigo-300 px-2 py-1 rounded cursor-pointer hover:bg-[#353560] select-all';
          code.textContent = '@' + discord;
          code.title = 'Click to copy';
          code.addEventListener('click', () => {
            navigator.clipboard?.writeText(discord).catch(() => {});
            code.textContent = '✓ copied';
            setTimeout(() => { code.textContent = '@' + discord; }, 1200);
          });
          tdDiscord.appendChild(code);
        } else {
          tdDiscord.textContent = '—';
          tdDiscord.className += ' text-gray-500';
        }

        // Score
        const tdScore = document.createElement('td');
        const score = c.score || 0;
        tdScore.className = 'py-3 px-2 text-right text-xs font-mono ' +
          (score >= 8 ? 'text-green-400' : score >= 6 ? 'text-yellow-400' : 'text-gray-400');
        tdScore.textContent = score.toFixed(1);

        // Profile link
        const tdProfile = document.createElement('td');
        tdProfile.className = 'py-3 px-2 text-xs';
        const profileLink = document.createElement('a');
        profileLink.href = c.ytjobsUrl || '#';
        profileLink.target = '_blank';
        profileLink.className = 'text-gray-500 hover:text-gray-300 underline';
        profileLink.textContent = 'View →';
        tdProfile.appendChild(profileLink);

        tr.append(tdName, tdRole, tdCountry, tdDiscord, tdScore, tdProfile);
        return tr;
      });

      tbody.replaceChildren(...rows);
      if (countEl) countEl.textContent = filtered.length + ' of ' + candidates.length + ' candidates — ' + (raw?.note || '');
    };

    renderRows();

    // Wire up search/filter (only once — check for sentinel attribute)
    const search = document.getElementById('backlog-search');
    const filterSelect = document.getElementById('backlog-filter-country');
    if (search && !search.dataset.wired) {
      search.dataset.wired = '1';
      search.addEventListener('input', renderRows);
    }
    if (filterSelect && !filterSelect.dataset.wired) {
      filterSelect.dataset.wired = '1';
      filterSelect.addEventListener('change', renderRows);
    }
  };

  // Patch renderAll to include renderBacklog
  const _origRenderAll = App.renderAll.bind(App);
  App.renderAll = function() {
    _origRenderAll();
    this.renderBacklog();
  };

  // Also fetch backlog data (in case loadAllData already ran before this script patched in)
  App.fetchJSON('backlog', 'data/ytjobs_backlog.json').then(() => {
    App.renderBacklog();
  }).catch(() => {});
})();
