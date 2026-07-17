/* README-grounded, browser-only project workbenches. */
(() => {
  'use strict';

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => [...(root || document).querySelectorAll(selector)];
  const html = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
  const makeTimers = ctx => {
    const ids = new Set();
    const reduced = Boolean(ctx && ctx.reducedMotion);
    return {
      later(fn, ms) {
        const id = setTimeout(() => { ids.delete(id); fn(); }, reduced ? Math.min(ms, 28) : ms);
        ids.add(id);
        return id;
      },
      clear() { ids.forEach(clearTimeout); ids.clear(); }
    };
  };
  const setStatus = (host, tone, text) => {
    const node = $('[data-tb-status]', host);
    if (!node) return;
    node.className = `tb-status ${tone || ''}`;
    node.textContent = text;
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function changeCockpit(spec, host, head, ctx) {
    const timers = makeTimers(ctx);
    const records = [
      {
        id: 'ncr', system: 'Opcenter', eyebrow: 'QUALITY · NCR-Q17', title: 'Torque escape detected',
        copy: 'A final-inspection NCR anchors the cross-system trace.', tone: 'bad',
        evidence: [['Record', 'NCR-Q17'], ['Signal', '3 of 24 units'], ['Owner', 'Quality role'], ['State', 'Containment open']],
        action: 'Contain the affected sample lot and preserve the inspection evidence.'
      },
      {
        id: 'eco', system: 'Teamcenter', eyebrow: 'DESIGN · ECO-042', title: 'Fastener revision implicated',
        copy: 'The NCR resolves to one released part revision and its pending ECO.', tone: 'warn',
        evidence: [['Object', 'ECO-042'], ['Affected', 'FASTENER-A · Rev C'], ['Relation', 'Problem item'], ['State', 'Design review']],
        action: 'Compare Rev C torque requirements with the proposed Rev D change.'
      },
      {
        id: 'capa', system: 'Quality', eyebrow: 'CAPA · CA-018', title: 'Corrective action coordinated',
        copy: 'A CAPA joins containment, work instruction, and verification work.', tone: 'good',
        evidence: [['Record', 'CA-018'], ['Scope', 'Instruction + gage'], ['Evidence', '2 checks linked'], ['Gate', 'Verification due']],
        action: 'Require one verified build before releasing the containment.'
      },
      {
        id: 'cost', system: 'SAP', eyebrow: 'COST · SIMULATED', title: 'Decision cost made visible',
        copy: 'Scrap, rework, inspection, and downtime are rolled into one sample estimate.', tone: 'good',
        evidence: [['Rework', '$8.4k sample'], ['Inspection', '$2.1k sample'], ['Downtime', '$11.7k sample'], ['Payback', '2.8 cycles']],
        action: 'Approve the bounded ECO path; the simulated payback clears the sample threshold.'
      }
    ];
    let selected = records[0].id;
    host.innerHTML = head + `<div class="tb-shell">
      <div class="tb-toolbar">
        <div class="tb-segments" role="group" aria-label="Cockpit area">
          <button class="active" data-change-area="operations">Operations</button>
          <button data-change-area="quality">Quality workbench</button>
          <button data-change-area="design">Design inbox</button>
          <button data-change-area="roi">Change ROI</button>
        </div>
        <div class="tb-actions"><span class="tb-status good" data-tb-status>4 systems · sample graph ready</span><button class="tb-button primary" data-change-trace>Trace NCR → decision</button></div>
      </div>
      <div class="tb-kpis">
        <div class="tb-kpi"><small>Open NCRs</small><strong>03</strong><span>1 cross-system match</span></div>
        <div class="tb-kpi"><small>Design inbox</small><strong>02</strong><span>ECO + CAPA evidence</span></div>
        <div class="tb-kpi"><small>At-risk work</small><strong>24</strong><span>sample units contained</span></div>
        <div class="tb-kpi"><small>Modeled exposure</small><strong>$22.2k</strong><span>illustrative only</span></div>
      </div>
      <div class="tb-grid-aside tb-change-layout">
        <section class="tb-panel">
          <div class="tb-panel-head"><b>Cross-system change graph</b><span>select a record</span></div>
          <div class="tb-change-canvas"><div class="tb-change-flow">
            ${records.map((record, index) => `<button class="tb-change-node${index === 0 ? ' active' : ''}" data-change-node="${record.id}" aria-pressed="${index === 0}">
              <small>${html(record.eyebrow)}</small><b>${html(record.title)}</b><span>${html(record.copy)}</span><i class="tb-pill ${record.tone}">${html(record.system)}</i>
            </button>`).join('')}
          </div></div>
        </section>
        <aside class="tb-panel">
          <div class="tb-panel-head"><b>Evidence inspector</b><span data-change-source>Opcenter source</span></div>
          <div class="tb-change-evidence" data-change-detail></div>
        </aside>
      </div>
    </div>`;

    const renderDetail = () => {
      const record = records.find(item => item.id === selected) || records[0];
      $('[data-change-source]', host).textContent = `${record.system} source`;
      $('[data-change-detail]', host).innerHTML = `<span class="tb-pill ${record.tone}">${html(record.eyebrow)}</span>
        <h5 class="tb-evidence-title">${html(record.title)}</h5><p class="tb-evidence-copy">${html(record.copy)}</p>
        <div class="tb-evidence-list">${record.evidence.map(row => `<div class="tb-evidence-row"><b>${html(row[0])}</b><span>${html(row[1])}</span><i class="tb-pill good">linked</i></div>`).join('')}</div>
        <div class="tb-next-actions"><div class="tb-next-action"><i>01</i><span>${html(record.action)}</span><em class="tb-pill">tool-backed</em></div></div>`;
      $$('[data-change-node]', host).forEach(button => {
        const active = button.dataset.changeNode === selected;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    };
    $$('[data-change-node]', host).forEach(button => button.addEventListener('click', () => {
      selected = button.dataset.changeNode;
      renderDetail();
    }));
    $$('[data-change-area]', host).forEach(button => button.addEventListener('click', () => {
      $$('[data-change-area]', host).forEach(item => item.classList.toggle('active', item === button));
      const target = { operations: 'ncr', quality: 'capa', design: 'eco', roi: 'cost' }[button.dataset.changeArea];
      selected = target;
      renderDetail();
      setStatus(host, 'good', `${button.textContent.trim()} · source context loaded`);
    }));
    $('[data-change-trace]', host).addEventListener('click', event => {
      timers.clear();
      const button = event.currentTarget;
      button.disabled = true;
      $$('[data-change-node]', host).forEach(node => node.classList.remove('traced'));
      setStatus(host, 'busy', 'Resolving NCR, ECO, CAPA, and cost relations');
      records.forEach((record, index) => timers.later(() => {
        const node = $(`[data-change-node="${record.id}"]`, host);
        if (node) node.classList.add('traced');
        selected = record.id;
        renderDetail();
      }, 180 + index * 230));
      timers.later(() => {
        setStatus(host, 'good', 'Trace complete · 4 source records · 1 governed decision');
        button.disabled = false;
      }, 1120);
    });
    renderDetail();
    return () => timers.clear();
  }

  function jtWidget(spec, host, head, ctx) {
    const timers = makeTimers(ctx);
    const parts = {
      housing: { name: 'Outer housing', type: 'JT part', id: 'PVW-100/A', color: 'teal', material: 'Aluminum sample', children: '3' },
      shaft: { name: 'Drive shaft', type: 'JT part', id: 'PVW-110/A', color: 'purple', material: 'Steel sample', children: '0' },
      rotor: { name: 'Rotor', type: 'JT part', id: 'PVW-120/B', color: 'amber', material: 'Nickel alloy sample', children: '0' },
      bracket: { name: 'Mount bracket', type: 'JT part', id: 'PVW-130/A', color: 'blue', material: 'Titanium sample', children: '0' }
    };
    let loaded = false, selected = 'housing', view = 'iso', sectioned = false;
    host.innerHTML = head + `<div class="tb-shell tb-panel">
      <div class="tb-jt-toolbar">
        <button class="tb-button primary" data-jt-load>Load local JT fixture</button>
        <span class="tb-pill" data-jt-load-state>not loaded</span>
        <span aria-hidden="true" style="width:1px;height:25px;background:var(--border);margin:0 3px"></span>
        ${[['front','Front'],['top','Top'],['right','Right'],['iso','Iso']].map(([key,label]) => `<button class="tb-icon-button${key === view ? ' active' : ''}" data-jt-view="${key}" title="${label} view">${label.slice(0,2).toUpperCase()}</button>`).join('')}
        <button class="tb-icon-button" data-jt-fit title="Fit model">FIT</button>
        <button class="tb-icon-button" data-jt-section title="Toggle section plane">SEC</button>
        <button class="tb-icon-button" data-jt-snapshot title="Create browser snapshot">PNG</button>
        <label class="tb-label" style="margin-left:auto;min-width:160px">Explode <input data-jt-explode type="range" min="0" max="100" value="0" aria-label="Explode amount"></label>
      </div>
      <div class="tb-jt-workspace">
        <aside class="tb-jt-tree"><div class="tb-jt-tree-label">Product structure</div><div data-jt-tree>
          <button class="tb-list-button active" data-jt-part="housing"><i style="--part-color:var(--teal)"></i><span>PVW sample assembly</span></button>
          <button class="tb-list-button child" data-jt-part="shaft"><i style="--part-color:var(--purple)"></i><span>Drive shaft</span></button>
          <button class="tb-list-button child" data-jt-part="rotor"><i style="--part-color:var(--amber)"></i><span>Rotor</span></button>
          <button class="tb-list-button child" data-jt-part="bracket"><i style="--part-color:#57a4ff"></i><span>Mount bracket</span></button>
        </div></aside>
        <div class="tb-jt-viewer" aria-label="Illustrative PLM Vis Web JT viewport">
          <div class="tb-jt-grid" aria-hidden="true"></div><div class="tb-jt-cube" data-jt-cube>ISO</div><div class="tb-jt-axis" aria-hidden="true">Z ↑<br>Y ↗ &nbsp; X →</div>
          <div class="tb-jt-model" data-jt-model data-view="iso">
            ${Object.keys(parts).map(key => `<button class="tb-jt-part${key === selected ? ' active' : ''}" data-jt-part="${key}" data-part="${key}" aria-label="Select ${html(parts[key].name)}"></button>`).join('')}
          </div>
          <div class="tb-jt-empty" data-jt-empty><span><b style="display:block;color:var(--text2);margin-bottom:7px">Mendix 3D Viewer</b>Load the browser-safe fixture to exercise the widget's URL/JT load, view, section, explode, snapshot, and selection-event surfaces.</span></div>
        </div>
        <aside class="tb-jt-inspector">
          <div class="tb-jt-tree-label">Mendix event bridge</div><div data-jt-inspector></div>
          <div class="tb-jt-event" data-jt-event>{ "isLoaded": false }</div>
        </aside>
      </div>
      <div class="tb-panel-head"><span class="tb-status" data-tb-status>Widget idle · no runtime or license call made</span><span>PLMVisWeb-style local simulation</span></div>
    </div>`;
    const renderInspector = eventName => {
      const part = parts[selected];
      $('[data-jt-inspector]', host).innerHTML = `<div class="tb-jt-property"><small>Selection</small><span>${html(part.name)}</span></div>
        <div class="tb-jt-property"><small>Occurrence ID</small><span>${html(part.id)}</span></div>
        <div class="tb-jt-property"><small>Material</small><span>${html(part.material)}</span></div>
        <div class="tb-jt-property"><small>Children</small><span>${html(part.children)}</span></div>`;
      if (eventName) $('[data-jt-event]', host).textContent = JSON.stringify({ event: eventName, selection: { id: part.id, name: part.name }, isLoaded: loaded }, null, 2);
      $$('[data-jt-part]', host).forEach(node => {
        node.classList.toggle('active', node.dataset.jtPart === selected);
        if (node.tagName === 'BUTTON') node.setAttribute('aria-pressed', String(node.dataset.jtPart === selected));
      });
    };
    const requireLoad = () => {
      if (loaded) return true;
      setStatus(host, 'bad', 'Load the local JT fixture first');
      return false;
    };
    $('[data-jt-load]', host).addEventListener('click', event => {
      timers.clear();
      const button = event.currentTarget;
      button.disabled = true;
      $('[data-jt-load-state]', host).textContent = 'parsing fixture';
      setStatus(host, 'busy', 'Resolving local model URL and initializing viewer');
      timers.later(() => {
        loaded = true;
        $('[data-jt-empty]', host).hidden = true;
        $('[data-jt-load-state]', host).className = 'tb-pill good';
        $('[data-jt-load-state]', host).textContent = 'JT loaded';
        $('[data-jt-event]', host).textContent = JSON.stringify({ event: 'onLoad', isLoaded: true, sourceType: 'Url', parts: 4 }, null, 2);
        setStatus(host, 'good', 'onLoad fired · Mendix loaded flag set true');
        button.textContent = 'Reload local fixture';
        button.disabled = false;
      }, 620);
    });
    $$('[data-jt-view]', host).forEach(button => button.addEventListener('click', () => {
      if (!requireLoad()) return;
      view = button.dataset.jtView;
      $('[data-jt-model]', host).dataset.view = view;
      $('[data-jt-cube]', host).textContent = view.toUpperCase();
      $$('[data-jt-view]', host).forEach(item => item.classList.toggle('active', item === button));
      setStatus(host, 'good', `${button.title} applied through standard-view surface`);
    }));
    $('[data-jt-fit]', host).addEventListener('click', () => {
      if (!requireLoad()) return;
      const model = $('[data-jt-model]', host);
      model.animate([{ opacity: .6 }, { opacity: 1 }], { duration: ctx && ctx.reducedMotion ? 1 : 260 });
      setStatus(host, 'good', 'fitToModel completed');
    });
    $('[data-jt-section]', host).addEventListener('click', event => {
      if (!requireLoad()) return;
      sectioned = !sectioned;
      $('[data-jt-model]', host).classList.toggle('sectioned', sectioned);
      event.currentTarget.classList.toggle('active', sectioned);
      $('[data-jt-event]', host).textContent = JSON.stringify({ event: sectioned ? 'addSectionPlane' : 'removeSectionPlane', axis: 'Z', direction: 'POSITIVE' }, null, 2);
      setStatus(host, 'good', sectioned ? 'Z section plane active' : 'Section plane removed');
    });
    $('[data-jt-explode]', host).addEventListener('input', event => {
      if (!requireLoad()) { event.currentTarget.value = 0; return; }
      const amount = Number(event.currentTarget.value) / 100;
      const model = $('[data-jt-model]', host);
      model.style.setProperty('--explode', amount.toFixed(2));
      model.classList.toggle('exploded', amount > .01);
      setStatus(host, 'good', `autoExplode(${amount.toFixed(2)})`);
    });
    $('[data-jt-snapshot]', host).addEventListener('click', () => {
      if (!requireLoad()) return;
      $('[data-jt-event]', host).textContent = JSON.stringify({ event: 'createSnapshotPNG', output: 'browser preview', written: false }, null, 2);
      setStatus(host, 'good', 'Snapshot preview generated · no file written');
    });
    $$('[data-jt-part]', host).forEach(button => button.addEventListener('click', () => {
      if (!requireLoad()) return;
      selected = button.dataset.jtPart;
      renderInspector('onSelect');
      setStatus(host, 'good', `onSelect fired · ${parts[selected].id}`);
    }));
    renderInspector();
    return () => timers.clear();
  }

  function mesDeck(spec, host, head) {
    const slides = [
      ['Mendix as a manufacturing frontend', 'A browser-safe presentation of two real integration positions.', ['Operator UX', 'MES truth', 'Governed extension']],
      ['The challenge', 'Manufacturing systems are powerful, but their fixed interfaces do not fit every role or station.', ['Rigid screens', 'Role friction', 'Slow iteration']],
      ['SAP ME today', 'Existing SAP ME extension routes include OData, BAPI, and BTP—not a fictional replacement engine.', ['OData', 'BAPI', 'BTP']],
      ['Mendix + SAP ME', 'Use Mendix as an extension layer around the existing MES boundary.', ['Extend', 'Compose', 'Preserve core']],
      ['Opcenter Core + Mendix', 'Mendix is embedded natively in the Opcenter Core frontend proposition.', ['Native embed', 'Shared context', 'Operator flow']],
      ['Side by side', 'SAP ME uses an overlay approach; Opcenter Core supports a natively embedded experience.', ['Overlay', 'Embedded', 'Trade-offs']],
      ['Representative use cases', 'Operator dashboards, quality workflows, mobile tasks, and production analytics.', ['Operator', 'Quality', 'Mobile']],
      ['Reference architecture', 'The frontend, identity, MES API, and governed write boundary stay explicit.', ['Mendix UI', 'MES API', 'Audit']],
      ['Adoption path', 'Start with one bounded workflow, expand proven patterns, then optimize ownership.', ['Pilot', 'Expand', 'Optimize']],
      ['Next steps', 'Discover the operator task, assess the API boundary, and define pilot evidence.', ['Discover', 'Assess', 'Pilot']]
    ];
    let active = 0;
    host.innerHTML = head + `<div class="tb-shell">
      <div class="tb-toolbar"><span class="tb-status good" data-tb-status>Sanitized 10-slide frontend presentation</span><div class="tb-actions"><button class="tb-button" data-mes-prev>Previous</button><button class="tb-button primary" data-mes-next>Next slide</button></div></div>
      <div class="tb-deck-shell"><nav class="tb-slide-list" data-mes-list aria-label="Slides"></nav><div><article class="tb-slide-stage" data-mes-stage tabindex="0" aria-live="polite"></article><div class="tb-deck-nav"><span class="tb-pill" data-mes-count></span><span class="tb-pill good">self-contained HTML concept</span></div></div></div>
    </div>`;
    const render = focus => {
      $('[data-mes-list]', host).innerHTML = slides.map((slide, index) => `<button class="tb-slide-thumb${index === active ? ' active' : ''}" data-mes-slide="${index}" aria-current="${index === active ? 'true' : 'false'}"><span>${String(index + 1).padStart(2, '0')}</span><b>${html(slide[0])}</b></button>`).join('');
      const slide = slides[active];
      $('[data-mes-stage]', host).innerHTML = `<div class="tb-slide-kicker">Manufacturing frontend · ${String(active + 1).padStart(2, '0')}</div><h5>${html(slide[0])}</h5><p>${html(slide[1])}</p><div class="tb-slide-visual">${slide[2].map((item, index) => `<div><b>${html(item)}</b><span>${index === 0 ? 'starting boundary' : index === 1 ? 'system position' : 'observable outcome'}</span></div>`).join('')}</div>`;
      $('[data-mes-count]', host).textContent = `${active + 1} / ${slides.length}`;
      $('[data-mes-prev]', host).disabled = active === 0;
      $('[data-mes-next]', host).disabled = active === slides.length - 1;
      $$('[data-mes-slide]', host).forEach(button => button.addEventListener('click', () => { active = Number(button.dataset.mesSlide); render(true); }));
      if (focus) {
        const button = $(`[data-mes-slide="${active}"]`, host);
        if (button) button.focus({ preventScroll: true });
      }
    };
    const move = delta => { active = clamp(active + delta, 0, slides.length - 1); render(false); setStatus(host, 'good', `Slide ${active + 1} · ${slides[active][0]}`); };
    $('[data-mes-prev]', host).addEventListener('click', () => move(-1));
    $('[data-mes-next]', host).addEventListener('click', () => move(1));
    $('[data-mes-stage]', host).addEventListener('keydown', event => {
      if (['ArrowRight', 'ArrowDown', ' '].includes(event.key)) { event.preventDefault(); move(1); }
      if (['ArrowLeft', 'ArrowUp'].includes(event.key)) { event.preventDefault(); move(-1); }
      if (event.key === 'Home') { event.preventDefault(); active = 0; render(false); }
      if (event.key === 'End') { event.preventDefault(); active = slides.length - 1; render(false); }
    });
    render(false);
    return () => {};
  }

  function mendixExpression(spec, host, head) {
    const rows = [
      { key: 'PX-1020', supplierId: 'SUP-046', supplierName: 'North Fabrication', price: '856.49', currency: 'EUR', changedAt: '18-Apr-23' },
      { key: 'PX-1021', supplierId: 'SUP-048', supplierName: 'Atlas Components', price: '1249.00', currency: 'EUR', changedAt: '22-Jul-23' },
      { key: 'PX-1022', supplierId: 'SUP-051', supplierName: 'First Compute', price: '434.80', currency: 'USD', changedAt: '05-Sep-23' },
      { key: 'PX-1023', supplierId: 'SUP-053', supplierName: 'Berlin Works', price: '1899.99', currency: 'EUR', changedAt: '15-Jan-24' },
      { key: 'PX-1024', supplierId: 'SUP-001', supplierName: 'Demo Supply', price: '299.00', currency: 'USD', changedAt: '10-Mar-24' }
    ];
    const params = [
      ['supplierId', 'Parameter {1} · SupplierID', '000000'],
      ['supplierName', 'Parameter {2} · SupplierName', 'Unknown Supplier'],
      ['price', 'Parameter {3} · Price', '0.00'],
      ['currency', 'Parameter {4} · CurrencyCode', 'EUR'],
      ['changedAt', 'Parameter {5} · ChangedAt', '01-Jan-23']
    ];
    let selected = 0, parameter = 0;
    host.innerHTML = head + `<div class="tb-shell">
      <div class="tb-toolbar"><span class="tb-status good" data-tb-status>Hardcoded demo replacement · no SAP connection</span><span class="tb-pill warn">illustrative lookup only</span></div>
      <div class="tb-expression-layout">
        <section class="tb-panel"><div class="tb-panel-head"><b>Sanitized fake data table</b><span>$listView3/Description</span></div><div class="tb-panel-body" style="overflow:auto"><table class="tb-demo-table"><thead><tr><th>Description</th><th>Supplier</th><th>Price</th></tr></thead><tbody data-mxexpr-rows></tbody></table></div></section>
        <section class="tb-panel"><div class="tb-panel-head"><b>Edit Caption · Value expression</b><span>nested if / else</span></div><div class="tb-panel-body tb-expression-card">
          <div class="tb-segments" data-mxexpr-tabs role="tablist" aria-label="Caption parameter"></div>
          <pre class="tb-code" data-mxexpr-code></pre>
          <div class="tb-actions"><button class="tb-button primary" data-mxexpr-evaluate>Evaluate selected product</button><span class="tb-pill" data-mxexpr-value>not evaluated</span></div>
          <div class="tb-expression-result" data-mxexpr-result></div>
        </div></section>
      </div>
    </div>`;
    const expression = () => {
      const [field, label, fallback] = params[parameter];
      return `// ${label}\n${rows.map((row, index) => `${index ? 'else ' : ''}if $listView3/Description = '${row.key}' then '${row[field]}'`).join('\n')}\nelse '${fallback}'`;
    };
    const render = () => {
      $('[data-mxexpr-rows]', host).innerHTML = rows.map((row, index) => `<tr class="${index === selected ? 'active' : ''}" data-mxexpr-row="${index}" tabindex="0" role="button" aria-selected="${index === selected}"><td>${html(row.key)}</td><td>${html(row.supplierName)}</td><td>${html(row.price)} ${html(row.currency)}</td></tr>`).join('');
      $('[data-mxexpr-tabs]', host).innerHTML = params.map((param, index) => `<button class="${index === parameter ? 'active' : ''}" data-mxexpr-param="${index}" role="tab" aria-selected="${index === parameter}">{${index + 1}} ${html(param[0])}</button>`).join('');
      $('[data-mxexpr-code]', host).textContent = expression();
      const row = rows[selected];
      $('[data-mxexpr-result]', host).innerHTML = params.map(([field, label]) => `<div><small>${html(label.split(' · ')[1])}</small><b>${html(row[field])}</b></div>`).join('');
      $$('[data-mxexpr-row]', host).forEach(node => {
        const choose = () => { selected = Number(node.dataset.mxexprRow); render(); setStatus(host, 'good', `${rows[selected].key} selected · evaluate a caption parameter`); };
        node.addEventListener('click', choose);
        node.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); } });
      });
      $$('[data-mxexpr-param]', host).forEach(button => button.addEventListener('click', () => { parameter = Number(button.dataset.mxexprParam); render(); }));
    };
    $('[data-mxexpr-evaluate]', host).addEventListener('click', () => {
      const field = params[parameter][0], row = rows[selected];
      $('[data-mxexpr-value]', host).className = 'tb-pill good';
      $('[data-mxexpr-value]', host).textContent = `${params[parameter][1]} → ${row[field]}`;
      setStatus(host, 'good', `Matched ${row.key} · final else branch not used`);
    });
    render();
    return () => {};
  }

  function crmJdbc(spec, host, head, ctx) {
    const timers = makeTimers(ctx);
    const tables = [
      ['users', 8], ['accounts', 20], ['contacts', 30], ['leads', 15],
      ['products', 10], ['opportunities', 22], ['opportunity_products', 17], ['activities', 25]
    ];
    const sampleRows = {
      accounts: [['AC-001', 'Northwind Demo', 'Manufacturing'], ['AC-002', 'Bluebird Sample', 'Energy'], ['AC-003', 'Atlas Sandbox', 'Technology']],
      contacts: [['CT-014', 'Taylor R.', 'AC-001'], ['CT-021', 'Morgan L.', 'AC-002'], ['CT-027', 'Casey A.', 'AC-003']],
      opportunities: [['OP-008', 'Automation pilot', 'Discovery'], ['OP-013', 'Analytics extension', 'Evaluation'], ['OP-019', 'Mobile workflow', 'Proposal']],
      activities: [['AT-104', 'Demo call', 'complete'], ['AT-112', 'Architecture review', 'scheduled'], ['AT-118', 'Sample follow-up', 'open']]
    };
    let engine = 'postgres', table = 'accounts';
    host.innerHTML = head + `<div class="tb-shell tb-panel">
      <div class="tb-panel-head"><b>Portable CRM demo database</b><span class="tb-status good" data-tb-status>fixture offline · same 8-table dataset</span></div>
      <div class="tb-toolbar" style="padding:12px;margin:0;border-bottom:1px solid var(--hairline)">
        <div class="tb-segments" role="group" aria-label="Database engine"><button class="active" data-crm-engine="postgres">PostgreSQL 16.4</button><button data-crm-engine="h2">H2 2.2</button></div>
        <span class="tb-pill good" data-crm-recommendation>Recommended for Mendix · built-in connection</span>
      </div>
      <div class="tb-schema-layout">
        <nav class="tb-schema-nav"><div class="tb-jt-tree-label">public schema · 8 tables</div><div class="tb-stack" data-crm-tables></div></nav>
        <main class="tb-schema-main">
          <div class="tb-connection-card" data-crm-settings></div>
          <label class="tb-label">Read-only SQL<textarea class="tb-textarea" data-crm-query spellcheck="false"></textarea></label>
          <div class="tb-actions" style="margin-top:8px"><button class="tb-button primary" data-crm-run>Run sample query</button><span class="tb-pill">row limit 25</span><span class="tb-pill">browser simulation</span></div>
          <div class="tb-sql-results" data-crm-results><div style="padding:24px;color:var(--text3);font-size:9px;text-align:center">Run a SELECT query against the deterministic browser fixture.</div></div>
        </main>
      </div>
    </div>`;
    const queryFor = name => `SELECT *\nFROM ${name}\nORDER BY id\nLIMIT 25;`;
    const render = () => {
      $('[data-crm-tables]', host).innerHTML = tables.map(([name, count]) => `<button class="tb-list-button${name === table ? ' active' : ''}" data-crm-table="${name}" aria-pressed="${name === table}"><i style="--part-color:var(--teal)"></i><span>${html(name)} <small style="color:var(--text3)">· ${count}</small></span></button>`).join('');
      const postgres = engine === 'postgres';
      $('[data-crm-settings]', host).innerHTML = postgres
        ? `<div><small>Connection type</small><code>PostgreSQL · Mendix OOTB</code></div><div><small>JDBC URL</small><code>jdbc:postgresql://localhost:5433/crm</code></div><div><small>Database / user</small><code>crm / demo role</code></div><div><small>Packaging</small><code>portable PostgreSQL launcher</code></div>`
        : `<div><small>Driver class</small><code>org.h2.Driver</code></div><div><small>JDBC URL</small><code>jdbc:h2:tcp://localhost:9092/crm</code></div><div><small>Mendix path</small><code>Database Connector module</code></div><div><small>Driver requirement</small><code>h2-2.2.224.jar in userlib</code></div>`;
      $('[data-crm-recommendation]', host).className = `tb-pill ${postgres ? 'good' : 'warn'}`;
      $('[data-crm-recommendation]', host).textContent = postgres ? 'Recommended for Mendix · built-in connection' : 'H2 requires Marketplace module + driver';
      $$('[data-crm-table]', host).forEach(button => button.addEventListener('click', () => {
        table = button.dataset.crmTable;
        $('[data-crm-query]', host).value = queryFor(table);
        render();
        setStatus(host, 'good', `${table} selected · ${tables.find(item => item[0] === table)[1]} fixture rows`);
      }));
    };
    $$('[data-crm-engine]', host).forEach(button => button.addEventListener('click', () => {
      engine = button.dataset.crmEngine;
      $$('[data-crm-engine]', host).forEach(item => item.classList.toggle('active', item === button));
      render();
      setStatus(host, 'good', engine === 'postgres' ? 'PostgreSQL variant · built-in Mendix connection' : 'H2 variant · Database Connector path');
    }));
    $('[data-crm-run]', host).addEventListener('click', event => {
      const button = event.currentTarget;
      const sql = $('[data-crm-query]', host).value.trim();
      if (!/^select\b/i.test(sql) || /\b(insert|update|delete|drop|alter|truncate)\b/i.test(sql)) {
        setStatus(host, 'bad', 'Read-only guard rejected a non-SELECT statement');
        return;
      }
      timers.clear();
      button.disabled = true;
      setStatus(host, 'busy', `Executing against ${engine === 'postgres' ? 'PostgreSQL' : 'H2'} sample`);
      $('[data-crm-results]', host).innerHTML = '<div style="padding:24px;color:var(--text3);font-size:9px;text-align:center">Preparing typed rows…</div>';
      timers.later(() => {
        const rows = sampleRows[table] || [[`${table.slice(0, 2).toUpperCase()}-001`, 'Sample row', 'fixture'], [`${table.slice(0, 2).toUpperCase()}-002`, 'Second row', 'fixture']];
        $('[data-crm-results]', host).innerHTML = `<table><thead><tr><th>id</th><th>${table === 'accounts' ? 'name' : table === 'contacts' ? 'contact' : table === 'opportunities' ? 'summary' : 'label'}</th><th>${table === 'accounts' ? 'industry' : table === 'contacts' ? 'account_id' : table === 'opportunities' ? 'stage' : 'state'}</th></tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${html(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        setStatus(host, 'good', `${rows.length} sanitized preview rows · ${tables.find(item => item[0] === table)[1]} rows in fixture table`);
        button.disabled = false;
      }, 520);
    });
    $('[data-crm-query]', host).value = queryFor(table);
    render();
    return () => timers.clear();
  }

  function cadArtifact(spec, host, head) {
    const artifacts = {
      prt: {
        name: 'Jetson_Thor_DevKit_V01_stp.prt', kind: 'NX part artifact', size: '927.1 KiB',
        sha: '58861532…331B0C7E', note: 'Native NX part produced from the STEP-derived development-kit model.'
      },
      fac: {
        name: 'Jetson_Thor_DevKit_V01_stp.fac', kind: 'NX faceted companion', size: '69.3 KiB',
        sha: '2E53305B…7CC64E42', note: 'Faceted display companion stored beside the part artifact.'
      }
    };
    let artifact = 'prt', view = 'iso';
    host.innerHTML = head + `<div class="tb-shell">
      <div class="tb-toolbar">
        <div class="tb-segments" role="group" aria-label="Artifact file"><button class="active" data-cad-artifact="prt">.prt</button><button data-cad-artifact="fac">.fac</button></div>
        <div class="tb-actions">${[['iso','Isometric'],['front','Front'],['top','Top'],['right','Right']].map(([key,label]) => `<button class="tb-button${key === view ? ' primary' : ''}" data-cad-view="${key}">${label}</button>`).join('')}</div>
      </div>
      <div class="tb-grid-aside">
        <section class="tb-panel"><div class="tb-panel-head"><b>Visual artifact inspection</b><span>illustrative viewport</span></div><div class="tb-cad-stage">
          <div class="tb-board" data-cad-board data-view="iso" role="img" aria-label="Stylized visual inspection of a Jetson Thor development kit NX artifact">
            <span class="tb-board-chip a"></span><span class="tb-board-chip b"></span><span class="tb-board-chip c"></span><span class="tb-board-trace one"></span><span class="tb-board-trace two"></span><span class="tb-board-label">JETSON THOR DEVKIT · STEP-DERIVED</span>
          </div><div class="tb-cad-callout cpu"><b>Compute module</b><br>board envelope</div><div class="tb-cad-callout io"><b>I/O edge</b><br>connector region</div>
        </div></section>
        <aside class="tb-panel"><div class="tb-panel-head"><b>Repository evidence</b><span>2 CAD files</span></div><div class="tb-panel-body">
          <div class="tb-artifact-list" data-cad-artifacts></div>
          <div class="tb-evidence-list" style="margin-top:12px">
            <div class="tb-evidence-row"><b>Boundary</b><span>Artifact repository, not an LLM benchmark</span><i class="tb-pill good">verified</i></div>
            <div class="tb-evidence-row"><b>Source</b><span>STEP-derived NX part + facet pair</span><i class="tb-pill">local</i></div>
            <div class="tb-evidence-row"><b>Preview</b><span>Stylized inspection, not native NX rendering</span><i class="tb-pill warn">explicit</i></div>
          </div>
          <p class="tb-evidence-copy" data-cad-note style="margin-top:12px"></p>
          <span class="tb-status good" data-tb-status>Artifact metadata loaded</span>
        </div></aside>
      </div>
    </div>`;
    const render = () => {
      $('[data-cad-artifacts]', host).innerHTML = Object.entries(artifacts).map(([key, item]) => `<button class="tb-artifact${key === artifact ? ' active' : ''}" data-cad-file="${key}" aria-pressed="${key === artifact}" style="width:100%;color:inherit;text-align:left;cursor:pointer">
        <header><b>${html(item.name)}</b><span class="tb-pill ${key === 'prt' ? 'good' : ''}">${html(item.size)}</span></header><dl><dt>Type</dt><dd>${html(item.kind)}</dd><dt>SHA-256</dt><dd>${html(item.sha)}</dd><dt>Modified</dt><dd>2026-05-07 · repository timestamp</dd></dl>
      </button>`).join('');
      $('[data-cad-note]', host).textContent = artifacts[artifact].note;
      $$('[data-cad-file]', host).forEach(button => button.addEventListener('click', () => {
        artifact = button.dataset.cadFile;
        render();
        setStatus(host, 'good', `${artifacts[artifact].kind} selected · checksum evidence visible`);
      }));
    };
    $$('[data-cad-artifact]', host).forEach(button => button.addEventListener('click', () => {
      artifact = button.dataset.cadArtifact;
      $$('[data-cad-artifact]', host).forEach(item => item.classList.toggle('active', item === button));
      render();
    }));
    $$('[data-cad-view]', host).forEach(button => button.addEventListener('click', () => {
      view = button.dataset.cadView;
      $('[data-cad-board]', host).dataset.view = view;
      $$('[data-cad-view]', host).forEach(item => { item.classList.toggle('primary', item === button); });
      setStatus(host, 'good', `${button.textContent.trim()} inspection view`);
    }));
    render();
    return () => {};
  }

  function productionCopilot(spec, host, head, ctx) {
    const timers = makeTimers(ctx);
    const stations = [
      { id: 1, name: 'LARGE ASSY 2', state: 'green', value: '7 / 7 units' },
      { id: 2, name: 'LARGE ASSY 3', state: 'green', value: '7 / 7 units' },
      { id: 3, name: 'FINAL ASSY 1', state: 'red', value: '2 / 7 units' },
      { id: 4, name: 'FINAL ASSY 2', state: 'yellow', value: '5 / 7 units' },
      { id: 5, name: 'FINAL ASSY 4', state: 'green', value: '7 / 7 units' },
      { id: 6, name: 'FINAL ASSY 7', state: 'green', value: '7 / 7 units' }
    ];
    const toolSteps = [
      ['load_production_line', 'Loaded 9 station fixtures'],
      ['overlay_mes_metrics', 'Mapped throughput against target'],
      ['highlight_station', 'Focused FINAL ASSY 1'],
      ['get_station_diagnostics', 'Quality 3 · delivery 2/7 · machines nominal'],
      ['get_root_cause', 'New PCB-C solder defects correlate with held units']
    ];
    let selected = 3, running = false;
    host.innerHTML = head + `<div class="tb-shell">
      <div class="tb-toolbar"><span class="tb-status good" data-tb-status>Scripted browser fixture · ReAct surface preserved</span><span class="tb-pill">aircraft final assembly sample</span></div>
      <div class="tb-copilot-layout">
        <section class="tb-plant">
          <div class="tb-plant-kpis"><span class="tb-pill bad">Throughput 2 / 7 units/day</span><span class="tb-pill warn">29% of target</span><span class="tb-pill">3 open NCs</span></div>
          <div class="tb-plant-line">${stations.map(station => `<button class="tb-station ${station.state}${station.id === selected ? ' active' : ''}" data-prod-station="${station.id}" aria-pressed="${station.id === selected}"><b>${html(station.name)}</b><span>${html(station.value)}</span></button>`).join('')}</div>
          <div class="tb-plant-caption" data-prod-caption>FINAL ASSY 1 selected · 2 units/day against target 7</div>
        </section>
        <aside class="tb-copilot">
          <div class="tb-copilot-head"><b>Production Co-Pilot</b><span>tool-first diagnosis · browser-safe scripted engine</span></div>
          <div class="tb-trace" data-prod-trace>
            <div class="tb-copilot-answer"><b>Suggested operator question</b><br>Why is the line below target, and what evidence points to the bottleneck?</div>
            ${toolSteps.map((step, index) => `<div class="tb-trace-step" data-prod-step="${index}"><i>${index + 1}</i><div><b>${html(step[0])}</b><span>${html(step[1])}</span></div></div>`).join('')}
            <div data-prod-answer></div>
          </div>
          <div class="tb-copilot-compose"><button class="tb-button primary" data-prod-diagnose>Diagnose bottleneck</button><span class="tb-pill" data-prod-engine>Scripted demo · no key required</span></div>
        </aside>
      </div>
    </div>`;
    const selectStation = id => {
      selected = id;
      const station = stations.find(item => item.id === selected) || stations[2];
      $$('[data-prod-station]', host).forEach(button => {
        const active = Number(button.dataset.prodStation) === selected;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      $('[data-prod-caption]', host).textContent = `${station.name} selected · ${station.value}${station.id === 3 ? ' · bottleneck candidate' : ' · station fixture'}`;
    };
    $$('[data-prod-station]', host).forEach(button => button.addEventListener('click', () => {
      selectStation(Number(button.dataset.prodStation));
      setStatus(host, button.classList.contains('red') ? 'bad' : button.classList.contains('yellow') ? 'busy' : 'good', `${button.textContent.trim().replace(/\s+/g, ' ')} selected`);
    }));
    $('[data-prod-diagnose]', host).addEventListener('click', event => {
      if (running) return;
      const button = event.currentTarget;
      running = true;
      timers.clear();
      button.disabled = true;
      $('[data-prod-answer]', host).innerHTML = '';
      $$('[data-prod-step]', host).forEach(step => step.className = 'tb-trace-step');
      setStatus(host, 'busy', 'Agent is choosing governed tools');
      toolSteps.forEach((step, index) => timers.later(() => {
        $$('[data-prod-step]', host).forEach((node, nodeIndex) => {
          node.classList.toggle('done', nodeIndex < index);
          node.classList.toggle('running', nodeIndex === index);
        });
        if (index === 2) selectStation(3);
      }, 150 + index * 300));
      timers.later(() => {
        $$('[data-prod-step]', host).forEach(node => { node.classList.remove('running'); node.classList.add('done'); });
        $('[data-prod-answer]', host).innerHTML = `<div class="tb-copilot-answer"><b>Grounded diagnosis · 98% fixture confidence</b><br>FINAL ASSY 1 is producing 2 of 7 target units/day. The held sample units share a new E-Box PCB-C path with solder-quality defects; material availability, station machines, and safety remain nominal. Inspect the PCB-C lot and move electrical screening upstream before executing a recovery plan.</div>`;
        setStatus(host, 'good', 'Diagnosis complete · 5 tool results · evidence retained');
        button.textContent = 'Run diagnosis again';
        button.disabled = false;
        running = false;
      }, 1740);
    });
    return () => { running = false; timers.clear(); };
  }

  function videoStudio(spec, host, head, ctx) {
    const timers = makeTimers(ctx);
    let source = { name: 'assembly-walkthrough-demo.mp4', size: '14.8 MB', duration: '00:38', kind: 'fixture' };
    let provider = 'auto', objectUrl = '', history = [];
    host.innerHTML = head + `<div class="tb-shell">
      <div class="tb-toolbar">
        <div class="tb-actions"><label class="tb-button" style="display:inline-flex;align-items:center">Choose local video<input data-video-file type="file" accept="video/*" style="position:absolute;width:1px;height:1px;opacity:0"></label><button class="tb-button" data-video-fixture>Load demo fixture</button></div>
        <div class="tb-segments" role="group" aria-label="Analysis provider"><button class="active" data-video-provider="auto">Auto</button><button data-video-provider="agy">Local agy</button><button data-video-provider="gemini">Gemini SDK</button></div>
      </div>
      <div class="tb-video-layout">
        <section class="tb-panel"><div class="tb-panel-head"><b>Local video preview</b><span data-video-meta>${html(source.name)} · ${html(source.duration)}</span></div>
          <div class="tb-video-preview" data-video-preview><div class="tb-video-fixture" data-video-fixture-view><div class="tb-scene-object"></div></div></div>
          <div class="tb-video-timeline">${[['00:00','Establishing'],['00:09','Assembly'],['00:21','Close detail'],['00:31','Walk-away']].map((shot,index) => `<button class="tb-video-shot${index === 0 ? ' active' : ''}" data-video-shot="${index}">${shot[0]}<br>${shot[1]}</button>`).join('')}</div>
        </section>
        <aside class="tb-panel"><div class="tb-panel-head"><b>Structured scene report</b><span class="tb-status" data-tb-status>Ready for local fixture</span></div><div class="tb-panel-body">
          <button class="tb-button primary" data-video-analyze style="width:100%">Run structured analysis</button>
          <div class="tb-report" data-video-report style="margin-top:10px"><div class="tb-report-section"><small>Awaiting analysis</small><p>The repository workflow uploads a temporary local file, selects Antigravity agy or Gemini, validates a JSON scene schema, and stores completed reports in SQLite.</p></div></div>
          <div class="tb-history" data-video-history></div>
        </div></aside>
      </div>
    </div>`;
    const renderSource = () => {
      $('[data-video-meta]', host).textContent = `${source.name} · ${source.size}${source.duration ? ` · ${source.duration}` : ''}`;
    };
    const clearObjectUrl = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = '';
    };
    $('[data-video-file]', host).addEventListener('change', event => {
      const file = event.currentTarget.files && event.currentTarget.files[0];
      if (!file) return;
      clearObjectUrl();
      objectUrl = URL.createObjectURL(file);
      source = { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, duration: '', kind: 'local-preview' };
      $('[data-video-preview]', host).innerHTML = `<video controls muted playsinline src="${html(objectUrl)}" aria-label="Local video preview"></video>`;
      renderSource();
      setStatus(host, 'good', 'Local preview ready · file remains in this browser');
    });
    $('[data-video-fixture]', host).addEventListener('click', () => {
      clearObjectUrl();
      source = { name: 'assembly-walkthrough-demo.mp4', size: '14.8 MB', duration: '00:38', kind: 'fixture' };
      $('[data-video-preview]', host).innerHTML = '<div class="tb-video-fixture" data-video-fixture-view><div class="tb-scene-object"></div></div>';
      renderSource();
      setStatus(host, 'good', 'Deterministic demo clip fixture loaded');
    });
    $$('[data-video-provider]', host).forEach(button => button.addEventListener('click', () => {
      provider = button.dataset.videoProvider;
      $$('[data-video-provider]', host).forEach(item => item.classList.toggle('active', item === button));
      const label = provider === 'auto' ? 'Auto chooses local agy first, then configured Gemini' : provider === 'agy' ? 'Antigravity agy provider selected' : 'Direct Gemini SDK provider selected';
      setStatus(host, 'good', label);
    }));
    $$('[data-video-shot]', host).forEach(button => button.addEventListener('click', () => {
      $$('[data-video-shot]', host).forEach(item => item.classList.toggle('active', item === button));
      setStatus(host, 'good', `Scene ${Number(button.dataset.videoShot) + 1} selected in local timeline`);
    }));
    $('[data-video-analyze]', host).addEventListener('click', event => {
      const button = event.currentTarget;
      timers.clear();
      button.disabled = true;
      $('[data-video-report]', host).innerHTML = '<div class="tb-report-section"><small>Schema validation</small><b>Preparing temporary upload</b><p>Checking media metadata and structured response fields…</p></div>';
      setStatus(host, 'busy', `Running browser-safe ${provider} workflow simulation`);
      timers.later(() => {
        $('[data-video-report]', host).innerHTML = `<div class="tb-report-section"><small>Summary</small><b>Technical assembly walkthrough</b><p>A presenter moves from a wide establishing view to an assembly close-up, then closes on the completed sample.</p></div>
          <div class="tb-report-section"><small>Scene segmentation</small><b>4 scenes · 00:38 fixture duration</b><p>00:00 wide context · 00:09 assembly action · 00:21 detail inspection · 00:31 closing movement.</p></div>
          <div class="tb-report-section"><small>Structured entities</small><b>work surface · component · presenter</b><p>No OCR text or identity data is retained in this deterministic portfolio report.</p></div>`;
        history.unshift({ name: source.name, provider: provider === 'auto' ? 'auto → local fixture' : provider, time: 'just now' });
        $('[data-video-history]', host).innerHTML = `<div class="tb-jt-tree-label">Analysis history · SQLite-shaped preview</div>${history.slice(0, 3).map(item => `<div class="tb-history-row"><b>${html(item.name)}</b><span>${html(item.provider)} · ${html(item.time)}</span></div>`).join('')}`;
        setStatus(host, 'good', `Structured report complete · ${source.kind === 'fixture' ? 'deterministic fixture' : 'interface simulation for local preview'}`);
        button.disabled = false;
      }, 850);
    });
    renderSource();
    return () => { timers.clear(); clearObjectUrl(); };
  }

  function storyPlatform(spec, host, head) {
    const scenarios = {
      energy: {
        name: 'Offshore service loop', industry: 'Energy · starter fixture',
        steps: [
          ['Define', 'Service objective', 'Frame a lifecycle outcome and the evidence required.'],
          ['Design', 'Assembly revision', 'Connect the revised design object to the story.'],
          ['Realize', 'Work plan', 'Expose the manufacturing plan and readiness signal.'],
          ['Realize', 'Quality gate', 'Show the check that protects the next handoff.'],
          ['Operate', 'Field signal', 'Bring the operating observation into context.'],
          ['Improve', 'Root cause', 'Trace the signal back to the affected definition.'],
          ['Improve', 'Closed loop', 'Publish the learning as the new lifecycle state.']
        ]
      },
      mobility: {
        name: 'Battery change journey', industry: 'Mobility · starter fixture',
        steps: [
          ['Define', 'Range target', 'Set the measurable product intent.'],
          ['Design', 'Module update', 'Select the revised battery module definition.'],
          ['Design', 'Impact review', 'Connect thermal and packaging implications.'],
          ['Realize', 'Cell setup', 'Show the updated production instruction.'],
          ['Operate', 'Fleet sample', 'Bring one anonymized operating signal into view.'],
          ['Improve', 'Pattern found', 'Relate field evidence to the changed module.'],
          ['Improve', 'Revision released', 'Close the story with verified learning.']
        ]
      },
      aerospace: {
        name: 'Flight-control lifecycle', industry: 'Aerospace · starter fixture',
        steps: [
          ['Define', 'Mission need', 'Establish a traceable capability objective.'],
          ['Design', 'Control revision', 'Open the changed product definition.'],
          ['Design', 'Simulation proof', 'Connect the model evidence to the decision.'],
          ['Realize', 'Build instruction', 'Translate intent into a governed operation.'],
          ['Realize', 'Inspection result', 'Capture the acceptance evidence.'],
          ['Operate', 'Service finding', 'Add a sanitized field observation.'],
          ['Improve', 'Lesson published', 'Return the evidence to the next definition.']
        ]
      }
    };
    let scenario = 'energy', active = 0, mode = 'view', stageMode = '3d', published = true;
    const working = Object.fromEntries(Object.entries(scenarios).map(([key, value]) => [key, value.steps.map(step => [...step])]));
    host.innerHTML = head + `<div class="tb-shell">
      <div class="tb-toolbar">
        <div class="tb-segments" role="group" aria-label="Platform mode"><button class="active" data-story-mode="view">View</button><button data-story-mode="edit">Edit</button></div>
        <div class="tb-actions"><div class="tb-segments" role="group" aria-label="Journey rendering"><button class="active" data-story-stage-mode="3d">3D map</button><button data-story-stage-mode="2d">2D journey</button></div><span class="tb-status good" data-tb-status>Published fixture · shared local state</span></div>
      </div>
      <div class="tb-story-shell">
        <nav class="tb-story-nav"><div class="tb-jt-tree-label">Scenario library</div>${Object.entries(scenarios).map(([key, value]) => `<button class="tb-scenario-card${key === scenario ? ' active' : ''}" data-story-scenario="${key}"><b>${html(value.name)}</b><span>${html(value.industry)} · 7 steps</span></button>`).join('')}</nav>
        <section class="tb-story-stage" data-story-stage data-mode="3d"><div class="tb-journey" data-story-journey></div><div class="tb-plant-caption" data-story-caption></div></section>
        <aside class="tb-story-inspector"><div class="tb-jt-tree-label">Story step</div><span class="tb-pill" data-story-platform></span><h5 class="tb-story-title" data-story-title></h5><p class="tb-story-copy" data-story-copy></p>
          <label class="tb-label" style="margin-top:13px">Editor caption<textarea class="tb-textarea" data-story-edit-copy disabled></textarea></label>
          <div class="tb-reorder"><button class="tb-button" data-story-earlier disabled>Move earlier</button><button class="tb-button" data-story-later disabled>Move later</button></div>
          <button class="tb-button primary" data-story-publish style="width:100%;margin-top:8px" disabled>Unpublish fixture</button>
          <div class="tb-evidence-list" style="margin-top:12px"><div class="tb-evidence-row"><b>Storage</b><span>SQLite-shaped local fixture</span><i class="tb-pill">local</i></div><div class="tb-evidence-row"><b>Integrity</b><span>7 steps · 6 connections</span><i class="tb-pill good">valid</i></div></div>
        </aside>
      </div>
    </div>`;

    const render = focus => {
      const steps = working[scenario], selected = steps[active];
      $('[data-story-journey]', host).innerHTML = steps.map((step, index) => `<button class="tb-journey-node${index === active ? ' active' : ''}" data-story-step="${index}" aria-pressed="${index === active}"><b>${html(step[1])}</b><span>${String(index + 1).padStart(2, '0')} · ${html(step[0])}</span></button>`).join('');
      $('[data-story-caption]', host).textContent = `${scenarios[scenario].name} · ${stageMode === '3d' ? 'free-orbit concept map' : 'responsive semantic journey'} · ${published ? 'published' : 'draft preview'}`;
      $('[data-story-platform]', host).textContent = `${selected[0]} · step ${active + 1} of ${steps.length}`;
      $('[data-story-title]', host).textContent = selected[1];
      $('[data-story-copy]', host).textContent = selected[2];
      $('[data-story-edit-copy]', host).value = selected[2];
      $('[data-story-edit-copy]', host).disabled = mode !== 'edit';
      $('[data-story-earlier]', host).disabled = mode !== 'edit' || active === 0;
      $('[data-story-later]', host).disabled = mode !== 'edit' || active === steps.length - 1;
      $('[data-story-publish]', host).disabled = mode !== 'edit';
      $('[data-story-publish]', host).textContent = published ? 'Unpublish fixture' : 'Publish fixture';
      $$('[data-story-step]', host).forEach(button => button.addEventListener('click', () => {
        active = Number(button.dataset.storyStep);
        render(true);
      }));
      if (focus) {
        const button = $(`[data-story-step="${active}"]`, host);
        if (button) button.focus({ preventScroll: true });
      }
    };
    $$('[data-story-scenario]', host).forEach(button => button.addEventListener('click', () => {
      scenario = button.dataset.storyScenario;
      active = 0;
      $$('[data-story-scenario]', host).forEach(item => item.classList.toggle('active', item === button));
      render(false);
      setStatus(host, 'good', `${scenarios[scenario].name} loaded · ${published ? 'published' : 'draft'} fixture`);
    }));
    $$('[data-story-mode]', host).forEach(button => button.addEventListener('click', () => {
      mode = button.dataset.storyMode;
      $$('[data-story-mode]', host).forEach(item => item.classList.toggle('active', item === button));
      render(false);
      setStatus(host, mode === 'edit' ? 'busy' : 'good', mode === 'edit' ? 'Editor enabled · changes remain in browser fixture' : 'Playback view · semantic navigation enabled');
    }));
    $$('[data-story-stage-mode]', host).forEach(button => button.addEventListener('click', () => {
      stageMode = button.dataset.storyStageMode;
      $('[data-story-stage]', host).dataset.mode = stageMode;
      $$('[data-story-stage-mode]', host).forEach(item => item.classList.toggle('active', item === button));
      render(false);
    }));
    $('[data-story-edit-copy]', host).addEventListener('input', event => {
      working[scenario][active][2] = event.currentTarget.value;
      $('[data-story-copy]', host).textContent = event.currentTarget.value;
      published = false;
      setStatus(host, 'busy', 'Draft changed · preview is not published');
    });
    $('[data-story-earlier]', host).addEventListener('click', () => {
      if (active < 1) return;
      const steps = working[scenario];
      [steps[active - 1], steps[active]] = [steps[active], steps[active - 1]];
      active--;
      published = false;
      render(true);
      setStatus(host, 'busy', 'Step reordered · connection integrity preserved');
    });
    $('[data-story-later]', host).addEventListener('click', () => {
      const steps = working[scenario];
      if (active >= steps.length - 1) return;
      [steps[active + 1], steps[active]] = [steps[active], steps[active + 1]];
      active++;
      published = false;
      render(true);
      setStatus(host, 'busy', 'Step reordered · connection integrity preserved');
    });
    $('[data-story-publish]', host).addEventListener('click', () => {
      published = !published;
      render(false);
      setStatus(host, published ? 'good' : 'busy', published ? 'Published fixture · 7 steps validated' : 'Fixture moved to draft preview');
    });
    render(false);
    return () => {};
  }

  function mobaPreview(spec, host, head, ctx) {
    const timers = makeTimers(ctx);
    const champions = [
      ['auditor', 'The Auditor', 'control · causal marks'], ['maintainer', 'Maintainer', 'fighter · repair field'],
      ['forecaster', 'Forecaster', 'mage · prediction lane'], ['negotiator', 'Negotiator', 'support · terms field'],
      ['architect', 'Architect', 'tank · structure wall'], ['broker', 'Broker', 'assassin · position swap'],
      ['curator', 'Curator', 'support · status archive'], ['operator', 'Operator', 'fighter · command chain'],
      ['compiler', 'Compiler', 'mage · clause stack'], ['arbiter', 'Arbiter', 'tank · verdict zone'],
      ['custodian', 'Custodian', 'support · safeguard'], ['evangelist', 'Evangelist', 'marksman · momentum']
    ];
    const clauses = [
      ['oracle', 'Oracle item set complete', 'All six selected item clauses are active.'],
      ['runes', 'Five-rune contract complete', 'Every required rune is equipped.'],
      ['traits', 'Two authored traits active', 'Champion/build traits match the preset.'],
      ['status', 'Target has W formation status', 'The prerequisite target state exists before Q → R.']
    ];
    let champion = 'auditor', feed = 'Oracle is ready. Execute W → Q → R or press the showcase button.';
    host.innerHTML = head + `<div class="tb-shell tb-moba-shell">
      <div class="tb-moba-top">
        <aside class="tb-moba-roster"><div class="tb-moba-label">12 original champions</div><div data-moba-roster style="max-height:445px;overflow:auto"></div></aside>
        <section class="tb-arena" aria-label="RUNE DIFF combat preview">
          <div class="tb-river"></div><div class="tb-player-unit" data-moba-player></div>
          ${[[22,22],[14,38],[25,50],[12,65],[31,72]].map(([right,top], index) => `<div class="tb-enemy" data-moba-enemy="${index}" style="right:${right}%;top:${top}%" aria-hidden="true"></div>`).join('')}
          <div class="tb-arena-hud"><span class="tb-pill" data-moba-champion>The Auditor</span><span class="tb-pill good" data-moba-engine>Triplicate engine armed</span></div>
          <div class="tb-moba-feed" data-moba-feed><b>Oracle</b> · ${html(feed)}</div>
        </section>
        <aside class="tb-moba-build"><div class="tb-moba-label">Triplicate Liability Engine</div><div data-moba-clauses>${clauses.map(([key,title,copy]) => `<label class="tb-clause"><input type="checkbox" data-moba-clause="${key}" checked><span><b>${html(title)}</b>${html(copy)}</span><output>met</output></label>`).join('')}</div>
          <div class="tb-ability-row"><button class="tb-ability" data-moba-ability="W" aria-label="Cast W">W</button><button class="tb-ability" data-moba-ability="Q" aria-label="Cast Q">Q</button><button class="tb-ability" data-moba-ability="E" aria-label="Cast E">E</button><button class="tb-ability" data-moba-ability="R" aria-label="Cast R">R</button></div>
          <button class="tb-button primary" data-moba-cast style="width:100%;margin-top:9px;background:#b68cff;border-color:#b68cff;color:#100d18">Execute Oracle combo</button>
          <div class="tb-evidence-list" style="margin-top:10px"><div class="tb-evidence-row" style="background:#171b27"><b>Damage</b><span data-moba-damage style="color:#d9dfec">420 base preview</span><i class="tb-pill">causal</i></div><div class="tb-evidence-row" style="background:#171b27"><b>Armor</b><span data-moba-armor style="color:#d9dfec">100 effective</span><i class="tb-pill">target</i></div></div>
        </aside>
      </div>
    </div>`;
    const selectedChampion = () => champions.find(item => item[0] === champion) || champions[0];
    const ready = () => $$('[data-moba-clause]', host).every(input => input.checked);
    const renderRoster = () => {
      $('[data-moba-roster]', host).innerHTML = champions.map(([key,name,role]) => `<button class="tb-champion${key === champion ? ' active' : ''}" data-moba-champion-id="${key}" aria-pressed="${key === champion}"><i>${html(name.split(' ').map(word => word[0]).join('').slice(0,2))}</i><span><b>${html(name)}</b><span>${html(role)}</span></span></button>`).join('');
      $$('[data-moba-champion-id]', host).forEach(button => button.addEventListener('click', () => {
        champion = button.dataset.mobaChampionId;
        renderRoster();
        $('[data-moba-champion]', host).textContent = selectedChampion()[1];
        $('[data-moba-feed]', host).innerHTML = `<b>${html(selectedChampion()[1])}</b> · Oracle preset loaded; every clause remains independently inspectable.`;
      }));
    };
    const renderClauses = () => {
      const armed = ready();
      $$('[data-moba-clause]', host).forEach(input => {
        const output = $('output', input.closest('.tb-clause'));
        output.textContent = input.checked ? 'met' : 'missing';
        output.style.color = input.checked ? '#79e7c8' : '#ef7588';
      });
      $('[data-moba-engine]', host).className = `tb-pill ${armed ? 'good' : 'bad'}`;
      $('[data-moba-engine]', host).textContent = armed ? 'Triplicate engine armed' : 'Triplicate engine blocked';
      $('[data-moba-damage]', host).textContent = armed ? '840 after clause multiplier' : '420 · multiplier withheld';
      $('[data-moba-armor]', host).textContent = armed ? '50 · halved by full contract' : '100 · unchanged';
    };
    $$('[data-moba-clause]', host).forEach(input => input.addEventListener('change', () => {
      renderClauses();
      $('[data-moba-feed]', host).innerHTML = ready() ? '<b>Clause resolver</b> · Every prerequisite is present. The engine may double damage and halve effective armor.' : '<b>Clause resolver</b> · At least one prerequisite is absent, so no Triplicate multiplier is applied.';
    }));
    const cast = ability => {
      timers.clear();
      const armed = ready();
      const player = $('[data-moba-player]', host);
      player.classList.add('casting');
      $$('[data-moba-enemy]', host).forEach(enemy => enemy.classList.remove('hit'));
      timers.later(() => $$('[data-moba-enemy]', host).forEach(enemy => enemy.classList.add('hit')), 130);
      timers.later(() => { player.classList.remove('casting'); $$('[data-moba-enemy]', host).forEach(enemy => enemy.classList.remove('hit')); }, 620);
      if (ability === 'COMBO') {
        $('[data-moba-feed]', host).innerHTML = armed
          ? `<b>W → Q → R · 1,460 resolved damage</b><br>W applied the formation status → Oracle items, runes, and traits all matched → Triplicate doubled the authored damage term and halved effective armor. Five-role formation defeated in this deterministic preview.`
          : `<b>W → Q → R · 510 resolved damage</b><br>The resolver found an incomplete contract. The cast landed, but Triplicate correctly withheld both the damage multiplier and armor reduction.`;
      } else {
        const descriptions = { W: 'Formation field applied the target-status prerequisite.', Q: 'Primary projectile consumed the current authored status.', E: 'Reposition and shield preview resolved.', R: 'Three-pulse ultimate preview resolved against the formation.' };
        $('[data-moba-feed]', host).innerHTML = `<b>${html(selectedChampion()[1])} · ${ability}</b><br>${html(descriptions[ability])}`;
      }
    };
    $('[data-moba-cast]', host).addEventListener('click', () => cast('COMBO'));
    $$('[data-moba-ability]', host).forEach(button => button.addEventListener('click', () => cast(button.dataset.mobaAbility)));
    renderRoster();
    renderClauses();
    return () => timers.clear();
  }

  function racingGame(spec, host, head, ctx) {
    const timers = makeTimers(ctx);
    const cars = {
      coupe: { name: 'Siemens GT Coupe', mass: '1,500 kg', gears: 6, max: 253, zero: '4.91 s' },
      indy: { name: 'Siemens Apex IR-27', mass: '765 kg', gears: 7, max: 292, zero: '3.46 s' }
    };
    const tracks = {
      eifel: { name: 'Eifel Ring', length: 6.27, note: 'original endurance layout', path: 'M52 167 C18 120 36 43 102 37 C151 5 241 30 258 89 C286 151 223 198 166 178 C122 208 72 196 52 167 Z' },
      spa: { name: 'Spa-Francorchamps', length: 7.004, note: 'public-map centerline', path: 'M48 178 C22 137 47 106 76 91 C56 54 86 19 134 36 C174 8 216 42 207 83 C268 77 282 130 247 153 C213 180 172 184 139 167 C103 203 68 201 48 178 Z' },
      siemens: { name: 'Siemens Grand Prix', length: 3.91, note: 'original technical GP', path: 'M48 166 C19 111 52 52 102 52 L180 31 C237 19 276 68 246 112 L218 151 C192 188 133 179 106 150 C84 190 60 187 48 166 Z' },
      brianza: { name: 'Brianza Classic GP', length: 5.26, note: 'original fast circuit', path: 'M41 151 C26 93 69 38 126 39 L230 45 C273 51 282 105 249 126 L208 157 C176 182 119 173 93 151 C75 176 48 176 41 151 Z' }
    };
    let car = 'coupe', track = 'eifel', running = false, speed = 0, progress = 0, lap = 1, elapsed = 0, steer = 0, throttle = false, brake = false, interval = 0;
    host.innerHTML = head + `<div class="tb-shell tb-race-shell">
      <div class="tb-race-top">
        <aside class="tb-race-menu"><div class="tb-moba-label">Vehicle</div><div data-race-cars></div><div class="tb-moba-label" style="margin-top:14px">Circuit</div><div data-race-tracks></div><button class="tb-button primary" data-race-start style="width:100%;margin-top:10px;background:#35d0b5;border-color:#35d0b5;color:#071512">Start time trial</button></aside>
        <section class="tb-race-view" data-race-view tabindex="0" aria-label="Playable Eifel Apex time-trial preview">
          <div class="tb-race-hud"><div><small>Speed</small><b><span data-race-speed>000</span> km/h</b></div><div><small>Gear</small><b data-race-gear>N</b></div><div><small>Lap / sector</small><b><span data-race-lap>1</span> / <span data-race-sector>01</span></b></div></div>
          <svg class="tb-race-track" data-race-svg viewBox="0 0 300 220" role="img" aria-label="Circuit minimap"><path class="base" data-race-path></path><path class="road" data-race-path-road></path><path class="line" data-race-path-line></path><circle data-race-car cx="48" cy="166" r="5"></circle></svg>
          <div class="tb-race-controls"><button class="tb-race-control" data-race-control="left">A / ←<br>steer</button><button class="tb-race-control" data-race-control="throttle">W / ↑<br>throttle</button><button class="tb-race-control" data-race-control="brake">S / ↓<br>brake</button><button class="tb-race-control" data-race-control="right">D / →<br>steer</button></div>
        </section>
        <aside class="tb-race-telemetry"><div class="tb-moba-label">Vehicle state · supporting telemetry</div>
          <div class="tb-gauge"><div class="tb-gauge-head"><span>RPM</span><b data-race-rpm>900</b></div><div class="tb-gauge-bar"><i data-race-rpm-bar></i></div></div>
          <div class="tb-gauge"><div class="tb-gauge-head"><span>Throttle</span><b data-race-throttle>0%</b></div><div class="tb-gauge-bar"><i data-race-throttle-bar></i></div></div>
          <div class="tb-gauge"><div class="tb-gauge-head"><span>Brake</span><b data-race-brake>0%</b></div><div class="tb-gauge-bar"><i data-race-brake-bar></i></div></div>
          <div class="tb-evidence-list"><div class="tb-evidence-row" style="background:#182126"><b>Vehicle</b><span data-race-car-name></span><i class="tb-pill">physics</i></div><div class="tb-evidence-row" style="background:#182126"><b>Circuit</b><span data-race-track-name></span><i class="tb-pill">12 sectors</i></div><div class="tb-evidence-row" style="background:#182126"><b>Timer</b><span data-race-time>00:00.000</span><i class="tb-pill good">valid</i></div></div>
          <div class="tb-sector-grid" data-race-sectors>${Array.from({ length: 12 }, (_, index) => `<div class="tb-sector${index === 0 ? ' active' : ''}">${String(index + 1).padStart(2, '0')}</div>`).join('')}</div>
          <span class="tb-status good" data-tb-status style="margin-top:12px">Menu ready · choose car and circuit</span>
        </aside>
      </div>
    </div>`;
    const renderMenu = () => {
      $('[data-race-cars]', host).innerHTML = Object.entries(cars).map(([key, item]) => `<button class="tb-track-card${key === car ? ' active' : ''}" data-race-car-select="${key}"><b>${html(item.name)}</b><span>${html(item.mass)} · 0–100 ${html(item.zero)}</span></button>`).join('');
      $('[data-race-tracks]', host).innerHTML = Object.entries(tracks).map(([key, item]) => `<button class="tb-track-card${key === track ? ' active' : ''}" data-race-track-select="${key}"><b>${html(item.name)}</b><span>${item.length} km · ${html(item.note)}</span></button>`).join('');
      $('[data-race-car-name]', host).textContent = cars[car].name;
      $('[data-race-track-name]', host).textContent = `${tracks[track].name} · ${tracks[track].length} km`;
      ['[data-race-path]', '[data-race-path-road]', '[data-race-path-line]'].forEach(selector => $(selector, host).setAttribute('d', tracks[track].path));
      $$('[data-race-car-select]', host).forEach(button => button.addEventListener('click', () => { car = button.dataset.raceCarSelect; resetRun(); renderMenu(); setStatus(host, 'good', `${cars[car].name} selected · ${cars[car].gears}-speed automatic`); }));
      $$('[data-race-track-select]', host).forEach(button => button.addEventListener('click', () => { track = button.dataset.raceTrackSelect; resetRun(); renderMenu(); setStatus(host, 'good', `${tracks[track].name} selected · ${tracks[track].length} km · 12 sectors`); }));
    };
    const formatTime = seconds => {
      const minutes = Math.floor(seconds / 60), rest = seconds - minutes * 60;
      return `${String(minutes).padStart(2, '0')}:${rest.toFixed(3).padStart(6, '0')}`;
    };
    const renderState = () => {
      const ratio = clamp(speed / cars[car].max, 0, 1);
      const gear = speed < 2 ? 'N' : Math.min(cars[car].gears, Math.max(1, Math.ceil(ratio * cars[car].gears)));
      const rpm = speed < 2 ? 900 : Math.round(2800 + ((ratio * 9200) % 6200));
      const sector = Math.min(11, Math.floor(progress * 12));
      $('[data-race-speed]', host).textContent = String(Math.round(speed)).padStart(3, '0');
      $('[data-race-gear]', host).textContent = gear;
      $('[data-race-rpm]', host).textContent = String(rpm);
      $('[data-race-rpm-bar]', host).style.setProperty('--value', `${clamp(rpm / 120, 4, 100)}%`);
      $('[data-race-throttle]', host).textContent = throttle ? '100%' : '0%';
      $('[data-race-throttle-bar]', host).style.setProperty('--value', throttle ? '100%' : '0%');
      $('[data-race-brake]', host).textContent = brake ? '100%' : '0%';
      $('[data-race-brake-bar]', host).style.setProperty('--value', brake ? '100%' : '0%');
      $('[data-race-lap]', host).textContent = lap;
      $('[data-race-sector]', host).textContent = String(sector + 1).padStart(2, '0');
      $('[data-race-time]', host).textContent = formatTime(elapsed);
      $$('[data-race-sectors] .tb-sector', host).forEach((node, index) => { node.classList.toggle('done', index < sector); node.classList.toggle('active', index === sector); });
      const angle = progress * Math.PI * 2;
      const variation = track === 'spa' ? Math.sin(angle * 3) * 12 : track === 'siemens' ? Math.sin(angle * 2) * 8 : track === 'brianza' ? Math.cos(angle * 2) * 7 : Math.sin(angle * 4) * 5;
      const x = 150 + Math.cos(angle) * (102 + variation * .35);
      const y = 110 + Math.sin(angle) * (66 + variation) + steer * 3;
      $('[data-race-car]', host).setAttribute('cx', x.toFixed(1));
      $('[data-race-car]', host).setAttribute('cy', y.toFixed(1));
    };
    const tick = () => {
      if (!running) return;
      elapsed += .08;
      if (throttle) speed += car === 'indy' ? 8.6 : 6.5;
      else speed -= speed > 160 ? 1.7 : .8;
      if (brake) speed -= car === 'indy' ? 15 : 13;
      speed = clamp(speed, 0, cars[car].max);
      const previous = progress;
      progress = (progress + (speed / tracks[track].length) * .00015) % 1;
      if (progress < previous) { lap++; setStatus(host, 'good', `Lap ${lap - 1} complete · ${formatTime(elapsed)} · best stored per car/circuit`); elapsed = 0; }
      renderState();
    };
    const stopInterval = () => { if (interval) clearInterval(interval); interval = 0; };
    const resetRun = () => {
      running = false; speed = 0; progress = 0; lap = 1; elapsed = 0; steer = 0; throttle = false; brake = false;
      stopInterval();
      $('[data-race-start]', host).textContent = 'Start time trial';
      $$('[data-race-control]', host).forEach(button => button.classList.remove('active'));
      renderState();
    };
    const setControl = (control, active) => {
      if (control === 'throttle') throttle = active;
      if (control === 'brake') brake = active;
      if (control === 'left') steer = active ? -1 : (steer < 0 ? 0 : steer);
      if (control === 'right') steer = active ? 1 : (steer > 0 ? 0 : steer);
      const button = $(`[data-race-control="${control}"]`, host);
      if (button) button.classList.toggle('active', active);
      renderState();
    };
    $('[data-race-start]', host).addEventListener('click', event => {
      running = !running;
      event.currentTarget.textContent = running ? 'Pause time trial' : 'Resume time trial';
      if (running) {
        if (!interval) interval = setInterval(tick, 80);
        speed = Math.max(speed, 28);
        $('[data-race-view]', host).focus({ preventScroll: true });
        setStatus(host, 'good', `Lap live · ${cars[car].name} at ${tracks[track].name}`);
      } else setStatus(host, 'busy', 'Time trial paused · lap state retained');
    });
    $$('[data-race-control]', host).forEach(button => {
      const control = button.dataset.raceControl;
      button.addEventListener('pointerdown', event => { event.preventDefault(); setControl(control, true); });
      button.addEventListener('pointerup', () => setControl(control, false));
      button.addEventListener('pointercancel', () => setControl(control, false));
      button.addEventListener('pointerleave', () => setControl(control, false));
      button.addEventListener('click', () => {
        setControl(control, true);
        timers.later(() => setControl(control, false), 700);
      });
    });
    const controlForKey = key => ({ w: 'throttle', ArrowUp: 'throttle', s: 'brake', ArrowDown: 'brake', a: 'left', ArrowLeft: 'left', d: 'right', ArrowRight: 'right' })[key];
    $('[data-race-view]', host).addEventListener('keydown', event => { const control = controlForKey(event.key); if (control) { event.preventDefault(); setControl(control, true); } });
    $('[data-race-view]', host).addEventListener('keyup', event => { const control = controlForKey(event.key); if (control) { event.preventDefault(); setControl(control, false); } });
    renderMenu();
    renderState();
    return () => { running = false; timers.clear(); stopInterval(); };
  }

  window.PROJECT_WORKBENCHES = Object.assign(window.PROJECT_WORKBENCHES || {}, {
    changeCockpit,
    jtWidget,
    mesDeck,
    mendixExpression,
    crmJdbc,
    cadArtifact,
    productionCopilot,
    videoStudio,
    storyPlatform,
    mobaPreview,
    racingGame
  });
})();
