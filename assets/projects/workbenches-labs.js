(function registerProjectWorkbenchLabs(global) {
  'use strict';

  const esc = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const fmt = value => typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : String(value);
  const query = (root, selector) => root.querySelector(selector);
  const queryAll = (root, selector) => Array.from(root.querySelectorAll(selector));
  function seedRandom(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i += 1) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    return () => {
      h += 0x6d2b79f5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function lifecycle() {
    const timeouts = new Set();
    const intervals = new Set();
    const frames = new Set();
    const listeners = [];
    let destroyed = false;
    const api = {
      later(fn, delay) {
        const id = global.setTimeout(() => {
          timeouts.delete(id);
          if (!destroyed) fn();
        }, delay);
        timeouts.add(id);
        return id;
      },
      every(fn, delay) {
        const id = global.setInterval(() => { if (!destroyed) fn(); }, delay);
        intervals.add(id);
        return id;
      },
      frame(fn) {
        const id = global.requestAnimationFrame(time => {
          frames.delete(id);
          if (!destroyed) fn(time);
        });
        frames.add(id);
        return id;
      },
      on(target, type, fn, options) {
        if (!target) return;
        target.addEventListener(type, fn, options);
        listeners.push([target, type, fn, options]);
      },
      cancelJobs() {
        timeouts.forEach(id => global.clearTimeout(id));
        intervals.forEach(id => global.clearInterval(id));
        frames.forEach(id => global.cancelAnimationFrame(id));
        timeouts.clear(); intervals.clear(); frames.clear();
      },
      destroy() {
        destroyed = true;
        api.cancelJobs();
        listeners.forEach(([target, type, fn, options]) => target.removeEventListener(type, fn, options));
        listeners.length = 0;
      }
    };
    return api;
  }

  function shell(host, head, type, body) {
    host.innerHTML = `${head || ''}<div class="wb-lab wb-${esc(type)}">${body}</div>`;
    return query(host, '.wb-lab');
  }

  function setLive(root, text, tone) {
    const node = query(root, '[data-wb-live]');
    if (!node) return;
    node.className = `wb-live ${tone || ''}`.trim();
    node.innerHTML = `<i></i><span>${esc(text)}</span>`;
  }

  function json(value) {
    return `<pre class="wb-json">${esc(JSON.stringify(value, null, 2))}</pre>`;
  }

  function agentStudio(spec, host, head, ctx) {
    const life = lifecycle();
    let generation = 0;
    const root = shell(host, head, 'agent-studio', `
      <div class="wb-command">
        <label class="wb-label" for="wb-agent-prompt">Engineering request</label>
        <textarea id="wb-agent-prompt" class="wb-input wb-prompt" rows="3">Find the released rotor assembly, inspect its mounting geometry, and summarize the open change impact.</textarea>
        <div class="wb-permissions" aria-label="Tool permissions">
          <label><input type="checkbox" data-permission="retrieve" checked> Retrieval read</label>
          <label><input type="checkbox" data-permission="cad" checked> CAD inspect</label>
          <label><input type="checkbox" data-permission="plm" checked> PLM trace</label>
        </div>
        <button class="wb-btn primary" data-agent-run>Plan and execute</button>
        <span class="wb-live" data-wb-live aria-live="polite"><i></i><span>Ready · governed tools idle</span></span>
      </div>
      <div class="wb-agent-grid">
        <section class="wb-panel"><div class="wb-panel-head"><span>01</span><b>Planner</b><small>intent → typed calls</small></div><div data-agent-plan class="wb-plan-empty">Submit the request to reveal the governed plan.</div></section>
        <section class="wb-panel"><div class="wb-panel-head"><span>02</span><b>Tool trace</b><small>schemas + results</small></div><div data-agent-calls class="wb-call-stack"></div></section>
      </div>
      <section class="wb-answer" data-agent-answer aria-live="polite"><span class="wb-answer-kicker">Composed answer</span><p>Evidence-backed output will appear after the permitted calls complete.</p></section>`);

    const tools = [
      { permission: 'retrieve', name: 'catalog.search_released', label: 'Retrieve released item', schema: { query: 'string', status: 'RELEASED', limit: 'integer ≤ 10' }, result: { item_id: 'ASM-204', revision: 'C', name: 'Rotor Assembly', confidence: 0.98 }, citation: '[1]' },
      { permission: 'cad', name: 'nx.inspect_mounting', label: 'Inspect CAD geometry', schema: { item_id: 'string', measurements: ['bolt_circle', 'bore_diameter'] }, result: { bolt_circle_mm: 168, bore_diameter_mm: 72, faces_checked: 18 }, citation: '[2]' },
      { permission: 'plm', name: 'tc.trace_change_impact', label: 'Trace PLM impact', schema: { item_id: 'string', direction: 'downstream', depth: '1..3' }, result: { change: 'ECN-SAMPLE-42', affected: ['Drawing', 'Mounting Plate'], gate: 'Review required' }, citation: '[3]' }
    ];

    function run() {
      life.cancelJobs();
      const turn = ++generation;
      const prompt = query(root, '#wb-agent-prompt').value.trim();
      const allowed = new Set(queryAll(root, '[data-permission]:checked').map(x => x.dataset.permission));
      const plan = query(root, '[data-agent-plan]');
      const calls = query(root, '[data-agent-calls]');
      const answer = query(root, '[data-agent-answer]');
      plan.innerHTML = tools.map((tool, index) => `<div class="wb-plan-step ${allowed.has(tool.permission) ? '' : 'blocked'}" data-plan-step="${index}"><span>${String(index + 1).padStart(2, '0')}</span><div><b>${esc(tool.label)}</b><small>${esc(tool.name)}</small></div><em>${allowed.has(tool.permission) ? 'queued' : 'permission blocked'}</em></div>`).join('');
      calls.innerHTML = '';
      answer.innerHTML = '<span class="wb-answer-kicker">Composed answer</span><p>Waiting for governed evidence…</p>';
      setLive(root, `Planning · ${prompt.split(/\s+/).length} tokens`, 'busy');
      tools.forEach((tool, index) => life.later(() => {
        if (turn !== generation) return;
        const permitted = allowed.has(tool.permission);
        const step = query(root, `[data-plan-step="${index}"]`);
        step.classList.add(permitted ? 'done' : 'blocked');
        step.querySelector('em').textContent = permitted ? 'verified' : 'blocked';
        calls.insertAdjacentHTML('beforeend', `<article class="wb-tool-call ${permitted ? 'ok' : 'denied'}">
          <header><span>${permitted ? '200' : '403'}</span><b>${esc(tool.name)}</b><em>${permitted ? tool.citation : 'policy'}</em></header>
          <details ${index === 0 ? 'open' : ''}><summary>Input schema</summary>${json(tool.schema)}</details>
          <details ${permitted ? 'open' : ''}><summary>${permitted ? 'Verified result' : 'Denied result'}</summary>${json(permitted ? tool.result : { error: 'permission_not_granted', tool: tool.name })}</details>
        </article>`);
      }, 180 + index * 330));
      life.later(() => {
        if (turn !== generation) return;
        const citations = tools.filter(t => allowed.has(t.permission)).map(t => t.citation).join(' ');
        answer.innerHTML = `<span class="wb-answer-kicker">Composed answer · cited</span><h5>Rotor Assembly · Rev C</h5><p>The released assembly uses a <b>168 mm bolt circle</b> around a <b>72 mm bore</b>. A sample engineering change affects its drawing and mounting plate; review is required before release. <span class="wb-citations">${esc(citations || '[no evidence permitted]')}</span></p>`;
        setLive(root, allowed.size ? `Complete · ${allowed.size} governed results` : 'Stopped · no permissions granted', allowed.size ? 'ok' : 'warn');
      }, 180 + tools.length * 330);
    }
    life.on(query(root, '[data-agent-run]'), 'click', run);
    return () => { generation += 1; life.destroy(); };
  }

  function modelLab(spec, host, head, ctx) {
    const life = lifecycle();
    let generation = 0;
    const profiles = {
      'Local 8B': { latency: 210, tokens: 118, quality: 78, source: 'workstation' },
      'Local 32B': { latency: 520, tokens: 142, quality: 89, source: 'workstation' },
      'Hosted frontier': { latency: 360, tokens: 156, quality: 94, source: 'governed endpoint' },
      'Reasoning 70B': { latency: 840, tokens: 171, quality: 92, source: 'private cluster' }
    };
    const names = Object.keys(profiles);
    const root = shell(host, head, 'model-lab', `
      <div class="wb-command">
        <label class="wb-label" for="wb-model-prompt">Shared engineering prompt</label>
        <textarea id="wb-model-prompt" class="wb-input wb-prompt" rows="3">Explain the release impact of replacing the rotor material, separating facts from assumptions.</textarea>
        <button class="wb-btn primary" data-model-run>Run parallel comparison</button>
        <span class="wb-live" data-wb-live aria-live="polite"><i></i><span>Ready · three backends selected</span></span>
      </div>
      <div class="wb-model-grid" data-model-grid>${[0, 1, 2].map((_, i) => `<article class="wb-model-pane" data-model-pane="${i}">
        <label class="wb-label" for="wb-backend-${i}">Backend ${i + 1}</label>
        <select id="wb-backend-${i}" class="wb-input" data-backend>${names.map((name, j) => `<option ${i === j ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select>
        <div class="wb-stream" data-stream><span>Awaiting prompt…</span></div>
        <div class="wb-model-metrics"><span>Latency <b data-latency>—</b></span><span>Tokens <b data-tokens>—</b></span><span>Quality <b data-quality>—</b></span></div>
      </article>`).join('')}</div>
      <section class="wb-evidence" data-model-evidence aria-live="polite"><div class="wb-panel-head"><span>EV</span><b>Evaluator evidence</b><small>same rubric · same prompt</small></div><p>Run the models to compare factual separation, change coverage, and unsupported claims.</p></section>`);

    const responses = {
      'Local 8B': 'Facts: the material specification and affected drawing must be revised. Assumption: downstream process settings may change; verify with manufacturing.',
      'Local 32B': 'Verified impact spans the material specification, drawing, and validation plan. Manufacturing parameters are a hypothesis until the process plan is inspected.',
      'Hosted frontier': 'Evidence indicates three release checks: specification revision, drawing consistency, and validation coverage. Treat process-setting changes as an explicit open question.',
      'Reasoning 70B': 'The change is bounded by specification, geometry documentation, and validation evidence. No production impact should be asserted before the linked process plan is retrieved.'
    };

    function run() {
      life.cancelJobs();
      const turn = ++generation;
      const prompt = query(root, '#wb-model-prompt').value.trim();
      const panes = queryAll(root, '[data-model-pane]');
      setLive(root, `Streaming · ${panes.length} backends`, 'busy');
      panes.forEach((pane, paneIndex) => {
        const backend = query(pane, '[data-backend]').value;
        const profile = profiles[backend];
        const target = query(pane, '[data-stream]');
        const words = responses[backend].split(' ');
        target.innerHTML = '<span class="wb-caret">▍</span>';
        query(pane, '[data-latency]').textContent = '…';
        query(pane, '[data-tokens]').textContent = '…';
        query(pane, '[data-quality]').textContent = '…';
        let cursor = 0;
        const tick = () => {
          if (turn !== generation) return;
          cursor = Math.min(words.length, cursor + 4);
          target.innerHTML = `${esc(words.slice(0, cursor).join(' '))}${cursor < words.length ? '<span class="wb-caret"> ▍</span>' : ''}`;
          if (cursor < words.length) life.later(tick, ctx && ctx.reducedMotion ? 10 : 46 + paneIndex * 8);
          else {
            query(pane, '[data-latency]').textContent = `${profile.latency + prompt.length % 47} ms`;
            query(pane, '[data-tokens]').textContent = profile.tokens;
            query(pane, '[data-quality]').textContent = `${profile.quality}/100`;
          }
        };
        life.later(tick, paneIndex * 70);
      });
      life.later(() => {
        if (turn !== generation) return;
        const selected = panes.map(pane => query(pane, '[data-backend]').value);
        const winner = selected.slice().sort((a, b) => profiles[b].quality - profiles[a].quality)[0];
        query(root, '[data-model-evidence]').innerHTML = `<div class="wb-panel-head"><span>EV</span><b>Evaluator evidence</b><small>deterministic rubric</small></div>
          <div class="wb-score-row"><span>Fact / assumption separation</span><b>${esc(winner)}</b><em>${profiles[winner].quality}/100</em></div>
          <div class="wb-score-row"><span>Unsupported claims</span><b>0 flagged</b><em>pass</em></div>
          <div class="wb-score-row"><span>Required evidence cited</span><b>3 / 3</b><em>pass</em></div>`;
        setLive(root, `Complete · ${winner} leads`, 'ok');
      }, ctx && ctx.reducedMotion ? 180 : 1250);
    }
    life.on(query(root, '[data-model-run]'), 'click', run);
    return () => { generation += 1; life.destroy(); };
  }

  function structure(spec, host, head, ctx) {
    const life = lifecycle();
    const rowHeight = 36;
    const expanded = new Set(['ASM-100', 'ASM-200']);
    const pinned = new Set(['revision', 'status']);
    let selected = 'ASM-100';
    let savedQuery = 'released';
    const groups = Array.from({ length: 9 }, (_, gi) => ({
      id: `ASM-${(gi + 1) * 100}`,
      name: ['Rotor Assembly', 'Housing Assembly', 'Cooling Module', 'Drive Train', 'Seal Pack', 'Sensor Module', 'Mounting Frame', 'Service Kit', 'Controls Pack'][gi],
      revision: String.fromCharCode(65 + (gi % 4)), status: gi % 3 === 0 ? 'Review' : 'Released', owner: ['Design', 'Systems', 'Manufacturing'][gi % 3],
      children: Array.from({ length: 22 }, (_, ci) => ({ id: `PRT-${gi + 1}${String(ci + 1).padStart(3, '0')}`, name: `${['Bracket', 'Rotor', 'Fastener', 'Seal', 'Cover', 'Harness'][ci % 6]} ${ci + 1}`, revision: String.fromCharCode(65 + (ci % 3)), status: ci % 7 === 0 ? 'In work' : 'Released', owner: ['Design', 'Analysis', 'Quality'][ci % 3] }))
    }));
    const root = shell(host, head, 'structure', `
      <div class="wb-command compact">
        <label class="wb-label" for="wb-saved-query">Saved query</label>
        <select id="wb-saved-query" class="wb-input" data-structure-query><option value="released">Released product</option><option value="where">Where-used focus</option><option value="review">Release exceptions</option></select>
        <div class="wb-pins" role="group" aria-label="Pinned columns"><span>Pin</span><button class="wb-chip active" data-pin="revision" aria-pressed="true">Revision</button><button class="wb-chip active" data-pin="status" aria-pressed="true">Status</button><button class="wb-chip" data-pin="owner" aria-pressed="false">Owner</button></div>
        <span class="wb-live ok" data-wb-live aria-live="polite"><i></i><span>Ready · virtual window mounted</span></span>
      </div>
      <div class="wb-structure-shell">
        <section class="wb-tree-panel"><div class="wb-tree-head"><b>Product structure</b><span data-structure-count></span></div><div class="wb-tree-columns" data-tree-columns></div><div class="wb-tree-window" data-tree-window role="tree" aria-label="Virtualized product structure"><div class="wb-tree-spacer" data-tree-spacer><div class="wb-tree-slice" data-tree-slice></div></div></div></section>
        <aside class="wb-detail" data-structure-detail aria-live="polite"></aside>
      </div>`);
    const windowEl = query(root, '[data-tree-window]');
    const sliceEl = query(root, '[data-tree-slice]');
    const spacer = query(root, '[data-tree-spacer]');

    function flattened() {
      let rows = [];
      groups.forEach(group => {
        if (savedQuery === 'review' && group.status === 'Released' && !group.children.some(x => x.status !== 'Released')) return;
        rows.push({ ...group, level: 0, group: true });
        if (expanded.has(group.id)) {
          let children = group.children;
          if (savedQuery === 'where') children = children.filter((_, i) => i % 3 === 0);
          if (savedQuery === 'review') children = children.filter(x => x.status !== 'Released');
          rows.push(...children.map(child => ({ ...child, level: 1, parent: group.id })));
        }
      });
      return rows;
    }
    function columns() {
      return ['name', ...pinned].join(' ');
    }
    function renderDetail(row) {
      if (!row) return;
      query(root, '[data-structure-detail]').innerHTML = `<span class="wb-kicker">Selected object</span><h5>${esc(row.name)}</h5><code>${esc(row.id)}</code><dl><div><dt>Revision</dt><dd>${esc(row.revision)}</dd></div><div><dt>Status</dt><dd>${esc(row.status)}</dd></div><div><dt>Owner</dt><dd>${esc(row.owner)}</dd></div>${row.group ? `<div><dt>Children</dt><dd>${row.children.length}</dd></div>` : `<div><dt>Parent</dt><dd>${esc(row.parent)}</dd></div>`}</dl><button class="wb-btn" data-structure-focus>Focus in structure</button>`;
    }
    function render() {
      const startTime = performance.now();
      const rows = flattened();
      const height = windowEl.clientHeight || 340;
      const start = clamp(Math.floor(windowEl.scrollTop / rowHeight) - 2, 0, Math.max(0, rows.length - 1));
      const end = Math.min(rows.length, start + Math.ceil(height / rowHeight) + 5);
      spacer.style.height = `${rows.length * rowHeight}px`;
      sliceEl.style.transform = `translateY(${start * rowHeight}px)`;
      sliceEl.innerHTML = rows.slice(start, end).map(row => `<button class="wb-tree-row ${row.id === selected ? 'selected' : ''}" style="--level:${row.level}" data-row="${esc(row.id)}" role="treeitem" aria-expanded="${row.group ? expanded.has(row.id) : ''}" aria-selected="${row.id === selected}">
        <span class="wb-tree-name">${row.group ? `<i>${expanded.has(row.id) ? '▾' : '▸'}</i>` : '<i>·</i>'}<b>${esc(row.name)}</b><small>${esc(row.id)}</small></span>${pinned.has('revision') ? `<span>${esc(row.revision)}</span>` : ''}${pinned.has('status') ? `<span class="wb-status ${row.status === 'Released' ? 'ok' : 'warn'}">${esc(row.status)}</span>` : ''}${pinned.has('owner') ? `<span>${esc(row.owner)}</span>` : ''}
      </button>`).join('');
      query(root, '[data-tree-columns]').innerHTML = `<b>Object</b>${pinned.has('revision') ? '<span>Rev</span>' : ''}${pinned.has('status') ? '<span>Status</span>' : ''}${pinned.has('owner') ? '<span>Owner</span>' : ''}`;
      root.style.setProperty('--wb-tree-cols', pinned.size ? `minmax(210px,1fr) ${Array.from(pinned).map(() => 'minmax(72px,.35fr)').join(' ')}` : '1fr');
      query(root, '[data-structure-count]').textContent = `${start + 1}–${end} visible · ${rows.length} mounted from 207`;
      setLive(root, `Frame ${(performance.now() - startTime).toFixed(1)} ms · ${end - start} DOM rows`, 'ok');
      const current = rows.find(row => row.id === selected) || rows[0];
      renderDetail(current);
    }
    life.on(windowEl, 'scroll', () => life.frame(render), { passive: true });
    life.on(query(root, '[data-structure-query]'), 'change', event => { savedQuery = event.target.value; windowEl.scrollTop = 0; render(); });
    life.on(root, 'click', event => {
      const pin = event.target.closest('[data-pin]');
      if (pin) { const key = pin.dataset.pin; pinned.has(key) ? pinned.delete(key) : pinned.add(key); pin.classList.toggle('active', pinned.has(key)); pin.setAttribute('aria-pressed', String(pinned.has(key))); render(); return; }
      const button = event.target.closest('[data-row]');
      if (button) { const id = button.dataset.row; const group = groups.find(x => x.id === id); if (group) expanded.has(id) ? expanded.delete(id) : expanded.add(id); selected = id; render(); }
      if (event.target.closest('[data-structure-focus]')) { const rows = flattened(), index = rows.findIndex(x => x.id === selected); windowEl.scrollTop = Math.max(0, index * rowHeight - rowHeight * 2); render(); }
    });
    render();
    return () => life.destroy();
  }

  function configurator(spec, host, head, ctx) {
    const life = lifecycle();
    const root = shell(host, head, 'configurator', `
      <div class="wb-config-grid">
        <section class="wb-panel wb-config-controls">
          <div class="wb-panel-head"><span>CFG</span><b>Requirements</b><small>sample rule model</small></div>
          <label class="wb-label">Cell format<select class="wb-input" data-config="format"><option>Compact</option><option selected>Balanced</option><option>High-throughput</option></select></label>
          <label class="wb-label">Required capacity<select class="wb-input" data-config="capacity"><option value="40">40 units/h</option><option value="70" selected>70 units/h</option><option value="110">110 units/h</option></select></label>
          <label class="wb-label">Motion package<select class="wb-input" data-config="motion"><option>Standard</option><option>Servo</option><option>Precision servo</option></select></label>
          <label class="wb-label">Environment<select class="wb-input" data-config="environment"><option>General</option><option>Washdown</option><option>Cleanroom</option></select></label>
          <button class="wb-btn primary" data-configure>Validate and configure</button>
        </section>
        <section class="wb-panel"><div class="wb-panel-head"><span>RULE</span><b>Constraint trace</b><small>explicit accept / reject</small></div><div data-constraint-trace></div></section>
      </div>
      <section class="wb-config-output" data-config-output aria-live="polite"></section>`);

    const formats = ['Compact', 'Balanced', 'High-throughput'];
    const capacities = [40, 70, 110];
    const motions = ['Standard', 'Servo', 'Precision servo'];
    const environments = ['General', 'Washdown', 'Cleanroom'];
    const valid = config => {
      const reasons = [];
      if (config.capacity > 70 && config.motion === 'Standard') reasons.push('Capacity above 70 units/h requires a servo motion package.');
      if (config.format === 'Compact' && config.capacity > 70) reasons.push('Compact cells are limited to 70 units/h.');
      if (config.environment === 'Cleanroom' && config.motion === 'Standard') reasons.push('Cleanroom validation requires sealed servo feedback.');
      if (config.environment === 'Washdown' && config.format === 'Compact') reasons.push('Compact enclosure lacks the washdown service clearance.');
      if (config.format === 'High-throughput' && config.motion !== 'Precision servo') reasons.push('High-throughput format requires Precision servo synchronization.');
      return reasons;
    };
    const combinations = [];
    formats.forEach(format => capacities.forEach(capacity => motions.forEach(motion => environments.forEach(environment => combinations.push({ format, capacity, motion, environment }))))) ;
    function selection() {
      return Object.fromEntries(queryAll(root, '[data-config]').map(input => [input.dataset.config, input.dataset.config === 'capacity' ? +input.value : input.value]));
    }
    function render(commit) {
      const current = selection();
      const reasons = valid(current);
      const allowed = combinations.filter(item => !valid(item).length && item.capacity >= current.capacity && item.environment === current.environment);
      query(root, '[data-constraint-trace]').innerHTML = [
        { ok: current.capacity <= 70 || current.motion !== 'Standard', text: 'Capacity ↔ motion compatibility' },
        { ok: !(current.format === 'Compact' && current.capacity > 70), text: 'Cell envelope capacity' },
        { ok: !(current.environment === 'Cleanroom' && current.motion === 'Standard'), text: 'Environment feedback sealing' },
        { ok: !(current.format === 'High-throughput' && current.motion !== 'Precision servo'), text: 'High-throughput synchronization' }
      ].map(rule => `<div class="wb-rule ${rule.ok ? 'ok' : 'bad'}"><i>${rule.ok ? '✓' : '×'}</i><span>${esc(rule.text)}</span><b>${rule.ok ? 'pass' : 'reject'}</b></div>`).join('');
      const output = query(root, '[data-config-output]');
      if (reasons.length) output.innerHTML = `<div class="wb-config-rejected"><span>Configuration rejected</span><h5>${esc(current.format)} · ${current.capacity} units/h</h5><ul>${reasons.map(reason => `<li>${esc(reason)}</li>`).join('')}</ul><p>${allowed.length} valid combinations satisfy the capacity and environment after changing the constrained options.</p></div>`;
      else {
        const score = 94 - (current.capacity === 110 ? 3 : 0) + (current.motion === 'Precision servo' ? 2 : 0);
        output.innerHTML = `<div class="wb-config-valid"><span>${commit ? 'Configured output' : 'Valid combination'}</span><h5>${esc(current.format)} Cell · ${esc(current.motion)}</h5><div class="wb-config-kpis"><b>${current.capacity}<small>units/h</small></b><b>${allowed.length}<small>valid variants</small></b><b>${score}<small>fit / 100</small></b></div><code>CFG-${current.format.slice(0, 3).toUpperCase()}-${current.capacity}-${current.motion.replace(/\s/g, '').slice(0, 4).toUpperCase()}</code></div>`;
      }
    }
    life.on(root, 'change', event => { if (event.target.matches('[data-config]')) render(false); });
    life.on(query(root, '[data-configure]'), 'click', () => render(true));
    render(false);
    return () => life.destroy();
  }

  function productViewer(spec, host, head, ctx) {
    const life = lifecycle();
    const parts = [
      { id: 'housing', name: 'Outer Housing', rev: 'C', material: 'Aluminum 6061', status: 'Released', color: 'teal' },
      { id: 'rotor', name: 'Rotor', rev: 'B', material: 'Steel 4140', status: 'Released', color: 'purple' },
      { id: 'cover', name: 'Inspection Cover', rev: 'A', material: 'Composite', status: 'Review', color: 'blue' },
      { id: 'seal', name: 'Primary Seal', rev: 'D', material: 'FKM', status: 'Released', color: 'amber' },
      { id: 'fasteners', name: 'Fastener Set', rev: 'A', material: 'A286', status: 'Released', color: 'soft' }
    ];
    let selected = 'rotor';
    let exploded = false;
    let angleX = -8;
    let angleY = -12;
    let dragging = false;
    let pointer = [0, 0];
    const hidden = new Set();
    const root = shell(host, head, 'product-viewer', `
      <div class="wb-pv-toolbar">
        <button class="wb-btn" data-pv-explode aria-pressed="false">Explode assembly</button>
        <button class="wb-btn" data-pv-fit>Fit view</button>
        <span class="wb-live ok" data-wb-live aria-live="polite"><i></i><span>5 parts · synchronized</span></span>
      </div>
      <div class="wb-pv-shell">
        <section class="wb-pv-tree" aria-label="Product structure"><div class="wb-panel-head"><span>STR</span><b>Structure</b><small>visibility + selection</small></div><div data-pv-tree></div></section>
        <section class="wb-pv-stage" data-pv-stage aria-label="Rotatable sample product viewer">
          <div class="wb-pv-grid"></div>
          <svg class="wb-pv-model" data-pv-model viewBox="0 0 620 390" role="img" aria-labelledby="wb-pv-title"><title id="wb-pv-title">Explodable sample rotor assembly</title>
            <g class="wb-pv-part tone-teal" data-part="housing"><path d="M145 85h330l65 80v120l-65 35H145l-65-35V165z" fill="none" stroke-width="16"/><path d="M130 140h360v130H130z" opacity=".12"/></g>
            <g class="wb-pv-part tone-purple" data-part="rotor"><circle cx="310" cy="205" r="91" fill="none" stroke-width="13"/><circle cx="310" cy="205" r="35"/><g class="wb-pv-blades">${Array.from({ length: 12 }, (_, i) => `<rect x="300" y="105" width="20" height="55" rx="7" transform="rotate(${i * 30} 310 205)"/>`).join('')}</g></g>
            <g class="wb-pv-part tone-blue" data-part="cover"><path d="M205 122h210l34 32v102l-34 32H205l-34-32V154z" fill="none" stroke-width="7" stroke-dasharray="11 7"/></g>
            <g class="wb-pv-part tone-amber" data-part="seal"><circle cx="310" cy="205" r="58" fill="none" stroke-width="8"/></g>
            <g class="wb-pv-part tone-soft" data-part="fasteners">${[[170,130],[450,130],[170,280],[450,280],[120,205],[500,205]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9"/>`).join('')}</g>
          </svg>
          <div class="wb-pv-hint">drag to orbit · select a part · toggle visibility</div>
        </section>
        <aside class="wb-pv-meta" data-pv-meta aria-live="polite"></aside>
      </div>`);
    const stage = query(root, '[data-pv-stage]');
    const model = query(root, '[data-pv-model]');
    function render() {
      const offsets = { housing: [-42, 0], rotor: [0, 0], cover: [48, -8], seal: [75, 8], fasteners: [105, 0] };
      queryAll(root, '[data-part]').forEach(node => {
        const id = node.dataset.part;
        node.classList.toggle('selected', id === selected);
        node.classList.toggle('hidden', hidden.has(id));
        const [x, y] = exploded ? offsets[id] : [0, 0];
        node.style.transform = `translate(${x}px, ${y}px)`;
      });
      model.style.transform = `perspective(900px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
      query(root, '[data-pv-tree]').innerHTML = parts.map((part, index) => `<div class="wb-pv-tree-row ${part.id === selected ? 'selected' : ''}">
        <button data-pv-select="${part.id}" aria-pressed="${part.id === selected}"><span>0${index + 1}</span><b>${esc(part.name)}</b><small>Rev ${part.rev}</small></button>
        <button class="wb-eye ${hidden.has(part.id) ? 'off' : ''}" data-pv-toggle="${part.id}" aria-label="${hidden.has(part.id) ? 'Show' : 'Hide'} ${esc(part.name)}" aria-pressed="${!hidden.has(part.id)}">${hidden.has(part.id) ? '○' : '●'}</button>
      </div>`).join('');
      const part = parts.find(item => item.id === selected);
      query(root, '[data-pv-meta]').innerHTML = `<span class="wb-kicker">JT-style metadata</span><h5>${esc(part.name)}</h5><code>${part.id.toUpperCase()}-SAMPLE</code><dl><div><dt>Revision</dt><dd>${part.rev}</dd></div><div><dt>Material</dt><dd>${esc(part.material)}</dd></div><div><dt>Status</dt><dd>${esc(part.status)}</dd></div><div><dt>Visible</dt><dd>${hidden.has(part.id) ? 'No' : 'Yes'}</dd></div></dl>`;
      query(root, '[data-pv-explode]').textContent = exploded ? 'Collapse assembly' : 'Explode assembly';
      query(root, '[data-pv-explode]').setAttribute('aria-pressed', String(exploded));
    }
    life.on(root, 'click', event => {
      const select = event.target.closest('[data-pv-select]');
      const toggle = event.target.closest('[data-pv-toggle]');
      const shape = event.target.closest('[data-part]');
      if (select) selected = select.dataset.pvSelect;
      else if (toggle) { const id = toggle.dataset.pvToggle; hidden.has(id) ? hidden.delete(id) : hidden.add(id); }
      else if (shape) selected = shape.dataset.part;
      else if (event.target.closest('[data-pv-explode]')) exploded = !exploded;
      else if (event.target.closest('[data-pv-fit]')) { angleX = -8; angleY = -12; exploded = false; }
      else return;
      render();
    });
    life.on(stage, 'pointerdown', event => { dragging = true; pointer = [event.clientX, event.clientY]; stage.setPointerCapture(event.pointerId); });
    life.on(stage, 'pointermove', event => { if (!dragging) return; angleY += (event.clientX - pointer[0]) * .35; angleX = clamp(angleX - (event.clientY - pointer[1]) * .25, -45, 45); pointer = [event.clientX, event.clientY]; render(); });
    life.on(stage, 'pointerup', () => { dragging = false; });
    life.on(stage, 'pointercancel', () => { dragging = false; });
    render();
    return () => life.destroy();
  }

  function prototypeLab(spec, host, head, ctx) {
    const life = lifecycle();
    let mode = 'structure';
    let selected = 'ASM-204';
    let activeTask = 'impact';
    const taskProgress = { impact: 1, release: 0, quality: 1 };
    const tasks = {
      impact: { title: 'Review ECN impact', description: 'Material Update affects the rotor assembly and its drawing.', steps: ['Open impacted assembly', 'Confirm drawing revision', 'Route impact decision'] },
      release: { title: 'Release preparation', description: 'Two sample objects are waiting on release evidence.', steps: ['Review readiness report', 'Resolve open signoff', 'Submit release package'] },
      quality: { title: 'Quality follow-up', description: 'A sample inspection note needs an owner and disposition.', steps: ['Open inspection note', 'Assign disposition owner', 'Close the follow-up'] }
    };
    const items = [
      { id: 'ASM-204', name: 'Rotor Assembly', type: 'Assembly', status: 'Released', owner: 'Design', children: ['PRT-411', 'PRT-412', 'DOC-108'] },
      { id: 'PRT-411', name: 'Rotor', type: 'Part', status: 'Released', owner: 'Analysis', children: [] },
      { id: 'PRT-412', name: 'Mounting Plate', type: 'Part', status: 'In work', owner: 'Design', children: [] },
      { id: 'DOC-108', name: 'Assembly Drawing', type: 'Document', status: 'Review', owner: 'Documentation', children: [] },
      { id: 'ECN-042', name: 'Material Update', type: 'Change', status: 'Impact', owner: 'Change Board', children: ['ASM-204'] }
    ];
    const root = shell(host, head, 'prototype-lab', `
      <div class="wb-proto-tabs" role="tablist" aria-label="Prototype direction">
        <button role="tab" aria-selected="true" data-proto-mode="structure">Structure first</button>
        <button role="tab" aria-selected="false" data-proto-mode="search">Search first</button>
        <button role="tab" aria-selected="false" data-proto-mode="task">Task first</button>
      </div>
      <div class="wb-proto-frame"><div class="wb-proto-chrome"><span>Teamcenter interaction sketch</span><b data-proto-label>Structure-first explorer</b><i></i><i></i><i></i></div><div data-proto-surface></div></div>`);
    function detail(item) {
      return `<div class="wb-proto-detail"><span class="wb-kicker">${esc(item.type)}</span><h5>${esc(item.name)}</h5><code>${esc(item.id)}</code><dl><div><dt>Status</dt><dd>${esc(item.status)}</dd></div><div><dt>Owner</dt><dd>${esc(item.owner)}</dd></div></dl><button class="wb-btn">Open sample object</button></div>`;
    }
    function render() {
      queryAll(root, '[data-proto-mode]').forEach(button => { const active = button.dataset.protoMode === mode; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
      const surface = query(root, '[data-proto-surface]');
      if (mode === 'structure') {
        query(root, '[data-proto-label]').textContent = 'Structure-first explorer';
        const assembly = items[0];
        surface.innerHTML = `<div class="wb-proto-structure"><div class="wb-proto-tree"><button class="open" data-proto-item="${assembly.id}">▾ <b>${assembly.name}</b><small>${assembly.id}</small></button>${assembly.children.map(id => { const item = items.find(x => x.id === id); return `<button data-proto-item="${id}">└ <b>${esc(item.name)}</b><small>${id}</small></button>`; }).join('')}</div>${detail(items.find(x => x.id === selected) || assembly)}</div>`;
      } else if (mode === 'search') {
        query(root, '[data-proto-label]').textContent = 'Search-first command surface';
        surface.innerHTML = `<div class="wb-proto-search"><label class="wb-label" for="wb-proto-query">Find product data</label><input id="wb-proto-query" class="wb-input" data-proto-query value="rotor" autocomplete="off"><div class="wb-proto-results" data-proto-results></div></div>`;
        renderSearch();
      } else {
        query(root, '[data-proto-label]').textContent = 'Task-first change workspace';
        const task = tasks[activeTask];
        const remaining = Math.max(0, task.steps.length - taskProgress[activeTask]);
        surface.innerHTML = `<div class="wb-proto-task"><aside><span class="wb-kicker">My work</span>${Object.entries(tasks).map(([key, item]) => `<button class="${key === activeTask ? 'active' : ''}" data-task="${key}" aria-current="${key === activeTask ? 'true' : 'false'}">${esc(item.title)} <b>${Math.max(0, item.steps.length - taskProgress[key])}</b></button>`).join('')}</aside><section><h5>${esc(task.title)}</h5><p>${esc(task.description)}</p><ol>${task.steps.map((step, index) => `<li class="${index < taskProgress[activeTask] ? 'done' : ''}">${esc(step)}</li>`).join('')}</ol><button class="wb-btn primary" data-task-next ${remaining ? '' : 'disabled'}>${remaining ? 'Complete next step' : 'Task complete ✓'}</button></section></div>`;
      }
    }
    function renderSearch() {
      const input = query(root, '[data-proto-query]'); if (!input) return;
      const term = input.value.toLowerCase();
      const matches = items.filter(item => `${item.id} ${item.name} ${item.type}`.toLowerCase().includes(term));
      query(root, '[data-proto-results]').innerHTML = matches.length ? matches.map(item => `<button data-proto-item="${item.id}"><span>${esc(item.type)}</span><b>${esc(item.name)}</b><small>${esc(item.id)} · ${esc(item.status)}</small></button>`).join('') : '<p>No matching sample objects.</p>';
    }
    life.on(root, 'click', event => {
      const modeButton = event.target.closest('[data-proto-mode]');
      const itemButton = event.target.closest('[data-proto-item]');
      const taskButton = event.target.closest('[data-task]');
      if (modeButton) { mode = modeButton.dataset.protoMode; render(); return; }
      if (itemButton) { selected = itemButton.dataset.protoItem; if (mode === 'search') { mode = 'structure'; } render(); return; }
      if (taskButton) { activeTask = taskButton.dataset.task; render(); return; }
      if (event.target.closest('[data-task-next]')) { taskProgress[activeTask] = Math.min(tasks[activeTask].steps.length, taskProgress[activeTask] + 1); render(); }
    });
    life.on(root, 'input', event => { if (event.target.matches('[data-proto-query]')) renderSearch(); });
    render();
    return () => life.destroy();
  }

  function retriever(spec, host, head, ctx) {
    const life = lifecycle();
    let generation = 0;
    const scenarios = {
      change: { question: 'What is affected by change ECN-042?', path: ['q', 'change', 'item', 'part', 'doc'], facts: ['ECN-042 affects Rotor Assembly Rev C.', 'Mounting Plate is a depth-2 dependent part.', 'Assembly Drawing DOC-108 requires review.'], answer: 'The change affects the released rotor assembly, its mounting plate, and the assembly drawing. Review the drawing before the release gate.', vector: 'Likely related: rotor documentation and manufacturing notes. Relationship depth is not preserved.' },
      requirement: { question: 'Which released parts satisfy the mounting requirement?', path: ['q', 'req', 'item', 'part'], facts: ['REQ-17 constrains Rotor Assembly.', 'Mounting Plate Rev B carries the verified interface.', 'Verification status is Released.'], answer: 'Mounting Plate Rev B is the released part linked to REQ-17 through the Rotor Assembly.', vector: 'Relevant chunks mention mounting plates and interface requirements; release status is ambiguous.' },
      supplier: { question: 'Trace the single-source exposure for the primary seal.', path: ['q', 'supplier', 'part', 'item'], facts: ['Primary Seal has one approved sample source.', 'Seal Pack uses the part in Rotor Assembly.', 'Recovery window is 18 sample days.'], answer: 'The primary seal is single-sourced and propagates risk through the Seal Pack into the Rotor Assembly.', vector: 'Supplier risk is mentioned in two notes; the affected assembly is not explicit.' }
    };
    const nodes = [
      { id: 'q', label: 'Question', x: 65, y: 130, tone: 'purple' }, { id: 'change', label: 'Change', x: 195, y: 65, tone: 'coral' }, { id: 'req', label: 'Requirement', x: 195, y: 130, tone: 'amber' }, { id: 'supplier', label: 'Supplier', x: 195, y: 195, tone: 'amber' }, { id: 'item', label: 'Item', x: 340, y: 95, tone: 'teal' }, { id: 'part', label: 'Part', x: 475, y: 150, tone: 'blue' }, { id: 'doc', label: 'Document', x: 600, y: 85, tone: 'purple' }
    ];
    const edges = [['q','change'],['q','req'],['q','supplier'],['change','item'],['req','item'],['supplier','part'],['item','part'],['item','doc'],['part','doc']];
    const root = shell(host, head, 'retriever', `
      <div class="wb-command"><label class="wb-label" for="wb-retriever-question">Engineering question</label><input id="wb-retriever-question" class="wb-input" data-retriever-question value="${esc(scenarios.change.question)}"><div class="wb-preset-row">${Object.entries(scenarios).map(([key, value]) => `<button class="wb-chip" data-retriever-preset="${key}">${esc(value.question.replace(/\?$/, ''))}</button>`).join('')}</div><button class="wb-btn primary" data-retrieve>Traverse typed graph</button><span class="wb-live" data-wb-live aria-live="polite"><i></i><span>Ready · graph index loaded</span></span></div>
      <div class="wb-retriever-grid"><section class="wb-graph-panel"><svg viewBox="0 0 665 250" role="img" aria-label="Typed retrieval graph">${edges.map(([a,b],i)=>{const p=nodes.find(n=>n.id===a),q=nodes.find(n=>n.id===b);return `<line class="wb-r-edge" data-edge="${a}-${b}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`;}).join('')}${nodes.map(node=>`<g class="wb-r-node tone-${node.tone}" data-node="${node.id}" transform="translate(${node.x} ${node.y})"><circle r="13"/><text y="-21" text-anchor="middle">${esc(node.label)}</text></g>`).join('')}</svg><div class="wb-facts" data-retrieved-facts></div></section><aside class="wb-retrieval-output"><div data-grounded-answer><span class="wb-kicker">Grounded answer</span><p>Run a traversal to compose from typed facts.</p></div><div class="wb-vector-baseline"><span class="wb-kicker">Vector baseline</span><p data-vector-answer>Run the same question against the comparison baseline.</p></div></aside></div>`);
    function scenarioForQuestion(question) {
      const text = question.toLowerCase();
      if (/require|mounting/.test(text)) return scenarios.requirement;
      if (/supplier|source|seal/.test(text)) return scenarios.supplier;
      return scenarios.change;
    }
    function run() {
      life.cancelJobs();
      const turn = ++generation;
      const scenario = scenarioForQuestion(query(root, '[data-retriever-question]').value);
      queryAll(root, '[data-node], [data-edge]').forEach(node => node.classList.remove('active'));
      query(root, '[data-retrieved-facts]').innerHTML = '';
      query(root, '[data-grounded-answer]').innerHTML = '<span class="wb-kicker">Grounded answer</span><p>Traversing typed relationships…</p>';
      setLive(root, 'Traversing · depth 0', 'busy');
      scenario.path.forEach((id, index) => life.later(() => {
        if (turn !== generation) return;
        query(root, `[data-node="${id}"]`)?.classList.add('active');
        if (index) query(root, `[data-edge="${scenario.path[index - 1]}-${id}"]`)?.classList.add('active');
        if (scenario.facts[index - 1]) query(root, '[data-retrieved-facts]').insertAdjacentHTML('beforeend', `<button data-fact-node="${id}"><b>[${index}]</b><span>${esc(scenario.facts[index - 1])}</span></button>`);
        setLive(root, `Traversing · depth ${index}`, 'busy');
      }, (ctx && ctx.reducedMotion ? 12 : 220) * index));
      life.later(() => {
        if (turn !== generation) return;
        query(root, '[data-grounded-answer]').innerHTML = `<span class="wb-kicker">Grounded answer · 3 cited edges</span><h5>Relationship-preserving result</h5><p>${esc(scenario.answer)} <span class="wb-citations">[1] [2] [3]</span></p>`;
        query(root, '[data-vector-answer]').textContent = scenario.vector;
        setLive(root, 'Complete · 3 facts grounded', 'ok');
      }, (ctx && ctx.reducedMotion ? 15 : 220) * scenario.path.length + 100);
    }
    life.on(root, 'click', event => {
      const preset = event.target.closest('[data-retriever-preset]');
      const fact = event.target.closest('[data-fact-node]');
      if (preset) { query(root, '[data-retriever-question]').value = scenarios[preset.dataset.retrieverPreset].question; run(); }
      else if (fact) { queryAll(root, '[data-node]').forEach(node => node.classList.toggle('selected', node.dataset.node === fact.dataset.factNode)); }
      else if (event.target.closest('[data-retrieve]')) run();
    });
    return () => { generation += 1; life.destroy(); };
  }

  function cypherLab(spec, host, head, ctx) {
    const life = lifecycle();
    const schemas = {
      lifecycle: {
        label: 'Lifecycle graph', nodes: 'Change → Item → Part → Document',
        presets: [
          { name: 'Change impact', query: 'MATCH (c:Change {id: $change})-[:AFFECTS]->(i:Item)-[:USES]->(p:Part)\nRETURN i.id, i.name, p.id, p.status', rows: [['ASM-204','Rotor Assembly','PRT-411','RELEASED'],['ASM-204','Rotor Assembly','PRT-412','IN_WORK']] },
          { name: 'Documents for item', query: 'MATCH (i:Item {id: $item})-[:DOCUMENTED_BY]->(d:Document)\nRETURN d.id, d.title, d.status', rows: [['DOC-108','Assembly Drawing','REVIEW'],['DOC-220','Material Specification','RELEASED']] }
        ]
      },
      requirements: {
        label: 'Requirement graph', nodes: 'Requirement → Item → Verification',
        presets: [
          { name: 'Unverified requirements', query: 'MATCH (r:Requirement)-[:CONSTRAINS]->(i:Item)\nWHERE NOT (r)-[:VERIFIED_BY]->(:Verification)\nRETURN r.id, r.text, i.id', rows: [['REQ-17','Mounting interface','ASM-204'],['REQ-31','Seal compatibility','ASM-204']] },
          { name: 'Verification coverage', query: 'MATCH (r:Requirement)-[:VERIFIED_BY]->(v:Verification)\nRETURN r.id, v.method, v.status', rows: [['REQ-12','Inspection','PASS'],['REQ-22','Analysis','PASS']] }
        ]
      }
    };
    const root = shell(host, head, 'cypher-lab', `
      <div class="wb-cypher-controls"><label class="wb-label">Schema<select class="wb-input" data-cypher-schema>${Object.entries(schemas).map(([key, value])=>`<option value="${key}">${esc(value.label)}</option>`).join('')}</select></label><label class="wb-label">Preset<select class="wb-input" data-cypher-preset></select></label><button class="wb-btn primary" data-cypher-run>Run + explain</button></div>
      <div class="wb-schema-strip" data-schema-strip></div>
      <label class="wb-label" for="wb-cypher-editor">Cypher editor</label><textarea id="wb-cypher-editor" class="wb-code-input" data-cypher-editor rows="5" spellcheck="false"></textarea>
      <div class="wb-cypher-output"><section class="wb-panel"><div class="wb-panel-head"><span>RES</span><b>Result rows</b><small data-result-count>not run</small></div><div data-cypher-results></div></section><section class="wb-panel"><div class="wb-panel-head"><span>EXP</span><b>Explain plan</b><small>indexed vs scan</small></div><div data-cypher-plan></div></section></div>`);
    function schema() { return schemas[query(root, '[data-cypher-schema]').value]; }
    function syncPresets() {
      const current = schema();
      query(root, '[data-cypher-preset]').innerHTML = current.presets.map((item, i) => `<option value="${i}">${esc(item.name)}</option>`).join('');
      query(root, '[data-cypher-editor]').value = current.presets[0].query;
      query(root, '[data-schema-strip]').innerHTML = current.nodes.split(' → ').map((node, i, all) => `<span>${esc(node)}</span>${i < all.length - 1 ? '<i>→</i>' : ''}`).join('');
    }
    function run() {
      const current = schema();
      const preset = current.presets[+query(root, '[data-cypher-preset]').value];
      const text = query(root, '[data-cypher-editor]').value.trim();
      if (/\b(CREATE|DELETE|DETACH|MERGE|SET|REMOVE|DROP)\b/i.test(text)) {
        query(root, '[data-cypher-results]').innerHTML = '<div class="wb-blocked"><b>Write query blocked</b><span>This public lab permits read-only MATCH / RETURN experiments.</span></div>';
        query(root, '[data-cypher-plan]').innerHTML = '<div class="wb-plan-node bad"><b>PolicyGuard</b><span>mutation verb detected</span></div>';
        return;
      }
      const rows = /RETURN/i.test(text) ? preset.rows : [];
      const columns = rows[0] ? rows[0].map((_, i) => ['id','name / value','related id','status'][i]) : [];
      query(root, '[data-cypher-results]').innerHTML = rows.length ? `<div class="wb-table"><div class="wb-tr head">${columns.map(x=>`<span>${esc(x)}</span>`).join('')}</div>${rows.map(row=>`<div class="wb-tr">${row.map(cell=>`<span>${esc(cell)}</span>`).join('')}</div>`).join('')}</div>` : '<p class="wb-empty">No rows returned. Add a RETURN clause or choose a preset.</p>';
      query(root, '[data-result-count]').textContent = `${rows.length} rows · deterministic sample`;
      const indexed = /\{id:|WHERE/.test(text);
      const latency = indexed ? 7.4 : 31.8;
      query(root, '[data-cypher-plan]').innerHTML = `<div class="wb-plan-node"><b>ProduceResults</b><span>${rows.length} rows</span></div><i>↓</i><div class="wb-plan-node"><b>${indexed ? 'NodeIndexSeek' : 'NodeByLabelScan'}</b><span>${indexed ? 'id index' : 'full label scan'}</span></div><div class="wb-latency-compare"><span>Current <b>${latency} ms</b></span><span>Alternative <b>${indexed ? '31.8' : '7.4'} ms</b></span></div>`;
    }
    life.on(query(root, '[data-cypher-schema]'), 'change', syncPresets);
    life.on(query(root, '[data-cypher-preset]'), 'change', event => { query(root, '[data-cypher-editor]').value = schema().presets[+event.target.value].query; });
    life.on(query(root, '[data-cypher-run]'), 'click', run);
    syncPresets(); run();
    return () => life.destroy();
  }

  function modelBench(spec, host, head, ctx) {
    const life = lifecycle();
    const models = {
      '8B Instruct': { params: 8, base: 128, quality: 76, vram: 8.1 },
      '32B Reasoning': { params: 32, base: 49, quality: 89, vram: 20.8 },
      '70B Engineering': { params: 70, base: 22, quality: 94, vram: 39.5 }
    };
    const quants = { Q8_0: { speed: .72, memory: 1, quality: 0 }, Q6_K: { speed: .92, memory: .78, quality: -1 }, Q4_K_M: { speed: 1.24, memory: .56, quality: -4 }, IQ2_XS: { speed: 1.55, memory: .34, quality: -10 } };
    const runs = [];
    const root = shell(host, head, 'model-bench', `
      <div class="wb-command wb-bench-controls">
        <label class="wb-label">Model<select class="wb-input" data-bench-model>${Object.keys(models).map(name=>`<option>${esc(name)}</option>`).join('')}</select></label>
        <label class="wb-label">Quantization<select class="wb-input" data-bench-quant>${Object.keys(quants).map(name=>`<option>${name}</option>`).join('')}</select></label>
        <label class="wb-label">Context<select class="wb-input" data-bench-context><option value="4096">4K</option><option value="8192" selected>8K</option><option value="16384">16K</option><option value="32768">32K</option></select></label>
        <button class="wb-btn primary" data-bench-run>Run workstation benchmark</button>
      </div>
      <div class="wb-bench-grid"><section class="wb-panel"><div class="wb-panel-head"><span>GPU</span><b>RTX 4090 profile</b><small>24 GB · deterministic</small></div><div class="wb-bench-gauges" data-bench-gauges></div><div class="wb-bench-verdict" data-bench-verdict></div></section><section class="wb-panel"><div class="wb-panel-head"><span>RUN</span><b>Benchmark history</b><small>same engineering prompt set</small></div><div data-bench-runs></div></section></div>`);
    function compute() {
      const model = query(root, '[data-bench-model]').value;
      const quant = query(root, '[data-bench-quant]').value;
      const context = +query(root, '[data-bench-context]').value;
      const m = models[model], q = quants[quant];
      const contextFactor = 1 + Math.log2(context / 4096) * .12;
      return { model, quant, context, speed: Math.max(5, m.base * q.speed / contextFactor), vram: m.vram * q.memory + context / 4096 * .36, quality: clamp(m.quality + q.quality - Math.log2(context / 4096) * .35, 0, 100) };
    }
    function render(result, committed) {
      const fits = result.vram <= 24;
      query(root, '[data-bench-gauges]').innerHTML = [
        ['Throughput', result.speed, 160, `${result.speed.toFixed(1)} tok/s`, 'teal'],
        ['VRAM', result.vram, 24, `${result.vram.toFixed(1)} / 24 GB`, fits ? 'blue' : 'coral'],
        ['Quality', result.quality, 100, `${result.quality.toFixed(1)} / 100`, 'purple']
      ].map(([label,value,max,display,tone])=>`<div class="wb-bench-gauge"><span>${label}</span><b>${display}</b><i><em class="tone-${tone}" style="width:${clamp(value/max*100,0,100)}%"></em></i></div>`).join('');
      query(root, '[data-bench-verdict]').innerHTML = fits ? `<b>Fits on one workstation</b><span>${esc(result.quant)} leaves ${(24-result.vram).toFixed(1)} GB headroom at ${result.context/1024}K context.</span>` : `<b class="bad">Exceeds local VRAM</b><span>Choose a smaller quant, model, or context window.</span>`;
      if (committed) runs.unshift(result);
      query(root, '[data-bench-runs]').innerHTML = runs.length ? `<div class="wb-table"><div class="wb-tr head"><span>Model</span><span>Quant</span><span>tok/s</span><span>VRAM</span><span>Quality</span></div>${runs.slice(0,6).map(run=>`<div class="wb-tr"><span>${esc(run.model)}</span><span>${run.quant}</span><span>${run.speed.toFixed(1)}</span><span>${run.vram.toFixed(1)} GB</span><span>${run.quality.toFixed(1)}</span></div>`).join('')}</div>` : '<p class="wb-empty">Run a configuration to create comparable evidence.</p>';
    }
    life.on(root, 'change', event => { if (event.target.matches('[data-bench-model],[data-bench-quant],[data-bench-context]')) render(compute(), false); });
    life.on(query(root, '[data-bench-run]'), 'click', () => render(compute(), true));
    render(compute(), false);
    return () => life.destroy();
  }

  function evalHarness(spec, host, head, ctx) {
    const life = lifecycle();
    const tasks = {
      'BOM change reasoning': { evidence: 'Requires both changed line identification and downstream effect.', weights: [1, .96, .91] },
      'Release gate decision': { evidence: 'Requires status evidence, explicit unknowns, and a bounded verdict.', weights: [.94, 1, .9] },
      'Requirement trace': { evidence: 'Requires a relationship path and no unsupported verification claim.', weights: [.9, .95, 1] }
    };
    const models = [
      { name: 'Open 8B', base: [72, 66, 70], note: 'Concise; misses one downstream dependency.' },
      { name: 'Open 32B', base: [86, 84, 88], note: 'Grounded and complete; one inference needs labeling.' },
      { name: 'Frontier API', base: [93, 91, 94], note: 'Strong evidence separation and relationship coverage.' }
    ];
    let selectedModel = 0;
    const root = shell(host, head, 'eval-harness', `
      <div class="wb-command"><label class="wb-label">Engineering task<select class="wb-input" data-eval-task>${Object.keys(tasks).map(name=>`<option>${esc(name)}</option>`).join('')}</select></label><div class="wb-rubric" aria-label="Evaluation rubric"><label><input type="checkbox" checked data-rubric="exact"> Exactness</label><label><input type="checkbox" checked data-rubric="ground"> Grounding</label><label><input type="checkbox" checked data-rubric="explain"> Explanation</label></div><button class="wb-btn primary" data-eval-run>Run repeatable evaluation</button><span class="wb-live" data-wb-live aria-live="polite"><i></i><span>Ready · fixed prompt set</span></span></div>
      <div class="wb-eval-grid"><section class="wb-panel"><div class="wb-panel-head"><span>MX</span><b>Score matrix</b><small>click a model for evidence</small></div><div data-eval-matrix></div></section><aside class="wb-eval-evidence" data-eval-evidence aria-live="polite"></aside></div>`);
    function scores() {
      const taskName = query(root, '[data-eval-task]').value;
      const taskIndex = Object.keys(tasks).indexOf(taskName);
      const rubricCount = queryAll(root, '[data-rubric]:checked').length;
      return models.map((model, mi) => ({ ...model, exact: model.base[taskIndex], grounding: model.base[(taskIndex+1)%3], explanation: model.base[(taskIndex+2)%3], total: (model.base[taskIndex]*.45 + model.base[(taskIndex+1)%3]*.35 + model.base[(taskIndex+2)%3]*.2) * (rubricCount ? 1 : .75) }));
    }
    function render() {
      const taskName = query(root, '[data-eval-task]').value;
      const rows = scores();
      query(root, '[data-eval-matrix]').innerHTML = `<div class="wb-table"><div class="wb-tr head"><span>Model</span><span>Exact</span><span>Ground</span><span>Explain</span><span>Total</span></div>${rows.map((row,i)=>`<button class="wb-tr ${i===selectedModel?'selected':''}" data-eval-model="${i}"><span>${esc(row.name)}</span><span>${row.exact}</span><span>${row.grounding}</span><span>${row.explanation}</span><span><b>${row.total.toFixed(1)}</b></span></button>`).join('')}</div>`;
      const row = rows[selectedModel];
      query(root, '[data-eval-evidence]').innerHTML = `<span class="wb-kicker">Evaluator evidence</span><h5>${esc(row.name)} · ${esc(taskName)}</h5><p>${esc(tasks[taskName].evidence)}</p><blockquote>“${esc(row.note)}”</blockquote><div class="wb-evidence-checks"><span>✓ answer parsed</span><span>✓ citations resolved</span><span>${row.total>90?'✓':'△'} coverage threshold</span></div>`;
    }
    function run() {
      setLive(root, 'Scoring · 3 models × 3 rubric axes', 'busy');
      life.cancelJobs();
      life.later(()=>{ render(); setLive(root, 'Complete · evidence retained', 'ok'); }, ctx&&ctx.reducedMotion?40:420);
    }
    life.on(root, 'change', event => { if (event.target.matches('[data-eval-task],[data-rubric]')) render(); });
    life.on(root, 'click', event => { const model = event.target.closest('[data-eval-model]'); if (model) { selectedModel=+model.dataset.evalModel;render(); } else if(event.target.closest('[data-eval-run]'))run(); });
    render();
    return () => life.destroy();
  }

  function experiment(spec, host, head, ctx) {
    const life = lifecycle();
    let generation = 0;
    const runs = [];
    const root = shell(host, head, 'experiment', `
      <div class="wb-command wb-exp-controls"><label class="wb-label">Learning rate<input class="wb-input" data-exp="lr" type="number" min="0.0001" max="0.1" step="0.0001" value="0.003"></label><label class="wb-label">Batch<select class="wb-input" data-exp="batch"><option>16</option><option selected>32</option><option>64</option></select></label><label class="wb-label">Epochs<input class="wb-input" data-exp="epochs" type="number" min="5" max="80" value="24"></label><label class="wb-label">Seed<input class="wb-input" data-exp="seed" type="number" min="1" max="9999" value="42"></label><button class="wb-btn primary" data-exp-run>Train sample experiment</button></div>
      <div class="wb-exp-grid"><section class="wb-panel"><div class="wb-panel-head"><span>CURVE</span><b>Deterministic training</b><small data-exp-state>not run</small></div><svg class="wb-exp-chart" viewBox="0 0 640 250" role="img" aria-label="Training and validation loss"><g class="wb-chart-grid">${[40,90,140,190,240].map(y=>`<line x1="0" x2="640" y1="${y}" y2="${y}"/>`).join('')}</g><path data-train-path class="train"/><path data-val-path class="valid"/></svg><div class="wb-chart-legend"><span class="train">Training loss</span><span class="valid">Validation loss</span></div></section><section class="wb-panel"><div class="wb-panel-head"><span>RUNS</span><b>Artifacts</b><small>local sample</small></div><div data-exp-runs></div><div data-exp-artifact></div></section></div>`);
    function controls() { return { lr:+query(root,'[data-exp="lr"]').value,batch:+query(root,'[data-exp="batch"]').value,epochs:+query(root,'[data-exp="epochs"]').value,seed:+query(root,'[data-exp="seed"]').value }; }
    function curve(config) {
      const rng=seedRandom(`experiment|${config.seed}|${config.lr}|${config.batch}`),train=[],valid=[];
      for(let i=0;i<config.epochs;i+=1){const progress=i/Math.max(1,config.epochs-1),base=Math.exp(-progress*(2.7+config.lr*40));train.push(.14+base*.86+(rng()-.5)*.025);valid.push(.19+base*.75+(rng()-.5)*.04+Math.max(0,progress-.72)*.18)}
      return{train,valid};
    }
    function path(values){const lo=0,hi=1.1;return values.map((v,i)=>`${i?'L':'M'} ${i/Math.max(1,values.length-1)*620+10} ${230-(v-lo)/(hi-lo)*205}`).join(' ')}
    function run(){life.cancelJobs();const turn=++generation,config=controls(),data=curve(config),trainPath=query(root,'[data-train-path]'),valPath=query(root,'[data-val-path]');trainPath.setAttribute('d',path(data.train));valPath.setAttribute('d',path(data.valid));[trainPath,valPath].forEach(p=>{const len=p.getTotalLength();p.style.strokeDasharray=len;p.style.strokeDashoffset=len;life.frame(()=>{p.style.strokeDashoffset='0'})});query(root,'[data-exp-state]').textContent='training…';life.later(()=>{if(turn!==generation)return;const best=Math.min(...data.valid),runItem={id:`RUN-${String(runs.length+1).padStart(2,'0')}`,...config,best,artifact:`model-seed-${config.seed}.onnx`};runs.unshift(runItem);query(root,'[data-exp-state]').textContent=`complete · best val ${best.toFixed(3)}`;query(root,'[data-exp-runs]').innerHTML=`<div class="wb-table"><div class="wb-tr head"><span>Run</span><span>LR</span><span>Batch</span><span>Epochs</span><span>Best val</span></div>${runs.map(r=>`<div class="wb-tr"><span>${r.id}</span><span>${r.lr}</span><span>${r.batch}</span><span>${r.epochs}</span><span>${r.best.toFixed(3)}</span></div>`).join('')}</div>`;query(root,'[data-exp-artifact]').innerHTML=`<div class="wb-artifact"><span>Artifact emitted</span><b>${esc(runItem.artifact)}</b><code>seed=${runItem.seed} · deterministic=true</code></div>`},ctx&&ctx.reducedMotion?50:650)}
    life.on(query(root,'[data-exp-run]'),'click',run);
    return()=>{generation+=1;life.destroy()};
  }

  function logAnalyzer(spec, host, head, ctx) {
    const life = lifecycle();
    const sample = `2026-07-17T10:11:02Z ERROR api TimeoutError: pool wait exceeded 2000 ms request=8fa1\n2026-07-17T10:11:03Z ERROR api TimeoutError: pool wait exceeded 2000 ms request=91bb\n2026-07-17T10:11:04Z WARN mapper schema retry 1/3 expected=v4 received=v3\n2026-07-17T10:11:05Z INFO web GET /health 200 4ms\n2026-07-17T10:11:06Z WARN mapper schema retry 2/3 expected=v4 received=v3\n2026-07-17T10:11:07Z INFO web GET /health 200 5ms\n2026-07-17T10:11:08Z ERROR auth token validation failed user=SAMPLE-17\n2026-07-17T10:11:09Z INFO web GET /health 200 4ms`;
    const root = shell(host, head, 'log-analyzer', `
      <div class="wb-command"><label class="wb-label" for="wb-log-input">Raw sample logs</label><textarea id="wb-log-input" class="wb-code-input" data-log-input rows="8" spellcheck="false">${esc(sample)}</textarea><button class="wb-btn primary" data-log-run>Cluster and rank signal</button><span class="wb-live" data-wb-live aria-live="polite"><i></i><span>Ready · ${sample.split('\n').length} raw events</span></span></div>
      <div class="wb-log-summary" data-log-summary></div><div class="wb-log-groups" data-log-groups></div>`);
    function fingerprint(line){const body=line.replace(/^\S+\s+/,'').replace(/\b(request|user)=[\w-]+/gi,'$1=<id>').replace(/\b\d+(?:\.\d+)?\s*(?:ms|s)?\b/gi,'<n>').toLowerCase();if(/pool wait|timeouterror/.test(body))return['critical','db.pool.timeout'];if(/schema retry/.test(body))return['warning','mapper.schema.retry'];if(/health/.test(body))return['info','routine.health'];if(/token validation|auth/.test(body))return['critical','auth.validation'];return[/error/.test(body)?'critical':/warn/.test(body)?'warning':'info',body.slice(0,58)];}
    function analyze(){life.cancelJobs();const lines=query(root,'[data-log-input]').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),groups=new Map();lines.forEach(line=>{const[severity,key]=fingerprint(line),entry=groups.get(key)||{key,severity,count:0,samples:[]};entry.count+=1;if(entry.samples.length<3)entry.samples.push(line);groups.set(key,entry)});const rank={critical:3,warning:2,info:1},rows=[...groups.values()].sort((a,b)=>(rank[b.severity]*100+b.count)-(rank[a.severity]*100+a.count));setLive(root,'Clustering · normalizing fingerprints','busy');query(root,'[data-log-summary]').innerHTML=`<div><span>Raw events</span><b>${lines.length}</b></div><div><span>Unique clusters</span><b>${rows.length}</b></div><div><span>Duplicates removed</span><b>${Math.max(0,lines.length-rows.length)}</b></div><div><span>Noise reduction</span><b>${lines.length?Math.round((1-rows.length/lines.length)*100):0}%</b></div>`;life.later(()=>{query(root,'[data-log-groups]').innerHTML=rows.map((row,index)=>`<details class="wb-log-group severity-${row.severity}" ${index===0?'open':''}><summary><span class="wb-rank">#${index+1}</span><i></i><b>${esc(row.key)}</b><em>${row.count} event${row.count===1?'':'s'}</em><small>${row.severity}</small></summary><div><p>Representative traces after timestamp, request ID, user ID, and numeric normalization.</p>${row.samples.map(line=>`<code>${esc(line)}</code>`).join('')}</div></details>`).join('');setLive(root,`Complete · ${rows.length} ranked clusters`,'ok')},ctx&&ctx.reducedMotion?30:320)}
    life.on(query(root,'[data-log-run]'),'click',analyze);analyze();
    return()=>life.destroy();
  }

  const factories = {
    agentStudio,
    modelLab,
    structure,
    configurator,
    productViewer,
    prototypeLab,
    retriever,
    cypherLab,
    modelBench,
    evalHarness,
    experiment,
    logAnalyzer
  };
  global.PROJECT_WORKBENCHES = Object.assign(global.PROJECT_WORKBENCHES || {}, factories);
})(window);
