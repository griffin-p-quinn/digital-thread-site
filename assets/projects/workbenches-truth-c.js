(() => {
  'use strict';

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => [...(root || document).querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
  const timersFor = ctx => {
    const ids = new Set();
    const reduced = Boolean(ctx && ctx.reducedMotion);
    return {
      later(callback, delay) {
        const id = setTimeout(() => {
          ids.delete(id);
          callback();
        }, reduced ? Math.min(delay, 32) : delay);
        ids.add(id);
        return id;
      },
      clear() {
        ids.forEach(clearTimeout);
        ids.clear();
      }
    };
  };
  const frame = (host, head, kind, body) => {
    host.innerHTML = `${head || ''}<section class="twc twc--${kind}" data-twc-kind="${kind}">${body}</section>`;
    return $('.twc', host);
  };
  const setStatus = (root, text, tone = '') => {
    const target = $('[data-twc-status]', root);
    if (!target) return;
    target.className = `twc-status${tone ? ` is-${tone}` : ''}`;
    target.textContent = text;
  };
  const setPressed = (buttons, active, key) => {
    buttons.forEach(button => {
      const selected = button.dataset[key] === active;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  };
  const stageMarkup = (stages, prefix) => stages.map((stage, index) => `
    <button class="twc-stage${index === 0 ? ' is-current' : ''}" data-${prefix}-stage="${index}" aria-label="Inspect stage ${index + 1}: ${esc(stage.title)}">
      <i>${String(index + 1).padStart(2, '0')}</i><span><b>${esc(stage.title)}</b><small>${esc(stage.note)}</small></span><em data-${prefix}-state="${index}">${index === 0 ? 'ready' : 'queued'}</em>
    </button>`).join('');

  function rdfPipeline(spec, host, head, ctx) {
    const timers = timersFor(ctx);
    const stages = [
      { title: 'Page AGS fixture', note: 'limit · offset · has_more', detail: 'A sanitized AGS-shaped page supplies typed nodes without retaining a server session.' },
      { title: 'Map canonical URI', note: 'stable subject identity', detail: 'Each source_id becomes a URI subject. Relationship targets are resolved to URI objects, never string literals.' },
      { title: 'Insert RDF batch', note: 'SPARQL INSERT DATA', detail: 'The loader emits a bounded INSERT batch after the ontology has been loaded into the selected graph.' },
      { title: 'Validate visibility', note: 'ObjectProperty + domain/range', detail: 'Visible Graph Studio edges require URI → URI triples and an owl:ObjectProperty declared with usable domain and range.' }
    ];
    const nodeSets = {
      Item: [
        { id: 'ITEM-A100', type: 'Item', name: 'Pump housing' },
        { id: 'ITEM-B210', type: 'Item', name: 'Seal carrier' }
      ],
      ItemRevision: [
        { id: 'REV-A100-03', type: 'ItemRevision', name: 'Pump housing / 03' },
        { id: 'REV-B210-02', type: 'ItemRevision', name: 'Seal carrier / 02' }
      ],
      Dataset: [
        { id: 'DATA-CAD-17', type: 'Dataset', name: 'Neutral CAD package' },
        { id: 'DATA-PDF-08', type: 'Dataset', name: 'Released drawing' }
      ],
      ChangeObject: [
        { id: 'CHG-SAMPLE-42', type: 'ChangeObject', name: 'Material clarification' },
        { id: 'CHG-SAMPLE-57', type: 'ChangeObject', name: 'Tolerance review' }
      ],
      WorkflowObject: [
        { id: 'WF-SAMPLE-12', type: 'WorkflowObject', name: 'Release workflow' },
        { id: 'WF-SAMPLE-29', type: 'WorkflowObject', name: 'Change review' }
      ]
    };
    const nodePaths = {
      Item: 'items',
      ItemRevision: 'revisions',
      Dataset: 'datasets',
      ChangeObject: 'changes',
      WorkflowObject: 'workflows'
    };
    let run = 0;
    let currentStage = 0;
    const root = frame(host, head, 'rdf', `
      <header class="twc-command">
        <div><span class="twc-eyebrow">STATELESS REST → RDF</span><h3>Graph visibility pipeline</h3><p>Sanitized fixtures only · no Teamcenter or triplestore connection</p></div>
        <div class="twc-command-actions">
          <label>Node page<select data-rdf-type>${Object.keys(nodeSets).map(type => `<option>${esc(type)}</option>`).join('')}</select></label>
          <label>Page size<select data-rdf-limit><option>50</option><option>100</option><option>250</option></select></label>
          <button class="twc-button is-primary" data-rdf-run>Trace page → edge</button>
        </div>
      </header>
      <div class="twc-rdf-route" aria-label="RDF loading stages">${stageMarkup(stages, 'rdf')}</div>
      <div class="twc-split twc-rdf-main">
        <section class="twc-panel">
          <div class="twc-panel-head"><div><small>AGS response</small><b data-rdf-endpoint>GET /api/ags/graph/nodes/item</b></div><span class="twc-badge">browser fixture</span></div>
          <div class="twc-rdf-page" data-rdf-page></div>
        </section>
        <section class="twc-panel">
          <div class="twc-panel-head"><div><small>RDF emission</small><b>URI subjects · URI objects</b></div><span class="twc-badge is-quiet">Turtle preview</span></div>
          <pre class="twc-code" data-rdf-triples aria-label="Generated RDF preview"></pre>
        </section>
      </div>
      <section class="twc-panel twc-rdf-proof">
        <div class="twc-rdf-insight"><span>Why this stage matters</span><strong data-rdf-detail>${esc(stages[0].detail)}</strong></div>
        <div class="twc-rdf-graph" data-rdf-graph aria-label="Relationship visibility preview">
          <span class="twc-graph-node">Item</span><i><b>ITEM_HAS_REVISION</b></i><span class="twc-graph-node is-alt">ItemRevision</span>
        </div>
        <div class="twc-status" data-twc-status role="status" aria-live="polite">Ready · current stateless REST path</div>
      </section>`);

    const renderFixture = () => {
      const type = $('[data-rdf-type]', root).value;
      const limit = $('[data-rdf-limit]', root).value;
      $('[data-rdf-endpoint]', root).textContent = `GET /api/ags/graph/nodes/${nodePaths[type]}?limit=${limit}&offset=0`;
      $('[data-rdf-page]', root).innerHTML = `<div class="twc-json-meta"><span>count <b>2</b></span><span>has_more <b>false</b></span><span>offset <b>0</b></span></div>
        ${nodeSets[type].map((node, index) => `<article><i>${String(index + 1).padStart(2, '0')}</i><div><b>${esc(node.id)}</b><span>${esc(node.name)}</span></div><em>${esc(node.type)}</em></article>`).join('')}`;
      const prefix = type === 'Item' ? 'item' : type === 'ItemRevision' ? 'revision' : type.toLowerCase();
      const left = `urn:sample:tc:${prefix}:${nodeSets[type][0].id.toLowerCase()}`;
      const right = type === 'Item' ? 'urn:sample:tc:revision:rev-a100-03' : `urn:sample:tc:${prefix}:${nodeSets[type][1].id.toLowerCase()}`;
      const predicate = type === 'Item' ? 'itemHasRevision' : 'relatedObject';
      $('[data-rdf-triples]', root).textContent =
`@prefix sample: <urn:sample:tc:> .
@prefix rel:    <urn:sample:relation:> .

<${left}>
  a sample:${type} ;
  sample:sourceId "${nodeSets[type][0].id}" ;
  rel:${predicate} <${right}> .

rel:${predicate}
  a owl:ObjectProperty .`;
    };
    const selectStage = index => {
      currentStage = index;
      $$('[data-rdf-stage]', root).forEach((button, buttonIndex) => button.classList.toggle('is-current', buttonIndex === index));
      $('[data-rdf-detail]', root).textContent = stages[index].detail;
    };
    $$('[data-rdf-stage]', root).forEach(button => button.addEventListener('click', () => selectStage(Number(button.dataset.rdfStage))));
    $$('[data-rdf-type], [data-rdf-limit]', root).forEach(control => control.addEventListener('change', () => {
      timers.clear();
      renderFixture();
      setStatus(root, 'Fixture changed · trace again to validate the edge');
      $$('[data-rdf-state]', root).forEach((state, index) => {
        state.textContent = index === 0 ? 'ready' : 'queued';
        state.closest('.twc-stage').classList.remove('is-complete');
      });
      $('[data-rdf-graph]', root).classList.remove('is-verified');
    }));
    $('[data-rdf-run]', root).addEventListener('click', event => {
      timers.clear();
      run += 1;
      const button = event.currentTarget;
      button.disabled = true;
      $('[data-rdf-graph]', root).classList.remove('is-verified');
      $$('[data-rdf-state]', root).forEach(state => {
        state.textContent = 'queued';
        state.closest('.twc-stage').classList.remove('is-complete');
      });
      stages.forEach((stage, index) => timers.later(() => {
        selectStage(index);
        const state = $(`[data-rdf-state="${index}"]`, root);
        state.textContent = 'passed';
        state.closest('.twc-stage').classList.add('is-complete');
        setStatus(root, `${stage.title} · passed`, 'busy');
      }, 120 + index * 260));
      timers.later(() => {
        $('[data-rdf-graph]', root).classList.add('is-verified');
        setStatus(root, `Trace ${String(run).padStart(2, '0')} · 3 URI nodes · 2 visible ObjectProperty edges`, 'good');
        button.disabled = false;
      }, 1180);
    });
    renderFixture();
    return () => timers.clear();
  }

  function capitalNx(spec, host, head, ctx) {
    const timers = timersFor(ctx);
    const connectors = [
      { id: 'J1_PWR', pins: 2, role: 'Power input', side: 'left' },
      { id: 'J2_SENSOR', pins: 3, role: 'Sensor interface', side: 'top' },
      { id: 'J3_OUTPUT', pins: 2, role: 'Signal output', side: 'right' }
    ];
    const wires = [
      { id: 'W1', from: 'J1.1', to: 'J2.1', net: 'VCC_12V', gauge: '22 AWG', color: 'red' },
      { id: 'W2', from: 'J1.2', to: 'J2.3', net: 'GND', gauge: '22 AWG', color: 'black' },
      { id: 'W3', from: 'J1.2', to: 'J3.2', net: 'GND', gauge: '22 AWG', color: 'black' },
      { id: 'W4', from: 'J2.2', to: 'J3.1', net: 'SENSOR_DATA', gauge: '24 AWG', color: 'blue' }
    ];
    let selectedWire = 'W1';
    const root = frame(host, head, 'capital', `
      <header class="twc-command">
        <div><span class="twc-eyebrow">ECAD ↔ MCAD HANDSHAKE</span><h3>Sensor junction box verification</h3><p>Logical connector names paired to NX Routing Electrical occurrences</p></div>
        <div class="twc-command-actions"><span class="twc-status" data-twc-status role="status" aria-live="polite">Pairing not run</span><button class="twc-button is-primary" data-capital-run>Verify 3 pairs</button></div>
      </header>
      <div class="twc-capital-board">
        <section class="twc-panel twc-capital-logical">
          <div class="twc-panel-head"><div><small>Capital logical</small><b>Four-wire schematic</b></div><span class="twc-badge">source definition</span></div>
          <svg viewBox="0 0 520 286" role="img" aria-label="Logical wiring between three connectors">
            <rect class="twc-cap-connector" x="24" y="96" width="116" height="88" rx="9"></rect>
            <rect class="twc-cap-connector" x="202" y="22" width="116" height="88" rx="9"></rect>
            <rect class="twc-cap-connector" x="380" y="96" width="116" height="88" rx="9"></rect>
            <text x="45" y="128">J1_PWR</text><text x="223" y="54">J2_SENSOR</text><text x="396" y="128">J3_OUTPUT</text>
            <circle cx="140" cy="125" r="4"></circle><circle cx="140" cy="158" r="4"></circle>
            <circle cx="218" cy="110" r="4"></circle><circle cx="260" cy="110" r="4"></circle><circle cx="302" cy="110" r="4"></circle>
            <circle cx="380" cy="125" r="4"></circle><circle cx="380" cy="158" r="4"></circle>
            <path data-capital-path="W1" d="M140 125 C165 125 180 110 218 110"></path>
            <path data-capital-path="W2" d="M140 158 C178 158 282 143 302 110"></path>
            <path data-capital-path="W3" d="M140 158 C232 230 338 220 380 158"></path>
            <path data-capital-path="W4" d="M260 110 C294 110 340 125 380 125"></path>
            <text class="twc-cap-label" x="158" y="114">W1</text><text class="twc-cap-label" x="214" y="150">W2</text>
            <text class="twc-cap-label" x="252" y="222">W3</text><text class="twc-cap-label" x="322" y="110">W4</text>
          </svg>
          <div class="twc-capital-wires" role="group" aria-label="Select logical wire">
            ${wires.map((wire, index) => `<button data-capital-wire="${wire.id}" class="${index === 0 ? 'is-active' : ''}" aria-pressed="${index === 0}">
              <i class="is-${wire.color}"></i><b>${wire.id}</b><span>${wire.from} → ${wire.to}</span><em>${wire.net}</em>
            </button>`).join('')}
          </div>
        </section>
        <section class="twc-panel twc-capital-physical">
          <div class="twc-panel-head"><div><small>NX physical</small><b>Routing Electrical assembly</b></div><span class="twc-badge is-quiet">fixture model</span></div>
          <div class="twc-capital-box" aria-label="Illustrative NX physical junction box">
            <div class="twc-capital-lid"></div><div class="twc-capital-chassis"></div>
            ${connectors.map((connector, index) => `<button style="--cap-x:${[8, 43, 77][index]}%;--cap-y:${[57, 22, 57][index]}%" data-capital-physical="${connector.id}" aria-label="${connector.id}, ${connector.role}">
              <i>${connector.pins}</i><b>${connector.id}</b><span>${connector.role}</span>
            </button>`).join('')}
          </div>
          <div class="twc-capital-wire-detail" data-capital-detail></div>
        </section>
      </div>
      <section class="twc-panel twc-capital-pairs">
        <div class="twc-panel-head"><div><small>Name-based pairing gate</small><b>Capital connector ↔ NX occurrence</b></div><strong data-capital-score>0 / 3</strong></div>
        <div class="twc-pair-grid">
          ${connectors.map(connector => `<article data-capital-pair="${connector.id}"><span>${connector.id}</span><i>↔</i><span>NX:${connector.id}</span><em>waiting</em></article>`).join('')}
        </div>
      </section>`);
    const renderWire = () => {
      const wire = wires.find(item => item.id === selectedWire);
      setPressed($$('[data-capital-wire]', root), selectedWire, 'capitalWire');
      $$('[data-capital-path]', root).forEach(path => path.classList.toggle('is-active', path.dataset.capitalPath === selectedWire));
      $('[data-capital-detail]', root).innerHTML = `<small>Selected logical relation</small><div><b>${wire.id} · ${wire.net}</b><span>${wire.from} → ${wire.to}</span></div><div><span>${wire.gauge}</span><em>${wire.color} conductor</em></div>`;
    };
    $$('[data-capital-wire]', root).forEach(button => button.addEventListener('click', () => {
      selectedWire = button.dataset.capitalWire;
      renderWire();
    }));
    $('[data-capital-run]', root).addEventListener('click', event => {
      timers.clear();
      const button = event.currentTarget;
      button.disabled = true;
      $('[data-capital-score]', root).textContent = '0 / 3';
      $$('[data-capital-pair]', root).forEach(pair => {
        pair.classList.remove('is-paired');
        $('em', pair).textContent = 'checking';
      });
      connectors.forEach((connector, index) => timers.later(() => {
        const pair = $(`[data-capital-pair="${connector.id}"]`, root);
        const physical = $(`[data-capital-physical="${connector.id}"]`, root);
        pair.classList.add('is-paired');
        physical.classList.add('is-paired');
        $('em', pair).textContent = 'name match';
        $('[data-capital-score]', root).textContent = `${index + 1} / 3`;
        setStatus(root, `Pairing ${connector.id} · logical pins ${connector.pins} ↔ physical occurrence`, 'busy');
      }, 150 + index * 300));
      timers.later(() => {
        setStatus(root, 'READY FOR CONNECT · 3/3 connector names paired', 'good');
        button.disabled = false;
      }, 1120);
    });
    renderWire();
    return () => timers.clear();
  }

  function nxJob(spec, host, head, ctx) {
    const timers = timersFor(ctx);
    const steps = [
      ['POST configuration', 'status: _New'],
      ['Poll next job', 'GET /000/next'],
      ['Map expressions', 'NX parameter update'],
      ['Open PRT template', 'managed fixture'],
      ['Generate exports', 'selected formats'],
      ['PATCH result', 'status + payload']
    ];
    let sequence = 0;
    const root = frame(host, head, 'nxjob', `
      <header class="twc-command">
        <div><span class="twc-eyebrow">MENDIX CONFIGURATION → NXOPEN</span><h3>Parametric model job</h3><p>Local deterministic simulation · the NX server is not contacted</p></div>
        <div class="twc-status" data-twc-status role="status" aria-live="polite">Ready for a sample configuration</div>
      </header>
      <div class="twc-nxjob-grid">
        <form class="twc-panel twc-nxjob-form" data-nxjob-form>
          <div class="twc-panel-head"><div><small>Configuration request</small><b>Bracket parameters</b></div><span class="twc-badge">_New</span></div>
          <div class="twc-field-grid">
            <label>Width · mm<input name="width" type="number" min="60" max="240" value="140" required></label>
            <label>Height · mm<input name="height" type="number" min="40" max="180" value="90" required></label>
            <label>Flange · mm<input name="flange" type="number" min="8" max="45" value="24" required></label>
            <label>Blend radius · mm<input name="blend" type="number" min="1" max="18" value="6" required></label>
          </div>
          <fieldset><legend>Requested deliverables</legend><div class="twc-checks">
            ${['JT', 'STEP', '3MF', 'JPEG', 'STL'].map((format, index) => `<label><input type="checkbox" name="export" value="${format}" ${index < 3 ? 'checked' : ''}><span>${format}</span></label>`).join('')}
          </div></fieldset>
          <button class="twc-button is-primary twc-wide" type="submit">Submit browser fixture</button>
          <p class="twc-fineprint">Production flow: Mendix creates the record; an NXOpen worker polls, generates, then patches the same record.</p>
        </form>
        <section class="twc-panel twc-nxjob-view">
          <div class="twc-panel-head"><div><small>NX expression preview</small><b data-nxjob-model>BRACKET_SAMPLE.PRT</b></div><span class="twc-badge is-quiet">not NX geometry</span></div>
          <div class="twc-nx-model" data-nxjob-preview aria-label="Illustrative bracket driven by the parameter fields">
            <div class="twc-nx-back"></div><div class="twc-nx-flange"></div><i class="twc-nx-hole is-one"></i><i class="twc-nx-hole is-two"></i>
            <span class="is-width">WIDTH</span><span class="is-height">HEIGHT</span>
          </div>
          <div class="twc-expression-table" data-nxjob-expressions></div>
        </section>
      </div>
      <section class="twc-panel twc-nxjob-run">
        <div class="twc-panel-head"><div><small>Worker lifecycle</small><b>Record 000 · sanitized fixture</b></div><span data-nxjob-state>idle</span></div>
        <div class="twc-job-steps">${steps.map((step, index) => `<article data-nxjob-step="${index}"><i>${index + 1}</i><div><b>${step[0]}</b><span>${step[1]}</span></div><em>waiting</em></article>`).join('')}</div>
        <div class="twc-artifact-row" data-nxjob-artifacts><span>No generated artifacts yet</span></div>
      </section>`);
    const form = $('[data-nxjob-form]', root);
    const read = () => {
      const data = new FormData(form);
      return {
        width: Number(data.get('width')),
        height: Number(data.get('height')),
        flange: Number(data.get('flange')),
        blend: Number(data.get('blend')),
        exports: data.getAll('export')
      };
    };
    const renderPreview = () => {
      const values = read();
      const preview = $('[data-nxjob-preview]', root);
      preview.style.setProperty('--nx-width', `${72 + (values.width - 60) * .32}px`);
      preview.style.setProperty('--nx-height', `${70 + (values.height - 40) * .38}px`);
      preview.style.setProperty('--nx-flange', `${18 + values.flange * .55}px`);
      $('[data-nxjob-expressions]', root).innerHTML = [
        ['p_width', `${values.width.toFixed(1)} mm`],
        ['p_height', `${values.height.toFixed(1)} mm`],
        ['p_flange', `${values.flange.toFixed(1)} mm`],
        ['p_blend', `${values.blend.toFixed(1)} mm`]
      ].map(row => `<div><code>${row[0]}</code><span>${row[1]}</span></div>`).join('');
    };
    $$('input', form).forEach(input => input.addEventListener('input', renderPreview));
    form.addEventListener('submit', event => {
      event.preventDefault();
      timers.clear();
      if (!form.reportValidity()) return;
      const values = read();
      if (!values.exports.length) {
        setStatus(root, 'Select at least one deliverable', 'bad');
        return;
      }
      sequence += 1;
      $$('input, button', form).forEach(control => control.disabled = true);
      $$('[data-nxjob-step]', root).forEach(step => {
        step.className = '';
        $('em', step).textContent = 'waiting';
      });
      $('[data-nxjob-artifacts]', root).innerHTML = '<span>NX worker fixture is processing…</span>';
      steps.forEach((step, index) => timers.later(() => {
        const node = $(`[data-nxjob-step="${index}"]`, root);
        node.classList.add('is-done');
        $('em', node).textContent = index === 0 ? '_New' : index === 5 ? '_Complete' : 'done';
        $('[data-nxjob-state]', root).textContent = step[0];
        setStatus(root, `${step[0]} · ${step[1]}`, 'busy');
      }, 120 + index * 210));
      timers.later(() => {
        $('[data-nxjob-artifacts]', root).innerHTML = values.exports.map(format => `<span><i>${format}</i><b>BRACKET_${sequence.toString().padStart(3, '0')}.${format.toLowerCase()}</b></span>`).join('');
        setStatus(root, `PATCH complete · ${values.exports.length} artifacts returned to Mendix fixture`, 'good');
        $('[data-nxjob-state]', root).textContent = `_Complete · job ${sequence.toString().padStart(3, '0')}`;
        $$('input, button', form).forEach(control => control.disabled = false);
      }, 1490);
    });
    renderPreview();
    return () => timers.clear();
  }

  function changeDashboard(spec, host, head, ctx) {
    const timers = timersFor(ctx);
    const changes = [
      { id: 'CHG-1042', type: 'Engineering Change', title: 'Bracket tolerance review', state: 'In Review', owner: 'Design role', age: 11, due: '4d', workflow: 62, impact: ['ASSY-210', 'PART-044', 'DOC-018'], tasks: [['Technical review', 'complete'], ['Manufacturing review', 'active'], ['Release gate', 'waiting']] },
      { id: 'PR-0718', type: 'Problem Report', title: 'Seal fit variance', state: 'Open', owner: 'Quality role', age: 19, due: 'overdue', workflow: 28, impact: ['PART-090', 'ASSY-033'], tasks: [['Triage', 'complete'], ['Root-cause evidence', 'active'], ['Disposition', 'waiting']] },
      { id: 'CHG-1055', type: 'Engineering Change', title: 'Drawing note alignment', state: 'Pending', owner: 'Release role', age: 6, due: '9d', workflow: 84, impact: ['DOC-061', 'PART-061'], tasks: [['Content review', 'complete'], ['Signoff', 'active'], ['Release gate', 'waiting']] },
      { id: 'DEV-0221', type: 'Deviation', title: 'Temporary material substitute', state: 'In Review', owner: 'Materials role', age: 23, due: 'overdue', workflow: 51, impact: ['PART-122', 'ORDER-014', 'PLANT-NORTH'], tasks: [['Scope', 'complete'], ['Impact review', 'active'], ['Expiration gate', 'waiting']] }
    ];
    let filtered = changes.slice();
    let selected = changes[0].id;
    let tab = 'workflow';
    const root = frame(host, head, 'change', `
      <header class="twc-command">
        <div><span class="twc-eyebrow">SAVED QUERY + SOA HYDRATION</span><h3>Change management lens</h3><p>Sanitized change rows · calculated workflow and impact evidence</p></div>
        <form class="twc-command-actions" data-change-query>
          <label>Saved query<select name="query"><option value="all">Open change portfolio</option><option value="review">In workflow review</option><option value="overdue">Overdue commitments</option></select></label>
          <label>Filter<input name="q" type="search" placeholder="ID or title"></label>
          <button class="twc-button is-primary" type="submit">Run lens</button>
        </form>
      </header>
      <div class="twc-change-hydration" aria-label="Data hydration stages">
        <span class="is-on">Saved query</span><i>→</i><span>getProperties</span><i>→</i><span>Workflow tasks</span><i>→</i><span>whereUsed impact</span>
        <em class="twc-status" data-twc-status role="status" aria-live="polite">4 fixture rows hydrated</em>
      </div>
      <div class="twc-kpis" data-change-kpis></div>
      <div class="twc-change-layout">
        <section class="twc-panel twc-change-table">
          <div class="twc-panel-head"><div><small>Query results</small><b data-change-count>4 changes</b></div><span class="twc-badge">read-only</span></div>
          <div class="twc-scroll"><table><thead><tr><th>Change</th><th>State</th><th>Owner</th><th>Age</th><th>Workflow</th></tr></thead><tbody data-change-rows></tbody></table></div>
        </section>
        <aside class="twc-panel twc-change-detail">
          <div class="twc-panel-head"><div><small>Hydrated evidence</small><b data-change-selected>CHG-1042</b></div><span data-change-due></span></div>
          <div class="twc-tabs" role="tablist" aria-label="Change evidence views">
            <button class="is-active" role="tab" aria-selected="true" data-change-tab="workflow">Workflow</button>
            <button role="tab" aria-selected="false" data-change-tab="impact">Impact</button>
          </div>
          <div data-change-inspector></div>
        </aside>
      </div>`);
    const renderKpis = () => {
      const overdue = filtered.filter(change => change.due === 'overdue').length;
      const averageAge = filtered.length ? Math.round(filtered.reduce((sum, change) => sum + change.age, 0) / filtered.length) : 0;
      const averageFlow = filtered.length ? Math.round(filtered.reduce((sum, change) => sum + change.workflow, 0) / filtered.length) : 0;
      $('[data-change-kpis]', root).innerHTML = [
        ['Open results', String(filtered.length).padStart(2, '0'), 'saved-query scope'],
        ['Overdue', String(overdue).padStart(2, '0'), 'commitment signal'],
        ['Average aging', `${averageAge}d`, 'calculated'],
        ['Workflow', `${averageFlow}%`, '(complete + skipped) / actionable']
      ].map(item => `<article><small>${item[0]}</small><strong>${item[1]}</strong><span>${item[2]}</span></article>`).join('');
    };
    const renderRows = () => {
      $('[data-change-count]', root).textContent = `${filtered.length} ${filtered.length === 1 ? 'change' : 'changes'}`;
      $('[data-change-rows]', root).innerHTML = filtered.length ? filtered.map(change => `<tr class="${change.id === selected ? 'is-selected' : ''}">
        <td><button data-change-row="${change.id}"><b>${change.id}</b><span>${esc(change.type)} · ${esc(change.title)}</span></button></td>
        <td><span class="twc-state">${change.state}</span></td><td>${change.owner}</td><td>${change.age}d</td>
        <td><div class="twc-meter"><i style="width:${change.workflow}%"></i></div><small>${change.workflow}%</small></td>
      </tr>`).join('') : '<tr><td colspan="5"><div class="twc-empty">No sanitized fixture rows match this lens.</div></td></tr>';
      $$('[data-change-row]', root).forEach(button => button.addEventListener('click', () => {
        selected = button.dataset.changeRow;
        renderRows();
        renderInspector();
      }));
    };
    const renderInspector = () => {
      const change = changes.find(item => item.id === selected) || filtered[0] || changes[0];
      $('[data-change-selected]', root).textContent = change.id;
      $('[data-change-due]', root).textContent = change.due === 'overdue' ? 'overdue sample' : `due in ${change.due}`;
      $('[data-change-due]', root).className = change.due === 'overdue' ? 'twc-badge is-alert' : 'twc-badge is-quiet';
      if (tab === 'workflow') {
        $('[data-change-inspector]', root).innerHTML = `<div class="twc-flow-score"><span><b>${change.workflow}%</b> calculated completion</span><div><i style="width:${change.workflow}%"></i></div></div>
          <div class="twc-task-list">${change.tasks.map((task, index) => `<article class="is-${task[1]}"><i>${index + 1}</i><div><b>${task[0]}</b><span>${task[1]}</span></div><em>${task[1] === 'active' ? 'current' : task[1]}</em></article>`).join('')}</div>
          <p class="twc-note">The percentage is derived from hydrated actionable tasks; it is not copied from a built-in change property.</p>`;
      } else {
        $('[data-change-inspector]', root).innerHTML = `<div class="twc-impact-map"><span>${change.id}</span><i></i><b>problem item</b><i></i><span>${change.impact[0]}</span></div>
          <div class="twc-impact-list">${change.impact.map((object, index) => `<article><i>${index + 1}</i><div><b>${object}</b><span>${index === 0 ? 'affected revision' : index === 1 ? 'where-used parent' : 'downstream context'}</span></div><em>hydrated</em></article>`).join('')}</div>
          <p class="twc-note">Impact follows change revision → problem item → ItemRevision → whereUsed evidence.</p>`;
      }
    };
    $$('[data-change-tab]', root).forEach(button => button.addEventListener('click', () => {
      tab = button.dataset.changeTab;
      $$('[data-change-tab]', root).forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      renderInspector();
    }));
    $('[data-change-query]', root).addEventListener('submit', event => {
      event.preventDefault();
      timers.clear();
      const form = event.currentTarget;
      const query = form.elements.query.value;
      const term = form.elements.q.value.trim().toLowerCase();
      const button = $('button[type="submit"]', form);
      button.disabled = true;
      const hydration = $$('.twc-change-hydration > span', root);
      hydration.forEach((stage, index) => {
        stage.classList.toggle('is-on', index === 0);
        timers.later(() => stage.classList.add('is-on'), 90 + index * 170);
      });
      setStatus(root, 'Running saved query and hydrating properties', 'busy');
      timers.later(() => {
        filtered = changes.filter(change => {
          const scope = query === 'all' || (query === 'review' && change.state === 'In Review') || (query === 'overdue' && change.due === 'overdue');
          const text = `${change.id} ${change.title} ${change.type}`.toLowerCase();
          return scope && (!term || text.includes(term));
        });
        if (!filtered.some(change => change.id === selected)) selected = filtered[0] ? filtered[0].id : changes[0].id;
        renderKpis();
        renderRows();
        renderInspector();
        setStatus(root, `${filtered.length} rows · properties, workflow, and impact hydrated`, 'good');
        button.disabled = false;
      }, 820);
    });
    renderKpis();
    renderRows();
    renderInspector();
    return () => timers.clear();
  }

  function fixedStory(spec, host, head, ctx) {
    const timers = timersFor(ctx);
    const scenes = [
      { system: ['Teamcenter'], eyebrow: '01 · CHANGE TRIGGER', title: 'A source change enters the product record', body: 'A sanitized change notice names one released part revision as the critical artifact.', artifact: 'CHG-SAMPLE-42 → PART-SAMPLE-A', evidence: 'Affected revision relation confirmed', action: 'Open the cross-system impact path' },
      { system: ['Teamcenter'], eyebrow: '02 · SUPPLIER RESPONSE', title: 'Qualification evidence is incomplete', body: 'Partner Connect records a supplier response, but the alternate material lacks one qualification result.', artifact: 'SUPPLIER-SAMPLE-02 · gap Q-07', evidence: 'Response present · qualification missing', action: 'Keep the change in controlled review' },
      { system: ['SAP', 'Opcenter'], eyebrow: '03 · ACTIVE PRODUCTION', title: 'The affected assembly is already in motion', body: 'An illustrative order and active operation connect the part to work now underway.', artifact: 'ORDER-SAMPLE-17 · OP-30 active', evidence: 'Order released · operation running', action: 'Evaluate containment before the next move' },
      { system: ['Graph Studio'], eyebrow: '04 · GRAPH REVEAL', title: 'Customer and contract impact becomes visible', body: 'The graph traverses the critical artifact from part through assembly, order, factory, customer, and contract.', artifact: '6 typed nodes · 5 governed edges', evidence: 'One complete artifact traversal', action: 'Escalate the bounded commercial impact' },
      { system: ['SAP', 'Opcenter'], eyebrow: '05 · FACTORY ACTION', title: 'Production is held at a traceable boundary', body: 'The fixed story applies a sample hold to the next operation while preserving completed work evidence.', artifact: 'HOLD-SAMPLE-05 · OP-40 blocked', evidence: 'No live transaction performed', action: 'Protect WIP pending disposition' },
      { system: ['Salesforce'], eyebrow: '06 · CUSTOMER NOTICE', title: 'The account team gets precise context', body: 'A sanitized case carries the affected assembly, order, and expected decision window without exposing customer data.', artifact: 'CASE-SAMPLE-03 · impact brief', evidence: 'Account context linked to contract fixture', action: 'Notify using the governed message' },
      { system: ['SAP', 'Teamcenter'], eyebrow: '07 · BRIDGE STOCK', title: 'A bounded material bridge is proposed', body: 'Available stock and revision applicability support a temporary path while qualification closes.', artifact: 'LOT-SAMPLE-08 · 14 sample units', evidence: 'Applicability and inventory both checked', action: 'Approve only the explicit quantity' },
      { system: ['Teamcenter', 'Mendix'], eyebrow: '08 · PATH FORWARD', title: 'FAI evidence closes the narrative loop', body: 'A first-article inspection plan and agent workbench return the decision to the governed change record.', artifact: 'FAI-SAMPLE-11 · evidence package', evidence: 'Decision path complete · verification pending', action: 'Release after FAI acceptance' }
    ];
    const traversal = [
      ['Part', 'PART-SAMPLE-A'], ['Assembly', 'ASSY-SAMPLE-04'], ['Production order', 'ORDER-SAMPLE-17'],
      ['Factory', 'PLANT-NORTH'], ['Customer', 'ACCOUNT-SAMPLE-03'], ['Contract', 'CONTRACT-SAMPLE-03']
    ];
    let current = 0;
    let playing = false;
    const root = frame(host, head, 'story', `
      <header class="twc-command">
        <div><span class="twc-eyebrow">FIXED 8-SCENE NARRATIVE</span><h3>Cross-system change impact story</h3><p>Six systems · wholly sanitized IDs · no live actions</p></div>
        <div class="twc-command-actions">
          <button class="twc-button" data-story-prev aria-label="Previous scene">← Previous</button>
          <button class="twc-button is-primary" data-story-play aria-pressed="false">Play story</button>
          <button class="twc-button" data-story-next>Next →</button>
        </div>
      </header>
      <nav class="twc-story-scenes" aria-label="Story scenes">${scenes.map((scene, index) => `<button data-story-scene="${index}" ${index === 0 ? 'class="is-active" aria-current="step"' : ''}><i>${String(index + 1).padStart(2, '0')}</i><span>${scene.eyebrow.split(' · ')[1]}</span></button>`).join('')}</nav>
      <div class="twc-story-stage">
        <section class="twc-story-copy" data-story-copy></section>
        <aside class="twc-story-evidence" data-story-evidence></aside>
      </div>
      <section class="twc-panel twc-story-traversal">
        <div class="twc-panel-head"><div><small>Critical artifact traversal</small><b>Part → Assembly → Production Order → Factory → Customer → Contract</b></div><span class="twc-status" data-twc-status role="status" aria-live="polite">Scene 01 of 08</span></div>
        <div class="twc-traversal-rail">${traversal.map((node, index) => `<button data-story-node="${index}"><small>${node[0]}</small><b>${node[1]}</b></button>${index < traversal.length - 1 ? '<i>→</i>' : ''}`).join('')}</div>
        <div class="twc-traversal-detail" data-story-traversal>PART-SAMPLE-A is the fixed story's critical artifact.</div>
      </section>`);
    const render = () => {
      const scene = scenes[current];
      $('[data-story-copy]', root).innerHTML = `<div class="twc-story-number">${String(current + 1).padStart(2, '0')}<span>/ 08</span></div><span class="twc-eyebrow">${scene.eyebrow}</span><h4>${scene.title}</h4><p>${scene.body}</p>
        <div class="twc-story-systems">${scene.system.map(system => `<span data-system="${system.toLowerCase().replace(/\s+/g, '-')}">${system}</span>`).join('')}</div>`;
      $('[data-story-evidence]', root).innerHTML = `<small>CURRENT ARTIFACT</small><strong>${scene.artifact}</strong><div><span>Evidence</span><b>${scene.evidence}</b></div><div><span>Decision</span><b>${scene.action}</b></div><em>browser-only narrative fixture</em>`;
      $$('[data-story-scene]', root).forEach((button, index) => {
        const active = index === current;
        button.classList.toggle('is-active', active);
        if (active) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      setStatus(root, `Scene ${String(current + 1).padStart(2, '0')} of 08 · ${scene.system.join(' + ')}`);
    };
    const stop = () => {
      playing = false;
      timers.clear();
      const button = $('[data-story-play]', root);
      button.textContent = 'Play story';
      button.setAttribute('aria-pressed', 'false');
    };
    const schedule = () => {
      if (!playing) return;
      timers.later(() => {
        if (!playing) return;
        if (current === scenes.length - 1) {
          stop();
          setStatus(root, 'Story complete · fixed evidence path preserved', 'good');
          return;
        }
        current += 1;
        render();
        schedule();
      }, 1200);
    };
    $$('[data-story-scene]', root).forEach(button => button.addEventListener('click', () => {
      stop();
      current = Number(button.dataset.storyScene);
      render();
    }));
    $('[data-story-prev]', root).addEventListener('click', () => {
      stop();
      current = (current + scenes.length - 1) % scenes.length;
      render();
    });
    $('[data-story-next]', root).addEventListener('click', () => {
      stop();
      current = (current + 1) % scenes.length;
      render();
    });
    $('[data-story-play]', root).addEventListener('click', event => {
      if (playing) {
        stop();
        return;
      }
      if (current === scenes.length - 1) current = 0;
      playing = true;
      event.currentTarget.textContent = 'Pause story';
      event.currentTarget.setAttribute('aria-pressed', 'true');
      render();
      schedule();
    });
    $$('[data-story-node]', root).forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.storyNode);
      const node = traversal[index];
      $$('[data-story-node]', root).forEach(item => item.classList.toggle('is-active', item === button));
      $('[data-story-traversal]', root).textContent = `${node[1]} · sanitized ${node[0].toLowerCase()} fixture · traversal hop ${index + 1} of ${traversal.length}.`;
    }));
    render();
    return () => timers.clear();
  }

  function mcpWorkspace(spec, host, head, ctx) {
    const timers = timersFor(ctx);
    const repos = {
      flights: {
        label: 'flights-mcp', language: 'Python · FastMCP', transport: 'stdio', boundary: 'Read-only API adapter',
        summary: 'Searches flight offers through a configured external provider in the real clone. This portfolio fixture never calls it.',
        tools: [
          ['search_flights', 'origin, destination, dates, passengers', 'Returns bounded one-way or round-trip offers'],
          ['get_offer_details', 'offer_id', 'Reads details for one returned offer'],
          ['search_multi_city', 'ordered trip segments', 'Searches a multi-city itinerary']
        ]
      },
      windows: {
        label: 'Windows-MCP', language: 'Python · Windows host', transport: 'stdio / desktop extension', boundary: 'Broad desktop-control authority',
        summary: 'Exposes host interaction primitives. A real launch can affect apps, processes, clipboard, input, and visible desktop state.',
        tools: [
          ['State', 'accessibility tree, optional screenshot', 'Reads current desktop context'],
          ['Launch', 'application or path', 'Starts a Windows application'],
          ['Click / Type', 'target and input text', 'Interacts with the active desktop'],
          ['PowerShell / Shell', 'command', 'Executes a host command'],
          ['Clipboard', 'read or write', 'Accesses host clipboard state'],
          ['Scroll / Drag / Key', 'interaction parameters', 'Performs direct input automation']
        ]
      }
    };
    const authority = [
      ['External network', 'provider API', 'optional / tool-dependent'],
      ['Desktop state', 'none', 'read + control'],
      ['Process launch', 'none', 'broad'],
      ['Screen / input', 'none', 'broad'],
      ['Primary intent', 'read flight offers', 'operate Windows host']
    ];
    let selectedRepo = 'flights';
    let selectedTool = 0;
    const root = frame(host, head, 'mcp', `
      <header class="twc-command">
        <div><span class="twc-eyebrow">CLONED REPOSITORY REVIEW</span><h3>MCP authority workspace</h3><p>Inventory and boundary comparison · no server launched · no tool invoked</p></div>
        <div class="twc-command-actions"><span class="twc-status" data-twc-status role="status" aria-live="polite">Static manifests inspected</span><button class="twc-button is-primary" data-mcp-review>Run boundary review</button></div>
      </header>
      <div class="twc-mcp-repos">
        ${Object.entries(repos).map(([key, repo], index) => `<button data-mcp-repo="${key}" class="${index === 0 ? 'is-active' : ''}" aria-pressed="${index === 0}">
          <small>REPOSITORY ${String(index + 1).padStart(2, '0')}</small><b>${repo.label}</b><span>${repo.language}</span><em>${repo.boundary}</em>
        </button>`).join('')}
      </div>
      <div class="twc-mcp-layout">
        <section class="twc-panel twc-mcp-tools">
          <div class="twc-panel-head"><div><small data-mcp-repo-label>flights-mcp</small><b>Declared tool surface</b></div><span class="twc-badge" data-mcp-transport>stdio</span></div>
          <p data-mcp-summary></p><div class="twc-mcp-tool-list" data-mcp-tools></div>
        </section>
        <section class="twc-panel twc-mcp-signature">
          <div class="twc-panel-head"><div><small>Selected capability</small><b data-mcp-tool-name>search_flights</b></div><span class="twc-badge is-quiet">inspect only</span></div>
          <div data-mcp-signature></div>
        </section>
      </div>
      <section class="twc-panel twc-mcp-authority">
        <div class="twc-panel-head"><div><small>Authority matrix</small><b>Capability is not the same as safety boundary</b></div><span>fixture comparison</span></div>
        <div class="twc-scroll"><table><thead><tr><th>Surface</th><th>flights-mcp</th><th>Windows-MCP</th></tr></thead><tbody>
          ${authority.map((row, index) => `<tr data-mcp-authority="${index}"><th>${row[0]}</th><td>${row[1]}</td><td>${row[2]}</td></tr>`).join('')}
        </tbody></table></div>
      </section>`);
    const render = () => {
      const repo = repos[selectedRepo];
      $('[data-mcp-repo-label]', root).textContent = repo.label;
      $('[data-mcp-transport]', root).textContent = repo.transport;
      $('[data-mcp-summary]', root).textContent = repo.summary;
      $('[data-mcp-tools]', root).innerHTML = repo.tools.map((tool, index) => `<button data-mcp-tool="${index}" class="${index === selectedTool ? 'is-active' : ''}" aria-pressed="${index === selectedTool}"><code>${tool[0]}</code><span>${tool[2]}</span><i>↗</i></button>`).join('');
      const tool = repo.tools[selectedTool] || repo.tools[0];
      $('[data-mcp-tool-name]', root).textContent = tool[0];
      $('[data-mcp-signature]', root).innerHTML = `<small>INPUT SHAPE</small><code>${tool[0]}(${esc(tool[1])})</code><small>DECLARED EFFECT</small><strong>${tool[2]}</strong><small>BOUNDARY</small><p>${repo.boundary}. Review configuration and host authority before any real server launch.</p>`;
      $$('[data-mcp-tool]', root).forEach(button => button.addEventListener('click', () => {
        selectedTool = Number(button.dataset.mcpTool);
        render();
      }));
      setPressed($$('[data-mcp-repo]', root), selectedRepo, 'mcpRepo');
    };
    $$('[data-mcp-repo]', root).forEach(button => button.addEventListener('click', () => {
      selectedRepo = button.dataset.mcpRepo;
      selectedTool = 0;
      render();
      setStatus(root, `${repos[selectedRepo].label} manifest selected`);
    }));
    $('[data-mcp-review]', root).addEventListener('click', event => {
      timers.clear();
      const button = event.currentTarget;
      button.disabled = true;
      $$('[data-mcp-authority]', root).forEach(row => row.classList.remove('is-reviewed'));
      $$('[data-mcp-authority]', root).forEach((row, index) => timers.later(() => {
        row.classList.add('is-reviewed');
        setStatus(root, `Reviewing ${$('th', row).textContent.toLowerCase()} boundary`, 'busy');
      }, 120 + index * 180));
      timers.later(() => {
        setStatus(root, 'Boundary review complete · read-only adapter ≠ host-control server', 'good');
        button.disabled = false;
      }, 1120);
    });
    render();
    return () => timers.clear();
  }

  function nxJournalReview(spec, host, head, ctx) {
    const timers = timersFor(ctx);
    const files = {
      sim: {
        name: 'simLaunch.cs', label: 'CAE simulation journal', badge: 'recorded NXOpen',
        phases: [
          ['Switch application', 'UG_APP_SFEM'],
          ['Create FEM + SIM', 'sample_fem.fem · sample_sim.sim'],
          ['Configure solver', 'NX NASTRAN · SESTATIC 101'],
          ['Build mesh', 'CTETRA(10)'],
          ['Apply conditions', 'Force(1) + Fixed constraints'],
          ['Assign material', 'AISI_310_SS'],
          ['Solve + inspect', 'fixture trace only']
        ],
        snippet:
`theSession.ApplicationSwitchImmediate("UG_APP_SFEM");
// sanitized fixture path
femBuilder.PartFileName = "<working-directory>/sample_fem.fem";
meshBuilder.ElementTypeName = "CTETRA(10)";
solution.Solve(SolveOption.Solve, SetupCheckOption.CompleteCheck);`,
        risks: [
          ['Absolute path coupling', 'Recorded paths bind the journal to one workstation.'],
          ['FindObject identity', 'Generated names depend on session-specific object identity.'],
          ['UI recording volume', 'Builder churn obscures the intended simulation procedure.'],
          ['Hard-coded physics', 'Mesh size, material, loads, and constraints are embedded literals.']
        ]
      },
      algo: {
        name: 'algodesign.cs', label: 'Algorithmic Feature journal', badge: 'recorded NXOpen',
        phases: [
          ['Open Rule Logic', 'Algorithmic Feature editor'],
          ['Select face', 'SelectFaceV1'],
          ['Create grid', 'HexagonalGrid'],
          ['Wire inputs', 'CountInU · CountInV · Parameter'],
          ['Emit geometry', 'vertices + curves'],
          ['Construct feature', 'VectorConstruct + Extrude'],
          ['Commit result', 'fixture trace only']
        ],
        snippet:
`var faceNode = nodeManager.CreateNode("SelectFaceV1");
var gridNode = nodeManager.CreateNode("HexagonalGrid");
graph.Connect(countU.Output, gridNode.GetInput("CountInU"));
graph.Connect(gridNode.Curves, extrude.GetInput("Section"));
algorithmicFeatureBuilder.Commit();`,
        risks: [
          ['Named-node coupling', 'Generated node and port names may shift between recordings.'],
          ['Selected-face identity', 'The target face is tied to a specific model topology.'],
          ['Magic layout values', 'Node positions and numeric inputs mix intent with editor state.'],
          ['Generated boilerplate', 'The long recording hides a much smaller dependency graph.']
        ]
      }
    };
    let fileKey = 'sim';
    let phase = 0;
    const root = frame(host, head, 'journal', `
      <header class="twc-command">
        <div><span class="twc-eyebrow">NXOPEN RECORDING REVIEW</span><h3>Journal call-sequence inspector</h3><p>Source-derived phases · sanitized snippets · NX is never invoked</p></div>
        <div class="twc-command-actions">
          <div class="twc-segmented" role="group" aria-label="Journal file">
            <button class="is-active" data-journal-file="sim" aria-pressed="true">simLaunch.cs</button>
            <button data-journal-file="algo" aria-pressed="false">algodesign.cs</button>
          </div>
          <button class="twc-button is-primary" data-journal-run>Run fixture trace</button>
        </div>
      </header>
      <div class="twc-journal-layout">
        <section class="twc-panel twc-journal-phases"><div class="twc-panel-head"><div><small>Ordered NXOpen phases</small><b data-journal-name></b></div><span class="twc-badge" data-journal-badge></span></div><div data-journal-phases></div></section>
        <section class="twc-panel twc-journal-code"><div class="twc-panel-head"><div><small>Representative excerpt</small><b>intent-bearing calls</b></div><span class="twc-badge is-quiet">path scrubbed</span></div><pre class="twc-code" data-journal-code></pre><div class="twc-trace-output" data-journal-output>Trace idle · select any phase to inspect its intent.</div></section>
        <aside class="twc-panel twc-journal-risks"><div class="twc-panel-head"><div><small>Hardening ledger</small><b data-journal-risk-count></b></div><span>review</span></div><div data-journal-risks></div></aside>
      </div>
      <div class="twc-status" data-twc-status role="status" aria-live="polite">Source sequence ready</div>`);
    const render = () => {
      const file = files[fileKey];
      $('[data-journal-name]', root).textContent = file.name;
      $('[data-journal-badge]', root).textContent = file.badge;
      $('[data-journal-code]', root).textContent = file.snippet;
      $('[data-journal-risk-count]', root).textContent = `${file.risks.length} brittle surfaces`;
      $('[data-journal-phases]', root).innerHTML = file.phases.map((item, index) => `<button data-journal-phase="${index}" class="${index === phase ? 'is-active' : ''}" aria-pressed="${index === phase}"><i>${String(index + 1).padStart(2, '0')}</i><span><b>${item[0]}</b><small>${item[1]}</small></span><em data-journal-phase-state="${index}">${index === phase ? 'inspect' : 'queued'}</em></button>`).join('');
      $('[data-journal-risks]', root).innerHTML = file.risks.map((risk, index) => `<article><i>${index + 1}</i><div><b>${risk[0]}</b><span>${risk[1]}</span></div></article>`).join('');
      $$('[data-journal-phase]', root).forEach(button => button.addEventListener('click', () => {
        timers.clear();
        phase = Number(button.dataset.journalPhase);
        render();
        const item = files[fileKey].phases[phase];
        $('[data-journal-output]', root).textContent = `${item[0]} · ${item[1]} · inspection only.`;
        setStatus(root, `Phase ${phase + 1} selected · no NX session call made`);
      }));
      setPressed($$('[data-journal-file]', root), fileKey, 'journalFile');
    };
    $$('[data-journal-file]', root).forEach(button => button.addEventListener('click', () => {
      timers.clear();
      fileKey = button.dataset.journalFile;
      phase = 0;
      render();
      $('[data-journal-output]', root).textContent = `Loaded source-derived phase map for ${files[fileKey].name}.`;
      setStatus(root, `${files[fileKey].name} selected · sanitized source review`);
    }));
    $('[data-journal-run]', root).addEventListener('click', event => {
      timers.clear();
      const button = event.currentTarget;
      const file = files[fileKey];
      button.disabled = true;
      $$('[data-journal-phase-state]', root).forEach(state => state.textContent = 'queued');
      file.phases.forEach((item, index) => timers.later(() => {
        phase = index;
        $$('[data-journal-phase]', root).forEach((node, nodeIndex) => node.classList.toggle('is-active', nodeIndex === index));
        const state = $(`[data-journal-phase-state="${index}"]`, root);
        state.textContent = 'traced';
        state.closest('button').classList.add('is-traced');
        $('[data-journal-output]', root).textContent = `${item[0]} → ${item[1]}`;
        setStatus(root, `Fixture trace ${index + 1}/${file.phases.length} · ${item[0]}`, 'busy');
      }, 90 + index * 165));
      timers.later(() => {
        $('[data-journal-output]', root).textContent = `${file.phases.length} ordered phases traced. NX was not started; no model was modified.`;
        setStatus(root, `Trace complete · ${file.phases.length} source-derived phases · NX not invoked`, 'good');
        button.disabled = false;
      }, 180 + file.phases.length * 170);
    });
    render();
    return () => timers.clear();
  }

  function designBrief(spec, host, head) {
    const directions = {
      industrial: {
        label: 'Industrial signal room', palette: ['#071b22', '#0d3942', '#18d6b4', '#ffbf57', '#e9fbf7'],
        type: ['Bahnschrift Condensed', 'IBM Plex Sans', 'IBM Plex Mono'],
        signature: 'An evidence rail cuts through the composition like a live commissioning trace.',
        layout: ['Context mast', 'Live artifact', 'Evidence rail', 'Decision edge']
      },
      editorial: {
        label: 'Technical field journal', palette: ['#211c17', '#f1e9da', '#b9432d', '#60735e', '#fffaf0'],
        type: ['Fraunces', 'Source Sans 3', 'IBM Plex Mono'],
        signature: 'Oversized folio numbers turn process steps into a paced technical narrative.',
        layout: ['Thesis folio', 'Annotated plate', 'Margin proof', 'Closing claim']
      },
      precision: {
        label: 'Calibration bench', palette: ['#111318', '#dce6ed', '#2b74ff', '#e84f66', '#f8fbff'],
        type: ['DIN Condensed', 'Inter', 'JetBrains Mono'],
        signature: 'A ruled calibration grid makes every claim resolve to a measurable interface state.',
        layout: ['Measured brief', 'Control plane', 'Calibrated preview', 'Critique strip']
      }
    };
    const root = frame(host, head, 'brief', `
      <header class="twc-command">
        <div><span class="twc-eyebrow">FRONTEND DESIGN SKILL</span><h3>Concrete direction compiler</h3><p>Subject + audience + one job → a defensible visual system</p></div>
        <div class="twc-status" data-twc-status role="status" aria-live="polite">Edit the brief or generate the default direction</div>
      </header>
      <div class="twc-brief-layout">
        <form class="twc-panel twc-brief-form" data-brief-form>
          <div class="twc-panel-head"><div><small>Creative inputs</small><b>Make the premise specific</b></div><span class="twc-badge">brief v1</span></div>
          <label>Subject<input name="subject" value="Semantic graph explorer" required maxlength="80"></label>
          <label>Audience<input name="audience" value="PLM integration engineers" required maxlength="80"></label>
          <label>Single page job<textarea name="job" rows="3" required maxlength="180">Make a URI-to-URI evidence path understandable at a glance.</textarea></label>
          <label>Direction<select name="direction">${Object.entries(directions).map(([key, value]) => `<option value="${key}">${value.label}</option>`).join('')}</select></label>
          <button class="twc-button is-primary twc-wide" type="submit">Generate direction</button>
        </form>
        <section class="twc-brief-result" data-brief-result></section>
      </div>`);
    const form = $('[data-brief-form]', root);
    const render = () => {
      const data = new FormData(form);
      const subject = data.get('subject').trim();
      const audience = data.get('audience').trim();
      const job = data.get('job').trim();
      const direction = directions[data.get('direction')];
      if (!subject || !audience || !job) return;
      $('[data-brief-result]', root).innerHTML = `
        <section class="twc-brief-hero" style="--brief-bg:${direction.palette[0]};--brief-ink:${direction.palette[4]};--brief-accent:${direction.palette[2]}">
          <small>DIRECTION · ${direction.label.toUpperCase()}</small><h4>${esc(subject)}</h4><p>${esc(job)}</p><span>for ${esc(audience)}</span>
          <div class="twc-brief-mini">${direction.layout.map((item, index) => `<i><b>${String(index + 1).padStart(2, '0')}</b><span>${item}</span></i>`).join('')}</div>
        </section>
        <div class="twc-brief-specs">
          <article><small>PALETTE</small><div class="twc-swatches">${direction.palette.map(color => `<span style="--swatch:${color}" title="${color}"><i></i><code>${color}</code></span>`).join('')}</div></article>
          <article><small>TYPE ROLES</small><div class="twc-type-roles"><b>${direction.type[0]}<i>display</i></b><span>${direction.type[1]}<i>body</i></span><code>${direction.type[2]} · evidence</code></div></article>
          <article><small>SIGNATURE</small><strong>${direction.signature}</strong></article>
          <article><small>CRITIQUE</small><ul><li>The subject supplies the artifact; decoration does not.</li><li>One signature device carries the identity across the page.</li><li>Avoid a generic centered hero, soft gradient, and interchangeable stat cards.</li></ul></article>
        </div>`;
      setStatus(root, `${direction.label} · direction generated for ${subject}`, 'good');
    };
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      render();
    });
    render();
    return () => {};
  }

  function semanticApi(spec, host, head, ctx) {
    const timers = timersFor(ctx);
    const endpoints = {
      items: { label: 'Items', path: '/api/ags/graph/nodes/items', type: 'Item', fields: ['uid', 'item_id', 'object_name', 'object_type'] },
      revisions: { label: 'Revisions', path: '/api/ags/graph/nodes/revisions', type: 'ItemRevision', fields: ['uid', 'item_revision_id', 'object_name', 'owning_item'] },
      datasets: { label: 'Datasets', path: '/api/ags/graph/nodes/datasets', type: 'Dataset', fields: ['uid', 'object_name', 'dataset_type', 'owning_revision'] },
      changes: { label: 'Changes', path: '/api/ags/graph/nodes/changes', type: 'ChangeObject', fields: ['uid', 'object_name', 'object_type', 'status'] },
      workflows: { label: 'Workflows', path: '/api/ags/graph/nodes/workflows', type: 'WorkflowObject', fields: ['uid', 'object_name', 'template', 'state'] },
      edges: { label: 'Core edges', path: '/api/ags/graph/edges/core', type: 'Edge', fields: ['source_id', 'target_id', 'predicate', 'source_type', 'target_type'] }
    };
    const samples = {
      items: [{ uid: 'ITEM-UID-001', item_id: 'ITEM-SAMPLE-01', object_name: 'Pump housing', object_type: 'Item' }],
      revisions: [{ uid: 'REV-UID-003', item_revision_id: '03', object_name: 'Pump housing / 03', owning_item: 'ITEM-UID-001' }],
      datasets: [{ uid: 'DATA-UID-017', object_name: 'Released drawing', dataset_type: 'PDF', owning_revision: 'REV-UID-003' }],
      changes: [{ uid: 'CHG-UID-042', object_name: 'Material clarification', object_type: 'ChangeNoticeRevision', status: 'In Review' }],
      workflows: [{ uid: 'WF-UID-012', object_name: 'Release workflow', template: 'Sample release', state: 'Started' }],
      edges: [{ source_id: 'ITEM-UID-001', target_id: 'REV-UID-003', predicate: 'ITEM_HAS_REVISION', source_type: 'Item', target_type: 'ItemRevision' }]
    };
    let endpointKey = 'items';
    let request = 0;
    const root = frame(host, head, 'api', `
      <header class="twc-command">
        <div><span class="twc-eyebrow">READ-ONLY SEMANTIC ADAPTER</span><h3>Teamcenter graph API console</h3><p>Sanitized MSSQL-shaped fixtures · no database or network request</p></div>
        <div class="twc-status" data-twc-status role="status" aria-live="polite">Choose a node or edge endpoint</div>
      </header>
      <nav class="twc-api-endpoints" aria-label="Semantic API endpoints">${Object.entries(endpoints).map(([key, endpoint], index) => `<button data-api-endpoint="${key}" class="${index === 0 ? 'is-active' : ''}" aria-pressed="${index === 0}"><i>GET</i><span>${endpoint.label}</span></button>`).join('')}</nav>
      <form class="twc-api-query" data-api-query>
        <code data-api-path>/api/ags/graph/nodes/items</code>
        <label>q<input type="search" name="q" placeholder="sanitized name or ID"></label>
        <label>limit<select name="limit"><option>10</option><option>25</option><option>50</option></select></label>
        <button class="twc-button is-primary" type="submit">Send fixture request</button>
      </form>
      <div class="twc-api-layout">
        <aside class="twc-panel twc-api-schema">
          <div class="twc-panel-head"><div><small>Normalized schema</small><b data-api-type>Item</b></div><span class="twc-badge">reader view</span></div>
          <div data-api-fields></div>
          <div class="twc-api-contract"><small>CONTRACT</small><p>Stable graph shape over fragmented Teamcenter tables. Administrative, authentication, and user metadata remain outside the response.</p></div>
        </aside>
        <section class="twc-panel twc-api-response">
          <div class="twc-panel-head"><div><small>Response</small><b><span data-api-code>200</span> · application/json</b></div><span class="twc-badge is-quiet" data-api-request-id>req-demo-0000</span></div>
          <pre class="twc-code" data-api-json aria-label="Sanitized JSON response"></pre>
        </section>
      </div>
      <div class="twc-api-guarantees">
        <article><i>01</i><b>Read-only views</b><span>GET fixtures mirror a reader-only boundary.</span></article>
        <article><i>02</i><b>Request diagnostics</b><span>X-Request-Id follows every response shape.</span></article>
        <article><i>03</i><b>Intentional omissions</b><span>Raw BOM parentage and transient BOMLine context are not invented.</span></article>
      </div>`);
    const renderEndpoint = () => {
      const endpoint = endpoints[endpointKey];
      $('[data-api-path]', root).textContent = endpoint.path;
      $('[data-api-type]', root).textContent = endpoint.type;
      $('[data-api-fields]', root).innerHTML = endpoint.fields.map((field, index) => `<div><i>${String(index + 1).padStart(2, '0')}</i><code>${field}</code><span>${field.includes('id') || field === 'uid' ? 'stable identifier' : field === 'predicate' ? 'normalized relation' : 'sanitized property'}</span></div>`).join('');
      setPressed($$('[data-api-endpoint]', root), endpointKey, 'apiEndpoint');
    };
    const responseFor = (query, limit) => {
      const base = samples[endpointKey];
      const filtered = query ? base.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())) : base;
      return {
        request_id: `req-demo-${String(request).padStart(4, '0')}`,
        count: filtered.length,
        limit: Number(limit),
        offset: 0,
        has_more: false,
        data: filtered
      };
    };
    const renderResponse = response => {
      $('[data-api-request-id]', root).textContent = response.request_id;
      $('[data-api-json]', root).textContent = JSON.stringify(response, null, 2);
    };
    $$('[data-api-endpoint]', root).forEach(button => button.addEventListener('click', () => {
      timers.clear();
      endpointKey = button.dataset.apiEndpoint;
      renderEndpoint();
      setStatus(root, `${endpoints[endpointKey].label} endpoint selected`);
    }));
    $('[data-api-query]', root).addEventListener('submit', event => {
      event.preventDefault();
      timers.clear();
      request += 1;
      const form = event.currentTarget;
      const button = $('button[type="submit"]', form);
      button.disabled = true;
      $('[data-api-code]', root).textContent = '…';
      setStatus(root, `GET ${endpoints[endpointKey].path} · fixture dispatch`, 'busy');
      timers.later(() => {
        const response = responseFor(form.elements.q.value.trim(), form.elements.limit.value);
        renderResponse(response);
        $('[data-api-code]', root).textContent = '200';
        setStatus(root, `200 OK · ${response.count} sanitized record${response.count === 1 ? '' : 's'} · ${response.request_id}`, 'good');
        button.disabled = false;
      }, 620);
    });
    renderEndpoint();
    renderResponse(responseFor('', 10));
    return () => timers.clear();
  }

  function genealogy(spec, host, head) {
    const people = [
      { id: 'elian', generation: 1, name: 'Elian Vale', years: '1848–1916', place: 'Westmere', relation: 'Founding household', verified: true, sources: ['S1', 'S2'], note: 'A fictional civil entry and census fixture agree on the household.', gap: 'Parentage before 1848 is unresolved.' },
      { id: 'mara', generation: 1, name: 'Mara Vale', years: '1852–1927', place: 'Lake Republic', relation: 'Founding household', verified: true, sources: ['S1', 'S3'], note: 'Two fictional source fixtures support name and migration year.', gap: 'Birth district needs a second independent fixture.' },
      { id: 'rowan', generation: 2, name: 'Rowan Vale', years: '1876–1944', place: 'Northport', relation: 'Child of Elian + Mara', verified: true, sources: ['S2', 'S4'], note: 'Household and directory fixtures establish the generational link.', gap: 'Occupation transition is only indirectly supported.' },
      { id: 'iris', generation: 2, name: 'Iris Vale', years: '1881–1953', place: 'Westmere', relation: 'Rowan’s partner', verified: false, sources: ['S5'], note: 'A single fictional oral-history note suggests the partnership.', gap: 'Primary union record is absent.' },
      { id: 'theo', generation: 3, name: 'Theo Vale', years: '1907–1988', place: 'Northport', relation: 'Child of Rowan + Iris', verified: true, sources: ['S4', 'S6'], note: 'Directory and passenger-manifest fixtures converge on identity.', gap: 'The 1931 residence interval remains open.' },
      { id: 'lina', generation: 3, name: 'Lina Vale', years: '1911–1999', place: 'Westmere', relation: 'Child of Rowan + Iris', verified: false, sources: ['S5'], note: 'This branch remains a fictional research hypothesis.', gap: 'No primary birth fixture has been attached.' },
      { id: 'june', generation: 4, name: 'June Vale', years: '1940–2012', place: 'Lake Republic', relation: 'Child of Theo', verified: true, sources: ['S3', 'S6'], note: 'Two independent fictional fixtures support the placement.', gap: 'One residence change lacks a dated source.' }
    ].map(person => ({ ...person, gapOpen: true }));
    const sources = {
      S1: ['Civil register fixture', 'Household union · fictional archive'],
      S2: ['Census fixture', 'Westmere household · fictional archive'],
      S3: ['Migration ledger fixture', 'Lake Republic entry · fictional archive'],
      S4: ['City directory fixture', 'Northport occupations · fictional archive'],
      S5: ['Oral-history note', 'Unverified family narrative · fictional'],
      S6: ['Passenger manifest fixture', 'Northport arrival · fictional archive']
    };
    let selected = 'elian';
    let filter = 'all';
    const root = frame(host, head, 'genealogy', `
      <header class="twc-command">
        <div><span class="twc-eyebrow">FICTIONAL RESEARCH FIXTURE</span><h3>Vale evidence tree</h3><p>No real persons, records, locations, or source identifiers</p></div>
        <div class="twc-command-actions"><div class="twc-segmented" role="group" aria-label="Verification filter"><button class="is-active" data-gene-filter="all" aria-pressed="true">All evidence</button><button data-gene-filter="verified" aria-pressed="false">Verified only</button></div></div>
      </header>
      <div class="twc-gene-layout">
        <section class="twc-panel twc-gene-tree">
          <div class="twc-panel-head"><div><small>Four-generation model</small><b>Source-backed placement</b></div><span class="twc-badge">fictional</span></div>
          <div class="twc-generations" data-gene-tree></div>
        </section>
        <aside class="twc-panel twc-gene-person">
          <div class="twc-panel-head"><div><small>Person evidence card</small><b data-gene-name></b></div><span data-gene-verification></span></div>
          <div data-gene-detail></div>
        </aside>
      </div>
      <section class="twc-panel twc-gene-sources">
        <div class="twc-panel-head"><div><small>Source register</small><b>Fictional citation fixtures</b></div><span class="twc-status" data-twc-status role="status" aria-live="polite">Select a person to inspect citations</span></div>
        <div>${Object.entries(sources).map(([id, source]) => `<button data-gene-source="${id}"><i>${id}</i><span><b>${source[0]}</b><small>${source[1]}</small></span></button>`).join('')}</div>
      </section>`);
    const renderTree = () => {
      $('[data-gene-tree]', root).innerHTML = [1, 2, 3, 4].map(generation => {
        const group = people.filter(person => person.generation === generation && (filter === 'all' || person.verified));
        return `<section><h4><i>G${generation}</i><span>${['Origins', 'Household', 'Branches', 'Later record'][generation - 1]}</span></h4><div>${group.length ? group.map(person => `<button data-gene-person="${person.id}" class="${person.id === selected ? 'is-active' : ''}" aria-pressed="${person.id === selected}"><span class="twc-origin" data-place="${person.place.toLowerCase().replace(/\s+/g, '-')}"></span><b>${person.name}</b><small>${person.years} · ${person.place}</small><em class="${person.verified ? 'is-verified' : 'is-hypothesis'}">${person.verified ? 'verified' : 'hypothesis'}</em></button>`).join('') : '<p>No verified person in this generation.</p>'}</div></section>`;
      }).join('');
      $$('[data-gene-person]', root).forEach(button => button.addEventListener('click', () => {
        selected = button.dataset.genePerson;
        renderTree();
        renderDetail();
      }));
    };
    const renderDetail = () => {
      const person = people.find(item => item.id === selected) || people[0];
      $('[data-gene-name]', root).textContent = person.name;
      const verification = $('[data-gene-verification]', root);
      verification.className = `twc-badge ${person.verified ? 'is-good' : 'is-alert'}`;
      verification.textContent = person.verified ? 'verified fixture' : 'research hypothesis';
      $('[data-gene-detail]', root).innerHTML = `<div class="twc-gene-identity"><span>${person.years}</span><strong>${person.place}</strong><small>${person.relation}</small></div>
        <p>${person.note}</p><small class="twc-gene-label">ATTACHED CITATIONS</small>
        <div class="twc-gene-citations">${person.sources.map(id => `<button data-gene-cite="${id}"><i>${id}</i><span>${sources[id][0]}</span></button>`).join('')}</div>
        <div class="twc-gene-gap ${person.gapOpen ? 'is-open' : ''}"><small>RESEARCH GAP</small><p>${person.gap}</p><button class="twc-button" data-gene-gap>${person.gapOpen ? 'Mark reviewed' : 'Reopen gap'}</button></div>`;
      $$('[data-gene-cite]', root).forEach(button => button.addEventListener('click', () => focusSource(button.dataset.geneCite)));
      $('[data-gene-gap]', root).addEventListener('click', () => {
        person.gapOpen = !person.gapOpen;
        renderDetail();
        setStatus(root, `${person.name} · research gap ${person.gapOpen ? 'open' : 'marked reviewed'} in this browser fixture`, person.gapOpen ? '' : 'good');
      });
      $$('[data-gene-source]', root).forEach(button => button.classList.toggle('is-cited', person.sources.includes(button.dataset.geneSource)));
    };
    const focusSource = id => {
      $$('[data-gene-source]', root).forEach(button => button.classList.toggle('is-selected', button.dataset.geneSource === id));
      const source = sources[id];
      setStatus(root, `${id} · ${source[0]} · fictional citation only`, 'good');
    };
    $$('[data-gene-filter]', root).forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.geneFilter;
      if (filter === 'verified' && !people.find(person => person.id === selected).verified) selected = people.find(person => person.verified).id;
      setPressed($$('[data-gene-filter]', root), filter, 'geneFilter');
      renderTree();
      renderDetail();
    }));
    $$('[data-gene-source]', root).forEach(button => button.addEventListener('click', () => focusSource(button.dataset.geneSource)));
    renderTree();
    renderDetail();
    return () => {};
  }

  window.PROJECT_WORKBENCHES = Object.assign(window.PROJECT_WORKBENCHES || {}, {
    rdfPipeline,
    capitalNx,
    nxJob,
    changeDashboard,
    fixedStory,
    mcpWorkspace,
    nxJournalReview,
    designBrief,
    semanticApi,
    genealogy
  });
})();
