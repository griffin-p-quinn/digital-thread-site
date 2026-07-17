/*
 * README-grounded portfolio workbenches: AI Studio, AutoModel, RL26,
 * Mendix migration, local OAuth, Maia MCP, PriceBook, and MXDocker.
 *
 * Every surface is a deterministic browser simulation. It never reaches a
 * backend, exposes a credential, or mutates the visitor's machine.
 */
(() => {
  'use strict';

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => [...(root || document).querySelectorAll(selector)];
  const escapeHtml = value => typeof esc === 'function'
    ? esc(value == null ? '' : String(value))
    : String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[char]);
  const reducedMotion = () => typeof REDUCE !== 'undefined' && REDUCE;
  const later = (timers, callback, delay) => {
    const id = setTimeout(callback, reducedMotion() ? Math.min(delay, 38) : delay);
    timers.push(id);
    return id;
  };
  const clearTimers = timers => timers.splice(0).forEach(clearTimeout);
  const setStatus = (host, kind, message) => {
    const node = $('[data-tw-status]', host);
    if (!node) return;
    node.className = `tw-status ${kind || ''}`;
    node.textContent = message;
  };
  const money = value => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(value);
  let uidCounter = 0;
  const uid = prefix => `${prefix}-${++uidCounter}`;

  function aiStudioAgent(spec, host, head) {
    const timers = [];
    let generation = 0;
    let ready = false;
    let mode = 'Debugger';
    let selectedPrompt = 'Why does this scoring process reject a row without the target column?';
    const runId = uid('ai-agent');
    const stages = [
      ['JAR', 'AI Studio Agent 1.8.8', 'Extension discovered after restart'],
      ['PATH', '//Local Repository/Connections', 'Connection objects enumerated'],
      ['PROFILE', 'Local engineering model', 'Provider and model resolved by AI Studio'],
      ['TOOLS', 'RapidMiner + optional MCP', 'Typed tools registered in Agent Chat']
    ];
    const processNodes = [
      ['Retrieve', 'Production Model'],
      ['Apply', 'Model'],
      ['Explain', 'Predictions'],
      ['Result', 'ExampleSet']
    ];

    host.innerHTML = head + `
      <div class="tw-workbench tw-ai" data-ai-root>
        <div class="tw-ai-window">
          <header class="tw-ai-titlebar">
            <div class="tw-ai-brand"><span class="tw-ai-mark">AI</span><span><b>AI Studio</b><small>Process · score_set.rmp</small></span></div>
            <div class="tw-ai-title-actions"><span class="tw-pill good">extension loaded</span><span class="tw-window-dot"></span><span class="tw-window-dot"></span><span class="tw-window-dot close"></span></div>
          </header>
          <div class="tw-ai-menubar"><span>File</span><span>Process</span><span>Connections</span><span>View</span><b>Agent Chat</b><span class="tw-ai-spacer"></span><span class="tw-mono">rmx_mcp_agent · 1.8.8</span></div>
          <div class="tw-ai-layout">
            <aside class="tw-ai-repository" aria-label="AI Studio repository">
              <div class="tw-section-label">Local Repository</div>
              <div class="tw-tree-line"><i>▾</i><b>Connections</b></div>
              <button class="tw-tree-line active" type="button" data-ai-profile-row><i>◆</i><span>Local engineering model</span></button>
              <div class="tw-tree-line"><i>▸</i><span>Processes</span></div>
              <div class="tw-tree-line child"><i>◇</i><span>score_set.rmp</span></div>
              <div class="tw-ai-install">
                <span class="tw-kicker">Installed extension</span>
                <b>mcp_agent-1.8.8-all.jar</b>
                <small>AI Studio user extensions</small>
              </div>
            </aside>
            <main class="tw-ai-process">
              <div class="tw-ai-canvas-head"><span>DESIGN</span><b>Scoring process</b><span class="tw-ai-spacer"></span><span>Input ExampleSet → Result</span></div>
              <div class="tw-ai-canvas" aria-label="Sample AI Studio process">
                <div class="tw-ai-port in"></div>
                ${processNodes.map((node, index) => `<div class="tw-ai-operator" style="--operator-index:${index}"><i>${index + 1}</i><b>${escapeHtml(node[0])}</b><span>${escapeHtml(node[1])}</span></div>`).join('')}
                <div class="tw-ai-wire"></div>
                <div class="tw-ai-port out"></div>
              </div>
              <div class="tw-ai-foot">
                <label class="tw-field"><span>Connection profile</span><select data-ai-profile aria-label="Connection profile"><option>Local engineering model</option><option>Hosted profile · redacted</option><option>Custom endpoint · redacted</option></select></label>
                <div class="tw-ai-modes" role="group" aria-label="Agent mode">
                  ${['Teacher', 'Explainer', 'Debugger', 'Advisor'].map(name => `<button type="button" data-ai-mode="${name}" class="${name === mode ? 'active' : ''}" aria-pressed="${name === mode}">${name}</button>`).join('')}
                </div>
                <label class="tw-switch-row"><input type="checkbox" data-ai-mcp checked><span class="tw-switch"></span><span><b>External MCP command</b><small>Attach registered tools in addition to AI Studio tools</small></span></label>
              </div>
            </main>
            <section class="tw-ai-chat" aria-label="AI Studio Agent Chat">
              <div class="tw-ai-chat-head"><span><b>Agent Chat</b><small data-ai-mode-label>Debugger mode</small></span><span class="tw-status" data-tw-status>Profile not initialized</span></div>
              <div class="tw-ai-setup" data-ai-setup>
                ${stages.map((stage, index) => `<div class="tw-ai-setup-row" data-ai-stage="${index}"><i>${index + 1}</i><span><b>${escapeHtml(stage[1])}</b><small>${escapeHtml(stage[2])}</small></span><em>waiting</em></div>`).join('')}
              </div>
              <div class="tw-ai-thread" data-ai-thread aria-live="polite">
                <div class="tw-ai-empty"><span>/tools</span><b>Initialize the profile inside AI Studio</b><p>The extension resolves a connection object, then exposes Agent Chat and any configured MCP tools.</p></div>
              </div>
              <div class="tw-ai-prompt-chips" aria-label="Prompt presets">
                <button type="button" data-ai-prompt="Why does this scoring process reject a row without the target column?">Debug process</button>
                <button type="button" data-ai-prompt="Explain the operator chain before I deploy this scoring process.">Explain chain</button>
                <button type="button" data-ai-prompt="/tools">List tools</button>
              </div>
              <div class="tw-ai-compose">
                <label for="${runId}-prompt">Message Agent Chat</label>
                <textarea id="${runId}-prompt" data-ai-input rows="3">${escapeHtml(selectedPrompt)}</textarea>
                <div><button class="w-btn" type="button" data-ai-init>Initialize profile</button><button class="w-btn primary" type="button" data-ai-send disabled>Send in AI Studio</button></div>
              </div>
            </section>
          </div>
        </div>
      </div>`;

    const setStage = (index, state) => {
      const row = $(`[data-ai-stage="${index}"]`, host);
      if (!row) return;
      row.className = `tw-ai-setup-row ${state}`;
      $('em', row).textContent = state === 'done' ? 'ready' : state === 'active' ? 'checking' : 'waiting';
    };
    const resetStages = () => stages.forEach((_, index) => setStage(index, ''));
    const initialize = () => {
      const turn = ++generation;
      clearTimers(timers);
      ready = false;
      $('[data-ai-init]', host).disabled = true;
      $('[data-ai-send]', host).disabled = true;
      resetStages();
      setStatus(host, 'busy', 'AI Studio is resolving the selected connection');
      stages.forEach((_, index) => {
        later(timers, () => {
          if (turn !== generation) return;
          if (index > 0) setStage(index - 1, 'done');
          setStage(index, 'active');
        }, 120 + index * 260);
      });
      later(timers, () => {
        if (turn !== generation) return;
        setStage(stages.length - 1, 'done');
        ready = true;
        $('[data-ai-init]', host).disabled = false;
        $('[data-ai-init]', host).textContent = 'Refresh profile';
        $('[data-ai-send]', host).disabled = false;
        setStatus(host, 'good', $('[data-ai-mcp]', host).checked ? 'Ready · AI Studio tools + external MCP' : 'Ready · AI Studio tools only');
        $('[data-ai-thread]', host).innerHTML = `<div class="tw-ai-message agent"><span>AGENT</span><p><b>${escapeHtml(mode)} mode is ready.</b> I can inspect this open process, explain operators, and use the tools enabled for this profile.</p><div class="tw-ai-tool-mini"><i>✓</i><span>RapidMinerActionTools</span><i>✓</i><span>DataAdvisorTools</span>${ $('[data-ai-mcp]', host).checked ? '<i>✓</i><span>external MCP registry</span>' : ''}</div></div>`;
      }, 120 + stages.length * 260);
    };
    const replyFor = prompt => {
      if (prompt.trim() === '/tools') return {
        tool: 'tools/list',
        title: 'Registered inside this Agent Chat profile',
        body: 'AI Studio process inspection, operator guidance, data advice' + ($('[data-ai-mcp]', host).checked ? ', and the configured external MCP tools.' : '. External MCP is disabled for this profile.')
      };
      if (/explain/i.test(prompt)) return {
        tool: 'RapidMinerActionTools · inspect_process',
        title: 'The deployed artifact should be the scoring process',
        body: 'This chain retrieves production artifacts, applies the model to an incoming ExampleSet, adds per-row explanations, and emits scored rows. Keep training and scoring as separate processes.'
      };
      return {
        tool: 'DataAdvisorTools · inspect_schema',
        title: 'The target role assignment still expects its column',
        body: 'The scoring row needs a placeholder target field because Define Target assigns that role before Apply Model. Add the field with a neutral value, then test the scoring process—not the training process.'
      };
    };
    const send = () => {
      if (!ready) return;
      const prompt = $('[data-ai-input]', host).value.trim();
      if (!prompt) {
        setStatus(host, 'bad', 'Enter a question for Agent Chat');
        return;
      }
      const turn = ++generation;
      clearTimers(timers);
      $('[data-ai-send]', host).disabled = true;
      const thread = $('[data-ai-thread]', host);
      thread.innerHTML = `<div class="tw-ai-message user"><span>YOU · INSIDE AI STUDIO</span><p>${escapeHtml(prompt)}</p></div><div class="tw-ai-message agent thinking"><span>${escapeHtml(mode.toUpperCase())}</span><p>Inspecting the open process and profile tools…</p></div>`;
      setStatus(host, 'busy', 'Agent Chat is inspecting the open process');
      later(timers, () => {
        if (turn !== generation) return;
        const reply = replyFor(prompt);
        thread.innerHTML = `<div class="tw-ai-message user"><span>YOU · INSIDE AI STUDIO</span><p>${escapeHtml(prompt)}</p></div><div class="tw-ai-message agent"><span>${escapeHtml(mode.toUpperCase())}</span><div class="tw-ai-tool-call"><i>TOOL</i><b>${escapeHtml(reply.tool)}</b><em>complete</em></div><p><b>${escapeHtml(reply.title)}</b> ${escapeHtml(reply.body)}</p><small>Browser-safe replay · no provider or local process was contacted.</small></div>`;
        $('[data-ai-send]', host).disabled = false;
        setStatus(host, 'good', 'Answer grounded in the process and tool result');
      }, 650);
    };

    $$('[data-ai-mode]', host).forEach(button => button.addEventListener('click', () => {
      mode = button.dataset.aiMode;
      $$('[data-ai-mode]', host).forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', active);
      });
      $('[data-ai-mode-label]', host).textContent = `${mode} mode`;
      setStatus(host, ready ? 'good' : '', ready ? `Ready · ${mode} mode` : 'Mode selected · initialize profile');
    }));
    $$('[data-ai-prompt]', host).forEach(button => button.addEventListener('click', () => {
      selectedPrompt = button.dataset.aiPrompt;
      $('[data-ai-input]', host).value = selectedPrompt;
      $('[data-ai-input]', host).focus();
    }));
    $('[data-ai-profile]', host).addEventListener('change', () => {
      ready = false;
      resetStages();
      $('[data-ai-send]', host).disabled = true;
      $('[data-ai-init]', host).textContent = 'Initialize profile';
      setStatus(host, '', 'Profile changed · initialize in AI Studio');
    });
    $('[data-ai-mcp]', host).addEventListener('change', event => {
      setStatus(host, ready ? 'busy' : '', event.target.checked ? 'External MCP requested · refresh profile' : 'External MCP detached · refresh profile');
      ready = false;
      $('[data-ai-send]', host).disabled = true;
      $('[data-ai-init]', host).textContent = 'Refresh profile';
    });
    $('[data-ai-init]', host).addEventListener('click', initialize);
    $('[data-ai-send]', host).addEventListener('click', send);
    return () => {
      generation += 1;
      clearTimers(timers);
    };
  }

  function autoModelScore(spec, host, head) {
    const timers = [];
    let generation = 0;
    const formId = uid('automodel');
    const features = [
      { key: 'baseline', label: 'Baseline formula cost', value: 42000, min: 5000, max: 90000, step: 1000, unit: '$' },
      { key: 'ncrs', label: 'NCRs per year', value: 22, min: 0, max: 60, step: 1, unit: '' },
      { key: 'trend', label: 'NCR trend QoQ', value: 7, min: -20, max: 30, step: 1, unit: '%' },
      { key: 'downtime', label: 'Downtime hours / NCR', value: 1.4, min: 0, max: 5, step: .1, unit: 'h' },
      { key: 'quality', label: 'Supplier quality score', value: 81, min: 50, max: 100, step: 1, unit: '' },
      { key: 'age', label: 'Part age', value: 48, min: 1, max: 120, step: 1, unit: 'mo' }
    ];
    const read = () => Object.fromEntries(features.map(feature => [feature.key, +$(`[data-score-field="${feature.key}"]`, host).value]));
    const predict = row => {
      let value = 7400;
      if (row.baseline > 18000) value += 6200;
      if (row.baseline > 38000) value += 10800;
      if (row.baseline > 65000) value += 15100;
      if (row.ncrs > 12) value += 4100;
      if (row.ncrs > 30) value += 7300;
      if (row.trend > 5) value += 3800;
      if (row.trend > 16) value += 5200;
      if (row.downtime > 1) value += 4900;
      if (row.downtime > 3) value += 8200;
      if (row.quality < 86) value += 3700;
      if (row.quality < 70) value += 5900;
      if (row.age > 36) value += 2100;
      if (row.age > 84) value += 3600;
      return Math.round(value / 100) * 100;
    };
    const driverData = row => {
      const entries = [
        ['baseline_formula_cost', row.baseline > 38000 ? .78 : .31, 'support'],
        ['ncrs_per_year', row.ncrs > 12 ? .34 : -.08, row.ncrs > 12 ? 'support' : 'contradict'],
        ['ncr_trend_qoq_pct', row.trend > 5 ? .26 : -.17, row.trend > 5 ? 'support' : 'contradict'],
        ['downtime_hours_per_ncr', row.downtime > 1 ? .21 : -.13, row.downtime > 1 ? 'support' : 'contradict'],
        ['supplier_quality_score', row.quality < 86 ? .19 : -.24, row.quality < 86 ? 'support' : 'contradict'],
        ['part_age_months', row.age > 36 ? .12 : -.07, row.age > 36 ? 'support' : 'contradict']
      ];
      return entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    };
    const sensitivity = row => features.map(feature => {
      const low = predict({ ...row, [feature.key]: feature.min });
      const high = predict({ ...row, [feature.key]: feature.max });
      return { label: feature.label, swing: Math.abs(high - low), low, high };
    }).sort((a, b) => b.swing - a.swing);

    host.innerHTML = head + `
      <div class="tw-workbench tw-score">
        <div class="tw-score-ribbon">
          <div><span class="tw-kicker">AI Studio → AI Hub</span><b>AutoModel GBT scoring replay</b><small>score_set.rmp · sanitized row · no live endpoint</small></div>
          <div class="tw-score-contract"><span>POST</span><code>/api/score</code><i>local proxy</i></div>
        </div>
        <div class="tw-score-layout">
          <section class="tw-score-input">
            <div class="tw-section-head"><span>01</span><div><b>ExampleSet row</b><small>Edit the inputs the deployed process expects</small></div><span class="tw-pill warn">target placeholder = 0</span></div>
            <div class="tw-score-fields">
              <label class="tw-score-part" for="${formId}-part"><span>Sample part</span><input id="${formId}-part" value="DEMO-PART-204" aria-label="Sanitized sample part identifier"></label>
              ${features.map(feature => `<label class="tw-score-field" for="${formId}-${feature.key}"><span>${escapeHtml(feature.label)} <output data-score-output="${feature.key}">${escapeHtml(feature.unit === '$' ? money(feature.value) : feature.value + feature.unit)}</output></span><input id="${formId}-${feature.key}" data-score-field="${feature.key}" type="range" min="${feature.min}" max="${feature.max}" step="${feature.step}" value="${feature.value}"></label>`).join('')}
            </div>
            <div class="tw-score-envelope"><span>Request envelope</span><code>{ "data": [ { …, "actual_annual_defect_cost": 0 } ] }</code></div>
            <button class="w-btn primary tw-score-run" type="button" data-score-run>Score sanitized row</button>
          </section>
          <section class="tw-score-output" aria-live="polite">
            <div class="tw-section-head"><span>02</span><div><b>Regression result</b><small>Piecewise-constant GBT output</small></div><span class="tw-status good" data-tw-status>Browser replay ready</span></div>
            <div class="tw-score-hero">
              <div><span>Predicted annual defect cost</span><b data-score-prediction>—</b><small data-score-band>Empirical error band appears after scoring</small></div>
              <div class="tw-step-curve" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
            </div>
            <div class="tw-score-note"><b>Why sliders can appear “stuck”</b><span>Gradient boosted trees move in thresholds, not smooth slopes. A feature can change without crossing a split.</span></div>
            <div class="tw-score-results">
              <div>
                <div class="tw-subhead"><b>Support / contradict</b><span>local explanation</span></div>
                <div class="tw-driver-list" data-driver-list><div class="tw-empty">Run the row to inspect its per-feature explanation.</div></div>
              </div>
              <div>
                <div class="tw-subhead"><b>Sensitivity tornado</b><span>full-range swing</span></div>
                <div class="tw-tornado" data-sensitivity><div class="tw-empty">Sensitivity is computed as a browser-only batch replay.</div></div>
              </div>
            </div>
          </section>
        </div>
      </div>`;

    const outputValue = (feature, value) => feature.unit === '$' ? money(value) : `${value}${feature.unit}`;
    features.forEach(feature => $(`[data-score-field="${feature.key}"]`, host).addEventListener('input', event => {
      $(`[data-score-output="${feature.key}"]`, host).textContent = outputValue(feature, event.target.value);
      setStatus(host, 'warn', 'Inputs changed · result is stale');
    }));
    $('[data-score-run]', host).addEventListener('click', event => {
      const turn = ++generation;
      clearTimers(timers);
      const button = event.currentTarget;
      const row = read();
      button.disabled = true;
      setStatus(host, 'busy', 'Applying production model and explanation operators');
      $('[data-score-prediction]', host).textContent = 'scoring…';
      later(timers, () => {
        if (turn !== generation) return;
        const prediction = predict(row);
        const drivers = driverData(row);
        const tornado = sensitivity(row);
        const maxSwing = Math.max(...tornado.map(item => item.swing), 1);
        $('[data-score-prediction]', host).textContent = money(prediction);
        $('[data-score-band]', host).textContent = `Documented empirical error reference · ±11.3% (not a confidence interval)`;
        $('[data-driver-list]', host).innerHTML = drivers.map(item => `
          <div class="tw-driver ${item[2]}"><span>${escapeHtml(item[0])}</span><div><i style="width:${Math.round(Math.abs(item[1]) * 100)}%"></i></div><b>${item[1] > 0 ? '+' : ''}${item[1].toFixed(3)}</b></div>`).join('');
        $('[data-sensitivity]', host).innerHTML = tornado.map(item => `
          <div class="tw-tornado-row"><span>${escapeHtml(item.label)}</span><div><i style="width:${Math.max(2, Math.round(item.swing / maxSwing * 100))}%"></i></div><b>${money(item.swing)} swing</b></div>`).join('');
        button.disabled = false;
        setStatus(host, 'good', 'Scored · explanation and batch sensitivity complete');
      }, 520);
    });
    return () => {
      generation += 1;
      clearTimers(timers);
    };
  }

  function workshopDocs(spec, host, head) {
    const documents = [
      { id:'01', title:'Get Started', sections:['Import Base Project'], sources:['Transcription · Part 1'], note:'Modules are pre-installed in the starter project.' },
      { id:'02', title:'Build Home Page', sections:['Set Up Navigation','Run and Test','Add Teamcenter Context','Configure Teamcenter'], sources:['Transcriptions · Parts 1–2','Working DOCX template'], note:'Navigation and connector context are established before search.' },
      { id:'03', title:'Create Artifacts in Mendix', sections:['Provide Teamcenter Instance','Generate ItemRevision Entity','Configure Access Rules'], sources:['Transcription · Part 3'], note:'Entity generation and access rules remain explicit workshop steps.' },
      { id:'04', title:'Build Search and Display Pages', sections:['Add Search Building Block','Create Data-source Microflow','Wire Data Source','Create Display Page','Configure Search Button','Create Search Microflow','Configure Data Grid','Run and Test'], sources:['Transcription · Part 4'], note:'The most complex guide; final Studio Pro behavior still needs review.' },
      { id:'05', title:'Run Mendix App', sections:['Modify Runtime Ports','Run Locally','Authenticate Teamcenter','Search for Items'], sources:['Hand-authored draft · 05'], note:'Uses full Stop → Run Locally; the documented rerun path is avoided.' },
      { id:'06', title:'Run App in Tablet Mode', sections:['Create Tablet Profile','Configure Navigation','Run in Tablet'], sources:['Hand-authored draft · 06'], note:'Closes the sequence with the tablet navigation profile.' }
    ];
    let active = 0;
    let filter = 'all';
    const localChecks = new Map(documents.map(doc => [doc.id, { visual:false, toc:false, behavior:false }]));

    host.innerHTML = head + `
      <div class="tw-workbench tw-docs">
        <header class="tw-docs-header">
          <div><span class="tw-kicker">Training document production</span><h4>Six guides. One traceable workshop.</h4><p>Generated DOCX curriculum for building a Mendix app that searches Teamcenter in Studio Pro 10.24.14.</p></div>
          <div class="tw-docs-count"><b>06</b><span>final document<br>outputs</span></div>
        </header>
        <div class="tw-docs-toolbar">
          <div class="tw-segment" role="group" aria-label="Document filter"><button type="button" class="active" data-doc-filter="all" aria-pressed="true">All six</button><button type="button" data-doc-filter="review" aria-pressed="false">Needs final review</button></div>
          <span class="tw-status warn" data-tw-status>Documented TODOs remain visible</span>
        </div>
        <div class="tw-docs-layout">
          <nav class="tw-doc-shelf" data-doc-shelf aria-label="Workshop document set"></nav>
          <article class="tw-doc-paper" data-doc-paper aria-live="polite"></article>
          <aside class="tw-doc-proof" data-doc-proof></aside>
        </div>
      </div>`;

    const visibleDocs = () => documents.filter(doc => filter === 'all' || !Object.values(localChecks.get(doc.id)).every(Boolean));
    const drawShelf = focusId => {
      const visible = visibleDocs();
      if (!visible.includes(documents[active])) active = documents.indexOf(visible[0] || documents[0]);
      $('[data-doc-shelf]', host).innerHTML = visible.map(doc => {
        const index = documents.indexOf(doc);
        const checks = localChecks.get(doc.id);
        const done = Object.values(checks).filter(Boolean).length;
        return `<button type="button" class="tw-doc-spine ${index === active ? 'active' : ''}" data-doc-index="${index}" aria-pressed="${index === active}"><span>${doc.id}</span><div><b>${escapeHtml(doc.title)}</b><small>${doc.sections.length} section${doc.sections.length === 1 ? '' : 's'} · ${done}/3 review gates</small></div><i>DOCX</i></button>`;
      }).join('');
      $$('[data-doc-index]', host).forEach(button => button.addEventListener('click', () => {
        active = +button.dataset.docIndex;
        draw(button.dataset.docIndex);
        const next = $(`[data-doc-index="${active}"]`, host);
        if (next) next.focus();
      }));
      if (focusId != null) {
        const target = $(`[data-doc-index="${focusId}"]`, host);
        if (target) target.focus();
      }
    };
    const drawPaper = () => {
      const doc = documents[active];
      $('[data-doc-paper]', host).innerHTML = `
        <div class="tw-paper-top"><span>RL26 · Activity ${doc.id}</span><i>Generated with python-docx</i></div>
        <h5>${escapeHtml(doc.id)} · ${escapeHtml(doc.title)}</h5>
        <p class="tw-doc-intro">This is a procedural lab. Follow the steps in sequence and validate the app at each run point.</p>
        <div class="tw-doc-toc"><b>Contents</b>${doc.sections.map((section, index) => `<button type="button" data-section-index="${index}"><span>${String(index + 1).padStart(2, '0')}</span><em>${escapeHtml(section)}</em><i>···· ${index + 2}</i></button>`).join('')}</div>
        <div class="tw-doc-callout"><b>Source-grounded note</b><span>${escapeHtml(doc.note)}</span></div>
        <div class="tw-doc-page-foot"><span>Workshop activity guide · sample preview</span><span>${doc.id} / 06</span></div>`;
      $$('[data-section-index]', host).forEach(button => button.addEventListener('click', () => {
        $$('[data-section-index]', host).forEach(item => item.classList.toggle('active', item === button));
        setStatus(host, 'good', `Section ${+button.dataset.sectionIndex + 1} selected · source remains linked`);
      }));
    };
    const drawProof = () => {
      const doc = documents[active];
      const checks = localChecks.get(doc.id);
      $('[data-doc-proof]', host).innerHTML = `
        <div class="tw-section-label">Source lineage</div>
        <div class="tw-doc-sources">${doc.sources.map(source => `<div><i>↳</i><span>${escapeHtml(source)}</span></div>`).join('')}</div>
        <div class="tw-section-label">Document contract</div>
        <div class="tw-doc-contract"><div><span>Template</span><b>Working DOCX</b></div><div><span>TOC</span><b>Word field</b></div><div><span>Steps</span><b>Restart / section</b></div><div><span>Client</span><b>Studio Pro 10.24.14</b></div></div>
        <div class="tw-section-label">Local QA rehearsal</div>
        <div class="tw-doc-checks">
          <label><input type="checkbox" data-doc-check="visual" ${checks.visual ? 'checked' : ''}><span><b>Screenshot pass</b><small>Documented TODO: replace placeholders</small></span></label>
          <label><input type="checkbox" data-doc-check="toc" ${checks.toc ? 'checked' : ''}><span><b>Update TOC in Word</b><small>Populate page numbers from the field</small></span></label>
          <label><input type="checkbox" data-doc-check="behavior" ${checks.behavior ? 'checked' : ''}><span><b>Studio Pro review</b><small>Confirm steps against real behavior</small></span></label>
        </div>
        <p class="tw-doc-disclaimer">Checks are a browser-only review rehearsal; they do not edit the generated DOCX files.</p>`;
      $$('[data-doc-check]', host).forEach(input => input.addEventListener('change', () => {
        checks[input.dataset.docCheck] = input.checked;
        const done = Object.values(checks).filter(Boolean).length;
        setStatus(host, done === 3 ? 'good' : 'warn', done === 3 ? `Activity ${doc.id} review rehearsal complete` : `Activity ${doc.id} · ${done}/3 review gates`);
        drawShelf();
      }));
    };
    const draw = focusId => {
      drawShelf(focusId);
      drawPaper();
      drawProof();
    };
    $$('[data-doc-filter]', host).forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.docFilter;
      $$('[data-doc-filter]', host).forEach(item => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', selected);
      });
      draw();
    }));
    draw();
    return () => {};
  }

  function migrationRetrospective(spec, host, head) {
    const timers = [];
    let generation = 0;
    let activePhase = 0;
    const evidence = [
      ['Three migrations at once', 'React client, connector surface, and BOM replacement were mixed in one app copy.'],
      ['Validator success over runtime quality', 'The project could report zero model errors while pages were blank, twitching, or behaviorally wrong.'],
      ['Security shortcut', 'Project security and entity access were stripped to clear a validator blockage; that state is explicitly rejected.'],
      ['Broad page blanking', 'Legacy widgets were removed wholesale, damaging login, home, workflow, and admin surfaces.']
    ];
    const phases = [
      { n:'01', title:'Mendix 10.24 + React only', goal:'Prove login, navigation, home, and runtime coherence while security remains intact.', checks:['Fresh copy of the untouched 10.12 app','Exact 10.24.17 toolchain','Studio Pro dialog metadata pass','Runtime proof before validator score'] },
      { n:'02', title:'Connector / module upgrade', goal:'Upgrade the Teamcenter connector surface while keeping legacy BOM behavior temporarily.', checks:['Phase 1 restore point exists','Login and configuration still work','No BOM component surgery','Re-run Studio Pro behavior checks'] },
      { n:'03', title:'BOM component migration', goal:'Replace the legacy BOM only after the React base and connector are both healthy.', checks:['Use the known sample app as reference','Patch only the BOM surface','Keep startup and security unchanged','Verify the real page in Studio Pro'] }
    ];

    host.innerHTML = head + `
      <div class="tw-workbench tw-migration">
        <header class="tw-migration-hero">
          <div><span class="tw-kicker">10.24 React migration retrospective</span><h4>A successful build was not a successful migration.</h4><p>The mutated 10.24RC copy is research evidence—not the delivery base. This planner preserves the failure lessons and starts clean.</p></div>
          <div class="tw-migration-verdict"><span>DELIVERY BASE</span><b>RESET</b><small>fresh 10.12 copy</small></div>
        </header>
        <div class="tw-migration-proof">
          <div><span>Validator</span><b>0 errors</b><small>insufficient evidence</small></div><i>≠</i><div><span>Runtime</span><b>coherent app</b><small>actual success criterion</small></div>
        </div>
        <div class="tw-migration-layout">
          <section class="tw-migration-evidence">
            <div class="tw-section-head"><span>FAILED COPY</span><div><b>What the experiment proved</b><small>Evidence retained without presenting an auto-fix</small></div></div>
            <div class="tw-evidence-list">${evidence.map((item, index) => `<button type="button" data-migration-evidence="${index}" class="${index === 0 ? 'active' : ''}" aria-pressed="${index === 0}"><i>0${index + 1}</i><span><b>${escapeHtml(item[0])}</b><small>${escapeHtml(item[1])}</small></span></button>`).join('')}</div>
            <div class="tw-evidence-detail" data-evidence-detail><b>Failure boundary</b><p>${escapeHtml(evidence[0][1])}</p><span>Current 10.24RC copy · research only</span></div>
          </section>
          <section class="tw-reset-plan">
            <div class="tw-section-head"><span>CLEAN REDO</span><div><b>Phased reset plan</b><small>One migration surface at a time</small></div><span class="tw-status" data-tw-status>Select a phase</span></div>
            <div class="tw-phase-rail" role="tablist" aria-label="Migration phases">${phases.map((phase, index) => `<button type="button" role="tab" data-migration-phase="${index}" class="${index === 0 ? 'active' : ''}" aria-selected="${index === 0}"><i>${phase.n}</i><span>${escapeHtml(phase.title)}</span></button>`).join('')}</div>
            <div class="tw-phase-card" data-phase-card></div>
          </section>
        </div>
      </div>`;

    const drawPhase = () => {
      const phase = phases[activePhase];
      $('[data-phase-card]', host).innerHTML = `
        <div class="tw-phase-number">PHASE ${phase.n}</div><h5>${escapeHtml(phase.title)}</h5><p>${escapeHtml(phase.goal)}</p>
        <div class="tw-phase-checks">${phase.checks.map((check, index) => `<label><input type="checkbox" data-phase-check="${index}" ${index < 2 ? 'checked' : ''}><span>${escapeHtml(check)}</span></label>`).join('')}</div>
        <button class="w-btn primary" type="button" data-evaluate-phase>Evaluate phase gate</button>
        <div class="tw-phase-result" data-phase-result><span>No automation is claimed here.</span><p>The gate records whether the clean migration has enough runtime evidence to proceed.</p></div>`;
      $('[data-evaluate-phase]', host).addEventListener('click', event => {
        const turn = ++generation;
        clearTimers(timers);
        const button = event.currentTarget;
        button.disabled = true;
        setStatus(host, 'busy', 'Reviewing runtime and guardrail evidence');
        later(timers, () => {
          if (turn !== generation) return;
          const checked = $$('[data-phase-check]:checked', host).length;
          const complete = checked === phase.checks.length;
          $('[data-phase-result]', host).className = `tw-phase-result ${complete ? 'pass' : 'blocked'}`;
          $('[data-phase-result]', host).innerHTML = complete
            ? `<span>Gate evidence is complete</span><p>Phase ${phase.n} can move to a real Studio Pro review. This browser planner did not alter an app.</p>`
            : `<span>Hold · ${phase.checks.length - checked} guardrail${phase.checks.length - checked === 1 ? '' : 's'} missing</span><p>Do not advance because validator/build success alone cannot prove runtime quality.</p>`;
          setStatus(host, complete ? 'good' : 'bad', complete ? 'Gate ready for real Studio Pro proof' : 'Gate held · runtime evidence incomplete');
          button.disabled = false;
        }, 440);
      });
    };
    $$('[data-migration-evidence]', host).forEach(button => button.addEventListener('click', () => {
      const index = +button.dataset.migrationEvidence;
      $$('[data-migration-evidence]', host).forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', active);
      });
      $('[data-evidence-detail]', host).innerHTML = `<b>Failure boundary</b><p>${escapeHtml(evidence[index][1])}</p><span>Current 10.24RC copy · research only</span>`;
    }));
    $$('[data-migration-phase]', host).forEach(button => button.addEventListener('click', () => {
      activePhase = +button.dataset.migrationPhase;
      $$('[data-migration-phase]', host).forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', active);
      });
      setStatus(host, '', `Phase ${phases[activePhase].n} selected`);
      drawPhase();
    }));
    drawPhase();
    return () => {
      generation += 1;
      clearTimers(timers);
    };
  }

  function oauthBroker(spec, host, head) {
    const timers = [];
    let generation = 0;
    let mode = 'browser';
    let step = 0;
    const isCore = spec.variant === 'core';
    const flows = {
      browser: [
        ['Broker ready', 'Loopback server is listening'],
        ['Browser login', 'Human authorizes in the provider UI'],
        ['OAuth callback', 'Authorization code returns to localhost'],
        ['Token exchange', 'Broker persists and redacts token material'],
        ['Agent ready', 'Local tools read a refreshed token']
      ],
      headless: [
        ['Broker ready', 'Separate headless path enabled'],
        ['Connected App', 'Client credentials are configured'],
        ['Token exchange', 'Dedicated integration identity is used'],
        ['Separate cache', 'Headless token never replaces browser token'],
        ['Agent ready', 'CLI or localhost endpoint can serve it']
      ]
    };
    const examples = {
      health: { route:'/health', payload:{ ok:true, host:'127.0.0.1', browser_auth:'ready', headless_auth:'optional' } },
      limits: { route:'/examples/salesforce/limits', payload:{ DailyApiRequests:{ Max:100000, Remaining:99842 }, source:'sanitized read-only sample' } },
      cases: { route:'/examples/salesforce/cases/recent', payload:{ records:[{ id:'CASE-DEMO-104', status:'Open', priority:'Normal' },{ id:'CASE-DEMO-099', status:'Working', priority:'High' }] } },
      objects: { route:'/examples/salesforce/projects/recent', payload:{ records:[{ id:'PROJECT-DEMO-07', name:'Integration rehearsal', state:'Active' }] } }
    };

    host.innerHTML = head + `
      <div class="tw-workbench tw-oauth">
        <header class="tw-oauth-header">
          <div class="tw-oauth-logo"><i>SF</i><span><b>Local OAuth token broker</b><small>localhost only · ${isCore ? 'packaged core' : 'Node prototype v1'}</small></span></div>
          <div class="tw-oauth-endpoint"><span>LISTENING</span><code>127.0.0.1:1717</code><i></i></div>
        </header>
        <div class="tw-oauth-layout">
          <section class="tw-oauth-control">
            <div class="tw-segment" role="group" aria-label="OAuth path"><button type="button" class="active" data-oauth-mode="browser" aria-pressed="true">Browser login · recommended</button><button type="button" data-oauth-mode="headless" aria-pressed="false">Headless · optional</button></div>
            <div class="tw-oauth-summary" data-oauth-summary></div>
            <div class="tw-oauth-lane" data-oauth-lane></div>
            <div class="tw-oauth-actions"><button class="w-btn primary" type="button" data-oauth-run>Run redacted browser flow</button><button class="w-btn" type="button" data-oauth-reset>Reset replay</button><span class="tw-status" data-tw-status>Ready for a local replay</span></div>
          </section>
          <aside class="tw-oauth-vault">
            <div class="tw-section-head"><span>LOCAL VAULT</span><div><b>Token material</b><small>Values are never rendered</small></div></div>
            <div class="tw-token-card"><span>Browser access token</span><code>••••••••••••••••</code><i data-browser-token>not issued</i></div>
            <div class="tw-token-card"><span>Refresh token</span><code>••••••••••••••••</code><i data-refresh-token>not issued</i></div>
            <div class="tw-token-card"><span>Headless access token</span><code>••••••••••••••••</code><i data-headless-token>separate cache</i></div>
            <p>Agents use local token endpoints. The browser path refreshes automatically; client credentials remain a separate, opt-in path.</p>
          </aside>
        </div>
        <section class="tw-oauth-examples">
          <div class="tw-section-head"><span>READ-ONLY EXAMPLES</span><div><b>Verify the broker without writing SOQL</b><small>Sanitized browser responses</small></div></div>
          <div class="tw-oauth-example-layout">
            <div class="tw-example-list"><button type="button" data-oauth-example="health">Health</button><button type="button" data-oauth-example="limits">Org limits</button><button type="button" data-oauth-example="cases">Recent cases</button><button type="button" data-oauth-example="objects">Project-like objects</button></div>
            <pre data-oauth-response aria-live="polite"><span>GET</span> /health\n\nSelect a route to inspect a browser-safe response.</pre>
          </div>
        </section>
      </div>`;

    const drawFlow = () => {
      const flow = flows[mode];
      $('[data-oauth-summary]', host).innerHTML = mode === 'browser'
        ? `<span class="tw-pill good">recommended</span><b>Log in once with a human browser</b><p>The broker reuses the saved token and refreshes it for local agents and scripts.</p>`
        : `<span class="tw-pill warn">separate path</span><b>Fully unattended client credentials</b><p>Requires a Connected App and integration identity; it does not replace browser login.</p>`;
      $('[data-oauth-lane]', host).innerHTML = flow.map((item, index) => `
        <div class="tw-oauth-step ${index < step ? 'done' : index === step ? 'active' : ''}"><i>${index < step ? '✓' : String(index + 1).padStart(2, '0')}</i><span><b>${escapeHtml(item[0])}</b><small>${escapeHtml(item[1])}</small></span></div>`).join('');
      $('[data-oauth-run]', host).textContent = mode === 'browser' ? 'Run redacted browser flow' : 'Run redacted headless flow';
    };
    const reset = () => {
      generation += 1;
      clearTimers(timers);
      step = 0;
      $('[data-oauth-run]', host).disabled = false;
      $('[data-browser-token]', host).textContent = 'not issued';
      $('[data-refresh-token]', host).textContent = 'not issued';
      $('[data-headless-token]', host).textContent = 'separate cache';
      setStatus(host, '', 'Ready for a local replay');
      drawFlow();
    };
    $$('[data-oauth-mode]', host).forEach(button => button.addEventListener('click', () => {
      mode = button.dataset.oauthMode;
      $$('[data-oauth-mode]', host).forEach(item => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', selected);
      });
      reset();
    }));
    $('[data-oauth-run]', host).addEventListener('click', event => {
      const turn = ++generation;
      clearTimers(timers);
      step = 0;
      const button = event.currentTarget;
      button.disabled = true;
      setStatus(host, 'busy', mode === 'browser' ? 'Waiting for the localhost callback' : 'Requesting a dedicated headless token');
      drawFlow();
      flows[mode].forEach((_, index) => later(timers, () => {
        if (turn !== generation) return;
        step = index + 1;
        drawFlow();
      }, 160 + index * 250));
      later(timers, () => {
        if (turn !== generation) return;
        if (mode === 'browser') {
          $('[data-browser-token]', host).textContent = 'issued · redacted';
          $('[data-refresh-token]', host).textContent = 'saved · redacted';
        } else {
          $('[data-headless-token]', host).textContent = 'issued · redacted';
        }
        setStatus(host, 'good', mode === 'browser' ? 'Browser token available to localhost agents' : 'Headless token cached separately');
        button.disabled = false;
      }, 160 + flows[mode].length * 250);
    });
    $('[data-oauth-reset]', host).addEventListener('click', reset);
    $$('[data-oauth-example]', host).forEach(button => button.addEventListener('click', () => {
      const example = examples[button.dataset.oauthExample];
      $$('[data-oauth-example]', host).forEach(item => item.classList.toggle('active', item === button));
      $('[data-oauth-response]', host).innerHTML = `<span>GET</span> ${escapeHtml(example.route)}\n\n${escapeHtml(JSON.stringify(example.payload, null, 2))}`;
    }));
    drawFlow();
    return () => {
      generation += 1;
      clearTimers(timers);
    };
  }

  function maiaControl(spec, host, head) {
    const timers = [];
    let generation = 0;
    let tab = 'overview';
    const roots = [
      { id:'app', name:'Sample Mendix application', detail:'Specific app folder · read-only by default' },
      { id:'widget', name:'Widget source lab', detail:'Specific source folder · read-only by default' }
    ];
    const rootChoices = [
      { id:'java', name:'Shared Java actions', detail:'Sanitized sample root' },
      { id:'docs', name:'Local documentation set', detail:'Sanitized sample root' }
    ];
    const capabilities = {
      writes:false, shell:false, tasks:false, widgets:false, npm:false, browser:true, external:false
    };

    host.innerHTML = head + `
      <div class="tw-workbench tw-maia">
        <div class="tw-native-window">
          <header class="tw-native-titlebar"><div class="tw-native-icon">M</div><span><b>Maia Local MCP Toolkit</b><small>Native control center · 2.5.0</small></span><div class="tw-native-controls"><i>—</i><i>□</i><i>×</i></div></header>
          <div class="tw-native-banner"><div><span class="tw-server-light"></span><b>Server running</b><code>http://127.0.0.1:8790/mcp</code></div><button type="button" data-maia-copy>Copy endpoint</button></div>
          <div class="tw-native-body">
            <nav class="tw-native-tabs" role="tablist" aria-label="Toolkit settings">
              <button type="button" role="tab" data-maia-tab="overview" class="active" aria-selected="true"><i>◉</i><span>Overview</span></button>
              <button type="button" role="tab" data-maia-tab="roots" aria-selected="false"><i>▱</i><span>File access</span></button>
              <button type="button" role="tab" data-maia-tab="capabilities" aria-selected="false"><i>⌁</i><span>Capabilities</span></button>
              <button type="button" role="tab" data-maia-tab="browser" aria-selected="false"><i>▣</i><span>Browser test</span></button>
            </nav>
            <main class="tw-native-panel" data-maia-panel aria-live="polite"></main>
          </div>
          <footer class="tw-native-status"><span class="tw-status good" data-tw-status>Loopback server healthy</span><span>Streamable HTTP · No Auth · local origin checks</span></footer>
        </div>
      </div>`;

    const overviewPanel = () => `
      <div class="tw-native-heading"><div><h5>Overview</h5><p>Maia receives typed local tools over Streamable HTTP. The executable bundles its core runtime and keeps higher-impact capabilities off until enabled here.</p></div><span class="tw-pill good">healthy</span></div>
      <div class="tw-health-grid">
        <div><i class="good">✓</i><span><b>MCP endpoint</b><small>loopback · port 8790</small></span></div>
        <div><i class="good">✓</i><span><b>Embedded runtime</b><small>Node + locked packages</small></span></div>
        <div><i class="good">✓</i><span><b>Configuration</b><small>validated before save</small></span></div>
        <div><i>○</i><span><b>Optional toolchains</b><small>detected when needed</small></span></div>
      </div>
      <section class="tw-native-group">
        <header><b>Connection for Studio Pro Maia</b><span>Studio Pro 11.8+</span></header>
        <div class="tw-native-form-row"><span>Server name</span><code>Maia Local Developer Toolkit</code></div>
        <div class="tw-native-form-row"><span>Connection type</span><code>HTTP (Streamable)</code></div>
        <div class="tw-native-form-row"><span>Authentication</span><code>No Auth · loopback boundary</code></div>
      </section>
      <div class="tw-native-actions"><button class="w-btn primary" type="button" data-maia-doctor>Run local doctor</button><button class="w-btn" type="button" data-maia-restart>Restart MCP server</button></div>
      <div class="tw-doctor-output" data-doctor-output>Core health checks have not been replayed.</div>`;

    const rootsPanel = () => `
      <div class="tw-native-heading"><div><h5>File access</h5><p>MCP tools can inspect only explicitly approved roots. The tools cannot add roots or change this permission list.</p></div><span class="tw-pill">${roots.length} roots</span></div>
      <div class="tw-root-list">${roots.map(root => `<div class="tw-root-row"><i>▰</i><span><b>${escapeHtml(root.name)}</b><small>${escapeHtml(root.detail)}</small></span><button type="button" data-maia-remove-root="${root.id}" aria-label="Remove ${escapeHtml(root.name)}">Remove</button></div>`).join('')}</div>
      <section class="tw-native-group"><header><b>Add a bounded sample root</b><span>Native picker represented safely</span></header><div class="tw-native-add"><select data-maia-root-choice aria-label="Sample root choice">${rootChoices.filter(choice => !roots.some(root => root.id === choice.id)).map(choice => `<option value="${choice.id}">${escapeHtml(choice.name)}</option>`).join('')}</select><button class="w-btn primary" type="button" data-maia-add-root ${rootChoices.every(choice => roots.some(root => root.id === choice.id)) ? 'disabled' : ''}>Browse and add</button></div></section>
      <div class="tw-native-warning"><i>!</i><p><b>Specific folders are safer than a profile or drive root.</b> Canonical-path checks reject junction and symlink escapes; secret-like files remain blocked by default.</p></div>`;

    const capabilityRows = [
      ['writes','File changes','Write, patch, create, move, copy, and delete inside allowed roots'],
      ['shell','Process execution','Run only allowlisted native executables with bounded output'],
      ['tasks','Background tasks','Managed processes with concurrency and runtime limits'],
      ['widgets','Widget tools','Inspect, lint, and run explicit widget scripts'],
      ['npm','npm installation','Requires writes, tasks, and external Node/npm'],
      ['browser','Browser testing','Installed Edge/Chrome, isolated context, exact local origins'],
      ['external','External information','Allowlisted docs and opt-in provider-backed web search']
    ];
    const capabilitiesPanel = () => `
      <div class="tw-native-heading"><div><h5>Capabilities</h5><p>Each higher-impact tool group is a separate gate. Enabling a dependent capability also reveals its prerequisite boundary.</p></div><span class="tw-pill warn">least privilege</span></div>
      <div class="tw-capability-list">${capabilityRows.map(row => `<label class="tw-capability-row"><span><b>${escapeHtml(row[1])}</b><small>${escapeHtml(row[2])}</small></span><input type="checkbox" data-maia-cap="${row[0]}" ${capabilities[row[0]] ? 'checked' : ''}><i></i></label>`).join('')}</div>
      <div class="tw-native-warning"><i>i</i><p><b>Process execution is not an operating-system sandbox.</b> Allowed roots constrain toolkit file tools, but an enabled child process runs as the current Windows user.</p></div>`;

    const browserPanel = () => `
      <div class="tw-native-heading"><div><h5>Bounded browser test</h5><p>Playwright uses an installed browser. Every navigation, redirect, script, image, and request must stay on an exact allowed loopback origin.</p></div><span class="tw-pill good">browser tools on</span></div>
      <div class="tw-browser-boundary">
        <label><span>Allowed origin</span><select data-maia-origin><option>http://127.0.0.1:8080</option><option>http://localhost:8080</option></select></label>
        <label><span>Target path</span><input data-maia-path value="/index.html" aria-label="Local test path"></label>
        <button class="w-btn primary" type="button" data-maia-browser-run>Run bounded test</button>
      </div>
      <div class="tw-browser-test-grid">
        <div class="tw-browser-preview"><div class="tw-browser-bar"><i></i><i></i><i></i><code data-browser-url>http://127.0.0.1:8080/index.html</code></div><div class="tw-browser-page" data-browser-page><span>LOCAL APP</span><b>Ready for an isolated browser replay</b><p>No external host can be reached by this simulation.</p></div></div>
        <div class="tw-browser-checks" data-browser-checks>${['Origin allowlist','Navigation','Accessibility snapshot','Console + screenshot'].map((label, index) => `<div data-browser-check="${index}"><i>${index + 1}</i><span><b>${escapeHtml(label)}</b><small>waiting</small></span></div>`).join('')}</div>
      </div>`;

    const wirePanel = () => {
      if (tab === 'overview') {
        $('[data-maia-doctor]', host).addEventListener('click', event => {
          const turn = ++generation;
          clearTimers(timers);
          event.currentTarget.disabled = true;
          setStatus(host, 'busy', 'Running presence-only local checks');
          $('[data-doctor-output]', host).innerHTML = '<span class="tw-native-spinner"></span> Checking endpoint, config, runtime, and optional dependencies…';
          later(timers, () => {
            if (turn !== generation || tab !== 'overview') return;
            $('[data-doctor-output]', host).innerHTML = '<b>4 core checks passed</b><span>Optional Studio Pro, Git, JDK, npm, and browser tooling are reported only when their tool group needs them.</span>';
            $('[data-maia-doctor]', host).disabled = false;
            setStatus(host, 'good', 'Doctor complete · secret values were not inspected');
          }, 620);
        });
        $('[data-maia-restart]', host).addEventListener('click', event => {
          const turn = ++generation;
          clearTimers(timers);
          event.currentTarget.disabled = true;
          setStatus(host, 'busy', 'Restarting the loopback listener safely');
          later(timers, () => {
            if (turn !== generation || tab !== 'overview') return;
            event.currentTarget.disabled = false;
            setStatus(host, 'good', 'Server restarted · endpoint healthy');
          }, 480);
        });
      } else if (tab === 'roots') {
        $$('[data-maia-remove-root]', host).forEach(button => button.addEventListener('click', () => {
          if (roots.length <= 1) {
            setStatus(host, 'bad', 'At least one allowed root must remain');
            return;
          }
          const index = roots.findIndex(root => root.id === button.dataset.maiaRemoveRoot);
          if (index >= 0) roots.splice(index, 1);
          setStatus(host, 'warn', 'Allowed-root change staged in this browser replay');
          renderPanel();
        }));
        const add = $('[data-maia-add-root]', host);
        if (add) add.addEventListener('click', () => {
          const choice = rootChoices.find(item => item.id === $('[data-maia-root-choice]', host).value);
          if (choice && !roots.some(root => root.id === choice.id)) roots.push({ ...choice });
          setStatus(host, 'good', 'Specific sanitized sample root added');
          renderPanel();
        });
      } else if (tab === 'capabilities') {
        $$('[data-maia-cap]', host).forEach(input => input.addEventListener('change', () => {
          const key = input.dataset.maiaCap;
          capabilities[key] = input.checked;
          if (input.checked && key === 'tasks') capabilities.shell = true;
          if (input.checked && key === 'widgets') {
            capabilities.shell = true;
            capabilities.tasks = true;
          }
          if (input.checked && key === 'npm') {
            capabilities.writes = true;
            capabilities.shell = true;
            capabilities.tasks = true;
          }
          setStatus(host, input.checked ? 'warn' : 'good', input.checked ? `${capabilityRows.find(row => row[0] === key)[1]} enabled · boundary elevated` : `${capabilityRows.find(row => row[0] === key)[1]} disabled`);
          renderPanel();
        }));
      } else if (tab === 'browser') {
        const updateUrl = () => {
          const origin = $('[data-maia-origin]', host).value;
          const path = $('[data-maia-path]', host).value.startsWith('/') ? $('[data-maia-path]', host).value : '/' + $('[data-maia-path]', host).value;
          $('[data-browser-url]', host).textContent = origin + path;
        };
        $('[data-maia-origin]', host).addEventListener('change', updateUrl);
        $('[data-maia-path]', host).addEventListener('input', updateUrl);
        $('[data-maia-browser-run]', host).addEventListener('click', event => {
          const turn = ++generation;
          clearTimers(timers);
          event.currentTarget.disabled = true;
          $$('[data-browser-check]', host).forEach(check => check.className = '');
          setStatus(host, 'busy', 'Launching an isolated installed-browser context');
          $$('[data-browser-check]', host).forEach((check, index) => later(timers, () => {
            if (turn !== generation || tab !== 'browser') return;
            if (index > 0) $$('[data-browser-check]', host)[index - 1].className = 'done';
            check.className = 'active';
            $('small', check).textContent = 'running';
          }, 120 + index * 230));
          later(timers, () => {
            if (turn !== generation || tab !== 'browser') return;
            const checks = $$('[data-browser-check]', host);
            checks[checks.length - 1].className = 'done';
            checks.forEach(check => $('small', check).textContent = 'passed');
            $('[data-browser-page]', host).innerHTML = '<span>LOCAL APP · VERIFIED</span><b>Accessible heading found</b><p>0 console errors · 0 disallowed requests · screenshot retained in the local artifact boundary.</p>';
            $('[data-maia-browser-run]', host).disabled = false;
            setStatus(host, 'good', 'Bounded browser test complete · exact origin preserved');
          }, 120 + 4 * 230);
        });
      }
    };
    const renderPanel = () => {
      clearTimers(timers);
      generation += 1;
      $('[data-maia-panel]', host).innerHTML = tab === 'overview' ? overviewPanel()
        : tab === 'roots' ? rootsPanel()
        : tab === 'capabilities' ? capabilitiesPanel()
        : browserPanel();
      wirePanel();
    };
    $$('[data-maia-tab]', host).forEach(button => button.addEventListener('click', () => {
      tab = button.dataset.maiaTab;
      $$('[data-maia-tab]', host).forEach(item => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-selected', selected);
      });
      renderPanel();
    }));
    $('[data-maia-copy]', host).addEventListener('click', event => {
      event.currentTarget.textContent = 'Endpoint copied';
      setStatus(host, 'good', 'Loopback endpoint copied · browser replay only');
      later(timers, () => {
        if (document.contains(event.currentTarget)) event.currentTarget.textContent = 'Copy endpoint';
      }, 700);
    });
    renderPanel();
    return () => {
      generation += 1;
      clearTimers(timers);
    };
  }

  function priceGraph(spec, host, head) {
    const timers = [];
    let generation = 0;
    let productIndex = 0;
    let selectedNode = 'product';
    const products = [
      { key:'software:DEMO-A1', name:'Engineering Suite Alpha', type:'Software', taxonomy:'Design & simulation', cost:'Band B · values redacted', service:'Standard support', replacement:'Suite Beta' },
      { key:'hardware:DEMO-E20', name:'Edge Node E20', type:'Hardware', taxonomy:'Industrial edge', cost:'Band C · values redacted', service:'Deployment service', replacement:'Edge Node E24' },
      { key:'service:DEMO-S7', name:'Integration Service S7', type:'Service', taxonomy:'Implementation', cost:'Band A · values redacted', service:'Named delivery package', replacement:'Not applicable' }
    ];
    const graphNodes = [
      { id:'product', x:275, y:145, kind:'Product' },
      { id:'taxonomy', x:90, y:65, kind:'Taxonomy' },
      { id:'cost', x:465, y:55, kind:'Cost band' },
      { id:'service', x:90, y:245, kind:'Service' },
      { id:'replacement', x:470, y:235, kind:'Replacement' }
    ];
    const edges = [['product','taxonomy','CLASSIFIED_AS'],['product','cost','HAS_COST_BAND'],['product','service','SUPPORTED_BY'],['product','replacement','REPLACED_BY']];
    const questions = {
      boundary:'Which catalog relationships are known for this item?',
      support:'What support is linked to this item?',
      replacement:'Is there a documented replacement?'
    };
    const nodeById = id => graphNodes.find(node => node.id === id);
    const current = () => products[productIndex];
    const valueFor = id => {
      const product = current();
      return id === 'product' ? product.name : product[id];
    };

    host.innerHTML = head + `
      <div class="tw-workbench tw-pricegraph">
        <header class="tw-graph-header">
          <div><span class="tw-kicker">Neo4j knowledge graph</span><h4>PriceBook relationship explorer</h4><p>Browse sanitized catalog metadata, then inspect exactly which graph facts ground the sample chat answer.</p></div>
          <div class="tw-graph-stack"><span>iX viewer</span><i>→</i><span>FastAPI</span><i>→</i><span>Neo4j</span></div>
        </header>
        <div class="tw-graph-search">
          <label><span>Catalog item</span><select data-pg-product>${products.map((product, index) => `<option value="${index}">${escapeHtml(product.name)} · ${escapeHtml(product.type)}</option>`).join('')}</select></label>
          <span class="tw-pill">sanitized graph · no real prices</span>
          <span class="tw-status good" data-tw-status>Graph fixture loaded</span>
        </div>
        <div class="tw-graph-layout">
          <section class="tw-graph-canvas">
            <div class="tw-section-head"><span>GRAPH</span><div><b data-pg-title>Engineering Suite Alpha</b><small>Click a node to inspect its source-safe metadata</small></div></div>
            <svg viewBox="0 0 560 300" role="img" aria-label="Sanitized price book relationship graph">
              <defs><marker id="tw-pg-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z"></path></marker></defs>
              ${edges.map(edge => {
                const from = nodeById(edge[0]), to = nodeById(edge[1]);
                const mx = Math.round((from.x + to.x) / 2), my = Math.round((from.y + to.y) / 2);
                return `<g class="tw-graph-edge" data-pg-edge="${edge[1]}"><line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line><text x="${mx}" y="${my - 6}" text-anchor="middle">${edge[2]}</text></g>`;
              }).join('')}
              ${graphNodes.map(node => `<g class="tw-graph-node ${node.id === selectedNode ? 'active' : ''}" data-pg-node="${node.id}" transform="translate(${node.x} ${node.y})" role="button" tabindex="0" aria-label="Inspect ${node.kind}"><circle r="${node.id === 'product' ? 33 : 25}"></circle><text text-anchor="middle" y="-3">${escapeHtml(node.kind)}</text><text class="value" text-anchor="middle" y="11" data-pg-node-value="${node.id}"></text></g>`).join('')}
            </svg>
            <div class="tw-node-inspector" data-pg-inspector></div>
          </section>
          <section class="tw-graph-chat">
            <div class="tw-section-head"><span>GROUNDED CHAT</span><div><b>Sample agent trace</b><small>Every claim cites returned graph nodes</small></div></div>
            <div class="tw-chat-question">
              <label><span>Question</span><select data-pg-question>${Object.entries(questions).map(entry => `<option value="${entry[0]}">${escapeHtml(entry[1])}</option>`).join('')}</select></label>
              <button class="w-btn primary" type="button" data-pg-ask>Traverse graph</button>
            </div>
            <div class="tw-cypher"><span>CYPHER</span><code>MATCH (p:Product {sourceKey:$key})-[r]-&gt;(n) RETURN type(r), n</code></div>
            <div class="tw-chat-trace" data-pg-trace><div class="tw-empty">Run a traversal to see query, graph evidence, and answer as separate steps.</div></div>
          </section>
        </div>
      </div>`;

    const updateNodeLabels = () => {
      graphNodes.forEach(node => {
        const text = valueFor(node.id);
        $(`[data-pg-node-value="${node.id}"]`, host).textContent = text.length > 20 ? text.slice(0, 18) + '…' : text;
      });
      $('[data-pg-title]', host).textContent = current().name;
    };
    const inspect = id => {
      selectedNode = id;
      $$('[data-pg-node]', host).forEach(node => node.classList.toggle('active', node.dataset.pgNode === id));
      $$('[data-pg-edge]', host).forEach(edge => edge.classList.toggle('active', edge.dataset.pgEdge === id || id === 'product'));
      const label = nodeById(id).kind;
      $('[data-pg-inspector]', host).innerHTML = `<span>${escapeHtml(label)}</span><b>${escapeHtml(valueFor(id))}</b><small>Source key ${escapeHtml(current().key)} · sanitized browser fixture</small>`;
    };
    const selectProduct = index => {
      productIndex = index;
      updateNodeLabels();
      inspect('product');
      $('[data-pg-trace]', host).innerHTML = '<div class="tw-empty">Catalog item changed. Traverse the graph to ground a new answer.</div>';
      setStatus(host, 'good', `${current().type} node loaded · price values remain redacted`);
    };
    $$('[data-pg-node]', host).forEach(node => {
      const choose = () => inspect(node.dataset.pgNode);
      node.addEventListener('click', choose);
      node.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          choose();
        }
      });
    });
    $('[data-pg-product]', host).addEventListener('change', event => selectProduct(+event.target.value));
    $('[data-pg-ask]', host).addEventListener('click', event => {
      const turn = ++generation;
      clearTimers(timers);
      const button = event.currentTarget;
      const question = $('[data-pg-question]', host).value;
      const product = current();
      const evidenceIds = question === 'support' ? ['product','service'] : question === 'replacement' ? ['product','replacement'] : ['product','taxonomy','cost','service','replacement'];
      const answer = question === 'support'
        ? `The graph links ${product.name} to “${product.service}.” No entitlement or live availability claim is present.`
        : question === 'replacement'
          ? product.replacement === 'Not applicable' ? 'This service node has no replacement relationship in the sanitized fixture.' : `A REPLACED_BY relationship points to “${product.replacement}.” The graph does not claim equivalence.`
          : `${product.name} is classified as ${product.taxonomy}, has ${product.cost}, links to ${product.service}, and records ${product.replacement} as its replacement field.`;
      button.disabled = true;
      setStatus(host, 'busy', 'Traversing typed graph relationships');
      $('[data-pg-trace]', host).innerHTML = '<div class="tw-trace-step active"><i>01</i><span><b>Parameterized query</b><small>sourceKey passed separately · LIMIT applied</small></span></div><div class="tw-trace-step"><i>02</i><span><b>Graph evidence</b><small>waiting</small></span></div><div class="tw-trace-step"><i>03</i><span><b>Grounded answer</b><small>waiting</small></span></div>';
      later(timers, () => {
        if (turn !== generation) return;
        const steps = $$('.tw-trace-step', host);
        steps[0].className = 'tw-trace-step done';
        steps[1].className = 'tw-trace-step active';
        $('small', steps[1]).textContent = evidenceIds.map(id => nodeById(id).kind).join(' · ');
        evidenceIds.forEach(id => $(`[data-pg-node="${id}"]`, host).classList.add('trace'));
      }, 330);
      later(timers, () => {
        if (turn !== generation) return;
        $$('[data-pg-node]', host).forEach(node => node.classList.remove('trace'));
        $('[data-pg-trace]', host).innerHTML = `
          <div class="tw-trace-step done"><i>✓</i><span><b>Parameterized query</b><small>1 product · ${evidenceIds.length - 1} related node${evidenceIds.length - 1 === 1 ? '' : 's'}</small></span></div>
          <div class="tw-trace-step done"><i>✓</i><span><b>Graph evidence</b><small>${evidenceIds.map(id => escapeHtml(nodeById(id).kind)).join(' · ')}</small></span></div>
          <div class="tw-graph-answer"><span>ANSWER · SANITIZED SAMPLE</span><p>${escapeHtml(answer)}</p><div>${evidenceIds.map(id => `<button type="button" data-pg-citation="${id}">${escapeHtml(nodeById(id).kind)}</button>`).join('')}</div></div>`;
        $$('[data-pg-citation]', host).forEach(citation => citation.addEventListener('click', () => {
          inspect(citation.dataset.pgCitation);
          $(`[data-pg-node="${citation.dataset.pgCitation}"]`, host).focus();
        }));
        button.disabled = false;
        setStatus(host, 'good', 'Answer complete · every claim remains graph-cited');
      }, 760);
    });
    updateNodeLabels();
    inspect('product');
    return () => {
      generation += 1;
      clearTimers(timers);
    };
  }

  function mxDocker(spec, host, head) {
    const timers = [];
    let generation = 0;
    let state = 'idle';
    let activeStage = -1;
    const stages = [
      ['Inspect package', '.mda and HSQL snapshot detected'],
      ['Unpack application', 'Isolated build context prepared'],
      ['Build image', 'Mendix Docker buildpack'],
      ['Start PostgreSQL', 'Fresh isolated database'],
      ['Migrate snapshot', 'HSQL state → PostgreSQL runtime'],
      ['Launch runtime', 'Container starts with bounded config'],
      ['Verify application', 'Health and login surface checked']
    ];
    const logLines = [];

    host.innerHTML = head + `
      <div class="tw-workbench tw-docker">
        <header class="tw-docker-header">
          <div class="tw-docker-cubes"><i></i><i></i><i></i></div>
          <div><span class="tw-kicker">Mendix isolated deployment</span><h4>Snapshot → PostgreSQL recovery lab</h4><p>Rehearse a packaged app deployment without touching the original project or source database.</p></div>
          <span class="tw-pill good">browser-only state machine</span>
        </header>
        <div class="tw-docker-boundary">
          <div><span>SOURCE · READ ONLY</span><b>SampleApp.mda</b><small>bundled HSQL snapshot</small></div><i>→</i><div><span>ISOLATED BUILD</span><b>Mendix buildpack</b><small>ephemeral context</small></div><i>→</i><div><span>TARGET</span><b>PostgreSQL container</b><small>fresh volume</small></div>
        </div>
        <div class="tw-docker-controls">
          <label class="tw-switch-row"><input type="checkbox" data-docker-failure><span class="tw-switch"></span><span><b>Inject restore failure</b><small>Rehearse missing database-role recovery</small></span></label>
          <div><button class="w-btn primary" type="button" data-docker-run>Run isolated deployment</button><button class="w-btn" type="button" data-docker-reset>Reset replay</button></div>
          <span class="tw-status" data-tw-status>Package ready · source protected</span>
        </div>
        <div class="tw-docker-layout">
          <section class="tw-docker-pipeline">
            <div class="tw-section-head"><span>DEPLOYMENT</span><div><b>State machine</b><small>Each boundary must complete before runtime starts</small></div></div>
            <div class="tw-docker-stages" data-docker-stages></div>
            <div class="tw-docker-recovery" data-docker-recovery></div>
          </section>
          <section class="tw-docker-terminal">
            <div class="tw-terminal-bar"><span><i></i><i></i><i></i></span><b>mx-docker · evidence log</b><em data-docker-clock>00:00</em></div>
            <div class="tw-terminal-body" data-docker-log aria-live="polite"><div><span>00:00:00</span><i>INFO</i><p>Waiting for isolated deployment replay.</p></div></div>
            <div class="tw-docker-evidence"><div><span>Original app</span><b>untouched</b></div><div><span>Source database</span><b>read-only</b></div><div><span>Target volume</span><b>isolated</b></div></div>
          </section>
        </div>
      </div>`;

    const drawStages = () => {
      $('[data-docker-stages]', host).innerHTML = stages.map((stage, index) => {
        const cls = state === 'failed' && index === activeStage ? 'failed'
          : index < activeStage || state === 'complete' ? 'done'
          : index === activeStage ? 'active' : '';
        const marker = cls === 'done' ? '✓' : cls === 'failed' ? '!' : String(index + 1).padStart(2, '0');
        const statusText = cls === 'done' ? 'complete' : cls === 'failed' ? 'blocked' : cls === 'active' ? 'running' : 'queued';
        return `<div class="tw-docker-stage ${cls}"><i>${marker}</i><span><b>${escapeHtml(stage[0])}</b><small>${escapeHtml(stage[1])}</small></span><em>${statusText}</em></div>`;
      }).join('');
    };
    const addLog = (level, text) => {
      const seconds = logLines.length + 1;
      logLines.push({ time: `00:00:${String(seconds).padStart(2, '0')}`, level, text });
      $('[data-docker-log]', host).innerHTML = logLines.map(line => `<div class="${line.level.toLowerCase()}"><span>${line.time}</span><i>${line.level}</i><p>${escapeHtml(line.text)}</p></div>`).join('');
      $('[data-docker-log]', host).scrollTop = $('[data-docker-log]', host).scrollHeight;
      $('[data-docker-clock]', host).textContent = `00:${String(seconds).padStart(2, '0')}`;
    };
    const reset = () => {
      generation += 1;
      clearTimers(timers);
      state = 'idle';
      activeStage = -1;
      logLines.splice(0);
      $('[data-docker-log]', host).innerHTML = '<div><span>00:00:00</span><i>INFO</i><p>Waiting for isolated deployment replay.</p></div>';
      $('[data-docker-clock]', host).textContent = '00:00';
      $('[data-docker-run]', host).disabled = false;
      $('[data-docker-run]', host).textContent = 'Run isolated deployment';
      $('[data-docker-recovery]', host).innerHTML = '';
      setStatus(host, '', 'Package ready · source protected');
      drawStages();
    };
    const completeSequence = (turn, startAt) => {
      for (let index = startAt; index < stages.length; index += 1) {
        later(timers, () => {
          if (turn !== generation) return;
          activeStage = index;
          state = 'running';
          drawStages();
          addLog(index === 4 ? 'MIGRATE' : 'INFO', stages[index][1]);
        }, (index - startAt) * 280);
      }
      later(timers, () => {
        if (turn !== generation) return;
        activeStage = stages.length;
        state = 'complete';
        drawStages();
        addLog('PASS', 'Runtime health verified; isolated deployment evidence is complete.');
        $('[data-docker-run]', host).disabled = false;
        $('[data-docker-run]', host).textContent = 'Run again';
        $('[data-docker-recovery]', host).innerHTML = '<div class="tw-recovery-pass"><i>✓</i><span><b>Deployment verified</b><small>The source package and original HSQL state remained unchanged.</small></span></div>';
        setStatus(host, 'good', 'Isolated PostgreSQL deployment verified');
      }, (stages.length - startAt) * 280 + 120);
    };
    const start = () => {
      const turn = ++generation;
      clearTimers(timers);
      state = 'running';
      activeStage = 0;
      logLines.splice(0);
      $('[data-docker-recovery]', host).innerHTML = '';
      $('[data-docker-run]', host).disabled = true;
      setStatus(host, 'busy', 'Building an isolated Mendix deployment');
      drawStages();
      const fail = $('[data-docker-failure]', host).checked;
      if (!fail) {
        completeSequence(turn, 0);
        return;
      }
      for (let index = 0; index <= 4; index += 1) {
        later(timers, () => {
          if (turn !== generation) return;
          activeStage = index;
          state = 'running';
          drawStages();
          addLog(index === 4 ? 'MIGRATE' : 'INFO', stages[index][1]);
        }, index * 280);
      }
      later(timers, () => {
        if (turn !== generation) return;
        state = 'failed';
        activeStage = 4;
        drawStages();
        addLog('ERROR', 'Illustrative restore failure: expected database role is absent in the fresh target.');
        $('[data-docker-recovery]', host).innerHTML = '<div class="tw-recovery-card"><i>!</i><span><b>Recovery is isolated and reversible</b><small>Create the missing role in the target container, recreate only the target volume, then replay migration.</small></span><button class="w-btn primary" type="button" data-docker-recover>Apply isolated recovery</button></div>';
        $('[data-docker-run]', host).textContent = 'Deployment blocked';
        setStatus(host, 'bad', 'Migration held · original package remains untouched');
        $('[data-docker-recover]', host).addEventListener('click', event => {
          const recoveryTurn = ++generation;
          clearTimers(timers);
          event.currentTarget.disabled = true;
          $('[data-docker-failure]', host).checked = false;
          state = 'running';
          activeStage = 4;
          drawStages();
          addLog('RECOVER', 'Recreated the isolated target and added the bounded database role.');
          setStatus(host, 'busy', 'Replaying snapshot migration in the fresh target');
          later(timers, () => {
            if (recoveryTurn !== generation) return;
            addLog('PASS', 'Snapshot migration completed after isolated target recovery.');
            activeStage = 5;
            drawStages();
            completeSequence(recoveryTurn, 5);
          }, 360);
        });
      }, 5 * 280 + 100);
    };
    $('[data-docker-run]', host).addEventListener('click', start);
    $('[data-docker-reset]', host).addEventListener('click', reset);
    drawStages();
    return () => {
      generation += 1;
      clearTimers(timers);
    };
  }

  window.PROJECT_WORKBENCHES = Object.assign(window.PROJECT_WORKBENCHES || {}, {
    aiStudioAgent,
    autoModelScore,
    workshopDocs,
    migrationRetrospective,
    oauthBroker,
    maiaControl,
    priceGraph,
    mxDocker
  });
})();
