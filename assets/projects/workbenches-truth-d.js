/*
 * README-grounded portfolio workbenches: Hyper-V archive, LLM evaluation,
 * Teamcenter BOM widget, OpenWrt audit, one-pager style proof, progression
 * evidence, goal drafting, Luma API research, Agent Builder hardening, and
 * static CSV time tracking.
 *
 * These are deterministic browser fixtures. They make no network requests,
 * expose no private source data, and never mutate a visitor's machine.
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
    const id = setTimeout(callback, reducedMotion() ? Math.min(delay, 36) : delay);
    timers.push(id);
    return id;
  };
  const clearTimers = timers => timers.splice(0).forEach(clearTimeout);
  const controller = () => new AbortController();
  const on = (root, signal, event, selector, handler) => {
    root.addEventListener(event, ev => {
      const target = ev.target.closest(selector);
      if (target && root.contains(target)) handler(ev, target);
    }, { signal });
  };
  const listen = (node, signal, event, handler) => node.addEventListener(event, handler, { signal });
  const setStatus = (host, kind, message) => {
    const node = $('[data-td-status]', host);
    if (!node) return;
    node.className = `td-status ${kind || ''}`;
    node.textContent = message;
  };
  const cleanup = (abort, timers = []) => () => {
    abort.abort();
    clearTimers(timers);
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = (() => {
    let value = 0;
    return prefix => `${prefix}-${++value}`;
  })();

  function snapshotArchive(spec, host, head) {
    const abort = controller();
    const timers = [];
    let selected = 0;
    let run = 0;
    const points = [
      {
        label: 'Recovery point 03', state: 'Newest preserved point', health: 'Complete triplet',
        note: 'Configuration, guest state, and saved runtime state are present together.',
        files: [
          ['VMCX', 'Virtual machine configuration', '96 KB fixture'],
          ['VMGS', 'Guest-state metadata', '4 KB fixture'],
          ['VMRS', 'Saved runtime state', '2.4 GB fixture']
        ]
      },
      {
        label: 'Recovery point 02', state: 'Middle preserved point', health: 'Complete triplet',
        note: 'A second configuration generation is retained as a distinct recovery point.',
        files: [
          ['VMCX', 'Virtual machine configuration', '92 KB fixture'],
          ['VMGS', 'Guest-state metadata', '4 KB fixture'],
          ['VMRS', 'Saved runtime state', '2.2 GB fixture']
        ]
      },
      {
        label: 'Recovery point 01', state: 'Oldest preserved point', health: 'Complete triplet',
        note: 'The earliest preserved generation remains available for forensic comparison.',
        files: [
          ['VMCX', 'Virtual machine configuration', '88 KB fixture'],
          ['VMGS', 'Guest-state metadata', '4 KB fixture'],
          ['VMRS', 'Saved runtime state', '2.0 GB fixture']
        ]
      }
    ];
    const instanceId = uid('archive');

    host.innerHTML = head + `
      <div class="td-workbench td-archive">
        <header class="td-shell-head">
          <div><span class="td-kicker">Preserved Hyper-V artifacts</span><h3>Recovery inventory</h3><p>One VM configuration set · three snapshot generations</p></div>
          <div class="td-boundary"><b>Archive, not infrastructure-as-code</b><span>No provisioning or restore is performed</span></div>
        </header>
        <div class="td-archive-layout">
          <aside class="td-archive-index" aria-label="Archive contents">
            <div class="td-mini-title"><span>Inventory</span><em>4 groups</em></div>
            <div class="td-archive-current">
              <i>VM</i><span><b>Demo VM configuration</b><small>VMCX · VMGS · VMRS</small></span><em>current</em>
            </div>
            <div class="td-archive-rail" role="list">
              ${points.map((point, index) => `
                <button type="button" data-sa-point="${index}" class="${index === 0 ? 'active' : ''}" aria-current="${index === 0 ? 'true' : 'false'}">
                  <i></i><span><b>${escapeHtml(point.label)}</b><small>${escapeHtml(point.health)}</small></span><em>03-${index + 1}</em>
                </button>`).join('')}
            </div>
            <div class="td-archive-legend"><span><i class="config"></i>configuration</span><span><i class="guest"></i>guest state</span><span><i class="runtime"></i>runtime state</span></div>
          </aside>
          <main class="td-archive-detail">
            <div class="td-panel-head">
              <div><span class="td-kicker">Selected recovery point</span><b data-sa-title></b></div>
              <span class="td-status good" data-td-status>Triplet relationship verified</span>
            </div>
            <section class="td-archive-map" aria-labelledby="${instanceId}-map">
              <div class="td-archive-origin"><span>VM configuration</span><b>Demo VM</b><small>sanitized archive label</small></div>
              <div class="td-archive-link" aria-hidden="true"><i></i><i></i><i></i></div>
              <div class="td-archive-files" data-sa-files></div>
            </section>
            <div class="td-archive-note"><span>Inventory reading</span><p data-sa-note></p></div>
            <div class="td-plan-box">
              <div><span class="td-kicker">Non-destructive preview</span><b>Recovery plan</b><p>Inspect what a manual recovery would require without mounting, importing, or starting anything.</p></div>
              <label class="td-check"><input type="checkbox" data-sa-runtime checked><span>Include preserved runtime state in the preview</span></label>
              <button class="td-button primary" type="button" data-sa-preview>Preview recovery steps</button>
            </div>
            <ol class="td-recovery-steps" data-sa-steps aria-live="polite">
              <li><i>1</i><span><b>Select a recovery point</b><small>No archive selected for preview yet.</small></span></li>
              <li><i>2</i><span><b>Verify the artifact triplet</b><small>Configuration, guest state, and runtime state remain untouched.</small></span></li>
              <li><i>3</i><span><b>Prepare an isolated copy</b><small>The source archive would be copied before any manual import.</small></span></li>
            </ol>
          </main>
        </div>
      </div>`;

    const render = () => {
      const point = points[selected];
      $('[data-sa-title]', host).textContent = point.label;
      $('[data-sa-note]', host).textContent = point.note;
      $('[data-sa-files]', host).innerHTML = point.files.map((file, index) => `
        <article class="td-archive-file type-${index}">
          <span>${escapeHtml(file[0])}</span><b>${escapeHtml(file[1])}</b><small>${escapeHtml(file[2])}</small><em>present</em>
        </article>`).join('');
      $$('[data-sa-point]', host).forEach((button, index) => {
        button.classList.toggle('active', index === selected);
        button.setAttribute('aria-current', index === selected ? 'true' : 'false');
      });
      setStatus(host, 'good', 'Triplet relationship verified');
      $('[data-sa-steps]', host).classList.remove('running', 'ready');
    };
    on(host, abort.signal, 'click', '[data-sa-point]', (_, button) => {
      run++;
      clearTimers(timers);
      selected = Number(button.dataset.saPoint);
      render();
    });
    on(host, abort.signal, 'click', '[data-sa-preview]', (_, button) => {
      const turn = ++run;
      clearTimers(timers);
      button.disabled = true;
      const steps = $$('[data-sa-steps] li', host);
      steps.forEach(step => step.className = '');
      $('[data-sa-steps]', host).classList.add('running');
      setStatus(host, 'busy', 'Checking the selected artifact relationships');
      const messages = [
        [points[selected].label + ' selected', 'Read-only inventory selection; nothing is mounted.'],
        ['Complete triplet confirmed', 'VMCX, VMGS, and VMRS are present in the same generation.'],
        ['Isolated-copy plan ready', $('[data-sa-runtime]', host).checked
          ? 'A manual copy would retain saved runtime state before import.'
          : 'A manual copy would omit saved runtime state and use configuration only.']
      ];
      steps.forEach((step, index) => later(timers, () => {
        if (turn !== run) return;
        step.className = 'done';
        $('b', step).textContent = messages[index][0];
        $('small', step).textContent = messages[index][1];
      }, 180 + index * 310));
      later(timers, () => {
        if (turn !== run) return;
        button.disabled = false;
        $('[data-sa-steps]', host).classList.add('ready');
        setStatus(host, 'good', 'Preview complete · source archive unchanged');
      }, 180 + steps.length * 310);
    });
    render();
    return cleanup(abort, timers);
  }

  function modelEval(spec, host, head) {
    const abort = controller();
    const timers = [];
    let run = 0;
    let tab = 'catalog';
    let selectedModel = 0;
    let benchmark = 'chat';
    const models = [
      { name: 'Hosted Chat A', family: 'chat', context: '128k fixture', modes: ['chat', 'tools'], note: 'Streaming chat and structured tool calls.' },
      { name: 'Hosted Vision B', family: 'chat', context: '64k fixture', modes: ['chat', 'vision'], note: 'Text and image messages in the catalog fixture.' },
      { name: 'Embedding S', family: 'embedding', context: '1,024 dims', modes: ['embedding'], note: 'Vector similarity benchmark surface.' },
      { name: 'Reranker R', family: 'rerank', context: '32 docs', modes: ['rerank'], note: 'Query-document ranking benchmark surface.' },
      { name: 'Transcriber T', family: 'transcribe', context: 'audio fixture', modes: ['transcribe'], note: 'Browser recording/upload to WER evaluation.' }
    ];
    const benches = {
      chat: {
        label: 'Chat accuracy', unit: '% pass', better: 'higher is better',
        rows: [['Hosted Chat A', 92, 'instruction + factual'], ['Hosted Vision B', 86, 'text subset']],
        note: 'Exact/semantic checks over a compact browser fixture.'
      },
      embedding: {
        label: 'Embedding similarity', unit: 'Spearman', better: 'higher is better',
        rows: [['Embedding S', 0.84, 'paired technical phrases'], ['Hosted Chat A', null, 'not an embedding model']],
        note: 'Correlation between fixture relevance labels and cosine similarity.'
      },
      rerank: {
        label: 'Reranking quality', unit: 'nDCG@10', better: 'higher is better',
        rows: [['Reranker R', 0.91, 'ranked document fixture'], ['Embedding S', 0.72, 'vector baseline']],
        note: 'Ranking quality is compared with nDCG, not chat accuracy.'
      },
      transcribe: {
        label: 'Transcription error', unit: 'WER', better: 'lower is better',
        rows: [['Transcriber T', 0.08, 'clean speech fixture'], ['Hosted Vision B', null, 'not a transcription model']],
        note: 'Word error rate compares a fixture transcript with its reference.'
      }
    };
    const tabs = [
      ['catalog', 'Model catalog'], ['chat', 'Chat'], ['agent', 'Agent'],
      ['transcribe', 'Transcribe'], ['bench', 'Benchmarks']
    ];

    host.innerHTML = head + `
      <div class="td-workbench td-model">
        <header class="td-model-bar">
          <div class="td-model-brand"><i>LL</i><span><b>llms-bench</b><small>unified local workbench fixture</small></span></div>
          <nav class="td-tabs" aria-label="Evaluation surfaces">
            ${tabs.map(item => `<button type="button" data-me-tab="${item[0]}" class="${item[0] === tab ? 'active' : ''}">${item[1]}</button>`).join('')}
          </nav>
          <span class="td-fixture-badge">browser fixture · no live catalog</span>
        </header>
        <div class="td-model-main" data-me-view aria-live="polite"></div>
      </div>`;

    const catalogView = () => `
      <div class="td-model-catalog">
        <aside>
          <div class="td-model-search"><span>Discovered models</span><em>${models.length} fixture records</em></div>
          ${models.map((model, index) => `
            <button type="button" data-me-model="${index}" class="${selectedModel === index ? 'active' : ''}">
              <i class="${escapeHtml(model.family)}"></i><span><b>${escapeHtml(model.name)}</b><small>${escapeHtml(model.family)}</small></span>
              <em>${escapeHtml(model.context)}</em>
            </button>`).join('')}
        </aside>
        <section class="td-model-card">
          <span class="td-kicker">Catalog discovery result</span>
          <h4>${escapeHtml(models[selectedModel].name)}</h4>
          <p>${escapeHtml(models[selectedModel].note)}</p>
          <div class="td-capability-row">${models[selectedModel].modes.map(mode => `<span>${escapeHtml(mode)}</span>`).join('')}</div>
          <dl>
            <div><dt>Family</dt><dd>${escapeHtml(models[selectedModel].family)}</dd></div>
            <div><dt>Published context</dt><dd>${escapeHtml(models[selectedModel].context)}</dd></div>
            <div><dt>Discovery</dt><dd>expected fixture ↔ discovered fixture</dd></div>
            <div><dt>Credentials</dt><dd>not present in browser</dd></div>
          </dl>
          <div class="td-model-route"><span>Evaluation route</span><b>${models[selectedModel].family === 'chat' ? 'Chat → Agent → chat accuracy' : models[selectedModel].family === 'transcribe' ? 'Transcribe → WER' : models[selectedModel].family === 'embedding' ? 'Benchmarks → similarity' : 'Benchmarks → nDCG@10'}</b></div>
        </section>
      </div>`;

    const chatView = () => `
      <div class="td-surface td-chat-surface">
        <aside class="td-surface-side">
          <span class="td-kicker">Chat settings</span>
          <label><span>Model</span><select data-me-chat-model><option>Hosted Chat A</option><option>Hosted Vision B</option></select></label>
          <label><span>Temperature · 0.2</span><input type="range" min="0" max="10" value="2" aria-label="Temperature"></label>
          <div class="td-history"><b>Local history</b><button type="button" data-me-prompt="Explain why benchmark metrics differ by model family.">Metric families</button><button type="button" data-me-prompt="Summarize the selected catalog capabilities.">Catalog summary</button></div>
        </aside>
        <section class="td-chat-thread">
          <div data-me-thread><div class="td-message system"><span>SYSTEM</span><p>Answer from the local fixture only. Do not call an external model.</p></div></div>
          <div class="td-compose"><label><span>Message</span><textarea rows="3" data-me-input>Explain why benchmark metrics differ by model family.</textarea></label><button class="td-button primary" type="button" data-me-send>Stream fixture response</button></div>
        </section>
      </div>`;

    const agentView = () => `
      <div class="td-surface td-agent-surface">
        <section>
          <span class="td-kicker">LangGraph-style fixture</span><h4>Repository brief agent</h4><p>Exercise the documented tool-and-trace surface against browser-only files.</p>
          <div class="td-agent-task"><label><span>Task</span><textarea rows="3" data-me-agent-input>Read the sample brief, generate a three-line summary, and save it to the fixture workspace.</textarea></label><button class="td-button primary" type="button" data-me-agent-run>Run agent fixture</button></div>
          <div class="td-tool-palette"><span>file_read</span><span>code_generate</span><span>file_write</span><span>web_search · disabled</span></div>
        </section>
        <ol class="td-agent-trace" data-me-agent-trace>
          <li><i>1</i><span><b>Awaiting task</b><small>No subprocess or container has started.</small></span></li>
          <li><i>2</i><span><b>Tool trace</b><small>Fixture calls will appear here.</small></span></li>
          <li><i>3</i><span><b>Result</b><small>Output remains in browser memory.</small></span></li>
        </ol>
      </div>`;

    const transcribeView = () => `
      <div class="td-surface td-transcribe">
        <section class="td-audio-stage">
          <div class="td-mic"><i></i><span data-me-clock>00:00</span></div>
          <div class="td-wave" aria-hidden="true">${Array.from({ length: 34 }, (_, index) => `<i style="--h:${18 + (index * 17) % 70}%"></i>`).join('')}</div>
          <div><button class="td-button primary" type="button" data-me-record>Record sample audio</button><button class="td-button" type="button" data-me-upload>Load upload fixture</button></div>
          <small>Microphone and file access are simulated for this public preview.</small>
        </section>
        <section class="td-transcript">
          <div><span class="td-kicker">Transcript</span><em data-me-transcribe-state>not started</em></div>
          <p data-me-transcript>Run either browser fixture to produce a sanitized transcript.</p>
          <button class="td-button" type="button" data-me-to-chat disabled>Send transcript to Chat</button>
        </section>
      </div>`;

    const benchmarkView = () => {
      const bench = benches[benchmark];
      const max = Math.max(...bench.rows.filter(row => row[1] != null).map(row => row[1]));
      return `
        <div class="td-benchmark">
          <div class="td-benchmark-head">
            <div><span class="td-kicker">Metric-appropriate comparison</span><h4>${escapeHtml(bench.label)}</h4><p>${escapeHtml(bench.note)}</p></div>
            <label><span>Benchmark family</span><select data-me-benchmark>
              <option value="chat" ${benchmark === 'chat' ? 'selected' : ''}>Chat accuracy</option>
              <option value="embedding" ${benchmark === 'embedding' ? 'selected' : ''}>Embedding similarity</option>
              <option value="rerank" ${benchmark === 'rerank' ? 'selected' : ''}>Reranking</option>
              <option value="transcribe" ${benchmark === 'transcribe' ? 'selected' : ''}>Transcription WER</option>
            </select></label>
          </div>
          <div class="td-benchmark-scale"><span>${escapeHtml(bench.unit)}</span><em>${escapeHtml(bench.better)}</em></div>
          <div class="td-benchmark-rows">
            ${bench.rows.map(row => `
              <article>
                <div><b>${escapeHtml(row[0])}</b><small>${escapeHtml(row[2])}</small></div>
                <div class="td-metric-bar"><i style="width:${row[1] == null ? 0 : Math.max(8, row[1] / max * 100)}%"></i></div>
                <strong>${row[1] == null ? 'N/A' : (benchmark === 'chat' ? row[1] + '%' : row[1].toFixed(2))}</strong>
              </article>`).join('')}
          </div>
          <div class="td-benchmark-boundary"><b>Not one universal score</b><span>Chat, embeddings, reranking, and transcription keep their own evaluation semantics.</span></div>
        </div>`;
    };

    const render = () => {
      $$('[data-me-tab]', host).forEach(button => {
        const active = button.dataset.meTab === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      const view = $('[data-me-view]', host);
      if (tab === 'catalog') view.innerHTML = catalogView();
      if (tab === 'chat') view.innerHTML = chatView();
      if (tab === 'agent') view.innerHTML = agentView();
      if (tab === 'transcribe') view.innerHTML = transcribeView();
      if (tab === 'bench') view.innerHTML = benchmarkView();
    };
    on(host, abort.signal, 'click', '[data-me-tab]', (_, button) => {
      run++;
      clearTimers(timers);
      tab = button.dataset.meTab;
      render();
    });
    on(host, abort.signal, 'click', '[data-me-model]', (_, button) => {
      selectedModel = Number(button.dataset.meModel);
      render();
    });
    on(host, abort.signal, 'click', '[data-me-prompt]', (_, button) => {
      $('[data-me-input]', host).value = button.dataset.mePrompt;
    });
    on(host, abort.signal, 'click', '[data-me-send]', (_, button) => {
      const prompt = $('[data-me-input]', host).value.trim();
      if (!prompt) return;
      const turn = ++run;
      button.disabled = true;
      $('[data-me-thread]', host).innerHTML = `
        <div class="td-message user"><span>YOU</span><p>${escapeHtml(prompt)}</p></div>
        <div class="td-message assistant thinking"><span>HOSTED CHAT A · FIXTURE</span><p>Streaming from the deterministic browser response…</p></div>`;
      later(timers, () => {
        if (turn !== run || tab !== 'chat') return;
        const node = $('.thinking', host);
        if (node) {
          node.classList.remove('thinking');
          $('p', node).textContent = /metric/i.test(prompt)
            ? 'Each family answers a different question: chat uses task correctness, embeddings use similarity correlation, rerankers use ordering quality, and transcription uses word error rate.'
            : 'The selected fixture advertises chat and tool-call modalities with a 128k published context. No external endpoint was queried.';
        }
        button.disabled = false;
      }, 680);
    });
    on(host, abort.signal, 'click', '[data-me-agent-run]', (_, button) => {
      const turn = ++run;
      clearTimers(timers);
      button.disabled = true;
      const trace = $('[data-me-agent-trace]', host);
      const stages = [
        ['file_read', 'Opened fixture://brief.md · 14 lines'],
        ['code_generate → file_write', 'Produced fixture://summary.md · browser memory only'],
        ['Agent result', 'Summary created with a complete three-step tool trace']
      ];
      trace.innerHTML = stages.map((stage, index) => `<li data-stage="${index}"><i>${index + 1}</i><span><b>${escapeHtml(stage[0])}</b><small>waiting</small></span></li>`).join('');
      stages.forEach((stage, index) => later(timers, () => {
        if (turn !== run || tab !== 'agent') return;
        const row = `[data-stage="${index}"]`;
        const node = $(row, trace);
        if (!node) return;
        node.className = 'done';
        $('small', node).textContent = stage[1];
        if (index === stages.length - 1) button.disabled = false;
      }, 180 + index * 360));
    });
    const transcribe = mode => {
      const turn = ++run;
      clearTimers(timers);
      const state = $('[data-me-transcribe-state]', host);
      const transcript = $('[data-me-transcript]', host);
      const record = $('[data-me-record]', host);
      const upload = $('[data-me-upload]', host);
      if (!state || !transcript) return;
      record.disabled = true;
      upload.disabled = true;
      state.textContent = mode === 'record' ? 'recording fixture' : 'reading upload fixture';
      $('.td-audio-stage', host).classList.add('active');
      later(timers, () => {
        if (turn !== run || tab !== 'transcribe') return;
        $('[data-me-clock]', host).textContent = '00:04';
        state.textContent = 'transcribing';
      }, 420);
      later(timers, () => {
        if (turn !== run || tab !== 'transcribe') return;
        transcript.textContent = 'Compare each model with the benchmark designed for its output family.';
        state.textContent = 'complete · fixture transcript';
        $('.td-audio-stage', host).classList.remove('active');
        $('[data-me-to-chat]', host).disabled = false;
        record.disabled = false;
        upload.disabled = false;
      }, 900);
    };
    on(host, abort.signal, 'click', '[data-me-record]', () => transcribe('record'));
    on(host, abort.signal, 'click', '[data-me-upload]', () => transcribe('upload'));
    on(host, abort.signal, 'click', '[data-me-to-chat]', () => {
      tab = 'chat';
      render();
      $('[data-me-input]', host).value = 'Compare each model with the benchmark designed for its output family.';
    });
    on(host, abort.signal, 'change', '[data-me-benchmark]', (_, select) => {
      benchmark = select.value;
      render();
    });
    render();
    return cleanup(abort, timers);
  }

  function tcBomWidget(spec, host, head) {
    const abort = controller();
    let selected = 'top';
    let expanded = true;
    const nodes = [
      { key: 'top', depth: 0, type: 'Item Revision', name: 'Demo pump assembly', uid: 'AWB-DEMO-0001', item: 'PUMP-1000', rev: 'A', children: true },
      { key: 'housing', depth: 1, type: 'Item Revision', name: 'Housing assembly', uid: 'AWB-DEMO-0100', item: 'HOUSING-1100', rev: 'B', children: true },
      { key: 'shell', parent: 'housing', depth: 2, type: 'Item Revision', name: 'Machined shell', uid: 'AWB-DEMO-0110', item: 'SHELL-1110', rev: 'A' },
      { key: 'seal', parent: 'housing', depth: 2, type: 'Item Revision', name: 'Seal ring', uid: 'AWB-DEMO-0120', item: 'SEAL-1120', rev: 'C' },
      { key: 'drive', depth: 1, type: 'Item Revision', name: 'Drive module', uid: 'AWB-DEMO-0200', item: 'DRIVE-1200', rev: 'A' },
      { key: 'fastener', depth: 1, type: 'Item Revision', name: 'Fastener set', uid: 'AWB-DEMO-0300', item: 'FAST-1300', rev: 'D' }
    ];

    host.innerHTML = head + `
      <div class="td-workbench td-bom">
        <header class="td-bom-brand">
          <div><i>TC</i><span><b>Teamcenter BOM widget</b><small>Mendix pluggable widget · ACE tree fixture</small></span></div>
          <span>siemens.tcbom.TcBOM</span>
        </header>
        <div class="td-bom-config">
          <label><span>WidgetID</span><input value="TcBOM_Demo" data-tb-widget></label>
          <label><span>ProductID · Teamcenter UID</span><input value="UID-DEMO-TOPLINE" data-tb-product></label>
          <label><span>RevisionRule</span><select data-tb-rule><option>Latest Working</option><option>Latest Released</option></select></label>
          <button class="td-button primary" type="button" data-tb-load>Load ACE fixture</button>
        </div>
        <div class="td-bom-layout">
          <section class="td-bom-tree">
            <div class="td-panel-head"><div><span class="td-kicker">Active Workspace tree</span><b>Demo pump assembly</b></div><span class="td-status good" data-td-status>Fixture loaded · 6 lines</span></div>
            <div class="td-bom-columns" aria-hidden="true"><span>Structure</span><span>Item ID</span><span>Rev</span><span>Type</span></div>
            <div role="tree" aria-label="Sample Teamcenter bill of materials">
              ${nodes.map(node => `
                <div class="td-bom-row ${node.key === selected ? 'selected' : ''} ${node.parent ? 'child-row' : ''}" data-tb-row="${node.key}" data-parent="${node.parent || ''}" role="treeitem" aria-selected="${node.key === selected ? 'true' : 'false'}" aria-level="${node.depth + 1}">
                  <div style="--depth:${node.depth}">
                    ${node.children ? `<button type="button" class="td-tree-toggle" data-tb-expand aria-expanded="true" aria-label="Collapse ${escapeHtml(node.name)}">▾</button>` : '<i class="td-tree-leaf"></i>'}
                    <button type="button" class="td-bom-select" data-tb-select="${node.key}"><i class="td-bom-icon">${node.depth ? '◇' : '◆'}</i><span>${escapeHtml(node.name)}</span></button>
                  </div>
                  <span>${escapeHtml(node.item)}</span><span>${escapeHtml(node.rev)}</span><span>${escapeHtml(node.type)}</span>
                </div>`).join('')}
            </div>
          </section>
          <aside class="td-bom-output">
            <div><span class="td-kicker">Selection output</span><h4>Mendix entity attributes</h4><p>The widget writes the selected ACE line values into the three configured attributes.</p></div>
            <dl>
              <div><dt>AwbElementUID</dt><dd data-tb-uid></dd></div>
              <div><dt>ItemId</dt><dd data-tb-item></dd></div>
              <div><dt>ItemRevisionId</dt><dd data-tb-rev></dd></div>
            </dl>
            <div class="td-event-payload"><span>onSelectionChanged payload</span><pre data-tb-payload></pre></div>
            <div class="td-bom-log" aria-live="polite"><span>Event trace</span><div data-tb-log></div></div>
            <div class="td-boundary compact"><b>Selection bridge only</b><span>This widget renders and emits a BOM selection. It is not a BOM comparison or diff tool.</span></div>
          </aside>
        </div>
      </div>`;

    const selectNode = (key, announce = true) => {
      const node = nodes.find(item => item.key === key) || nodes[0];
      selected = node.key;
      $$('[data-tb-row]', host).forEach(row => {
        const active = row.dataset.tbRow === selected;
        row.classList.toggle('selected', active);
        row.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      $('[data-tb-uid]', host).textContent = node.uid;
      $('[data-tb-item]', host).textContent = node.item;
      $('[data-tb-rev]', host).textContent = node.rev;
      $('[data-tb-payload]', host).textContent = JSON.stringify({
        awbElementUids: node.uid,
        itemIds: node.item,
        itemRevisionIds: node.rev
      }, null, 2);
      if (announce) {
        const log = $('[data-tb-log]', host);
        log.innerHTML = `<p><i></i><span><b>selectionChanged</b><small>${escapeHtml(node.name)} → three attributes written</small></span></p>` + log.innerHTML;
      }
    };
    on(host, abort.signal, 'click', '[data-tb-select]', (_, button) => selectNode(button.dataset.tbSelect));
    on(host, abort.signal, 'click', '[data-tb-expand]', (_, button) => {
      expanded = !expanded;
      button.textContent = expanded ? '▾' : '▸';
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      button.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} Housing assembly`);
      $$('[data-parent="housing"]', host).forEach(row => row.hidden = !expanded);
    });
    on(host, abort.signal, 'click', '[data-tb-load]', () => {
      const product = $('[data-tb-product]', host).value.trim() || 'UID-DEMO-TOPLINE';
      setStatus(host, 'good', `ACE fixture loaded for ${product}`);
      selectNode('top');
    });
    selectNode('top', false);
    return cleanup(abort);
  }

  function routerAudit(spec, host, head) {
    const abort = controller();
    const timers = [];
    let run = 0;
    let tab = 'posture';
    let ready = false;
    const tabs = [
      ['posture', 'Posture'], ['network', 'Network'], ['services', 'Services'], ['packages', 'Packages']
    ];
    const views = {
      posture: () => `
        <div class="td-router-posture">
          <section class="td-router-score">
            <div class="td-score-ring"><span>82</span><small>/ 100</small></div>
            <div><span class="td-kicker">Sanitized audit fixture</span><h4>Travel-router baseline</h4><p>Remote administration is disabled, no port forwards are configured, and VPN packages are installed but inactive.</p></div>
          </section>
          <section class="td-finding-list">
            <article class="good"><i>✓</i><span><b>No WAN administration</b><small>Management stays on the private LAN fixture.</small></span><em>pass</em></article>
            <article class="good"><i>✓</i><span><b>No DMZ or port forwards</b><small>No inbound exposure found in the sample firewall rules.</small></span><em>pass</em></article>
            <article class="warn"><i>!</i><span><b>Legacy API scripts incompatible</b><small>Firmware 4.x uses JSON-RPC at /rpc; old 3.x calls require review.</small></span><em>review</em></article>
            <article class="info"><i>i</i><span><b>2.4 GHz radio only</b><small>Hardware limitation, not a configuration defect.</small></span><em>context</em></article>
          </section>
        </div>`,
      network: () => `
        <div class="td-router-network">
          <section class="td-network-map">
            <div class="td-net-node wan"><i>WAN</i><b>Upstream</b><small>public address redacted</small></div>
            <div class="td-net-wire"></div>
            <div class="td-net-node router"><i>R</i><b>Demo Mango router</b><small>OpenWrt 22.03.4</small></div>
            <div class="td-net-branches"><i></i><i></i><i></i></div>
            <div class="td-net-clients">
              <article><i>01</i><span><b>Sample laptop</b><small>LAN · address redacted</small></span></article>
              <article><i>02</i><span><b>Sample phone</b><small>Wi-Fi · address redacted</small></span></article>
              <article><i>03</i><span><b>Guest device</b><small>Guest network · isolated</small></span></article>
            </div>
          </section>
          <aside class="td-throughput">
            <span class="td-kicker">Fixture replay</span><h4>Throughput sample</h4>
            <div><span>Download</span><b>42 Mbps</b><i style="width:78%"></i></div>
            <div><span>Upload</span><b>31 Mbps</b><i style="width:57%"></i></div>
            <small>Illustrative replay—not a measurement of the visitor's network.</small>
          </aside>
        </div>`,
      services: () => `
        <div class="td-service-grid">
          ${[
            ['JSON-RPC', '/rpc · LAN only', 'available', 'good'],
            ['LuCI', 'private LAN', 'available', 'good'],
            ['SSH', 'private LAN', 'review', 'warn'],
            ['Remote admin', 'WAN', 'disabled', 'good'],
            ['OpenVPN client', 'installed', 'inactive', 'info'],
            ['WireGuard client', 'installed', 'inactive', 'info']
          ].map(row => `<article class="${row[3]}"><span>${escapeHtml(row[0])}</span><b>${escapeHtml(row[2])}</b><small>${escapeHtml(row[1])}</small></article>`).join('')}
        </div>`,
      packages: () => `
        <div class="td-package-view">
          <div><span class="td-kicker">Installed package families</span><h4>Capability inventory</h4><p>Package presence is recorded without implying that each service is enabled.</p></div>
          <div class="td-package-cloud"><span>OpenVPN</span><span>WireGuard</span><span>captive portal</span><span>USB storage</span><span>extroot</span><span>LuCI</span><span>dnsmasq</span><span>firewall</span></div>
          <div class="td-version-shift"><article><span>Recovered baseline</span><b>Firmware 3.025</b><small>legacy API generation</small></article><i>→</i><article><span>Audited state</span><b>Firmware 4.3.25</b><small>OpenWrt 22.03.4 · JSON-RPC</small></article></div>
        </div>`
    };

    host.innerHTML = head + `
      <div class="td-workbench td-router">
        <header class="td-router-head">
          <div class="td-router-device"><i>R</i><span><b>OpenWrt router audit</b><small>GL.iNet Mango class · sanitized fixture</small></span></div>
          <div class="td-router-version"><span>FIRMWARE</span><b>4.3.25</b><small>OpenWrt 22.03.4</small></div>
          <span class="td-status" data-td-status>Audit not run</span>
          <button class="td-button primary" type="button" data-ra-run>Run sanitized audit</button>
        </header>
        <div class="td-router-controls">
          <nav class="td-tabs" aria-label="Router audit sections">${tabs.map(item => `<button type="button" data-ra-tab="${item[0]}" class="${tab === item[0] ? 'active' : ''}">${item[1]}</button>`).join('')}</nav>
          <label><span>Policy lens</span><select data-ra-policy><option>Travel router baseline</option><option>Guest isolation</option><option>VPN client readiness</option></select></label>
          <span data-ra-policy-note>Remote admin off · inbound rules closed</span>
        </div>
        <div class="td-router-progress" data-ra-progress aria-label="Audit progress">${['Identity', 'Firmware', 'Networks', 'Firewall', 'Services'].map(stage => `<span><i></i>${stage}</span>`).join('')}</div>
        <main class="td-router-view" data-ra-view></main>
        <footer class="td-router-redaction"><i>PRIVACY</i><span>Hostnames, SSIDs, passwords, addresses, MACs, serials, and public IP data are replaced with sample labels.</span><b>No live router access</b></footer>
      </div>`;

    const render = () => {
      $$('[data-ra-tab]', host).forEach(button => {
        const active = button.dataset.raTab === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      $('[data-ra-view]', host).innerHTML = views[tab]();
      $('[data-ra-view]', host).classList.toggle('muted', !ready);
    };
    on(host, abort.signal, 'click', '[data-ra-tab]', (_, button) => {
      tab = button.dataset.raTab;
      render();
    });
    on(host, abort.signal, 'change', '[data-ra-policy]', (_, select) => {
      const notes = {
        'Travel router baseline': 'Remote admin off · inbound rules closed',
        'Guest isolation': 'Guest → LAN denied · DNS retained',
        'VPN client readiness': 'Packages present · tunnel remains inactive'
      };
      $('[data-ra-policy-note]', host).textContent = notes[select.value];
    });
    on(host, abort.signal, 'click', '[data-ra-run]', (_, button) => {
      const turn = ++run;
      clearTimers(timers);
      ready = false;
      button.disabled = true;
      const stages = $$('[data-ra-progress] span', host);
      stages.forEach(stage => stage.className = '');
      setStatus(host, 'busy', 'Reading the sanitized router fixture');
      stages.forEach((stage, index) => later(timers, () => {
        if (turn !== run) return;
        if (index > 0) stages[index - 1].className = 'done';
        stage.className = 'active';
      }, 100 + index * 220));
      later(timers, () => {
        if (turn !== run) return;
        stages.forEach(stage => stage.className = 'done');
        ready = true;
        button.disabled = false;
        button.textContent = 'Re-run audit';
        setStatus(host, 'good', 'Audit complete · 2 review items');
        render();
      }, 180 + stages.length * 220);
    });
    render();
    return cleanup(abort, timers);
  }

  function onePagerKit(spec, host, head) {
    const abort = controller();
    const timers = [];
    let run = 0;
    let page = 0;
    let qa = false;
    const pages = [
      {
        label: '01 · Story',
        html: `<div class="td-a4-hero"><span>INDUSTRIAL OPERATIONS</span><h4>Connect one critical workflow from signal to decision</h4><div class="td-iso-art"><i></i><i></i><i></i><b>01</b></div><p>A fixed sample narrative demonstrates the prescribed hero, context, challenge, and solution rhythm.</p></div><div class="td-a4-bottom"><b>Sample organization</b><span></span><small>sanitized public proof</small></div>`
      },
      {
        label: '02 · Evidence',
        html: `<div class="td-a4-section"><span>RESULTS &amp; BENEFITS</span><h4>A compact evidence grid gives the story measurable shape.</h4><div class="td-a4-grid"><article><i>↗</i><b>Clear handoffs</b><small>shared workflow state</small></article><article><i>◎</i><b>Visible context</b><small>evidence at the decision</small></article><article><i>◇</i><b>Faster review</b><small>one narrative surface</small></article><article><i>✓</i><b>Bounded claim</b><small>proof stays inspectable</small></article></div><blockquote>“The page should make one industrial story legible—not turn into a catalog.”</blockquote></div>`
      },
      {
        label: '03 · Close',
        html: `<div class="td-a4-section"><span>SIEMENS XCELERATOR</span><h4>Close with the portfolio context and a precise next step.</h4><p>The final page preserves the navy field, limited teal accent, compact prose, and a fixed footer zone.</p><div class="td-a4-x"><i>X</i><span><b>Explore the workflow proof</b><small>Sample call to action · no customer data</small></span></div><div class="td-a4-qr"><i></i><span>Fixture QR zone</span></div></div><div class="td-a4-bottom"><b>Sample organization</b><span></span><small>legal line · page 3</small></div>`
      }
    ];

    host.innerHTML = head + `
      <div class="td-workbench td-onepager">
        <header class="td-op-head">
          <div><span class="td-kicker">Fixed Siemens A4 composition</span><h3>One-pager style proof</h3><p>HTML + print CSS → Puppeteer PDF dry-run</p></div>
          <div class="td-op-spec"><span><b>210 × 297</b> mm</span><span><b>3</b> pages</span><span><b>12–15</b> mm sides</span></div>
        </header>
        <div class="td-op-layout">
          <aside class="td-op-guide">
            <div><span class="td-kicker">Style guide</span><h4>Non-negotiable rules</h4></div>
            <ul>
              <li><i style="--swatch:#000028"></i><span><b>Deep navy field</b><small>#000028 on every page</small></span></li>
              <li><i style="--swatch:#00b3b0"></i><span><b>Teal accent only</b><small>#00B3B0 · restrained use</small></span></li>
              <li><i class="type">Aa</i><span><b>Siemens Sans hierarchy</b><small>fallback visible in browser proof</small></span></li>
              <li><i class="margin">↔</i><span><b>A4 print geometry</b><small>portrait · fixed margins</small></span></li>
            </ul>
            <label class="td-check"><input type="checkbox" data-op-qa><span>Show QA geometry overlay</span></label>
            <div class="td-boundary compact"><b>Not a document generator</b><span>This previews one fixed authored composition and its PDF build contract.</span></div>
          </aside>
          <main class="td-op-proof">
            <div class="td-op-toolbar">
              <div role="tablist" aria-label="A4 pages">${pages.map((item, index) => `<button type="button" data-op-page="${index}" class="${page === index ? 'active' : ''}">${escapeHtml(item.label)}</button>`).join('')}</div>
              <span class="td-status" data-td-status>Ready for style validation</span>
            </div>
            <div class="td-paper-stage">
              <article class="td-a4-page" data-op-paper aria-label="A4 page preview"><div class="td-safe-area"></div><div data-op-content></div></article>
              <div class="td-page-ruler"><span>210 mm</span><i></i><span>297 mm</span></div>
            </div>
          </main>
          <aside class="td-op-build">
            <div><span class="td-kicker">PDF dry-run</span><h4>Browser print pipeline</h4></div>
            <ol data-op-steps>
              <li><i>1</i><span><b>Validate composition</b><small>navy, teal, hierarchy, page zones</small></span></li>
              <li><i>2</i><span><b>Load fixed HTML</b><small>authored pages, no form merge</small></span></li>
              <li><i>3</i><span><b>Apply A4 print CSS</b><small>portrait geometry and margins</small></span></li>
              <li><i>4</i><span><b>Puppeteer page.pdf()</b><small>dry-run only in this browser</small></span></li>
            </ol>
            <button class="td-button primary" type="button" data-op-build>Validate + dry-run PDF</button>
            <div class="td-op-result" data-op-result aria-live="polite"><span>No build run yet</span></div>
          </aside>
        </div>
      </div>`;

    const render = () => {
      $('[data-op-content]', host).innerHTML = pages[page].html;
      $('[data-op-paper]', host).classList.toggle('qa', qa);
      $$('[data-op-page]', host).forEach((button, index) => {
        button.classList.toggle('active', index === page);
        button.setAttribute('aria-selected', index === page ? 'true' : 'false');
      });
    };
    on(host, abort.signal, 'click', '[data-op-page]', (_, button) => {
      page = Number(button.dataset.opPage);
      render();
    });
    on(host, abort.signal, 'change', '[data-op-qa]', (_, input) => {
      qa = input.checked;
      render();
    });
    on(host, abort.signal, 'click', '[data-op-build]', (_, button) => {
      const turn = ++run;
      clearTimers(timers);
      button.disabled = true;
      const steps = $$('[data-op-steps] li', host);
      steps.forEach(step => step.className = '');
      setStatus(host, 'busy', 'Checking fixed style-guide constraints');
      $('[data-op-result]', host).innerHTML = '<span>Dry-run in progress…</span>';
      steps.forEach((step, index) => later(timers, () => {
        if (turn !== run) return;
        step.className = 'done';
      }, 130 + index * 260));
      later(timers, () => {
        if (turn !== run) return;
        button.disabled = false;
        setStatus(host, 'good', 'A4 composition passes the browser fixture');
        $('[data-op-result]', host).innerHTML = '<i>✓</i><span><b>PDF dry-run passed</b><small>3 pages · A4 portrait · print background enabled</small></span>';
      }, 170 + steps.length * 260);
    });
    render();
    return cleanup(abort, timers);
  }

  function evidenceBoard(spec, host, head) {
    const abort = controller();
    let filter = 'all';
    let selected = 0;
    const folders = ['Testimonials', 'Narrative', 'Development', 'Case study A', 'Case study B', 'Research', 'Reusable', 'Review uncertain'];
    const artifacts = [
      { title: 'Workshop facilitation note', type: 'Document', size: '84 KB', confidence: 'high', target: 'Development', hash: 'fixture-a17f…', duplicate: false },
      { title: 'Architecture decision diagram', type: 'Image', size: '1.8 MB', confidence: 'high', target: 'Case study A', hash: 'fixture-4c2b…', duplicate: false },
      { title: 'Sanitized feedback excerpt', type: 'Document', size: '22 KB', confidence: 'uncertain', target: 'Testimonials', hash: 'fixture-9f10…', duplicate: false },
      { title: 'Prototype walkthrough recording', type: 'Video', size: '740 MB', confidence: 'high', target: 'Case study B', hash: 'fixture-c530…', duplicate: false, large: true },
      { title: 'Repeated design snapshot', type: 'Image', size: '620 KB', confidence: 'high', target: 'Reusable', hash: 'fixture-4c2b…', duplicate: true }
    ];
    const manifest = [];

    host.innerHTML = head + `
      <div class="td-workbench td-evidence">
        <header class="td-evidence-head">
          <div><span class="td-kicker">Personal progression evidence</span><h3>Artifact organizer</h3><p>Copy-only intake · SHA-256 dedupe · confidence review</p></div>
          <div class="td-evidence-rules"><span><i>✓</i> originals untouched</span><span><i>✓</i> secrets excluded</span><span><i>✓</i> large media linked</span></div>
        </header>
        <div class="td-evidence-layout">
          <aside class="td-folder-tree">
            <div class="td-mini-title"><span>Evidence folders</span><em>taxonomy</em></div>
            ${folders.map((folder, index) => `<button type="button" data-eb-folder="${escapeHtml(folder)}"><i>${index < 7 ? '◇' : '?'}</i><span>${escapeHtml(folder)}</span><em data-eb-folder-count="${escapeHtml(folder)}">0</em></button>`).join('')}
          </aside>
          <section class="td-evidence-inbox">
            <div class="td-panel-head">
              <div><span class="td-kicker">Sanitized inbox</span><b>Select an artifact to classify</b></div>
              <label><span>Confidence</span><select data-eb-filter><option value="all">All</option><option value="high">High</option><option value="uncertain">Uncertain</option></select></label>
            </div>
            <div class="td-artifact-list" data-eb-list></div>
          </section>
          <aside class="td-evidence-inspector" data-eb-inspector></aside>
        </div>
        <section class="td-manifest">
          <div><span class="td-kicker">Manifest preview</span><b>Copy decisions and dedupe evidence</b></div>
          <div class="td-manifest-table">
            <div class="head"><span>Artifact</span><span>Decision</span><span>Destination</span><span>Digest</span></div>
            <div data-eb-manifest><p>No artifact classified in this browser session.</p></div>
          </div>
        </section>
      </div>`;

    const visibleArtifacts = () => artifacts.map((item, index) => ({ item, index })).filter(entry => filter === 'all' || entry.item.confidence === filter);
    const renderList = () => {
      const list = $('[data-eb-list]', host);
      const visible = visibleArtifacts();
      list.innerHTML = visible.length ? visible.map(({ item, index }) => `
        <button type="button" data-eb-artifact="${index}" class="${index === selected ? 'active' : ''}">
          <i class="${item.type.toLowerCase()}">${item.type === 'Document' ? 'DOC' : item.type === 'Image' ? 'IMG' : 'VID'}</i>
          <span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.type)} · ${escapeHtml(item.size)}</small></span>
          <em class="${item.confidence}">${escapeHtml(item.confidence)}</em>
        </button>`).join('') : '<div class="td-empty">No artifacts match this confidence filter.</div>';
    };
    const renderInspector = () => {
      const item = artifacts[selected];
      $('[data-eb-inspector]', host).innerHTML = `
        <div><span class="td-kicker">Artifact evidence</span><h4>${escapeHtml(item.title)}</h4><p>Public sample metadata only; original source location and people are not shown.</p></div>
        <dl>
          <div><dt>Type</dt><dd>${escapeHtml(item.type)}</dd></div>
          <div><dt>Confidence</dt><dd><span class="td-confidence ${item.confidence}">${escapeHtml(item.confidence)}</span></dd></div>
          <div><dt>SHA-256</dt><dd>${escapeHtml(item.hash)}</dd></div>
          <div><dt>Handling</dt><dd>${item.large ? 'link in place · over 500 MB' : 'copy into evidence set'}</dd></div>
        </dl>
        <label><span>Evidence category</span><select data-eb-target>${folders.map(folder => `<option ${folder === item.target ? 'selected' : ''}>${escapeHtml(folder)}</option>`).join('')}</select></label>
        <button class="td-button primary" type="button" data-eb-classify>${item.large ? 'Record link in manifest' : 'Copy into evidence set'}</button>
        <div class="td-copy-rule"><i>i</i><span><b>Original remains untouched</b><small>No move, rename, or delete operation exists here.</small></span></div>`;
    };
    const renderManifest = () => {
      const node = $('[data-eb-manifest]', host);
      node.innerHTML = manifest.length ? manifest.map(row => `
        <div class="row"><span>${escapeHtml(row.title)}</span><span class="${row.kind}">${escapeHtml(row.decision)}</span><span>${escapeHtml(row.target)}</span><span>${escapeHtml(row.hash)}</span></div>`).join('') : '<p>No artifact classified in this browser session.</p>';
      folders.forEach(folder => {
        const count = manifest.filter(row => row.target === folder && row.kind !== 'dedupe').length;
        const badge = `[data-eb-folder-count="${folder}"]`;
        const node = $(badge, host);
        if (node) node.textContent = count;
      });
    };
    on(host, abort.signal, 'click', '[data-eb-artifact]', (_, button) => {
      selected = Number(button.dataset.ebArtifact);
      renderList();
      renderInspector();
    });
    on(host, abort.signal, 'change', '[data-eb-filter]', (_, select) => {
      filter = select.value;
      const first = visibleArtifacts()[0];
      if (first && !visibleArtifacts().some(entry => entry.index === selected)) selected = first.index;
      renderList();
      renderInspector();
    });
    on(host, abort.signal, 'click', '[data-eb-folder]', (_, button) => {
      const select = $('[data-eb-target]', host);
      if (select) select.value = button.dataset.ebFolder;
    });
    on(host, abort.signal, 'click', '[data-eb-classify]', () => {
      const item = artifacts[selected];
      const target = $('[data-eb-target]', host).value;
      const existing = manifest.find(row => row.index === selected);
      const row = {
        index: selected, title: item.title, target, hash: item.hash,
        decision: item.duplicate ? 'deduped · no second copy' : item.large ? 'linked in place' : 'copied',
        kind: item.duplicate ? 'dedupe' : item.large ? 'linked' : 'copied'
      };
      if (existing) Object.assign(existing, row); else manifest.unshift(row);
      item.target = target;
      renderManifest();
      const button = $('[data-eb-classify]', host);
      button.textContent = item.duplicate ? 'Duplicate detected' : item.large ? 'Link recorded' : 'Copy recorded';
      button.classList.add('confirmed');
    });
    renderList();
    renderInspector();
    renderManifest();
    return cleanup(abort);
  }

  function goalDraft(spec, host, head) {
    const abort = controller();
    let selected = 0;
    const goals = [
      { title: 'Technical depth', area: 'Engineering practice', product: 'Sample platform · Level II', skill: 'Clear communication · Level II', why: 'Build a repeatable technical proof that others can inspect and reuse.', minimum: 'Publish one sanitized artifact with setup notes and verification evidence.', stretch: 'Add a second implementation variant and a concise comparison.', evidence: 'Repository proof, test record, and review note.' },
      { title: 'Customer discovery', area: 'Solution discovery', product: 'Sample portfolio · Level I', skill: 'Active listening · Level II', why: 'Turn ambiguous needs into a bounded problem statement.', minimum: 'Capture one anonymized discovery brief and its acceptance criteria.', stretch: 'Validate the brief against two contrasting scenarios.', evidence: 'Sanitized brief, decision log, and outcome summary.' },
      { title: 'Reusable enablement', area: 'Knowledge sharing', product: 'Sample toolkit · Level II', skill: 'Facilitation · Level II', why: 'Reduce the effort required for the next person to reproduce the work.', minimum: 'Create one walkthrough with source links and a verification checklist.', stretch: 'Run a peer session and incorporate the resulting feedback.', evidence: 'Guide, fixture, and anonymized review notes.' },
      { title: 'Architecture judgment', area: 'Solution architecture', product: 'Integration patterns · Level II', skill: 'Decision quality · Level II', why: 'Make tradeoffs and boundaries explicit before implementation expands.', minimum: 'Document one decision with options, constraints, and chosen boundary.', stretch: 'Add a working reference path for the selected option.', evidence: 'Architecture decision and browser-safe proof.' },
      { title: 'Evidence discipline', area: 'Professional development', product: 'Evidence practice · Level I', skill: 'Self reflection · Level II', why: 'Connect claims to inspectable artifacts without exposing private work.', minimum: 'Maintain a sanitized evidence manifest for the five goal areas.', stretch: 'Identify gaps and create one missing proof artifact.', evidence: 'Manifest, gap review, and public-safe excerpts.' }
    ];
    const fields = [
      ['area', 'Concentration area', 'input'],
      ['product', 'Product → level', 'input'],
      ['skill', 'PSC soft skill → level', 'input'],
      ['why', 'Why this matters', 'textarea'],
      ['minimum', 'Minimum viable safe fallback', 'textarea'],
      ['stretch', 'Stretch outcome', 'textarea'],
      ['evidence', 'Evidence statement', 'textarea']
    ];

    host.innerHTML = head + `
      <div class="td-workbench td-goals">
        <header class="td-goal-head">
          <div><span class="td-kicker">Public sanitized sample</span><h3>Goal evidence draft</h3><p>Five-goal document structure · browser memory only</p></div>
          <div class="td-private-seal"><i>PRIVATE SOURCE</i><span><b>Not rendered</b><small>Names, accounts, links, and dates stay excluded</small></span></div>
        </header>
        <div class="td-goal-layout">
          <aside class="td-goal-index" aria-label="Five sample goals">
            <span>Draft sections</span>
            ${goals.map((goal, index) => `<button type="button" data-gd-goal="${index}" class="${index === selected ? 'active' : ''}"><i>0${index + 1}</i><span><b>${escapeHtml(goal.title)}</b><small>minimum · stretch · evidence</small></span></button>`).join('')}
            <div class="td-boundary compact"><b>Drafting document</b><span>This is not a roadmap, task tracker, or performance system.</span></div>
          </aside>
          <main class="td-goal-document">
            <div class="td-doc-meta"><span>GOAL <b data-gd-number>01</b> / 05</span><em>anonymized fixture</em></div>
            <label class="td-goal-title"><span>Goal title</span><input data-gd-title></label>
            <div class="td-goal-fields" data-gd-fields></div>
          </main>
          <aside class="td-goal-quality">
            <div><span class="td-kicker">Completeness review</span><h4>Evidence-ready?</h4><p>Check structure and specificity without scoring the person.</p></div>
            <div class="td-quality-score"><span data-gd-score>7 / 7</span><i><b data-gd-score-bar></b></i></div>
            <ul data-gd-checks></ul>
            <button class="td-button" type="button" data-gd-check>Review this draft</button>
            <div class="td-goal-review" data-gd-review aria-live="polite">All edits remain in this browser session.</div>
          </aside>
        </div>
      </div>`;

    const fieldValue = (goal, key) => goal[key] || '';
    const render = () => {
      const goal = goals[selected];
      $('[data-gd-number]', host).textContent = String(selected + 1).padStart(2, '0');
      $('[data-gd-title]', host).value = goal.title;
      $('[data-gd-fields]', host).innerHTML = fields.map(field => `
        <label class="${field[2] === 'textarea' ? 'wide' : ''}">
          <span>${escapeHtml(field[1])}</span>
          ${field[2] === 'textarea'
            ? `<textarea rows="3" data-gd-field="${field[0]}">${escapeHtml(fieldValue(goal, field[0]))}</textarea>`
            : `<input data-gd-field="${field[0]}" value="${escapeHtml(fieldValue(goal, field[0]))}">`}
        </label>`).join('');
      $$('[data-gd-goal]', host).forEach((button, index) => {
        button.classList.toggle('active', index === selected);
        button.setAttribute('aria-current', index === selected ? 'step' : 'false');
      });
      review(false);
    };
    const review = announce => {
      const goal = goals[selected];
      const checks = [
        ['Concentration area named', goal.area.trim().length > 3],
        ['Product level selected', /Level\s+[IVX]+/i.test(goal.product)],
        ['Soft-skill level selected', /Level\s+[IVX]+/i.test(goal.skill)],
        ['Why is concrete', goal.why.trim().length >= 24],
        ['Minimum fallback is bounded', goal.minimum.trim().length >= 30],
        ['Stretch is distinct', goal.stretch.trim().length >= 30 && goal.stretch !== goal.minimum],
        ['Evidence is inspectable', goal.evidence.trim().length >= 20]
      ];
      const passed = checks.filter(check => check[1]).length;
      $('[data-gd-score]', host).textContent = `${passed} / ${checks.length}`;
      $('[data-gd-score-bar]', host).style.width = `${passed / checks.length * 100}%`;
      $('[data-gd-checks]', host).innerHTML = checks.map(check => `<li class="${check[1] ? 'pass' : 'miss'}"><i>${check[1] ? '✓' : '·'}</i><span>${escapeHtml(check[0])}</span></li>`).join('');
      if (announce) $('[data-gd-review]', host).textContent = passed === checks.length
        ? 'Structure complete. The sample connects minimum, stretch, and evidence.'
        : `${checks.length - passed} structural gap${checks.length - passed === 1 ? '' : 's'} remain in this sanitized draft.`;
    };
    on(host, abort.signal, 'click', '[data-gd-goal]', (_, button) => {
      selected = Number(button.dataset.gdGoal);
      render();
    });
    listen($('[data-gd-title]', host), abort.signal, 'input', event => {
      goals[selected].title = event.target.value;
      const button = `[data-gd-goal="${selected}"] b`;
      const node = $(button, host);
      if (node) node.textContent = event.target.value || 'Untitled goal';
    });
    on(host, abort.signal, 'input', '[data-gd-field]', (_, input) => {
      goals[selected][input.dataset.gdField] = input.value;
      review(false);
    });
    on(host, abort.signal, 'click', '[data-gd-check]', () => review(true));
    render();
    return cleanup(abort);
  }

  function lumaApi(spec, host, head) {
    const abort = controller();
    const timers = [];
    let run = 0;
    let selected = 0;
    let search = '';
    let surface = 'all';
    const operations = [
      { surface: 'GraphQL', kind: 'Query', name: 'apps', domain: 'Apps', signature: 'apps(first: Int, after: String): AppConnection!', variables: { first: 2 }, result: { data: { apps: { nodes: [{ id: 'app_demo_01', name: 'Sample workspace' }, { id: 'app_demo_02', name: 'Fixture lab' }] } } } },
      { surface: 'GraphQL', kind: 'Query', name: 'repositories', domain: 'Repositories', signature: 'repositories(appId: ID!): RepositoryConnection!', variables: { appId: 'app_demo_01' }, result: { data: { repositories: { nodes: [{ id: 'repo_demo_01', name: 'Sample repository' }] } } } },
      { surface: 'GraphQL', kind: 'Query', name: 'tables', domain: 'Tables', signature: 'tables(repositoryId: ID!): TableConnection!', variables: { repositoryId: 'repo_demo_01' }, result: { data: { tables: { nodes: [{ id: 'table_demo_01', name: 'instrument_runs', columns: 8 }] } } } },
      { surface: 'GraphQL', kind: 'Query', name: 'flows', domain: 'Flows', signature: 'flows(appId: ID!, state: FlowState): [Flow!]!', variables: { appId: 'app_demo_01', state: 'ACTIVE' }, result: { data: { flows: [{ id: 'flow_demo_01', name: 'Sample ingestion flow', steps: 3 }] } } },
      { surface: 'GraphQL', kind: 'Mutation', name: 'startFlowExecution', domain: 'Executions', signature: 'startFlowExecution(flowId: ID!): FlowExecution!', variables: { flowId: 'flow_demo_01' }, result: { data: { startFlowExecution: { id: 'exec_fixture_01', status: 'FIXTURE_ONLY' } } } },
      { surface: 'REST', kind: 'GET', name: 'user preferences', domain: 'Settings', signature: 'GET /settings/preferences', variables: {}, result: { theme: 'system', rowsPerPage: 25, fixture: true } },
      { surface: 'REST', kind: 'POST', name: 'save preferences', domain: 'Settings', signature: 'POST /settings/preferences', variables: { rowsPerPage: 50 }, result: { accepted: true, persisted: false, fixture: true } }
    ];

    host.innerHTML = head + `
      <div class="td-workbench td-luma">
        <header class="td-luma-warning">
          <i>!</i><div><b>Unsupported internal API research</b><span>The observed GraphQL and REST surfaces can change without notice. This browser fixture is not a supported product integration.</span></div><em>NO LIVE REQUESTS</em>
        </header>
        <div class="td-luma-shell">
          <aside class="td-api-nav">
            <div class="td-api-brand"><i>L</i><span><b>Luma research client</b><small>endpoint + bearer token redacted</small></span></div>
            <label><span>Find operation</span><input type="search" data-la-search placeholder="apps, tables, flows…"></label>
            <div class="td-api-filter" role="group" aria-label="API surface">
              <button type="button" data-la-surface="all" class="active">All</button><button type="button" data-la-surface="GraphQL">GraphQL</button><button type="button" data-la-surface="REST">REST</button>
            </div>
            <div class="td-operation-list" data-la-list></div>
          </aside>
          <main class="td-api-detail" data-la-detail></main>
        </div>
      </div>`;

    const filtered = () => operations.map((operation, index) => ({ operation, index })).filter(entry => {
      const matchesSurface = surface === 'all' || entry.operation.surface === surface;
      const haystack = `${entry.operation.name} ${entry.operation.domain} ${entry.operation.kind}`.toLowerCase();
      return matchesSurface && haystack.includes(search.toLowerCase());
    });
    const renderList = () => {
      const entries = filtered();
      $('[data-la-list]', host).innerHTML = entries.length ? entries.map(({ operation, index }) => `
        <button type="button" data-la-op="${index}" class="${index === selected ? 'active' : ''}">
          <i class="${operation.surface.toLowerCase()}">${operation.surface === 'GraphQL' ? 'GQL' : 'REST'}</i>
          <span><b>${escapeHtml(operation.name)}</b><small>${escapeHtml(operation.domain)}</small></span><em>${escapeHtml(operation.kind)}</em>
        </button>`).join('') : '<div class="td-empty">No operation matches this filter.</div>';
    };
    const renderDetail = () => {
      const operation = operations[selected];
      const request = operation.surface === 'GraphQL'
        ? `${operation.kind.toLowerCase()} ResearchOperation(${Object.keys(operation.variables).map((key, index) => '¤' + key + ': ' + ['Int', 'ID!', 'FlowState'][index % 3]).join(', ')}) {\n  ${operation.name} {\n    __typename\n    # fixture fields selected here\n  }\n}`
        : `${operation.signature}\nAuthorization: Bearer [redacted]\nContent-Type: application/json`;
      $('[data-la-detail]', host).innerHTML = `
        <div class="td-api-detail-head">
          <div><span class="td-kicker">${escapeHtml(operation.surface)} · ${escapeHtml(operation.domain)}</span><h3>${escapeHtml(operation.name)}</h3><p>${escapeHtml(operation.signature)}</p></div>
          <span class="td-api-kind ${operation.kind.toLowerCase()}">${escapeHtml(operation.kind)}</span>
        </div>
        <div class="td-api-grid">
          <section class="td-api-editor">
            <div><span>Request fixture</span><em>endpoint redacted</em></div>
            <pre>${escapeHtml(request)}</pre>
          </section>
          <section class="td-api-vars">
            <div><span>Variables</span><em>sanitized</em></div>
            <pre>${escapeHtml(JSON.stringify(operation.variables, null, 2))}</pre>
          </section>
        </div>
        <div class="td-api-actions"><button class="td-button primary" type="button" data-la-run>Replay fixture response</button><span class="td-status" data-td-status>Nothing sent</span></div>
        <section class="td-api-response"><div><span>Response</span><em data-la-response-state>awaiting replay</em></div><pre data-la-response>{\n  "fixture": true\n}</pre></section>
        <div class="td-api-boundary"><i>RESEARCH</i><span><b>Observed, authenticated, unsupported</b><small>Schema introspection and settings calls were studied as an internal surface; production compatibility is not promised.</small></span></div>`;
    };
    const render = () => {
      renderList();
      renderDetail();
      $$('[data-la-surface]', host).forEach(button => button.classList.toggle('active', button.dataset.laSurface === surface));
    };
    on(host, abort.signal, 'click', '[data-la-op]', (_, button) => {
      selected = Number(button.dataset.laOp);
      run++;
      clearTimers(timers);
      render();
    });
    on(host, abort.signal, 'input', '[data-la-search]', (_, input) => {
      search = input.value;
      const first = filtered()[0];
      if (first && !filtered().some(entry => entry.index === selected)) selected = first.index;
      renderList();
    });
    on(host, abort.signal, 'click', '[data-la-surface]', (_, button) => {
      surface = button.dataset.laSurface;
      const first = filtered()[0];
      if (first) selected = first.index;
      render();
    });
    on(host, abort.signal, 'click', '[data-la-run]', (_, button) => {
      const turn = ++run;
      clearTimers(timers);
      button.disabled = true;
      setStatus(host, 'busy', 'Replaying a local deterministic fixture');
      $('[data-la-response-state]', host).textContent = 'resolving fixture';
      later(timers, () => {
        if (turn !== run) return;
        $('[data-la-response]', host).textContent = JSON.stringify(operations[selected].result, null, 2);
        $('[data-la-response-state]', host).textContent = '200 fixture · 0 network calls';
        button.disabled = false;
        setStatus(host, 'good', 'Fixture response rendered locally');
      }, 620);
    });
    render();
    return cleanup(abort, timers);
  }

  function agentBuilder(spec, host, head) {
    const abort = controller();
    const timers = [];
    let run = 0;
    let scenario = 'valid';
    let selectedStage = 0;
    const stages = [
      ['searchOperators', 'Catalog lookup', 'Find Retrieve, Set Role, learner, validation, Apply Model, Performance.'],
      ['getOperatorDetails', 'Authoritative metadata', 'Read real operator keys, parameters, input/output ports, and generated snippets.'],
      ['getProcessXml', 'Process skeleton', 'Start from one valid top-level process operator instead of guessing the wrapper.'],
      ['setProcessXml', 'Validate + commit', 'Run nine structural checks; reject and roll back an invalid candidate.'],
      ['arrangeOperators', 'Canvas layout', 'Arrange only after the candidate XML is accepted.'],
      ['runCurrentProcess', 'Synthetic execution', 'Run against a fixture repository entry, never a private dataset.'],
      ['inspectLastRunResults', 'Execution evidence', 'Return fixture rows, performance, and a concise completion result.']
    ];
    const scenarios = {
      valid: {
        label: 'Valid synthetic mission fixture',
        prompt: 'Build a classification process for a sanitized equipment-risk fixture, validate the XML, run it, and summarize the result.',
        fail: -1, iteration: 12,
        result: 'Valid XML committed · synthetic run completed · result inspected'
      },
      relative: {
        label: 'Relative Retrieve path fault',
        prompt: 'Build the same fixture process, but test a candidate with a relative repository entry.',
        fail: 3, iteration: 9,
        result: 'Rejected · prior process restored · use an absolute fixture repository entry'
      },
      fanout: {
        label: 'Output fanout fault',
        prompt: 'Test a candidate that connects one output directly to two downstream inputs.',
        fail: 3, iteration: 10,
        result: 'Rejected · prior process restored · insert Multiply for fanout'
      }
    };
    const xml = {
      valid: `<process version="10.3">
  <operator name="Process" class="process" expanded="true">
    <process expanded="true">
      <operator name="Retrieve fixture" class="retrieve">
        <parameter key="repository_entry"
          value="//Fixture Repository/data/equipment_risk"/>
      </operator>
      <operator name="Set label" class="set_role"/>
      <operator name="Validation" class="concurrency:cross_validation"/>
      <connect from_op="Retrieve fixture" from_port="output"
        to_op="Set label" to_port="example set input"/>
    </process>
  </operator>
</process>`,
      relative: `<operator name="Retrieve fixture" class="retrieve">
  <parameter key="repository_entry"
    value="../data/equipment_risk"/>
</operator>`,
      fanout: `<connect from_op="Retrieve fixture" from_port="output"
  to_op="Set label" to_port="example set input"/>
<connect from_op="Retrieve fixture" from_port="output"
  to_op="Weights" to_port="example set"/>`
    };

    host.innerHTML = head + `
      <div class="td-workbench td-builder">
        <header class="td-builder-head">
          <div class="td-builder-brand"><i>AI</i><span><b>Agent Builder hardening harness</b><small>headless Builder loop · deterministic browser replay</small></span></div>
          <div class="td-builder-budget"><span>ITERATION BUDGET</span><b data-ab-budget>0 / 25</b><i><em data-ab-budget-bar></em></i></div>
          <span class="td-status" data-td-status>Harness idle</span>
        </header>
        <div class="td-builder-prompt">
          <label><span>Fault fixture</span><select data-ab-scenario>${Object.entries(scenarios).map(([key, item]) => `<option value="${key}">${escapeHtml(item.label)}</option>`).join('')}</select></label>
          <label><span>Builder mission</span><textarea rows="3" data-ab-prompt></textarea></label>
          <button class="td-button primary" type="button" data-ab-run>Run headless harness</button>
        </div>
        <div class="td-builder-layout">
          <section class="td-builder-loop">
            <div class="td-panel-head"><div><span class="td-kicker">Prompt → tools → validate → execute</span><b>Tool iteration trace</b></div><span>max 25 · fixture only</span></div>
            <ol data-ab-stages>${stages.map((stage, index) => `
              <li data-ab-stage="${index}" tabindex="0"><i>${index + 1}</i><span><b>${escapeHtml(stage[0])}</b><small>${escapeHtml(stage[1])}</small></span><em>waiting</em>
                <button type="button" data-ab-inspect="${index}" aria-label="Inspect ${escapeHtml(stage[0])}">›</button>
              </li>`).join('')}</ol>
          </section>
          <section class="td-builder-inspector">
            <div class="td-builder-inspector-head"><span class="td-kicker" data-ab-inspect-kicker>Catalog lookup</span><h4 data-ab-inspect-title>searchOperators</h4><p data-ab-inspect-note></p></div>
            <div class="td-builder-code"><div><span>Candidate process XML</span><em>sanitized synthetic fixture</em></div><pre data-ab-xml></pre></div>
            <div class="td-validator">
              <div><span class="td-kicker">Structural validator</span><b>9 checks + rollback</b></div>
              <ul data-ab-checks>
                <li><i>·</i><span>single top-level process operator</span></li>
                <li><i>·</i><span>known operator keys and parameters</span></li>
                <li><i>·</i><span>ports remain inside process scope</span></li>
                <li><i>·</i><span>repository entries are absolute</span></li>
                <li><i>·</i><span>one output feeds one input</span></li>
              </ul>
            </div>
            <div class="td-builder-result" data-ab-result aria-live="polite"><span>Run the selected synthetic fixture to collect execution evidence.</span></div>
          </section>
        </div>
        <footer class="td-builder-boundary"><b>Hardening evidence, not autonomous production deployment</b><span>Operator metadata, XML candidates, data, repository entries, and results are sanitized fixtures. No model endpoint or AI Studio process is invoked here.</span></footer>
      </div>`;

    const updateScenario = () => {
      const item = scenarios[scenario];
      $('[data-ab-prompt]', host).value = item.prompt;
      $('[data-ab-xml]', host).textContent = xml[scenario];
      $('[data-ab-result]', host).innerHTML = '<span>Run the selected synthetic fixture to collect execution evidence.</span>';
      $('[data-ab-budget]', host).textContent = '0 / 25';
      $('[data-ab-budget-bar]', host).style.width = '0%';
      $$('[data-ab-stage]', host).forEach(stage => stage.className = '');
      $$('[data-ab-checks] li', host).forEach(check => {
        check.className = '';
        $('i', check).textContent = '·';
      });
      setStatus(host, '', 'Harness idle');
    };
    const inspectStage = index => {
      selectedStage = index;
      const stage = stages[index];
      $('[data-ab-inspect-kicker]', host).textContent = stage[1];
      $('[data-ab-inspect-title]', host).textContent = stage[0];
      $('[data-ab-inspect-note]', host).textContent = stage[2];
      $$('[data-ab-stage]', host).forEach((row, rowIndex) => row.classList.toggle('selected', rowIndex === index));
    };
    on(host, abort.signal, 'change', '[data-ab-scenario]', (_, select) => {
      run++;
      clearTimers(timers);
      scenario = select.value;
      updateScenario();
      inspectStage(0);
    });
    on(host, abort.signal, 'click', '[data-ab-inspect]', (_, button) => inspectStage(Number(button.dataset.abInspect)));
    on(host, abort.signal, 'keydown', '[data-ab-stage]', (event, row) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        inspectStage(Number(row.dataset.abStage));
      }
    });
    on(host, abort.signal, 'click', '[data-ab-run]', (_, button) => {
      const turn = ++run;
      clearTimers(timers);
      button.disabled = true;
      const item = scenarios[scenario];
      const rows = $$('[data-ab-stage]', host);
      const checks = $$('[data-ab-checks] li', host);
      rows.forEach(row => row.className = '');
      checks.forEach(check => { check.className = ''; $('i', check).textContent = '·'; });
      $('[data-ab-result]', host).innerHTML = '<span>Builder loop running against the selected fixture…</span>';
      setStatus(host, 'busy', 'Catalog-backed tool loop is running');
      const stopAt = item.fail >= 0 ? item.fail : rows.length - 1;
      rows.forEach((row, index) => {
        if (index > stopAt) return;
        later(timers, () => {
          if (turn !== run) return;
          if (index > 0) {
            rows[index - 1].classList.remove('active');
            rows[index - 1].classList.add('done');
            $('em', rows[index - 1]).textContent = 'complete';
          }
          row.classList.add('active');
          $('em', row).textContent = index === item.fail ? 'validating' : 'running';
          inspectStage(index);
          const used = Math.max(1, Math.round(item.iteration * (index + 1) / (stopAt + 1)));
          $('[data-ab-budget]', host).textContent = `${used} / 25`;
          $('[data-ab-budget-bar]', host).style.width = `${used / 25 * 100}%`;
        }, 110 + index * 300);
      });
      later(timers, () => {
        if (turn !== run) return;
        const row = rows[stopAt];
        row.classList.remove('active');
        if (item.fail >= 0) {
          row.classList.add('failed');
          $('em', row).textContent = 'rejected';
          checks.forEach((check, index) => {
            const failing = (scenario === 'relative' && index === 3) || (scenario === 'fanout' && index === 4);
            check.className = failing ? 'fail' : 'pass';
            $('i', check).textContent = failing ? '×' : '✓';
          });
          setStatus(host, 'bad', 'Invalid XML rejected · previous process restored');
          $('[data-ab-result]', host).innerHTML = `<i class="bad">×</i><span><b>Validator stopped the candidate</b><small>${escapeHtml(item.result)}</small></span>`;
        } else {
          row.classList.add('done');
          $('em', row).textContent = 'complete';
          checks.forEach(check => { check.className = 'pass'; $('i', check).textContent = '✓'; });
          setStatus(host, 'good', 'Valid XML + synthetic execution evidence');
          $('[data-ab-result]', host).innerHTML = `<i>✓</i><span><b>Harness mission completed in ${item.iteration} iterations</b><small>${escapeHtml(item.result)}</small></span>`;
        }
        $('[data-ab-budget]', host).textContent = `${item.iteration} / 25`;
        $('[data-ab-budget-bar]', host).style.width = `${item.iteration / 25 * 100}%`;
        button.disabled = false;
      }, 170 + (stopAt + 1) * 300);
    });
    updateScenario();
    inspectStage(0);
    return cleanup(abort, timers);
  }

  function timeTracker(spec, host, head) {
    const abort = controller();
    let filter = 'all';
    let selected = 0;
    const initialRows = [
      { date: '2026-06-01', account: 'Sample account A', meeting: 45, async: 30, meetings: 1, signals: 1, subject: 'Discovery review', notes: 'Sanitized fixture entry.' },
      { date: '2026-06-02', account: 'Internal enablement', meeting: 30, async: 90, meetings: 1, signals: 2, subject: 'Prototype walkthrough', notes: 'Prepared browser-safe materials.' },
      { date: '2026-06-03', account: 'Sample account B', meeting: 60, async: 20, meetings: 1, signals: 1, subject: 'Architecture discussion', notes: 'Reviewed a bounded sample workflow.' },
      { date: '2026-06-04', account: 'Internal enablement', meeting: 0, async: 120, meetings: 0, signals: 2, subject: 'Documentation', notes: 'Updated static project notes.' },
      { date: '2026-06-05', account: 'Sample account A', meeting: 25, async: 35, meetings: 1, signals: 1, subject: 'Follow-up', notes: 'Recorded next-step summary.' }
    ];
    let rows = clone(initialRows);
    const minutes = value => {
      const h = Math.floor(value / 60);
      const m = value % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    host.innerHTML = head + `
      <div class="td-workbench td-time">
        <header class="td-time-head">
          <div><span class="td-kicker">Static CSV workbench</span><h3>Time entry dashboard</h3><p>Import · filter · edit · total · export preview</p></div>
          <div class="td-no-capture"><i>○</i><span><b>No activity capture</b><small>No timer, telemetry, or background monitoring</small></span></div>
          <div class="td-time-actions"><button class="td-button" type="button" data-tt-import>Import sanitized fixture</button><button class="td-button primary" type="button" data-tt-export>Preview CSV export</button></div>
        </header>
        <section class="td-time-metrics">
          <article><span>Total time</span><b data-tt-total>—</b><small>filtered rows</small></article>
          <article><span>Meeting time</span><b data-tt-meet>—</b><small data-tt-meet-count>— meetings</small></article>
          <article><span>Async estimate</span><b data-tt-async>—</b><small>manually entered</small></article>
          <article><span>CSV records</span><b data-tt-count>—</b><small>browser memory</small></article>
        </section>
        <div class="td-time-layout">
          <main class="td-time-table-wrap">
            <div class="td-time-toolbar">
              <label><span>Account filter</span><select data-tt-filter></select></label>
              <span data-tt-summary></span>
            </div>
            <div class="td-time-table">
              <div class="head"><span>Date</span><span>Account</span><span>Subject</span><span>Meeting</span><span>Async</span><span>Total</span></div>
              <div data-tt-rows></div>
            </div>
          </main>
          <aside class="td-time-editor">
            <div><span class="td-kicker">Selected CSV row</span><h4>Edit entry</h4><p>Changes remain local until an export is previewed.</p></div>
            <label><span>Date</span><input type="date" data-tt-field="date"></label>
            <label><span>Account</span><input data-tt-field="account"></label>
            <label><span>Subject</span><input data-tt-field="subject"></label>
            <div class="td-time-field-pair">
              <label><span>Meeting minutes</span><input type="number" min="0" max="1440" data-tt-field="meeting"></label>
              <label><span>Async minutes</span><input type="number" min="0" max="1440" data-tt-field="async"></label>
            </div>
            <label><span>Notes</span><textarea rows="3" data-tt-field="notes"></textarea></label>
            <button class="td-button primary" type="button" data-tt-save>Update row</button>
            <span class="td-status" data-td-status>Fixture loaded</span>
          </aside>
        </div>
        <section class="td-csv-preview" data-tt-preview hidden>
          <div><span class="td-kicker">CSV export preview</span><b>Static rows · quoted fields</b><button type="button" data-tt-close aria-label="Close CSV preview">×</button></div>
          <pre data-tt-csv></pre>
        </section>
      </div>`;

    const accounts = () => ['all', ...new Set(rows.map(row => row.account))];
    const visible = () => rows.map((row, index) => ({ row, index })).filter(entry => filter === 'all' || entry.row.account === filter);
    const renderFilter = () => {
      const select = $('[data-tt-filter]', host);
      select.innerHTML = accounts().map(account => `<option value="${escapeHtml(account)}" ${account === filter ? 'selected' : ''}>${account === 'all' ? 'All accounts' : escapeHtml(account)}</option>`).join('');
    };
    const renderRows = () => {
      const list = visible();
      $('[data-tt-rows]', host).innerHTML = list.length ? list.map(({ row, index }) => `
        <button type="button" data-tt-row="${index}" class="row ${index === selected ? 'active' : ''}">
          <span>${escapeHtml(row.date)}</span><span>${escapeHtml(row.account)}</span><span>${escapeHtml(row.subject)}</span>
          <span>${minutes(row.meeting)}</span><span>${minutes(row.async)}</span><strong>${minutes(row.meeting + row.async)}</strong>
        </button>`).join('') : '<div class="td-empty">No rows match this account filter.</div>';
      const totals = list.reduce((sum, entry) => {
        sum.meeting += Number(entry.row.meeting);
        sum.async += Number(entry.row.async);
        sum.meetings += Number(entry.row.meetings);
        return sum;
      }, { meeting: 0, async: 0, meetings: 0 });
      $('[data-tt-total]', host).textContent = minutes(totals.meeting + totals.async);
      $('[data-tt-meet]', host).textContent = minutes(totals.meeting);
      $('[data-tt-async]', host).textContent = minutes(totals.async);
      $('[data-tt-count]', host).textContent = String(list.length);
      $('[data-tt-meet-count]', host).textContent = `${totals.meetings} meeting${totals.meetings === 1 ? '' : 's'}`;
      $('[data-tt-summary]', host).textContent = `Showing ${list.length} of ${rows.length} static CSV rows`;
    };
    const renderEditor = () => {
      const row = rows[selected] || rows[0];
      if (!row) return;
      $$('[data-tt-field]', host).forEach(input => input.value = row[input.dataset.ttField]);
    };
    const render = () => {
      renderFilter();
      renderRows();
      renderEditor();
    };
    on(host, abort.signal, 'click', '[data-tt-row]', (_, button) => {
      selected = Number(button.dataset.ttRow);
      renderRows();
      renderEditor();
      setStatus(host, '', 'Row selected · edits not yet applied');
    });
    on(host, abort.signal, 'change', '[data-tt-filter]', (_, select) => {
      filter = select.value;
      const first = visible()[0];
      if (first) selected = first.index;
      render();
    });
    on(host, abort.signal, 'click', '[data-tt-save]', () => {
      const row = rows[selected];
      $$('[data-tt-field]', host).forEach(input => {
        const key = input.dataset.ttField;
        row[key] = ['meeting', 'async'].includes(key) ? Math.max(0, Number(input.value) || 0) : input.value;
      });
      render();
      setStatus(host, 'good', 'Static CSV row updated in browser memory');
    });
    on(host, abort.signal, 'click', '[data-tt-import]', () => {
      rows = clone(initialRows);
      filter = 'all';
      selected = 0;
      render();
      setStatus(host, 'good', 'Sanitized CSV fixture imported · 5 rows');
    });
    on(host, abort.signal, 'click', '[data-tt-export]', () => {
      const headers = ['Date', 'Account', 'Meeting_Time', 'Async_Time_Est', 'Total_Time', 'Meeting_Count', 'Async_Signal_Count', 'Meeting_Subjects', 'Notes'];
      const csvRows = rows.map(row => [
        row.date, row.account, minutes(row.meeting), minutes(row.async), minutes(row.meeting + row.async),
        row.meetings, row.signals, row.subject, row.notes
      ]);
      const quote = value => `"${String(value).replace(/"/g, '""')}"`;
      $('[data-tt-csv]', host).textContent = [headers, ...csvRows].map(row => row.map(quote).join(',')).join('\n');
      $('[data-tt-preview]', host).hidden = false;
      $('[data-tt-preview]', host).scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    });
    on(host, abort.signal, 'click', '[data-tt-close]', () => {
      $('[data-tt-preview]', host).hidden = true;
    });
    render();
    return cleanup(abort);
  }

  window.PROJECT_WORKBENCHES = Object.assign(window.PROJECT_WORKBENCHES || {}, {
    snapshotArchive,
    modelEval,
    tcBomWidget,
    routerAudit,
    onePagerKit,
    evidenceBoard,
    goalDraft,
    lumaApi,
    agentBuilder,
    timeTracker
  });
})();
