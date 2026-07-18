/* Project-specific portfolio workbenches. Loaded after projects.html's core runtime. */
(() => {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const wait = (timers, fn, ms) => { const id = setTimeout(fn, REDUCE ? Math.min(ms, 35) : ms); timers.push(id); return id; };
  const stopTimers = timers => timers.splice(0).forEach(clearTimeout);
  const status = (host, cls, text) => { const el = $('[data-cw-status]', host); if (el) { el.className = `cw-status ${cls || ''}`; el.textContent = text; } };

  function replacementMap(spec, host, head) {
    const timers = [];
    const legacy = [
      ['ERP','Legacy batch export','Nightly flat-file handoff'],
      ['FS','Shared staging folder','Polling and duplicate retries'],
      ['MAP','Custom field mapper','Implicit rules in scripts'],
      ['PLM','PLM import job','Partial audit trail']
    ];
    const modern = [
      ['API','Typed service façade','Stable contract around legacy behavior'],
      ['EVT','Idempotent event intake','Retry and replay by correlation ID'],
      ['MAP','Versioned mapping service','Explicit transformations and tests'],
      ['AUD','Governed PLM adapter','Policy checks with evidence ledger']
    ];
    host.innerHTML = head + `
      <div class="cw-toolbar">
        <div class="w-chips" style="margin:0">
          <label class="w-chip active"><input type="checkbox" data-constraint="ids" checked> Preserve external IDs</label>
          <label class="w-chip active"><input type="checkbox" data-constraint="retry" checked> Replay safely</label>
          <label class="w-chip active"><input type="checkbox" data-constraint="audit" checked> Retain audit trail</label>
        </div>
        <button class="w-btn primary" data-generate>Generate replacement plan</button>
      </div>
      <div class="cw-grid-2">
        <section class="cw-panel"><div class="cw-panel-head"><b>Reconstructed legacy flow</b><span>4 boundaries</span></div><div class="cw-map">${legacy.map(n => `<div class="cw-map-node"><i>${n[0]}</i><div><b>${n[1]}</b><small>${n[2]}</small></div><span class="cw-chip warn">observed</span></div>`).join('')}</div></section>
        <section class="cw-panel"><div class="cw-panel-head"><b>Proposed replacement</b><span data-map-count>not generated</span></div><div class="cw-map" data-modern>${modern.map((n, i) => `<div class="cw-map-node pending" data-modern-node="${i}"><i>${n[0]}</i><div><b>${n[1]}</b><small>${n[2]}</small></div><span class="cw-chip">planned</span></div>`).join('')}</div></section>
      </div>
      <div class="cw-panel" style="margin-top:11px"><div class="cw-panel-head"><b>Migration rationale</b><span class="cw-status" data-cw-status>Awaiting constraints</span></div><div class="cw-panel-body"><div class="cw-rationale" data-rationale></div></div></div>`;
    const drawRationale = () => {
      const checked = new Set($$('[data-constraint]:checked', host).map(x => x.dataset.constraint));
      const lines = [
        checked.has('ids') ? 'Canonical IDs pass unchanged through a typed compatibility façade.' : 'New IDs are generated and recorded in a reversible crosswalk.',
        checked.has('retry') ? 'Correlation keys make retries idempotent and replayable.' : 'Retries remain bounded; failed packets enter a visible review queue.',
        checked.has('audit') ? 'Every mapping decision is written to a browser-only evidence ledger.' : 'Only operational status is retained in this sample plan.'
      ];
      $('[data-rationale]', host).innerHTML = lines.map(x => `<div>${esc(x)}</div>`).join('');
    };
    $$('[data-constraint]', host).forEach(x => x.addEventListener('change', () => {
      x.closest('.w-chip').classList.toggle('active', x.checked); drawRationale(); status(host, '', 'Constraints changed · regenerate');
    }));
    $('[data-generate]', host).addEventListener('click', e => {
      const button = e.currentTarget; stopTimers(timers); button.disabled = true; status(host, 'busy', 'Mapping behaviors and controls');
      $$('[data-modern-node]', host).forEach(n => { n.className = 'cw-map-node pending'; $('.cw-chip', n).className = 'cw-chip'; $('.cw-chip', n).textContent = 'planned'; });
      $$('[data-modern-node]', host).forEach((n, i) => wait(timers, () => { n.className = 'cw-map-node ready'; $('.cw-chip', n).className = 'cw-chip ok'; $('.cw-chip', n).textContent = 'mapped'; }, 230 + i * 240));
      wait(timers, () => { $('[data-map-count]', host).textContent = '4 governed services'; status(host, 'ok', 'Replacement plan ready · 3 constraints traced'); button.disabled = false; }, 1320);
    });
    drawRationale();
    return () => stopTimers(timers);
  }

  const briefEvents = [
    { id:'E1', icon:'MTG', title:'Architecture review completed', text:'Interfaces and ownership boundaries were reviewed.', confidence:96 },
    { id:'E2', icon:'LAB', title:'Sample integration exercised', text:'A browser-safe fixture completed the read path.', confidence:91 },
    { id:'E3', icon:'NOTE', title:'Open question recorded', text:'Deployment ownership remains intentionally unresolved.', confidence:84 }
  ];

  function briefWorkbench(spec, host, head) {
    const timers = [], core = spec.variant === 'core'; let active = 'E1';
    host.innerHTML = head + `
      <div class="cw-toolbar">
        <span class="cw-status ok" data-cw-status>${core ? 'Sanitized packet loaded' : '3 anonymized sources ready'}</span>
        <button class="w-btn primary" data-brief-generate>${core ? 'Run sourced synthesis' : 'Generate account brief'}</button>
      </div>
      ${core ? `<div class="cw-panel" style="margin-bottom:11px"><div class="cw-panel-head"><b>Editable sanitized event packet</b><span>No identity or commercial fields</span></div><div class="cw-panel-body"><textarea class="cw-textarea" data-event-json aria-label="Sanitized event JSON">[
  { "type": "meeting", "topic": "architecture", "signal": "interfaces reviewed" },
  { "type": "lab", "topic": "integration", "signal": "sample read path completed" },
  { "type": "note", "topic": "ownership", "signal": "deployment owner unresolved" }
]</textarea></div></div>` : ''}
      <div class="cw-grid-aside">
        <section class="cw-panel"><div class="cw-panel-head"><b>${core ? 'Evidence ledger' : 'Sanitized activity'}</b><span>source linked</span></div><div class="cw-panel-body" data-events>${briefEvents.map(e => `<button class="cw-event${e.id === active ? ' active' : ''}" data-event="${e.id}"><i>${e.icon}</i><span><b>${esc(e.title)}</b><span>${esc(e.text)}</span></span><span class="cw-chip ok">${e.confidence}%</span></button>`).join('')}</div></section>
        <section class="cw-panel"><div class="cw-panel-head"><b>Structured brief</b><span data-brief-state>draft</span></div><div class="cw-brief" data-brief-output><div class="cw-empty">Generate the brief to separate evidence, inference, and the open question.</div></div></section>
      </div>`;
    const wireEvents = () => $$('[data-event]', host).forEach(b => b.addEventListener('click', () => { active = b.dataset.event; $$('[data-event]', host).forEach(x => x.classList.toggle('active', x === b)); const source = $(`[data-source="${active}"]`, host); if (source) { $$('[data-source]', host).forEach(x => x.classList.toggle('active', x === source)); source.focus(); } }));
    wireEvents();
    $('[data-brief-generate]', host).addEventListener('click', e => {
      const button = e.currentTarget; stopTimers(timers);
      if (core) { try { const data = JSON.parse($('[data-event-json]', host).value); if (!Array.isArray(data)) throw new Error('Packet must be an array'); } catch (err) { status(host, 'bad', `Packet error · ${err.message}`); return; } }
      button.disabled = true; status(host, 'busy', 'Linking claims to sanitized sources'); $('[data-brief-state]', host).textContent = 'synthesizing';
      $('[data-brief-output]', host).innerHTML = '<div class="cw-empty">Building evidence ledger…</div>';
      wait(timers, () => {
        $('[data-brief-state]', host).textContent = core ? '3 claims · 3 sources' : 'source-linked';
        $('[data-brief-output]', host).innerHTML = `<div class="kicker">Illustrative sourced brief</div><h5>Technical evaluation is becoming more concrete</h5><p><b>Evidence:</b> architecture boundaries were reviewed and the sample read path completed. <b>Inference:</b> evaluation depth appears to be increasing. <b>Open question:</b> deployment ownership is not yet established.</p><div class="cw-source-row">${briefEvents.map(x => `<button class="cw-source" data-source="${x.id}">${x.id} · ${x.confidence}%</button>`).join('')}</div>${core ? `<div class="cw-ledger">${briefEvents.map((x, i) => `<div class="cw-ledger-row"><b>${x.id}</b><span>${i < 2 ? 'observation' : 'open question'}</span><span>${x.confidence}%</span></div>`).join('')}</div>` : ''}`;
        $$('[data-source]', host).forEach(b => b.addEventListener('click', () => { active = b.dataset.source; $$('[data-source]', host).forEach(x => x.classList.toggle('active', x === b)); const event = $(`[data-event="${active}"]`, host); if (event) { $$('[data-event]', host).forEach(x => x.classList.toggle('active', x === event)); event.focus(); } }));
        status(host, 'ok', 'Brief complete · every claim remains source-linked'); button.disabled = false;
      }, 720);
    });
    return () => stopTimers(timers);
  }

  function deckBuilder(spec, host, head) {
    const timers = [];
    const strategies = {
      decision:[['Decision','Approve a governed pilot'],['Context','The current workflow crosses three disconnected systems'],['Evidence','A typed tool path preserves source and policy'],['Architecture','Browser → MCP → governed adapter'],['Action','Run the bounded sample with named success criteria']],
      technical:[['Boundary','Define the system boundary'],['Interfaces','Typed calls and stable schemas'],['Controls','Policy, approval, and audit points'],['Sequence','Request → validate → execute → verify'],['Proof','Test evidence and observable failure modes']],
      demo:[['Setup','Start from the operator question'],['Input','Choose one sanitized sample object'],['Interaction','Run the governed action'],['Result','Inspect the changed artifact and trace'],['Recap','Connect the moment to the system outcome']]
    };
    let mode = 'decision', selected = 0, slides = strategies[mode].map(x => [...x]);
    host.innerHTML = head + `
      <div class="cw-toolbar">
        <div class="sim-modes" role="group" aria-label="Deck outline"><button class="sim-mode active" data-deck-mode="decision">Decision</button><button class="sim-mode" data-deck-mode="technical">Technical</button><button class="sim-mode" data-deck-mode="demo">Demo</button></div>
        <div style="display:flex;gap:7px"><button class="w-btn" data-slide-up>Move earlier</button><button class="w-btn" data-slide-down>Move later</button><button class="w-btn primary" data-export>Export dry run</button></div>
      </div>
      <div class="cw-deck"><div class="cw-thumbs" data-thumbs></div><section class="cw-slide" data-slide aria-live="polite"></section></div>
      <div class="cw-status ok" data-cw-status style="margin-top:10px">5-slide outline ready</div>`;
    function draw() {
      $('[data-thumbs]', host).innerHTML = slides.map((s, i) => `<button class="cw-thumb${i === selected ? ' active' : ''}" data-slide-index="${i}" aria-pressed="${i === selected}"><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(s[0])}</b></button>`).join('');
      const s = slides[selected];
      $('[data-slide]', host).innerHTML = `<div class="slide-no">${String(selected + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')} · ${esc(mode)} outline</div><h5>${esc(s[1])}</h5><p>${esc(s[0])} slide · concise sample copy with a source-safe architecture narrative.</p><div class="cw-slide-bars"><i></i><i></i><i style="width:82%"></i></div>`;
      $$('[data-slide-index]', host).forEach(b => b.addEventListener('click', () => { selected = +b.dataset.slideIndex; draw(); b = $(`[data-slide-index="${selected}"]`, host); if (b) b.focus(); }));
      $('[data-slide-up]', host).disabled = selected === 0; $('[data-slide-down]', host).disabled = selected === slides.length - 1;
    }
    $$('[data-deck-mode]', host).forEach(b => b.addEventListener('click', () => { mode = b.dataset.deckMode; slides = strategies[mode].map(x => [...x]); selected = 0; $$('[data-deck-mode]', host).forEach(x => x.classList.toggle('active', x === b)); status(host, 'ok', `${mode} outline · 5 slides mapped`); draw(); }));
    $('[data-slide-up]', host).addEventListener('click', () => { if (selected < 1) return; [slides[selected - 1], slides[selected]] = [slides[selected], slides[selected - 1]]; selected--; draw(); });
    $('[data-slide-down]', host).addEventListener('click', () => { if (selected >= slides.length - 1) return; [slides[selected + 1], slides[selected]] = [slides[selected], slides[selected + 1]]; selected++; draw(); });
    $('[data-export]', host).addEventListener('click', e => { const button = e.currentTarget; button.disabled = true; status(host, 'busy', 'Checking layout, notes, and source labels'); wait(timers, () => { status(host, 'ok', 'Export dry run passed · 5 slides · no file written'); button.disabled = false; }, 650); });
    draw(); return () => stopTimers(timers);
  }

  function storyMapper(spec, host, head) {
    const stories = {
      engineer:[['Trigger','Change C-42 enters the inbox','Open the task from the assigned worklist.'],['Investigate','Affected rotor structure','Follow item, BOM, and drawing relationships.'],['Decide','Two updates required','Explain why the drawing and validation plan must change.'],['Act','Submit reviewed response','Close with ownership and next evidence.']],
      manager:[['Signal','Release score drops','Start from the rollup, not a raw object.'],['Drill down','Two blockers explain the score','Preserve the path from signal to source.'],['Align','Owners accept follow-ups','Make accountability visible without private names.'],['Gate','Conditional release recorded','End with a bounded decision.']],
      agent:[['Prompt','What blocks release?','Frame the question and its allowed scope.'],['Tools','Traverse change and structure','Show each governed call and returned object.'],['Evidence','Cite C-42 and Spec S-9','Separate evidence from inference.'],['Answer','State blockers and next action','Close with traceable recommendations.']]
    };
    let persona = 'engineer', active = 0, steps = stories[persona].map(x => [...x]);
    host.innerHTML = head + `<div class="cw-toolbar"><div class="sim-modes" role="group" aria-label="Persona lens"><button class="sim-mode active" data-persona="engineer">Engineer</button><button class="sim-mode" data-persona="manager">Manager</button><button class="sim-mode" data-persona="agent">Agent</button></div><div style="display:flex;gap:7px"><button class="w-btn" data-story-left>Move earlier</button><button class="w-btn" data-story-right>Move later</button></div></div><section class="cw-panel"><div class="cw-panel-head"><b>Reorderable demo journey</b><span data-story-count>4 beats</span></div><div class="cw-story-lane" data-story-lane></div><div class="cw-cue" data-cue aria-live="polite"></div></section>`;
    function draw() {
      $('[data-story-lane]', host).style.setProperty('--story-count', steps.length);
      $('[data-story-lane]', host).innerHTML = steps.map((s, i) => `<button class="cw-story-step${i === active ? ' active' : ''}" data-story="${i}" aria-pressed="${i === active}"><small>${String(i + 1).padStart(2, '0')} · ${esc(s[0])}</small><b>${esc(s[1])}</b><span>${esc(s[2])}</span></button>`).join('');
      $('[data-cue]', host).innerHTML = `<b>Presenter cue</b><span>${esc(steps[active][2])} Then hand off to “${esc(steps[(active + 1) % steps.length][1])}.”</span>`;
      $$('[data-story]', host).forEach(b => b.addEventListener('click', () => { active = +b.dataset.story; draw(); const next = $(`[data-story="${active}"]`, host); if (next) next.focus(); }));
      $('[data-story-left]', host).disabled = active === 0; $('[data-story-right]', host).disabled = active === steps.length - 1;
    }
    $$('[data-persona]', host).forEach(b => b.addEventListener('click', () => { persona = b.dataset.persona; steps = stories[persona].map(x => [...x]); active = 0; $$('[data-persona]', host).forEach(x => x.classList.toggle('active', x === b)); draw(); }));
    $('[data-story-left]', host).addEventListener('click', () => { if (!active) return; [steps[active - 1], steps[active]] = [steps[active], steps[active - 1]]; active--; draw(); });
    $('[data-story-right]', host).addEventListener('click', () => { if (active >= steps.length - 1) return; [steps[active + 1], steps[active]] = [steps[active], steps[active + 1]]; active++; draw(); });
    draw(); return () => {};
  }

  function techSite(spec, host, head) {
    const cards = [
      { id:'graph', type:'AI', icon:'GR', title:'Graph-grounded answers', copy:'Compare typed traversal with a flat retrieval baseline.', detail:'Question → typed edges → cited facts → grounded answer. Open the representative graph artifact to inspect its evidence path.' },
      { id:'edge', type:'Edge', icon:'ED', title:'Local anomaly detection', copy:'Keep the signal and its response inside the browser sample.', detail:'Start a synthetic stream, inject a bounded anomaly, and verify that the local alarm contains no external data.' },
      { id:'tools', type:'Agents', icon:'MC', title:'Governed tool orchestration', copy:'Compose small typed tools with visible permission boundaries.', detail:'A prompt becomes a plan, individual allowed calls, and a result whose claims link back to tool evidence.' }
    ];
    let filter = 'All', active = cards[0].id;
    host.innerHTML = head + `<nav class="cw-tech-nav" aria-label="Exploration filters">${['All','AI','Edge','Agents'].map((x, i) => `<button class="w-chip${i ? '' : ' active'}" data-tech-filter="${x}">${x}</button>`).join('')}</nav><div class="cw-tech-grid" data-tech-grid></div><div class="cw-tech-detail" data-tech-detail aria-live="polite"></div>`;
    function draw() {
      const shown = cards.filter(c => filter === 'All' || c.type === filter); if (!shown.some(c => c.id === active)) active = shown[0].id;
      $('[data-tech-grid]', host).innerHTML = shown.map(c => `<button class="cw-tech-card${c.id === active ? ' active' : ''}" data-tech="${c.id}"><i>${c.icon}</i><b>${esc(c.title)}</b><span>${esc(c.copy)}</span></button>`).join('');
      const c = cards.find(x => x.id === active); $('[data-tech-detail]', host).innerHTML = `<b>${esc(c.type)} exploration</b><p>${esc(c.detail)}</p>`;
      $$('[data-tech]', host).forEach(b => b.addEventListener('click', () => { active = b.dataset.tech; draw(); const next = $(`[data-tech="${active}"]`, host); if (next) next.focus(); }));
    }
    $$('[data-tech-filter]', host).forEach(b => b.addEventListener('click', () => { filter = b.dataset.techFilter; $$('[data-tech-filter]', host).forEach(x => x.classList.toggle('active', x === b)); draw(); }));
    draw(); return () => {};
  }

  function lunchRoulette(spec, host, head, ctx) {
    const places = [
      { id:'garden', name:'Garden Bowl', meta:'7 min · light', weight:34, color:'teal' },
      { id:'noodle', name:'Noodle Workshop', meta:'12 min · adventurous', weight:33, color:'purple' },
      { id:'deli', name:'Corner Deli', meta:'4 min · reliable', weight:33, color:'amber' }
    ];
    const timers = []; let vetoes = new Set(), history = [], turn = 0;
    host.innerHTML = head + `<div class="cw-wheel-wrap"><section class="cw-panel"><div class="cw-panel-head"><b>Weighted draw</b><span>browser-only round</span></div><div class="cw-panel-body"><div class="cw-pointer"></div><div class="cw-wheel" data-wheel></div><button class="w-btn primary" data-spin style="width:100%;justify-content:center">Spin lunch wheel</button><div class="cw-status ok" data-cw-status style="margin-top:10px">Ready · no vetoes</div></div></section><section class="cw-panel"><div class="cw-panel-head"><b>Weights and veto round</b><span>one-click rematch</span></div><div class="cw-panel-body" data-places></div><div class="cw-panel-body" style="border-top:1px solid var(--hairline)"><b style="font-size:10px;color:var(--text2)">Round history</b><div class="cw-history" data-history><span class="cw-chip">No draws yet</span></div></div></section></div>`;
    function drawPlaces() {
      $('[data-places]', host).innerHTML = places.map(p => `<div class="cw-place"><div><b>${esc(p.name)}</b><span>${esc(p.meta)} · weight <output data-weight-out="${p.id}">${p.weight}</output></span><input type="range" min="1" max="60" value="${p.weight}" data-weight="${p.id}" aria-label="${esc(p.name)} weight"></div><button class="cw-veto${vetoes.has(p.id) ? ' active' : ''}" data-veto="${p.id}" aria-pressed="${vetoes.has(p.id)}">${vetoes.has(p.id) ? 'Vetoed' : 'Veto'}</button></div>`).join('');
      $$('[data-weight]', host).forEach(r => r.addEventListener('input', () => { const p = places.find(x => x.id === r.dataset.weight); p.weight = +r.value; $(`[data-weight-out="${p.id}"]`, host).textContent = p.weight; }));
      $$('[data-veto]', host).forEach(b => b.addEventListener('click', () => { vetoes.has(b.dataset.veto) ? vetoes.delete(b.dataset.veto) : vetoes.add(b.dataset.veto); drawPlaces(); status(host, vetoes.size === places.length ? 'bad' : 'ok', vetoes.size ? `${vetoes.size} veto${vetoes.size > 1 ? 'es' : ''} · spin chooses remaining options` : 'Ready · no vetoes'); }));
    }
    $('[data-spin]', host).addEventListener('click', e => {
      const button = e.currentTarget, allowed = places.filter(p => !vetoes.has(p.id)); if (!allowed.length) { status(host, 'bad', 'Every option is vetoed · clear one to continue'); return; }
      const total = allowed.reduce((n, p) => n + p.weight, 0); let pick = ctx.rng() * total, winner = allowed[0]; for (const p of allowed) { pick -= p.weight; if (pick <= 0) { winner = p; break; } }
      button.disabled = true; turn += 1260 + Math.round(ctx.rng() * 420); $('[data-wheel]', host).style.setProperty('--turn', `${turn}deg`); status(host, 'busy', 'Drawing from active weights');
      wait(timers, () => { history.unshift(winner.name); history = history.slice(0, 5); $('[data-history]', host).innerHTML = history.map((x, i) => `<span class="cw-chip${i ? '' : ' ok'}">${i ? 'then ' : ''}${esc(x)}</span>`).join(''); status(host, 'ok', `${winner.name} selected · veto or re-spin for a rematch`); button.disabled = false; }, 1250);
    });
    drawPlaces(); return () => stopTimers(timers);
  }

  function dataMapper(spec, host, head) {
    return spec.kind === 'nx-mendix' ? nxMendixMapper(spec, host, head) : mendixSapMapper(spec, host, head);
  }

  function mendixSapMapper(spec, host, head) {
    const timers = [];
    host.innerHTML = head + `<div class="cw-toolbar"><div class="w-controls" style="margin:0"><div class="w-field"><label for="cw-material">Sample material ID</label><input id="cw-material" data-material value="SAMPLE-1042"></div><label class="w-chip active"><input type="checkbox" data-cache checked> Use browser cache</label></div><button class="w-btn primary" data-read>Read and map material</button></div><div class="cw-grid-2"><section class="cw-panel"><div class="cw-panel-head"><b>OData response</b><span data-cache-state>cache warm</span></div><div class="cw-panel-body"><pre class="cw-code" data-source-json>{ ready: true }</pre></div></section><section class="cw-panel"><div class="cw-panel-head"><b>Mendix domain entity</b><span>typed mapping</span></div><div class="cw-panel-body"><div class="cw-field-table" data-entity><div class="cw-empty">Run the read to inspect mapped fields.</div></div></div></section></div><div class="cw-status ok" data-cw-status style="margin-top:10px">Ready · read-only adapter</div>`;
    $('[data-cache]', host).addEventListener('change', e => { e.currentTarget.closest('.w-chip').classList.toggle('active', e.currentTarget.checked); $('[data-cache-state]', host).textContent = e.currentTarget.checked ? 'cache warm' : 'cache bypass'; });
    $('[data-read]', host).addEventListener('click', e => { const button = e.currentTarget, id = $('[data-material]', host).value.trim().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 24) || 'SAMPLE-1042', cached = $('[data-cache]', host).checked; button.disabled = true; status(host, 'busy', 'Validating identifier and mapping six fields');
      const payload = { Material:id, Description:'Sample drive housing', BaseUnit:'EA', Status:'Released', Plant:'DEMO', Revision:'B' }; $('[data-source-json]', host).textContent = JSON.stringify({ d:payload, meta:{ source:'sample fixture', cached } }, null, 2);
      wait(timers, () => { $('[data-entity]', host).innerHTML = Object.entries({ materialId:id, displayName:payload.Description, unit:payload.BaseUnit, lifecycle:payload.Status, site:payload.Plant, revision:payload.Revision }).map(([k, v]) => `<div class="cw-field-row"><b>${esc(k)}</b><span>${esc(v)}</span><span class="cw-chip ok">mapped</span></div>`).join(''); status(host, 'ok', `${cached ? 'Cache hit' : 'Adapter read'} · 6 / 6 fields mapped`); button.disabled = false; }, cached ? 280 : 650);
    }); return () => stopTimers(timers);
  }

  function nxMendixMapper(spec, host, head) {
    const props = [{k:'partNumber',v:'ROTOR-204'},{k:'revision',v:'C'},{k:'material',v:'Steel · sample'},{k:'massKg',v:'12.84'},{k:'released',v:'true'}];
    host.innerHTML = head + `<div class="cw-toolbar"><span class="cw-status ok" data-cw-status>NX sample metadata loaded</span><button class="w-btn primary" data-map-properties>Build operator card</button></div><div class="cw-grid-aside"><section class="cw-panel"><div class="cw-panel-head"><b>NX properties</b><span>Select published fields</span></div><div class="cw-panel-body">${props.map((p, i) => `<label class="cw-field-row"><b><input type="checkbox" data-nx-prop="${p.k}" ${i < 4 ? 'checked' : ''}> ${esc(p.k)}</b><span>${esc(p.v)}</span><span class="cw-chip">NX</span></label>`).join('')}</div></section><section class="cw-panel"><div class="cw-panel-head"><b>Mendix operator result</b><span>domain preview</span></div><div class="cw-panel-body" data-mendix-card><div class="cw-empty">Choose properties and build the mapped card.</div></div></section></div>`;
    $('[data-map-properties]', host).addEventListener('click', () => { const selected = new Set($$('[data-nx-prop]:checked', host).map(x => x.dataset.nxProp)); if (!selected.size) { status(host, 'bad', 'Select at least one property'); return; } const fields = props.filter(p => selected.has(p.k)); $('[data-mendix-card]', host).innerHTML = `<div class="cw-chip ok">Mapped entity · ${fields.length} fields</div><h5 style="margin:13px 0 6px;color:var(--text);font-size:17px">${selected.has('partNumber') ? 'ROTOR-204' : 'Selected NX object'}</h5><div class="cw-field-table">${fields.map(p => `<div class="cw-field-row"><b>${esc(p.k)}</b><span>${esc(p.v)}</span><span class="cw-chip ok">published</span></div>`).join('')}</div><pre class="cw-code" style="margin-top:11px">${esc(JSON.stringify(Object.fromEntries(fields.map(p => [p.k, p.v])), null, 2))}</pre>`; status(host, 'ok', `${fields.length} properties mapped · browser preview only`); });
    return () => {};
  }

  function jdbcWorkbench(spec, host, head) {
    const queries = { released:'SELECT item_type, COUNT(*) AS total\nFROM sample_items\nWHERE status = :status\nGROUP BY item_type\nLIMIT 250', owners:'SELECT owning_group, COUNT(*) AS total\nFROM sample_items\nGROUP BY owning_group\nLIMIT 250', forbidden:'DELETE FROM sample_items WHERE status = \'DRAFT\'' };
    host.innerHTML = head + `<div class="cw-toolbar"><div class="w-controls" style="margin:0"><div class="w-field"><label for="cw-query-preset">Saved query</label><select id="cw-query-preset" data-query-preset><option value="released">Released counts</option><option value="owners">Owning groups</option><option value="forbidden">Mutation guard test</option></select></div></div><button class="w-btn primary" data-run-query>Execute constrained query</button></div><div class="cw-grid-2"><section class="cw-panel"><div class="cw-panel-head"><b>Parameterized SQL</b><span>read-only · limit 250</span></div><div class="cw-panel-body"><textarea class="cw-textarea" data-sql aria-label="Sample SQL">${queries.released}</textarea></div></section><section class="cw-panel"><div class="cw-panel-head"><b>Typed result rows</b><span data-query-meta>not run</span></div><div class="cw-panel-body" data-query-result><div class="cw-empty">Run a safe SELECT or exercise the mutation guard.</div></div></section></div><div class="cw-status ok" data-cw-status style="margin-top:10px">Policy ready · SELECT only</div>`;
    $('[data-query-preset]', host).addEventListener('change', e => { $('[data-sql]', host).value = queries[e.target.value]; status(host, 'ok', 'Preset loaded · policy not yet evaluated'); });
    $('[data-run-query]', host).addEventListener('click', () => { const sql = $('[data-sql]', host).value.trim(); if (/\b(insert|update|delete|drop|alter|create|merge)\b/i.test(sql) || !/^select\b/i.test(sql)) { $('[data-query-result]', host).innerHTML = `<div class="cw-empty" style="color:var(--coral)">Mutation rejected before JDBC dispatch.<br><span class="cw-chip bad" style="margin-top:9px">READ_ONLY_POLICY</span></div>`; $('[data-query-meta]', host).textContent = 'blocked · 0 rows'; status(host, 'bad', 'Policy guard rejected a mutation verb'); return; } const owners = /owning_group/i.test(sql); const rows = owners ? [['Engineering','84'],['Manufacturing','61'],['Quality','39']] : [['Part','112'],['Document','48'],['Dataset','24']]; $('[data-query-result]', host).innerHTML = `<table class="cw-result-table"><thead><tr><th>${owners ? 'owning_group' : 'item_type'}</th><th>total</th><th>JDBC type</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td>VARCHAR · INTEGER</td></tr>`).join('')}</tbody></table>`; $('[data-query-meta]', host).textContent = `3 rows · 42 ms`; status(host, 'ok', 'Read-only query complete · row limit and types verified'); }); return () => {};
  }

  function supplyRisk(spec, host, head) {
    const nodes = [{id:'asm',x:330,y:42,l:'Drive assembly'},{id:'motor',x:155,y:120,l:'Motor'},{id:'ctrl',x:330,y:125,l:'Controller'},{id:'seal',x:505,y:120,l:'Seal kit'},{id:'chip',x:260,y:220,l:'Control IC'},{id:'ring',x:475,y:220,l:'Seal ring'}];
    const edges = [['asm','motor'],['asm','ctrl'],['asm','seal'],['ctrl','chip'],['seal','ring']]; const pos = id => nodes.find(n => n.id === id);
    const edgeSvg = edges.map(([a,b]) => `<line class="cw-risk-edge" x1="${pos(a).x}" y1="${pos(a).y}" x2="${pos(b).x}" y2="${pos(b).y}"/>`).join('');
    host.innerHTML = head + `<div class="cw-toolbar"><div class="w-field" style="flex:1;min-width:230px"><label for="cw-shock">Lead-time shock — <output data-shock-out>30</output> days</label><input id="cw-shock" data-shock type="range" min="0" max="90" value="30"></div><div class="sim-modes"><button class="sim-mode active" data-network="single">Current network</button><button class="sim-mode" data-network="dual">Dual source</button></div></div><div class="cw-grid-2"><section class="cw-panel"><div class="cw-panel-head"><b>BOM / supplier propagation</b><span>select a part</span></div><svg class="cw-risk-svg" data-risk-svg viewBox="0 0 660 260" role="img" aria-label="Sample BOM supply risk graph">${edgeSvg}${nodes.map(n => `<g class="cw-risk-node" data-risk-node="${n.id}" tabindex="0" role="button" transform="translate(${n.x} ${n.y})"><circle r="12" fill="var(--teal)"></circle><text text-anchor="middle" y="-20">${esc(n.l)}</text></g>`).join('')}</svg></section><section class="cw-panel"><div class="cw-panel-head"><b>Propagation result</b><span data-risk-score>risk 62 / 100</span></div><div class="cw-panel-body"><div class="cw-field-table" data-risk-results></div><div class="cw-rationale" data-risk-actions></div></div></section></div>`;
    let mode = 'single', selected = 'chip';
    function update() { const shock = +$('[data-shock]', host).value, mitigation = mode === 'dual' ? 28 : 0, score = Math.max(8, Math.min(99, Math.round(44 + shock * .62 - mitigation))), hot = new Set(score > 72 ? ['asm','ctrl','chip','seal','ring'] : score > 52 ? ['asm','ctrl','chip'] : ['chip']); $('[data-shock-out]', host).textContent = shock; $('[data-risk-score]', host).textContent = `risk ${score} / 100`; $$('[data-risk-node]', host).forEach(n => n.classList.toggle('hot', hot.has(n.dataset.riskNode))); $('[data-risk-results]', host).innerHTML = `<div class="cw-field-row"><b>Selected</b><span>${esc(pos(selected).l)}</span><span class="cw-chip ${hot.has(selected) ? 'bad' : 'ok'}">${hot.has(selected) ? 'exposed' : 'covered'}</span></div><div class="cw-field-row"><b>Shock</b><span>+${shock} days at tier 2</span><span class="cw-chip warn">propagated</span></div><div class="cw-field-row"><b>Recovery</b><span>${Math.max(12, Math.round(67 + shock * .45 - mitigation))} days</span><span class="cw-chip">estimate</span></div>`; $('[data-risk-actions]', host).innerHTML = (mode === 'dual' ? ['Alternate source absorbs the first 28 risk points.','Control IC remains the highest-centrality exposure.'] : ['Control IC delay propagates through controller to top assembly.','Dual-source plan would isolate the tier-2 shock.']).map(x => `<div>${esc(x)}</div>`).join(''); }
    $('[data-shock]', host).addEventListener('input', update); $$('[data-network]', host).forEach(b => b.addEventListener('click', () => { mode = b.dataset.network; $$('[data-network]', host).forEach(x => x.classList.toggle('active', x === b)); update(); })); $$('[data-risk-node]', host).forEach(n => { const choose = () => { selected = n.dataset.riskNode; update(); }; n.addEventListener('click', choose); n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } }); }); update(); return () => {};
  }

  function eventTransform(spec, host, head) {
    host.innerHTML = head + `<div class="cw-grid-aside"><section class="cw-panel"><div class="cw-panel-head"><b>Canonical event input</b><span>editable sample</span></div><div class="cw-panel-body"><div class="w-field"><label for="cw-event-title">Title</label><input id="cw-event-title" data-event-title value="Digital thread lab" style="width:100%"></div><div class="cw-grid-2" style="margin-top:10px"><div class="w-field"><label for="cw-event-date">Date</label><input id="cw-event-date" data-event-date type="date" value="2026-08-12"></div><div class="w-field"><label for="cw-event-time">Time</label><input id="cw-event-time" data-event-time type="time" value="14:00"></div></div><div class="w-field" style="margin-top:10px"><label for="cw-event-zone">Timezone</label><select id="cw-event-zone" data-event-zone><option>America/New_York</option><option>Europe/Berlin</option><option>UTC</option></select></div><button class="w-btn primary" data-event-build style="margin-top:13px">Generate calendar + digest</button></div></section><section class="cw-panel"><div class="cw-panel-head"><b>Two outputs · one source</b><span data-event-state>not generated</span></div><div class="cw-panel-body"><div class="cw-chip">ICS</div><pre class="cw-code" data-ics style="margin:8px 0 15px">Awaiting event input…</pre><div class="cw-chip">DIGEST</div><p data-digest style="margin-top:8px;color:var(--text2);font-size:11px;line-height:1.5">The concise digest will appear here.</p></div></section></div>`;
    $('[data-event-build]', host).addEventListener('click', () => { const title = $('[data-event-title]', host).value.trim() || 'Sample event', date = $('[data-event-date]', host).value.replaceAll('-',''), time = $('[data-event-time]', host).value.replace(':','') + '00', zone = $('[data-event-zone]', host).value; $('[data-ics]', host).textContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;TZID=${zone}:${date}T${time}\nSUMMARY:${title}\nUID:sample-${date}@local\nEND:VEVENT\nEND:VCALENDAR`; $('[data-digest]', host).textContent = `${title} · ${$('[data-event-date]', host).value} at ${$('[data-event-time]', host).value} (${zone}). Added from the same normalized browser-only event record.`; $('[data-event-state]', host).textContent = 'ICS + digest ready'; }); return () => {};
  }

  function vaultDiff(spec, host, head) {
    const initial = `---\ntitle: MCP Design Notes\ntags: [agents, plm]\nstatus: draft\n---\n\nSee [[Tool Contract]] and [[Missing Runbook]].\nRelated: [[Graph Retrieval]].`;
    host.innerHTML = head + `<div class="cw-toolbar"><span class="cw-status ok" data-cw-status>Local sample note loaded</span><div style="display:flex;gap:7px"><button class="w-btn" data-vault-scan>Scan links</button><button class="w-btn primary" data-vault-fix disabled>Stage repair</button></div></div><div class="cw-grid-2"><section class="cw-panel"><div class="cw-panel-head"><b>Markdown + frontmatter</b><span>editable</span></div><div class="cw-panel-body"><textarea class="cw-textarea" data-vault-note aria-label="Sample Markdown note">${esc(initial)}</textarea></div></section><section class="cw-panel"><div class="cw-panel-head"><b>Staged sync diff</b><span data-vault-state>not scanned</span></div><div class="cw-panel-body" data-vault-diff><div class="cw-empty">Scan the note to find unresolved links and frontmatter issues.</div></div></section></div>`;
    $('[data-vault-scan]', host).addEventListener('click', () => { const text = $('[data-vault-note]', host).value, missing = text.includes('[[Missing Runbook]]'); $('[data-vault-diff]', host).innerHTML = `<div class="cw-field-table"><div class="cw-field-row"><b>Frontmatter</b><span>title · tags · status</span><span class="cw-chip ok">valid</span></div><div class="cw-field-row"><b>Links</b><span>${missing ? '1 unresolved of 3' : '3 resolved'}</span><span class="cw-chip ${missing ? 'bad' : 'ok'}">${missing ? 'repair' : 'clean'}</span></div><div class="cw-field-row"><b>Sync</b><span>working tree only</span><span class="cw-chip">staged preview</span></div></div>`; $('[data-vault-state]', host).textContent = missing ? '1 repair available' : 'clean'; $('[data-vault-fix]', host).disabled = !missing; status(host, missing ? 'bad' : 'ok', missing ? 'Broken link found · no files changed' : 'Vault sample is consistent'); });
    $('[data-vault-fix]', host).addEventListener('click', () => { const before = $('[data-vault-note]', host).value, after = before.replace('[[Missing Runbook]]','[[Local Demo Runbook]]'); $('[data-vault-note]', host).value = after; $('[data-vault-diff]', host).innerHTML = `<div class="cw-diff"><div class="del">- See [[Tool Contract]] and [[Missing Runbook]].</div><div class="add">+ See [[Tool Contract]] and [[Local Demo Runbook]].</div><div>Preview only · no vault files were written.</div></div>`; $('[data-vault-state]', host).textContent = 'repair staged'; $('[data-vault-fix]', host).disabled = true; status(host, 'ok', 'Repair staged in browser · sync conflict check passed'); }); return () => {};
  }

  function threadWorkbench(spec, host, head) {
    const sets = { rotor:[['Design','Rotor CAD released','Rev C · CAD-204'],['Plan','Manufacturing route linked','CELL-02 · Op 40'],['Inspect','Balance result captured','0.42 mm/s · pass'],['Field','Service observation added','Cycle 120 · nominal']], pump:[['Design','Pump housing revised','Rev B · CAD-318'],['Plan','Casting route approved','CELL-04 · Op 20'],['Inspect','Pressure test captured','12 bar · pass'],['Field','Commissioning evidence','Site sample · nominal']] };
    let part='rotor',active=0;
    host.innerHTML=head+`<div class="cw-toolbar"><div class="w-field"><label for="cw-thread-part">Sample part</label><select id="cw-thread-part" data-thread-part><option value="rotor">Rotor assembly</option><option value="pump">Pump housing</option></select></div><span class="cw-status ok" data-cw-status>4 linked events</span></div><div class="cw-grid-aside"><section class="cw-panel"><div class="cw-panel-head"><b>Timestamped digital thread</b><span>design → field</span></div><div class="cw-panel-body"><div class="cw-thread" data-thread></div></div></section><section class="cw-panel"><div class="cw-panel-head"><b>Evidence drilldown</b><span data-thread-type>Design</span></div><div class="cw-panel-body" data-thread-detail></div></section></div>`;
    function draw(){const rows=sets[part];$('[data-thread]',host).innerHTML=rows.map((r,i)=>`<button class="cw-thread-item${i===active?' active':''}" data-thread-index="${i}"><b>${esc(r[1])}</b><span>T+${i*14}d · ${esc(r[0])}</span></button>`).join('');const r=rows[active];$('[data-thread-type]',host).textContent=r[0];$('[data-thread-detail]',host).innerHTML=`<div class="cw-chip ok">Authoritative sample evidence</div><h5 style="margin:13px 0 7px;color:var(--text);font-size:17px">${esc(r[1])}</h5><p style="color:var(--text2);font-size:11px;line-height:1.5">${esc(r[2])}. The event retains a direct relationship to the selected sample part and previous thread state.</p><div class="cw-field-table" style="margin-top:14px"><div class="cw-field-row"><b>Part</b><span>${part==='rotor'?'ROTOR-204':'PUMP-318'}</span><span class="cw-chip">typed</span></div><div class="cw-field-row"><b>Stage</b><span>${esc(r[0])}</span><span class="cw-chip ok">linked</span></div></div>`;$$('[data-thread-index]',host).forEach(b=>b.addEventListener('click',()=>{active=+b.dataset.threadIndex;draw();const n=$(`[data-thread-index="${active}"]`,host);if(n)n.focus()}));}
    $('[data-thread-part]',host).addEventListener('change',e=>{part=e.target.value;active=0;draw()});draw();return()=>{};
  }

  function networkLab(spec,host,head){
    const routes={segmented:[['PLC cell',.4],['Edge gateway',1.7],['Industrial DMZ',3.8],['Consumer',1.3]],direct:[['PLC cell',.4],['Edge gateway',1.5],['Approved route',1.1],['Consumer',1.0]]};let mode='segmented';
    host.innerHTML=head+`<div class="cw-toolbar"><div class="sim-modes"><button class="sim-mode active" data-route="segmented">Segmented DMZ</button><button class="sim-mode" data-route="direct">Approved direct</button></div><label class="w-chip active"><input type="checkbox" data-vlan checked> Enforce VLAN 110</label><button class="w-btn primary" data-probe>Run measured probe</button></div><section class="cw-panel"><div class="cw-panel-head"><b>Per-hop route</b><span data-net-total>7.2 ms budget</span></div><div class="cw-panel-body"><div class="cw-hop-grid" data-hops></div><div class="cw-status ok" data-cw-status>Ready · route policy valid</div></div></section>`;
    function draw(){const vlan=$('[data-vlan]',host).checked,rows=routes[mode],penalty=vlan?0:.9,total=rows.reduce((n,r)=>n+r[1],0)+penalty;$('[data-hops]',host).innerHTML=rows.map((r,i)=>`<div class="cw-hop"><b>${esc(r[0])}</b><span>${(r[1]+(i===2?penalty:0)).toFixed(1)} ms</span><small style="color:var(--text3);font-size:8px">${i===0?'VLAN 110':i===1?'OPC-UA':i===2?(mode==='segmented'?'MQTT relay':'policy route'):'browser app'}</small></div>`).join('');$('[data-net-total]',host).textContent=`${total.toFixed(1)} ms total`;}
    $$('[data-route]',host).forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.route;$$('[data-route]',host).forEach(x=>x.classList.toggle('active',x===b));draw();status(host,'ok','Route changed · run probe to verify')}));$('[data-vlan]',host).addEventListener('change',e=>{e.currentTarget.closest('.w-chip').classList.toggle('active',e.currentTarget.checked);draw();status(host,e.currentTarget.checked?'ok':'bad',e.currentTarget.checked?'VLAN policy restored':'VLAN enforcement disabled · policy warning')});$('[data-probe]',host).addEventListener('click',()=>status(host,$('[data-vlan]',host).checked?'ok':'bad',$('[data-vlan]',host).checked?'Probe complete · every hop within budget':'Probe measured, but VLAN policy failed'));draw();return()=>{};
  }

  function onePager(spec,host,head){
    host.innerHTML=head+`<div class="cw-grid-aside"><section class="cw-panel"><div class="cw-panel-head"><b>Structured brief fields</b><span>sanitized sample</span></div><div class="cw-panel-body"><div class="w-field"><label for="cw-page-title">Headline</label><input id="cw-page-title" data-page-title value="Connect engineering intent to execution" style="width:100%"></div><div class="w-field" style="margin-top:10px"><label for="cw-page-outcome">Outcome</label><textarea id="cw-page-outcome" class="cw-textarea" data-page-outcome style="min-height:90px">A governed browser-safe path links design evidence, typed actions, and a measurable result.</textarea></div><div class="w-field" style="margin-top:10px"><label for="cw-page-layout">Narrative</label><select id="cw-page-layout" data-page-layout><option value="outcome">Outcome led</option><option value="architecture">Architecture led</option><option value="demo">Demo led</option></select></div></div></section><section class="cw-page-sheet" data-page-sheet></section></div>`;
    function draw(){const title=$('[data-page-title]',host).value.trim()||'Untitled solution brief',outcome=$('[data-page-outcome]',host).value.trim(),mode=$('[data-page-layout]',host).value,cols=mode==='architecture'?['Boundary','Controls','Evidence']:mode==='demo'?['Scenario','Interaction','Result']:['Outcome','Capabilities','Next step'];$('[data-page-sheet]',host).innerHTML=`<div class="eyebrow">Illustrative ${esc(mode)} brief</div><h5>${esc(title)}</h5><p>${esc(outcome)}</p><div class="cw-page-cols">${cols.map((x,i)=>`<div class="cw-page-col"><b>${esc(x)}</b><br>${i===0?'Frame the need clearly.':i===1?'Show the bounded mechanism.':'Close with an observable action.'}</div>`).join('')}</div>`;}$$('[data-page-title],[data-page-outcome]',host).forEach(x=>x.addEventListener('input',draw));$('[data-page-layout]',host).addEventListener('change',draw);draw();return()=>{};
  }

  function siteBuilder(spec,host,head){
    let sections=[{id:'hero',name:'Hero',on:true},{id:'projects',name:'Selected projects',on:true},{id:'writing',name:'Field notes',on:true},{id:'about',name:'Profile',on:true}];
    host.innerHTML=head+`<div class="cw-grid-aside"><section class="cw-panel"><div class="cw-panel-head"><b>Section order and visibility</b><span>component kit</span></div><div class="cw-panel-body"><div class="cw-section-order" data-section-order></div></div></section><section class="cw-site-preview" data-site-preview></section></div>`;
    function draw(){const list=$('[data-section-order]',host);list.innerHTML=sections.map((s,i)=>`<div class="cw-section-row"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(s.name)}</b><span><button data-section-up="${s.id}" aria-label="Move ${esc(s.name)} up" ${i===0?'disabled':''}>↑</button><button data-section-down="${s.id}" aria-label="Move ${esc(s.name)} down" ${i===sections.length-1?'disabled':''}>↓</button><label class="cw-chip"><input type="checkbox" data-section-on="${s.id}" ${s.on?'checked':''}> show</label></span></div>`).join('');$('[data-site-preview]',host).innerHTML=`<header><b>GQ / studio</b><span>static component preview</span></header>${sections.filter(s=>s.on).map(s=>`<section class="cw-site-section"><b>${esc(s.name)}</b><p>${s.id==='hero'?'Engineering systems, made legible.':s.id==='projects'?'Interactive projects with source-aware explanations.':s.id==='writing'?'Notes from PLM, agents, and the industrial edge.':'A compact professional profile and contact path.'}</p></section>`).join('')}`;$$('[data-section-up]',host).forEach(b=>b.addEventListener('click',()=>{const i=sections.findIndex(s=>s.id===b.dataset.sectionUp);[sections[i-1],sections[i]]=[sections[i],sections[i-1]];draw()}));$$('[data-section-down]',host).forEach(b=>b.addEventListener('click',()=>{const i=sections.findIndex(s=>s.id===b.dataset.sectionDown);[sections[i+1],sections[i]]=[sections[i],sections[i+1]];draw()}));$$('[data-section-on]',host).forEach(b=>b.addEventListener('change',()=>{sections.find(s=>s.id===b.dataset.sectionOn).on=b.checked;draw()}));}draw();return()=>{};
  }

  function changeManager(spec,host,head){
    const timers=[];let stage=0;const stages=['Draft','Validate','Review','Workflow'];
    host.innerHTML=head+`<div class="cw-grid-aside"><section class="cw-panel"><div class="cw-panel-head"><b>Raise sample change</b><span>required fields</span></div><div class="cw-panel-body"><div class="cw-change-form"><div class="w-field"><label for="cw-change-title">Summary</label><input id="cw-change-title" data-change-title value="Update rotor drawing note"></div><div class="w-field"><label for="cw-change-object">Affected object</label><select id="cw-change-object" data-change-object><option>ROTOR-204 · Rev C</option><option>DRAWING-204 · Rev B</option></select></div><div class="w-field"><label for="cw-change-severity">Priority</label><select id="cw-change-severity" data-change-severity><option>Normal</option><option>Urgent</option></select></div><button class="w-btn primary" data-change-validate>Validate and submit</button></div></div></section><section class="cw-panel"><div class="cw-panel-head"><b>Workflow validation</b><span data-change-state>draft</span></div><div class="cw-panel-body"><div class="cw-change-lane" data-change-lane></div><div class="cw-rationale" data-change-checks style="margin-top:14px"></div></div></section></div>`;
    function draw(){$('[data-change-lane]',host).innerHTML=stages.map((s,i)=>`<div class="cw-change-stage${i===stage?' active':''}"><b>${esc(s)}</b><br>${i<stage?'complete':i===stage?'current':'queued'}</div>`).join('');$('[data-change-checks]',host).innerHTML=['Affected object exists in sample structure','Summary contains an actionable change','Workflow route has an owner role'].map((x,i)=>`<div>${esc(x)} <span class="cw-chip ${i<stage?'ok':''}">${i<stage?'verified':'pending'}</span></div>`).join('');}
    $('[data-change-validate]',host).addEventListener('click',e=>{const button=e.currentTarget,title=$('[data-change-title]',host).value.trim();if(title.length<8){$('[data-change-state]',host).textContent='summary too short';return}button.disabled=true;stage=0;draw();[1,2,3].forEach((n,i)=>wait(timers,()=>{stage=n;$('[data-change-state]',host).textContent=n===3?'submitted to sample workflow':`${stages[n].toLowerCase()} check`;draw();if(n===3)button.disabled=false},(i+1)*260));});draw();return()=>stopTimers(timers);
  }

  window.PROJECT_WORKBENCHES = Object.assign(window.PROJECT_WORKBENCHES || {}, {
    replacementMap,
    brief: briefWorkbench,
    deckBuilder,
    storyMapper,
    techSite,
    lunchRoulette,
    dataMapper,
    jdbcWorkbench,
    supplyRisk,
    eventTransform,
    vaultDiff,
    threadWorkbench,
    networkLab,
    onePager,
    siteBuilder,
    changeManager
  });
})();
