(function () {
  'use strict';

  const PREFIX = 'pwb';
  let uidSeed = 0;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function uid(label) {
    uidSeed += 1;
    return `${PREFIX}-${label}-${uidSeed}`;
  }

  function mount(host, head, type, label, body) {
    if (!host) throw new Error(`PROJECT_WORKBENCHES.${type} requires a host element.`);
    host.innerHTML = `${head || ''}<section class="${PREFIX} ${PREFIX}--${esc(type)}" data-pwb-root="${esc(type)}" aria-label="${esc(label)}">${body}</section>`;
    return host.querySelector(`[data-pwb-root="${type}"]`);
  }

  function createSession(root, ctx) {
    const controller = new AbortController();
    const timers = new Set();
    const intervals = new Set();
    const reduced = Boolean(ctx && ctx.reducedMotion) || Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    let generation = 0;

    function on(target, eventName, handler, options) {
      if (!target) return;
      target.addEventListener(eventName, handler, Object.assign({}, options || {}, { signal: controller.signal }));
    }

    function later(callback, delay) {
      const id = window.setTimeout(function () {
        timers.delete(id);
        callback();
      }, reduced ? Math.min(35, Math.max(0, delay * 0.06)) : delay);
      timers.add(id);
      return id;
    }

    function every(callback, delay) {
      const id = window.setInterval(callback, reduced ? Math.max(180, delay) : delay);
      intervals.add(id);
      return id;
    }

    function clearTimer(id) {
      window.clearTimeout(id);
      timers.delete(id);
    }

    function clearEvery(id) {
      window.clearInterval(id);
      intervals.delete(id);
    }

    function cancelTimers() {
      timers.forEach(window.clearTimeout);
      timers.clear();
    }

    function nextGeneration() {
      generation += 1;
      cancelTimers();
      return generation;
    }

    function isCurrent(value) {
      return value === generation && root.isConnected;
    }

    function cleanup() {
      generation += 1;
      controller.abort();
      timers.forEach(window.clearTimeout);
      intervals.forEach(window.clearInterval);
      timers.clear();
      intervals.clear();
    }

    return { on, later, every, clearTimer, clearEvery, cancelTimers, nextGeneration, isCurrent, cleanup, reduced };
  }

  function setStatus(node, text, tone) {
    if (!node) return;
    node.textContent = text;
    node.dataset.tone = tone || 'neutral';
  }

  function vision(spec, host, head, ctx) {
    const thresholdId = uid('vision-threshold');
    const root = mount(host, head, 'vision', (spec && spec.title) || 'Vision inspection workbench', `
      <div class="pwb__toolbar">
        <div class="pwb__status" data-status data-tone="neutral" role="status" aria-live="polite">Camera paused · sample fixture</div>
        <div class="pwb__actions">
          <button class="pwb__button" type="button" data-stream aria-pressed="false">Start frame stream</button>
          <button class="pwb__button pwb__button--primary" type="button" data-inject>Inject surface defect</button>
        </div>
      </div>
      <div class="pwb-vision__controls">
        <label for="${thresholdId}">Capture threshold <output data-threshold-output for="${thresholdId}">92%</output></label>
        <input id="${thresholdId}" data-threshold type="range" min="70" max="99" value="92" step="1">
        <span>Detections below the threshold stay in the frame trace but do not create a review clip.</span>
      </div>
      <div class="pwb-vision__layout">
        <figure class="pwb__panel pwb-vision__viewer" aria-labelledby="${thresholdId}-caption">
          <figcaption id="${thresholdId}-caption" class="pwb__panel-title"><span>CAM-02 · line-side sample</span><span data-frame-label>Frame 0000</span></figcaption>
          <svg class="pwb-vision__frame" viewBox="0 0 720 360" role="img" aria-label="Synthetic bottling-line camera frame with five containers">
            <defs>
              <linearGradient id="${thresholdId}-belt" x1="0" x2="1"><stop stop-color="#172331"/><stop offset=".5" stop-color="#263746"/><stop offset="1" stop-color="#172331"/></linearGradient>
              <linearGradient id="${thresholdId}-glass" x1="0" x2="1"><stop stop-color="#a9e7db" stop-opacity=".22"/><stop offset=".5" stop-color="#dcfff8" stop-opacity=".62"/><stop offset="1" stop-color="#6dc8bc" stop-opacity=".18"/></linearGradient>
            </defs>
            <rect width="720" height="360" rx="12" class="pwb-vision__scene"/>
            <g opacity=".42" stroke="currentColor"><path d="M0 72H720M0 144H720M0 216H720"/><path d="M120 0V250M240 0V250M360 0V250M480 0V250M600 0V250"/></g>
            <rect x="0" y="250" width="720" height="82" fill="url(#${thresholdId}-belt)"/>
            <path d="M0 250H720M0 332H720" class="pwb-vision__belt-edge"/>
            ${[74, 204, 334, 464, 594].map(function (x, index) { return `
              <g class="pwb-vision__bottle" data-bottle="${index}" transform="translate(${x} 0)">
                <path d="M22 84h38v25c0 9 17 18 17 40v98c0 13-9 23-22 23H27c-13 0-22-10-22-23v-98c0-22 17-31 17-40z" fill="url(#${thresholdId}-glass)" stroke="currentColor" stroke-width="2"/>
                <rect x="26" y="71" width="30" height="17" rx="3" class="pwb-vision__cap"/>
                <path d="M10 183h61" class="pwb-vision__fill"/>
                <circle cx="53" cy="164" r="8" class="pwb-vision__defect-mark"/>
                <rect x="-5" y="62" width="92" height="216" rx="7" class="pwb-vision__box"/>
                <text x="0" y="54" class="pwb-vision__box-label">surface defect</text>
              </g>`; }).join('')}
            <path d="M28 25h42M28 25v42M692 25h-42M692 25v42M28 335h42M28 335v-42M692 335h-42M692 335v-42" class="pwb-vision__reticle"/>
            <text x="28" y="312" class="pwb-vision__stamp">SYNTHETIC FRAME · NO CUSTOMER IMAGERY</text>
          </svg>
          <div class="pwb-vision__kpis" aria-label="Inference measurements">
            <div><span>Inference</span><strong data-infer>18.0 ms</strong></div>
            <div><span>Top confidence</span><strong data-confidence>—</strong></div>
            <div><span>Captured</span><strong data-captured>0 clips</strong></div>
          </div>
        </figure>
        <aside class="pwb__panel pwb-vision__review" aria-label="Detection review">
          <div class="pwb__panel-title">Event review</div>
          <div data-review class="pwb-vision__review-empty">Inject a defect to exercise thresholding and local clip capture.</div>
        </aside>
      </div>
      <section class="pwb__panel pwb-vision__clips" aria-labelledby="${thresholdId}-clips">
        <div class="pwb__panel-title" id="${thresholdId}-clips">Local review clips <span data-clip-count>0</span></div>
        <div class="pwb-vision__clip-strip" data-clips><span class="pwb__empty">No event clips captured.</span></div>
      </section>`);

    const session = createSession(root, ctx);
    const status = root.querySelector('[data-status]');
    const streamButton = root.querySelector('[data-stream]');
    const threshold = root.querySelector('[data-threshold]');
    const bottles = Array.from(root.querySelectorAll('[data-bottle]'));
    let running = false;
    let streamId = 0;
    let frame = 0;
    let activeBottle = -1;
    let confidence = 0;
    const clips = [];
    let selectedClip = -1;

    function updateFrame() {
      frame += 1;
      root.querySelector('[data-frame-label]').textContent = `Frame ${String(frame).padStart(4, '0')}`;
      root.querySelector('[data-infer]').textContent = `${(16.8 + ((frame * 7) % 19) / 10).toFixed(1)} ms`;
      bottles.forEach(function (bottle, index) {
        bottle.classList.toggle('is-scanned', index === frame % bottles.length);
      });
    }

    function renderDetection() {
      const limit = Number(threshold.value);
      root.querySelector('[data-threshold-output]').textContent = `${limit}%`;
      root.querySelector('[data-confidence]').textContent = confidence ? `${confidence.toFixed(1)}%` : '—';
      bottles.forEach(function (bottle, index) {
        bottle.classList.toggle('has-defect', index === activeBottle);
        bottle.classList.toggle('is-captured', index === activeBottle && confidence >= limit);
      });
      if (activeBottle >= 0) {
        const captured = confidence >= limit;
        setStatus(status, captured ? `Defect ${confidence.toFixed(1)}% · clip captured locally` : `Defect ${confidence.toFixed(1)}% · below ${limit}% threshold`, captured ? 'danger' : 'warning');
      }
    }

    function renderReview() {
      const review = root.querySelector('[data-review]');
      const clip = clips[selectedClip];
      if (!clip) {
        review.className = 'pwb-vision__review-empty';
        review.textContent = 'Inject a defect to exercise thresholding and local clip capture.';
        return;
      }
      review.className = 'pwb-vision__review-card';
      review.innerHTML = `
        <div class="pwb-vision__review-frame"><span class="pwb-vision__review-bottle"></span><i></i></div>
        <dl class="pwb__facts">
          <div><dt>Event</dt><dd>${esc(clip.id)}</dd></div>
          <div><dt>Class</dt><dd>surface defect</dd></div>
          <div><dt>Confidence</dt><dd>${clip.confidence.toFixed(1)}%</dd></div>
          <div><dt>Frame range</dt><dd>${clip.start}–${clip.end}</dd></div>
        </dl>
        <p>Five synthetic frames retained in browser memory. No video or identifier leaves this page.</p>`;
    }

    function renderClips() {
      const strip = root.querySelector('[data-clips]');
      root.querySelector('[data-clip-count]').textContent = String(clips.length);
      root.querySelector('[data-captured]').textContent = `${clips.length} ${clips.length === 1 ? 'clip' : 'clips'}`;
      if (!clips.length) {
        strip.innerHTML = '<span class="pwb__empty">No event clips captured.</span>';
        renderReview();
        return;
      }
      strip.innerHTML = clips.map(function (clip, index) {
        return `<button type="button" class="pwb-vision__clip${index === selectedClip ? ' is-selected' : ''}" data-clip="${index}" aria-pressed="${index === selectedClip}">
          <span class="pwb-vision__clip-thumb"><i></i></span><strong>${esc(clip.id)}</strong><small>${clip.confidence.toFixed(1)}% · frames ${clip.start}–${clip.end}</small>
        </button>`;
      }).join('');
      renderReview();
    }

    function toggleStream() {
      running = !running;
      streamButton.setAttribute('aria-pressed', String(running));
      streamButton.textContent = running ? 'Pause frame stream' : 'Start frame stream';
      root.classList.toggle('is-streaming', running);
      if (running) {
        updateFrame();
        streamId = session.every(updateFrame, 420);
        setStatus(status, 'Camera streaming · 24 fps sampled locally', 'success');
      } else {
        session.clearEvery(streamId);
        streamId = 0;
        setStatus(status, 'Camera paused · frame history retained', 'neutral');
      }
    }

    session.on(streamButton, 'click', toggleStream);
    session.on(root.querySelector('[data-inject]'), 'click', function () {
      frame = Math.max(frame, 41);
      activeBottle = frame % bottles.length;
      confidence = 96.4 + (clips.length % 3) * 0.7;
      updateFrame();
      renderDetection();
      if (confidence >= Number(threshold.value)) {
        const clip = { id: `EVT-${String(clips.length + 1).padStart(3, '0')}`, confidence, start: frame - 2, end: frame + 2 };
        clips.unshift(clip);
        selectedClip = 0;
        renderClips();
      }
    });
    session.on(threshold, 'input', renderDetection);
    session.on(root.querySelector('[data-clips]'), 'click', function (event) {
      const button = event.target.closest('[data-clip]');
      if (!button) return;
      selectedClip = Number(button.dataset.clip);
      renderClips();
      const selected = root.querySelector(`[data-clip="${selectedClip}"]`);
      if (selected) selected.focus();
    });
    renderDetection();
    renderClips();
    return session.cleanup;
  }

  function testRunner(spec, host, head, ctx) {
    const scenarioId = uid('test-scenario');
    const failureId = uid('test-failure');
    const scenarios = [
      {
        name: 'Create change and attach item', url: '/plm/change/new',
        steps: [
          ['Open change workspace', 'Workspace heading is visible', 'Change workspace'],
          ['Create sanitized change', 'Draft CHG-SAMPLE-104 is created', 'New engineering change'],
          ['Attach rotor item', 'Affected item count equals 1', 'Affected items · 1'],
          ['Submit impact review', 'Workflow state equals Impact review', 'Impact review submitted']
        ]
      },
      {
        name: 'Revise product structure line', url: '/plm/structure/SAMPLE-204',
        steps: [
          ['Open released structure', 'Revision C and 7 lines are visible', 'Rotor assembly · Rev C'],
          ['Begin revise operation', 'Working revision D is created', 'Working copy · Rev D'],
          ['Replace sample seal', 'Occurrence points to SEAL-SAMPLE-8', 'Structure line replaced'],
          ['Save and compare', 'Revision diff contains one changed line', 'Revision diff · 1 changed']
        ]
      },
      {
        name: 'Submit release workflow', url: '/plm/workflows/release',
        steps: [
          ['Open release task', 'Task owner and due state are visible', 'Release task'],
          ['Inspect validation evidence', 'Validation score is 94', 'Evidence · validation 94'],
          ['Confirm release status', 'Status is Ready for review', 'Ready for review'],
          ['Submit workflow', 'Inbox shows submitted confirmation', 'Workflow submitted']
        ]
      }
    ];

    const root = mount(host, head, 'testRunner', (spec && spec.title) || 'Browser test runner', `
      <div class="pwb__toolbar">
        <div class="pwb__status" data-status data-tone="neutral" role="status" aria-live="polite">Ready · isolated browser fixture</div>
        <button class="pwb__button pwb__button--primary" type="button" data-run>Run selected scenario</button>
      </div>
      <div class="pwb-test__controls">
        <label for="${scenarioId}">Browser scenario</label>
        <select id="${scenarioId}" data-scenario>${scenarios.map(function (item, index) { return `<option value="${index}">${esc(item.name)}</option>`; }).join('')}</select>
        <label class="pwb__check" for="${failureId}"><input id="${failureId}" data-failure type="checkbox"> Inject stale workflow-state assertion</label>
      </div>
      <div class="pwb-test__layout">
        <section class="pwb__panel pwb-test__browser" aria-label="Synthetic browser preview">
          <div class="pwb-test__chrome"><span></span><span></span><span></span><code data-address></code></div>
          <div class="pwb-test__screen" data-screen>
            <div class="pwb-test__app-rail"><i></i><i></i><i></i><i></i></div>
            <div class="pwb-test__app-body"><small>PLM SAMPLE WORKSPACE</small><h3 data-screen-title>Scenario ready</h3><p data-screen-copy>Run the selected path to observe browser steps and assertions.</p><div class="pwb-test__skeleton"><i></i><i></i><i></i></div></div>
          </div>
        </section>
        <section class="pwb__panel pwb-test__steps" aria-labelledby="${scenarioId}-steps">
          <div class="pwb__panel-title" id="${scenarioId}-steps">Runnable steps <span data-duration>—</span></div>
          <ol data-steps></ol>
        </section>
      </div>
      <section class="pwb__panel pwb-test__evidence" aria-labelledby="${scenarioId}-evidence">
        <div class="pwb__panel-title" id="${scenarioId}-evidence">Evidence bundle <span data-evidence-count>0 artifacts</span></div>
        <div class="pwb-test__evidence-grid" data-evidence><span class="pwb__empty">Screenshots and trace records appear after a run.</span></div>
      </section>`);

    const session = createSession(root, ctx);
    const status = root.querySelector('[data-status]');
    const select = root.querySelector('[data-scenario]');
    const runButton = root.querySelector('[data-run]');
    let evidence = [];

    function activeScenario() {
      return scenarios[Number(select.value)] || scenarios[0];
    }

    function renderScenario() {
      const item = activeScenario();
      root.querySelector('[data-address]').textContent = `sample.local${item.url}`;
      root.querySelector('[data-screen-title]').textContent = item.name;
      root.querySelector('[data-screen-copy]').textContent = 'Awaiting a deterministic local run.';
      root.querySelector('[data-duration]').textContent = `${item.steps.length} steps`;
      root.querySelector('[data-steps]').innerHTML = item.steps.map(function (step, index) {
        return `<li data-step="${index}" data-state="pending"><span class="pwb-test__step-mark">${index + 1}</span><span><strong>${esc(step[0])}</strong><small>${esc(step[1])}</small></span><em data-step-state>queued</em></li>`;
      }).join('');
    }

    function renderEvidence() {
      const hostNode = root.querySelector('[data-evidence]');
      root.querySelector('[data-evidence-count]').textContent = `${evidence.length} ${evidence.length === 1 ? 'artifact' : 'artifacts'}`;
      if (!evidence.length) {
        hostNode.innerHTML = '<span class="pwb__empty">Screenshots and trace records appear after a run.</span>';
        return;
      }
      hostNode.innerHTML = evidence.map(function (item, index) {
        if (item.kind === 'trace') {
          return `<details class="pwb-test__trace"><summary>Trace · ${esc(item.status)}</summary><pre>${esc(item.text)}</pre></details>`;
        }
        return `<button class="pwb-test__shot" type="button" data-shot="${index}"><span><i></i><b>${esc(item.screen)}</b></span><strong>${esc(item.label)}</strong><small>${esc(item.assertion)}</small></button>`;
      }).join('');
    }

    function finishRun(turn, failed, startedAt, failureTrace) {
      if (!session.isCurrent(turn)) return;
      runButton.disabled = false;
      select.disabled = false;
      const elapsed = session.reduced ? 0.3 : ((performance.now() - startedAt) / 1000);
      root.querySelector('[data-duration]').textContent = `${elapsed.toFixed(1)} s · ${failed ? 'failed' : 'passed'}`;
      evidence.push({ kind: 'trace', status: failed ? 'failed' : 'passed', text: failed ? `${failureTrace || 'assertion expected current workflow state'}\nreceived stale fixture state\ntrace retained locally` : '4 steps passed\n4 assertions passed\n0 network dependencies\ntrace retained locally' });
      renderEvidence();
      setStatus(status, failed ? 'Failed · assertion evidence retained' : 'Passed · screenshots and trace retained', failed ? 'danger' : 'success');
    }

    function run() {
      const turn = session.nextGeneration();
      const item = activeScenario();
      const injectFailure = root.querySelector('[data-failure]').checked;
      const startedAt = performance.now();
      let failed = false;
      evidence = [];
      renderScenario();
      renderEvidence();
      runButton.disabled = true;
      select.disabled = true;
      setStatus(status, `Running · Chromium · ${item.steps.length} steps`, 'busy');

      item.steps.forEach(function (step, index) {
        session.later(function () {
          if (!session.isCurrent(turn) || failed) return;
          const row = root.querySelector(`[data-step="${index}"]`);
          root.querySelectorAll('[data-step]').forEach(function (node) {
            if (node.dataset.state === 'running') {
              node.dataset.state = 'passed';
              node.querySelector('[data-step-state]').textContent = 'passed';
            }
          });
          row.dataset.state = 'running';
          row.querySelector('[data-step-state]').textContent = 'running';
          root.querySelector('[data-screen-title]').textContent = step[2];
          root.querySelector('[data-screen-copy]').textContent = step[1];
          root.querySelector('[data-screen]').classList.remove('is-captured');
          void root.querySelector('[data-screen]').offsetWidth;
          root.querySelector('[data-screen]').classList.add('is-captured');

          const shouldFail = injectFailure && index === 2;
          session.later(function () {
            if (!session.isCurrent(turn) || failed) return;
            row.dataset.state = shouldFail ? 'failed' : 'passed';
            row.querySelector('[data-step-state]').textContent = shouldFail ? 'failed' : 'passed';
            if (index === 1 || index === item.steps.length - 1 || shouldFail) {
              evidence.push({ kind: 'shot', label: shouldFail ? 'failure.png' : `step-${index + 1}.png`, screen: step[2], assertion: shouldFail ? 'Observed stale Draft status' : step[1] });
              renderEvidence();
            }
            if (shouldFail) {
              failed = true;
              finishRun(turn, true, startedAt, `assertion[${index}] expected: ${step[1]}`);
            }
          }, 250);
        }, index * 720);
      });

      session.later(function () {
        if (!failed) finishRun(turn, false, startedAt);
      }, item.steps.length * 720 + 300);
    }

    session.on(select, 'change', function () {
      session.nextGeneration();
      runButton.disabled = false;
      evidence = [];
      renderScenario();
      renderEvidence();
      setStatus(status, 'Ready · scenario changed', 'neutral');
    });
    session.on(runButton, 'click', run);
    session.on(root.querySelector('[data-evidence]'), 'click', function (event) {
      const button = event.target.closest('[data-shot]');
      if (!button) return;
      const item = evidence[Number(button.dataset.shot)];
      if (!item || item.kind !== 'shot') return;
      root.querySelector('[data-screen-title]').textContent = item.screen;
      root.querySelector('[data-screen-copy]').textContent = item.assertion;
      setStatus(status, `Reviewing ${item.label} · local evidence`, 'neutral');
    });
    renderScenario();
    renderEvidence();
    return session.cleanup;
  }

  function activity(spec, host, head, ctx) {
    const stream = [
      { time: '11:06', app: 'Terminal', title: 'nx-mcp · local schema tests', project: 'NX MCP', category: 'Build', minutes: 12, confidence: 94 },
      { time: '11:24', app: 'Browser', title: 'GraphRAG · typed traversal notes', project: 'GraphRAG', category: 'Research', minutes: 17, confidence: 88 },
      { time: '11:51', app: 'Slides', title: 'Architecture review · sanitized deck', project: 'Demo fabric', category: 'Communication', minutes: 14, confidence: 81 },
      { time: '12:18', app: 'Editor', title: 'MRO · disposition rule fixture', project: 'MRO Workbench', category: 'Build', minutes: 21, confidence: 97 }
    ];
    const categories = ['Build', 'Research', 'Communication', 'Planning', 'Unassigned'];
    let events = [
      { time: '09:10', app: 'Editor', title: 'nx-mcp · server.py', project: 'NX MCP', category: 'Build', minutes: 38, confidence: 96 },
      { time: '10:02', app: 'Browser', title: 'Local project demo', project: 'Demo fabric', category: 'Research', minutes: 22, confidence: 78 },
      { time: '10:31', app: 'Editor', title: 'MRO · traveler preview', project: 'MRO Workbench', category: 'Build', minutes: 46, confidence: 93 }
    ];
    let cursor = 0;
    let running = false;
    let intervalId = 0;

    const root = mount(host, head, 'activity', (spec && spec.title) || 'Private activity classifier', `
      <div class="pwb__toolbar">
        <div class="pwb__status" data-status data-tone="neutral" role="status" aria-live="polite">Paused · 3 local observations</div>
        <div class="pwb__actions">
          <button class="pwb__button" type="button" data-next>Add next sample event</button>
          <button class="pwb__button pwb__button--primary" type="button" data-stream aria-pressed="false">Start foreground stream</button>
        </div>
      </div>
      <div class="pwb-activity__privacy"><span aria-hidden="true">●</span><strong>Private by construction</strong><span>Fixture titles are classified in browser memory; no activity is transmitted.</span></div>
      <div class="pwb-activity__layout">
        <section class="pwb__panel pwb-activity__events" aria-label="Foreground event stream">
          <div class="pwb__panel-title">Foreground observations <span data-observation-count></span></div>
          <div class="pwb__table-wrap">
            <table><thead><tr><th>Observed</th><th>Classifier result</th><th>Confidence</th><th>Correction</th></tr></thead><tbody data-events></tbody></table>
          </div>
        </section>
        <aside class="pwb__panel pwb-activity__totals" aria-label="Private time totals">
          <div class="pwb__panel-title">Private summary</div>
          <div data-totals></div>
          <p class="pwb__note">Corrections update only this summary and remain local to the active demo.</p>
        </aside>
      </div>`);

    const session = createSession(root, ctx);
    const status = root.querySelector('[data-status]');
    const streamButton = root.querySelector('[data-stream]');

    function render() {
      const focusedControl = document.activeElement && document.activeElement.closest ? document.activeElement.closest('[data-correction]') : null;
      const focusedItem = focusedControl ? events[Number(focusedControl.dataset.correction)] : null;
      root.querySelector('[data-observation-count]').textContent = `${events.length} events`;
      root.querySelector('[data-events]').innerHTML = events.slice().reverse().map(function (item, reverseIndex) {
        const index = events.length - reverseIndex - 1;
        return `<tr data-event="${index}">
          <td><time>${esc(item.time)}</time><strong>${esc(item.app)}</strong><small>${esc(item.title)}</small></td>
          <td><strong>${esc(item.project)}</strong><small>${esc(item.category)}${item.corrected ? ' · corrected' : ' · automatic'}</small></td>
          <td><span class="pwb-activity__confidence" style="--confidence:${item.confidence}%">${item.confidence}%</span></td>
          <td><label><span class="pwb__sr-only">Correct category for ${esc(item.title)}</span><select data-correction="${index}">${categories.map(function (category) { return `<option${category === item.category ? ' selected' : ''}>${esc(category)}</option>`; }).join('')}</select></label></td>
        </tr>`;
      }).join('');

      const totals = categories.map(function (category) {
        return { category, minutes: events.filter(function (item) { return item.category === category; }).reduce(function (sum, item) { return sum + item.minutes; }, 0) };
      }).filter(function (item) { return item.minutes > 0; });
      const maximum = Math.max.apply(null, totals.map(function (item) { return item.minutes; }).concat([1]));
      const grand = totals.reduce(function (sum, item) { return sum + item.minutes; }, 0);
      root.querySelector('[data-totals]').innerHTML = `<div class="pwb-activity__grand"><strong>${Math.floor(grand / 60)}h ${grand % 60}m</strong><span>classified locally</span></div>${totals.map(function (item) {
        return `<div class="pwb-activity__total"><span>${esc(item.category)}</span><b>${Math.floor(item.minutes / 60) ? `${Math.floor(item.minutes / 60)}h ` : ''}${item.minutes % 60}m</b><i><span style="width:${Math.round(item.minutes / maximum * 100)}%"></span></i></div>`;
      }).join('')}`;
      if (focusedItem) {
        const nextIndex = events.indexOf(focusedItem);
        const replacement = nextIndex >= 0 ? root.querySelector(`[data-correction="${nextIndex}"]`) : null;
        if (replacement) replacement.focus();
      }
    }

    function addNext() {
      const item = Object.assign({}, stream[cursor % stream.length]);
      cursor += 1;
      events.push(item);
      if (events.length > 8) events.shift();
      render();
      setStatus(status, `${item.app} classified as ${item.category} · ${item.confidence}%`, 'success');
    }

    function toggleStream() {
      running = !running;
      streamButton.setAttribute('aria-pressed', String(running));
      streamButton.textContent = running ? 'Pause foreground stream' : 'Start foreground stream';
      if (running) {
        addNext();
        intervalId = session.every(addNext, 1250);
      } else {
        session.clearEvery(intervalId);
        intervalId = 0;
        setStatus(status, `Paused · ${events.length} local observations`, 'neutral');
      }
    }

    session.on(root.querySelector('[data-next]'), 'click', addNext);
    session.on(streamButton, 'click', toggleStream);
    session.on(root.querySelector('[data-events]'), 'change', function (event) {
      const select = event.target.closest('[data-correction]');
      if (!select) return;
      const item = events[Number(select.dataset.correction)];
      if (!item) return;
      item.category = select.value;
      item.confidence = 100;
      item.corrected = true;
      render();
      setStatus(status, `${item.app} corrected to ${item.category} · local model feedback`, 'success');
    });
    render();
    return session.cleanup;
  }

  function fileCleaner(spec, host, head, ctx) {
    const scopeId = uid('cleaner-scope');
    const root = mount(host, head, 'fileCleaner', (spec && spec.title) || 'Reserved-name cleanup planner', `
      <div class="pwb__toolbar">
        <div class="pwb__status" data-status data-tone="neutral" role="status" aria-live="polite">Ready · browser dry run only</div>
        <button class="pwb__button pwb__button--primary" type="button" data-scan>Run dry-run scan</button>
      </div>
      <div class="pwb-cleaner__scope">
        <label for="${scopeId}">Literal sample scope</label>
        <div><input id="${scopeId}" data-scope type="text" spellcheck="false" value="sample-workspace\\engineering-tools"><span class="pwb-cleaner__mode">fixture filesystem</span></div>
        <p>Only relative paths below <code>sample-workspace\\</code> are accepted. No local disk API is called.</p>
      </div>
      <section class="pwb__panel pwb-cleaner__boundary" aria-labelledby="${scopeId}-boundary">
        <div class="pwb__panel-title" id="${scopeId}-boundary">Boundary validation</div>
        <div data-boundary></div>
      </section>
      <div class="pwb-cleaner__layout">
        <section class="pwb__panel" aria-labelledby="${scopeId}-findings">
          <div class="pwb__panel-title" id="${scopeId}-findings">Reserved-name findings <span data-finding-count>not scanned</span></div>
          <div class="pwb__table-wrap" data-findings><span class="pwb__empty">Run a valid dry-run scope to inspect deterministic findings.</span></div>
        </section>
        <aside class="pwb__panel pwb-cleaner__plan" aria-labelledby="${scopeId}-plan">
          <div class="pwb__panel-title" id="${scopeId}-plan">Quarantine plan</div>
          <div data-plan><span class="pwb__empty">Select findings to build a recoverable plan.</span></div>
          <button class="pwb__button" type="button" data-plan-button disabled>Build quarantine plan</button>
        </aside>
      </div>`);

    const session = createSession(root, ctx);
    const status = root.querySelector('[data-status]');
    const input = root.querySelector('[data-scope]');
    const scanButton = root.querySelector('[data-scan]');
    let findings = [];
    let selected = new Set();

    function validateScope() {
      const value = input.value.trim();
      const relative = /^[^<>:"|?*\\/]+(?:\\[^<>:"|?*\\/]+)*$/.test(value);
      const containsTraversal = value.split('\\').some(function (part) { return part === '..' || part === '.'; });
      const insideFixture = value.toLowerCase().startsWith('sample-workspace\\') && value.length > 'sample-workspace\\'.length;
      const valid = relative && !containsTraversal && insideFixture;
      root.querySelector('[data-boundary]').innerHTML = `
        <span data-pass="${relative}">${relative ? '✓' : '×'} safe relative path</span>
        <span data-pass="${!containsTraversal}">${!containsTraversal ? '✓' : '×'} no traversal segments</span>
        <span data-pass="${insideFixture}">${insideFixture ? '✓' : '×'} contained by fixture root</span>`;
      scanButton.disabled = !valid;
      if (!valid) setStatus(status, 'Blocked · scope is outside the sample boundary', 'danger');
      else setStatus(status, 'Ready · sample path contained by fixture root', 'neutral');
      return { valid, value };
    }

    function renderFindings() {
      root.querySelector('[data-finding-count]').textContent = findings.length ? `${findings.length} found` : '0 found';
      const node = root.querySelector('[data-findings]');
      if (!findings.length) {
        node.innerHTML = '<span class="pwb__empty">No reserved-name fixtures found in this scope.</span>';
        root.querySelector('[data-plan-button]').disabled = true;
        return;
      }
      node.innerHTML = `<table><thead><tr><th>Plan</th><th>Literal path</th><th>Reason</th></tr></thead><tbody>${findings.map(function (item, index) {
        return `<tr><td><label class="pwb__check pwb__check--compact"><input type="checkbox" data-finding="${index}"${selected.has(index) ? ' checked' : ''}><span class="pwb__sr-only">Include ${esc(item.name)} in quarantine plan</span></label></td><td><code>${esc(item.path)}</code></td><td><strong>${esc(item.name)}</strong><small>${esc(item.reason)}</small></td></tr>`;
      }).join('')}</tbody></table>`;
      root.querySelector('[data-plan-button]').disabled = selected.size === 0;
    }

    function renderPlan() {
      const node = root.querySelector('[data-plan]');
      if (!selected.size) {
        node.innerHTML = '<span class="pwb__empty">Select findings to build a recoverable plan.</span>';
        return;
      }
      const rows = Array.from(selected).map(function (index) { return findings[index]; }).filter(Boolean);
      node.innerHTML = `<ol>${rows.map(function (item) {
        return `<li><span>move literal path</span><code>${esc(item.path)}</code><span>to recoverable fixture quarantine</span><code>${esc(item.quarantine)}</code></li>`;
      }).join('')}</ol><div class="pwb-cleaner__guarantee"><strong>No delete operation</strong><span>Boundary is rechecked before every planned move.</span></div>`;
    }

    function scan() {
      const scope = validateScope();
      if (!scope.valid) return;
      const turn = session.nextGeneration();
      scanButton.disabled = true;
      selected = new Set();
      findings = [];
      renderFindings();
      root.querySelector('[data-plan]').innerHTML = '<span class="pwb__empty">Waiting for dry-run results.</span>';
      setStatus(status, 'Scanning fixture · literal paths only', 'busy');
      session.later(function () {
        if (!session.isCurrent(turn)) return;
        setStatus(status, 'Verifying reserved-device basenames', 'busy');
      }, 350);
      session.later(function () {
        if (!session.isCurrent(turn)) return;
        const base = scope.value.replace(/\\+$/, '');
        findings = [
          { name: 'NUL', path: `${base}\\NUL`, reason: 'Reserved DOS device basename', quarantine: `${base}\\.quarantine\\NUL.reserved` },
          { name: 'AUX.txt', path: `${base}\\archive\\AUX.txt`, reason: 'Reserved basename remains invalid with extension', quarantine: `${base}\\.quarantine\\archive__AUX.txt.reserved` },
          { name: 'CON.json', path: `${base}\\generated\\CON.json`, reason: 'Reserved basename blocks normal Win32 operations', quarantine: `${base}\\.quarantine\\generated__CON.json.reserved` }
        ];
        selected = new Set([0, 1, 2]);
        renderFindings();
        scanButton.disabled = false;
        setStatus(status, 'Dry run complete · 3 recoverable findings · 0 changes', 'warning');
      }, 760);
    }

    session.on(input, 'input', function () {
      session.nextGeneration();
      findings = [];
      selected = new Set();
      renderFindings();
      renderPlan();
      validateScope();
    });
    session.on(scanButton, 'click', scan);
    session.on(root.querySelector('[data-findings]'), 'change', function (event) {
      const checkbox = event.target.closest('[data-finding]');
      if (!checkbox) return;
      const index = Number(checkbox.dataset.finding);
      if (checkbox.checked) selected.add(index); else selected.delete(index);
      root.querySelector('[data-plan-button]').disabled = selected.size === 0;
      renderPlan();
    });
    session.on(root.querySelector('[data-plan-button]'), 'click', function () {
      renderPlan();
      setStatus(status, `Plan ready · ${selected.size} recoverable moves · 0 deletes`, 'success');
    });
    validateScope();
    renderFindings();
    return session.cleanup;
  }

  function fabric(spec, host, head, ctx) {
    const topologyId = uid('fabric-topology');
    const failureId = uid('fabric-failure');
    const topologies = [
      {
        name: 'Edge gateway lab',
        nodes: [
          { id: 'switch', kind: 'vSwitch', title: 'edge-isolated', detail: 'Private · VLAN 110' },
          { id: 'gateway', kind: 'VM', title: 'edge-gateway-01', detail: '2 vCPU · 4 GB' },
          { id: 'broker', kind: 'Service', title: 'mqtt-broker-01', detail: 'TCP 1883 · local' },
          { id: 'client', kind: 'VM', title: 'operations-ui-01', detail: 'Browser client' }
        ]
      },
      {
        name: 'PLM client lab',
        nodes: [
          { id: 'switch', kind: 'vSwitch', title: 'plm-nat', detail: 'NAT · VLAN 220' },
          { id: 'client', kind: 'VM', title: 'plm-client-01', detail: '4 vCPU · 8 GB' },
          { id: 'adapter', kind: 'Service', title: 'soa-adapter-01', detail: 'Read-only fixture' },
          { id: 'vault', kind: 'Fixture', title: 'teamcenter-sample', detail: '7 sanitized items' }
        ]
      },
      {
        name: 'Full demo cell',
        nodes: [
          { id: 'switch', kind: 'vSwitch', title: 'demo-fabric', detail: '2 isolated segments' },
          { id: 'gateway', kind: 'VM', title: 'edge-gateway-01', detail: 'OPC-UA → MQTT' },
          { id: 'broker', kind: 'Service', title: 'mqtt-broker-01', detail: 'TCP 1883 · local' },
          { id: 'plm', kind: 'VM', title: 'plm-client-01', detail: 'SOA fixture' },
          { id: 'app', kind: 'VM', title: 'demo-console-01', detail: 'Operations surface' }
        ]
      }
    ];

    const root = mount(host, head, 'fabric', (spec && spec.title) || 'Hyper-V fabric planner', `
      <div class="pwb__toolbar">
        <div class="pwb__status" data-status data-tone="neutral" role="status" aria-live="polite">Draft topology · validation required</div>
        <div class="pwb__actions">
          <button class="pwb__button" type="button" data-validate>Validate topology</button>
          <button class="pwb__button pwb__button--primary" type="button" data-provision disabled>Provision fixture</button>
        </div>
      </div>
      <div class="pwb-fabric__controls">
        <label for="${topologyId}">Lab topology</label>
        <select id="${topologyId}" data-topology>${topologies.map(function (item, index) { return `<option value="${index}">${esc(item.name)}</option>`; }).join('')}</select>
        <label class="pwb__check" for="${failureId}"><input id="${failureId}" data-failure type="checkbox"> Simulate broker health failure</label>
      </div>
      <section class="pwb__panel pwb-fabric__canvas" aria-labelledby="${topologyId}-canvas">
        <div class="pwb__panel-title" id="${topologyId}-canvas">Virtual fabric <span>browser-safe plan</span></div>
        <div class="pwb-fabric__path" data-nodes></div>
      </section>
      <div class="pwb-fabric__lower">
        <section class="pwb__panel" aria-labelledby="${topologyId}-stages">
          <div class="pwb__panel-title" id="${topologyId}-stages">Provisioning trace</div>
          <ol class="pwb-fabric__trace" data-trace>
            <li data-stage="boundary"><i></i><span><strong>Boundary check</strong><small>Workspace and switch names</small></span><em>queued</em></li>
            <li data-stage="network"><i></i><span><strong>Network plan</strong><small>Isolated virtual switch</small></span><em>queued</em></li>
            <li data-stage="machine"><i></i><span><strong>VM definitions</strong><small>CPU, memory, disk fixture</small></span><em>queued</em></li>
            <li data-stage="health"><i></i><span><strong>Health probes</strong><small>Service-to-service reachability</small></span><em>queued</em></li>
          </ol>
        </section>
        <section class="pwb__panel pwb-fabric__health" aria-labelledby="${topologyId}-health">
          <div class="pwb__panel-title" id="${topologyId}-health">Runtime health <button class="pwb__button pwb__button--small" type="button" data-health disabled>Run health check</button></div>
          <div data-health-table><span class="pwb__empty">Provision the fixture to enable service probes.</span></div>
        </section>
      </div>`);

    const session = createSession(root, ctx);
    const status = root.querySelector('[data-status]');
    const select = root.querySelector('[data-topology]');
    const validateButton = root.querySelector('[data-validate]');
    const provisionButton = root.querySelector('[data-provision]');
    const healthButton = root.querySelector('[data-health]');
    let nodeState = {};
    let validated = false;
    let provisioned = false;

    function topology() {
      return topologies[Number(select.value)] || topologies[0];
    }

    function resetTrace() {
      root.querySelectorAll('[data-stage]').forEach(function (row) {
        row.dataset.state = 'queued';
        row.querySelector('em').textContent = 'queued';
      });
    }

    function renderNodes() {
      const nodes = topology().nodes;
      root.querySelector('[data-nodes]').innerHTML = nodes.map(function (node, index) {
        const state = nodeState[node.id] || 'draft';
        return `${index ? '<span class="pwb-fabric__link" aria-hidden="true"><i></i></span>' : ''}<article class="pwb-fabric__node" data-node-state="${esc(state)}">
          <span class="pwb-fabric__node-icon" aria-hidden="true">${node.kind === 'vSwitch' ? '⇄' : node.kind === 'VM' ? '▣' : node.kind === 'Service' ? '◇' : '▦'}</span>
          <small>${esc(node.kind)}</small><strong>${esc(node.title)}</strong><span>${esc(node.detail)}</span><em>${esc(state)}</em>
        </article>`;
      }).join('');
    }

    function reset() {
      session.nextGeneration();
      nodeState = {};
      validated = false;
      provisioned = false;
      validateButton.disabled = false;
      provisionButton.disabled = true;
      healthButton.disabled = true;
      resetTrace();
      renderNodes();
      root.querySelector('[data-health-table]').innerHTML = '<span class="pwb__empty">Provision the fixture to enable service probes.</span>';
      setStatus(status, 'Draft topology · validation required', 'neutral');
    }

    function setTrace(stage, state, text) {
      const row = root.querySelector(`[data-stage="${stage}"]`);
      if (!row) return;
      row.dataset.state = state;
      row.querySelector('em').textContent = text || state;
    }

    function validate() {
      const turn = session.nextGeneration();
      validated = false;
      provisioned = false;
      validateButton.disabled = true;
      provisionButton.disabled = true;
      healthButton.disabled = true;
      resetTrace();
      topology().nodes.forEach(function (node) { nodeState[node.id] = 'checking'; });
      renderNodes();
      setStatus(status, 'Validating names, resources, and isolated boundaries', 'busy');
      ['boundary', 'network', 'machine'].forEach(function (stage, index) {
        session.later(function () {
          if (!session.isCurrent(turn)) return;
          if (index > 0) setTrace(['boundary', 'network', 'machine'][index - 1], 'passed');
          setTrace(stage, 'running');
        }, index * 430);
      });
      session.later(function () {
        if (!session.isCurrent(turn)) return;
        setTrace('machine', 'passed');
        topology().nodes.forEach(function (node) { nodeState[node.id] = 'validated'; });
        renderNodes();
        validated = true;
        validateButton.disabled = false;
        provisionButton.disabled = false;
        setStatus(status, 'Valid · resource plan fits the sample host', 'success');
      }, 1380);
    }

    function provision() {
      if (!validated) return;
      const turn = session.nextGeneration();
      provisionButton.disabled = true;
      validateButton.disabled = true;
      topology().nodes.forEach(function (node) { nodeState[node.id] = 'provisioning'; });
      renderNodes();
      setTrace('health', 'running', 'waiting');
      setStatus(status, 'Provisioning isolated fixture · no host changes', 'busy');
      topology().nodes.forEach(function (node, index) {
        session.later(function () {
          if (!session.isCurrent(turn)) return;
          nodeState[node.id] = 'running';
          renderNodes();
        }, index * 360);
      });
      session.later(function () {
        if (!session.isCurrent(turn)) return;
        provisioned = true;
        validateButton.disabled = false;
        provisionButton.disabled = false;
        healthButton.disabled = false;
        setTrace('health', 'queued', 'ready');
        root.querySelector('[data-health-table]').innerHTML = '<span class="pwb__empty">Fixture running. Start the deterministic service probes.</span>';
        setStatus(status, 'Provisioned · fixture services ready for health check', 'success');
      }, topology().nodes.length * 360 + 160);
    }

    function health() {
      if (!provisioned) return;
      const turn = session.nextGeneration();
      const fail = root.querySelector('[data-failure]').checked;
      healthButton.disabled = true;
      setTrace('health', 'running');
      setStatus(status, 'Probing service reachability and fixture ports', 'busy');
      session.later(function () {
        if (!session.isCurrent(turn)) return;
        const nodes = topology().nodes;
        const failingId = nodes.some(function (node) { return node.id === 'broker'; }) ? 'broker' : nodes[Math.min(2, nodes.length - 1)].id;
        nodes.forEach(function (node) { nodeState[node.id] = fail && node.id === failingId ? 'failed' : fail && nodes.indexOf(node) > nodes.findIndex(function (item) { return item.id === failingId; }) ? 'degraded' : 'healthy'; });
        renderNodes();
        root.querySelector('[data-health-table]').innerHTML = `<div class="pwb-fabric__health-grid">${nodes.map(function (node) {
          const state = nodeState[node.id];
          const detail = state === 'failed' ? 'TCP probe refused · retry available' : state === 'degraded' ? 'Dependency unavailable' : 'Reachable · fixture response verified';
          return `<div data-health-state="${esc(state)}"><span>${esc(node.title)}</span><strong>${esc(state)}</strong><small>${esc(detail)}</small></div>`;
        }).join('')}</div>${fail ? '<div class="pwb-fabric__failure"><strong>Failure contained</strong><span>The broker fixture is unreachable on TCP 1883. Dependent clients stay degraded; no external network was contacted.</span></div>' : ''}`;
        setTrace('health', fail ? 'failed' : 'passed');
        healthButton.disabled = false;
        setStatus(status, fail ? 'Degraded · broker health failure isolated' : 'Healthy · all fixture probes passed', fail ? 'danger' : 'success');
      }, 720);
    }

    session.on(select, 'change', reset);
    session.on(validateButton, 'click', validate);
    session.on(provisionButton, 'click', provision);
    session.on(healthButton, 'click', health);
    renderNodes();
    return session.cleanup;
  }

  function nxJournal(spec, host, head, ctx) {
    const journalId = uid('journal');
    const journals = [
      {
        name: 'Drawing cleanup', artifact: 'drawing',
        params: '<label>Drawing sheet<select data-param="sheet"><option>SHROUD_DETAIL_A</option><option>ROTOR_LAYOUT_B</option></select></label><label>Layer policy<select data-param="policy"><option>Corporate 2026</option><option>Minimal manufacturing</option></select></label>',
        steps: [
          ['NXOpen.Drawings.Open', 'Opened SHROUD_DETAIL_A in read/write fixture mode'],
          ['Layers.Normalize', 'Moved 7 annotations to approved layers'],
          ['Views.Update', 'Regenerated 3 drawing views'],
          ['Part.SaveAs', 'Wrote fixture revision with audit summary']
        ],
        before: ['17 visible layers', '3 stale views', '7 misplaced notes'], after: ['8 approved layers', '3 views current', '0 misplaced notes']
      },
      {
        name: 'Feature rename', artifact: 'model',
        params: '<label>Work part<input data-param="part" value="BRACKET_SAMPLE_A" spellcheck="false"></label><label>Feature prefix<input data-param="prefix" value="BRK" maxlength="12" spellcheck="false"></label>',
        steps: [
          ['Features.Scan', 'Found 12 unnamed or generated features'],
          ['References.Validate', 'Verified 28 dependent references'],
          ['Features.Rename', 'Applied deterministic BRK_* naming rules'],
          ['Part.SaveAs', 'Wrote fixture revision and rename manifest']
        ],
        before: ['EXTRUDE(7)', 'EDGE_BLEND(3)', 'SKETCH(12)'], after: ['BRK_BASE', 'BRK_FILLET_OUTER', 'BRK_MOUNT_PROFILE']
      },
      {
        name: 'Batch neutral export', artifact: 'assembly',
        params: '<label>Assembly<input data-param="assembly" value="ROTOR_SAMPLE_C" spellcheck="false"></label><label>Neutral format<select data-param="format"><option>STEP AP242</option><option>JT lightweight</option><option>Parasolid</option></select></label>',
        steps: [
          ['Assembly.Traverse', 'Resolved 6 unique released components'],
          ['Export.Configure', 'Applied STEP AP242 fixture options'],
          ['Export.Write', 'Produced 6 deterministic output records'],
          ['Manifest.Verify', 'Checksums and source revisions recorded']
        ],
        before: ['6 NX parts', '3 duplicate occurrences', '0 neutral files'], after: ['6 AP242 files', '1 assembly manifest', '6 checksums verified']
      }
    ];

    const root = mount(host, head, 'nxJournal', (spec && spec.title) || 'NX journal execution workbench', `
      <div class="pwb__toolbar">
        <div class="pwb__status" data-status data-tone="neutral" role="status" aria-live="polite">Ready · NX fixture session</div>
        <button class="pwb__button pwb__button--primary" type="button" data-run>Run sample journal</button>
      </div>
      <div class="pwb-journal__controls">
        <label for="${journalId}">Journal automation</label>
        <select id="${journalId}" data-journal>${journals.map(function (item, index) { return `<option value="${index}">${esc(item.name)}</option>`; }).join('')}</select>
        <div class="pwb-journal__params" data-params></div>
      </div>
      <div class="pwb-journal__layout">
        <section class="pwb__panel pwb-journal__artifact" aria-labelledby="${journalId}-artifact">
          <div class="pwb__panel-title" id="${journalId}-artifact">NX artifact state <span data-artifact-name></span></div>
          <div class="pwb-journal__comparison">
            <article><span>Before</span><div class="pwb-journal__preview" data-before-preview></div><ul data-before></ul></article>
            <article data-after-card><span>After journal</span><div class="pwb-journal__preview" data-after-preview></div><ul data-after></ul></article>
          </div>
        </section>
        <section class="pwb__panel pwb-journal__console" aria-labelledby="${journalId}-console">
          <div class="pwb__panel-title" id="${journalId}-console">NXOpen execution log <span data-log-count>0 / 4</span></div>
          <ol data-log></ol>
        </section>
      </div>`);

    const session = createSession(root, ctx);
    const status = root.querySelector('[data-status]');
    const select = root.querySelector('[data-journal]');
    const runButton = root.querySelector('[data-run]');
    let complete = false;
    let logStates = [];
    let runtimeSteps = null;

    function journal() {
      return journals[Number(select.value)] || journals[0];
    }

    function previewMarkup(kind, after) {
      if (kind === 'drawing') {
        return `<svg viewBox="0 0 260 150" role="img" aria-label="${after ? 'Normalized drawing sheet' : 'Drawing sheet with stale annotations'}"><rect x="15" y="12" width="230" height="126"/><path d="M44 102L82 50H173L213 102ZM82 50V102M173 50V102M44 102H213"/><circle cx="128" cy="77" r="18"/><g class="pwb-journal__annotations"><path d="M34 33H90M178 34H228M27 119H88"/><text x="37" y="29">${after ? 'L8' : 'L17'}</text><text x="184" y="30">REV</text></g></svg>`;
      }
      if (kind === 'model') {
        return `<svg viewBox="0 0 260 150" role="img" aria-label="${after ? 'Renamed NX feature model' : 'NX feature model with generated names'}"><path d="M47 104L87 38H184L218 91L171 126H76Z"/><path d="M87 38L117 75H218M117 75L76 126M171 126L145 79"/><circle cx="97" cy="91" r="13"/><circle cx="174" cy="89" r="13"/><text x="74" y="25">${after ? 'BRK_BASE' : 'EXTRUDE(7)'}</text></svg>`;
      }
      return `<svg viewBox="0 0 260 150" role="img" aria-label="${after ? 'Exported neutral assembly set' : 'NX assembly source set'}"><g><rect x="26" y="48" width="58" height="45"/><rect x="101" y="26" width="58" height="45"/><rect x="176" y="54" width="58" height="45"/><path d="M84 70H101M159 57H176M55 93V121H204V99"/></g><text x="27" y="38">${after ? 'AP242' : 'NX'}</text><text x="161" y="130">${after ? 'manifest ✓' : '6 parts'}</text></svg>`;
    }

    function resolvedSteps() {
      const item = journal();
      const values = {};
      root.querySelectorAll('[data-param]').forEach(function (control) { values[control.dataset.param] = control.value.trim(); });
      if (item.artifact === 'drawing') {
        return [
          ['NXOpen.Drawings.Open', `Opened ${values.sheet || 'sample drawing'} in read/write fixture mode`],
          ['Layers.Normalize', `Applied ${values.policy || 'selected'} layer policy to 7 annotations`],
          ['Views.Update', 'Regenerated 3 drawing views'],
          ['Part.SaveAs', `Wrote ${values.sheet || 'sample drawing'} fixture revision with audit summary`]
        ];
      }
      if (item.artifact === 'model') {
        return [
          ['Features.Scan', `Found 12 generated features in ${values.part || 'sample part'}`],
          ['References.Validate', 'Verified 28 dependent references'],
          ['Features.Rename', `Applied deterministic ${(values.prefix || 'FEATURE').toUpperCase()}_* naming rules`],
          ['Part.SaveAs', `Wrote ${values.part || 'sample part'} fixture revision and rename manifest`]
        ];
      }
      return [
        ['Assembly.Traverse', `Resolved 6 unique components in ${values.assembly || 'sample assembly'}`],
        ['Export.Configure', `Applied ${values.format || 'selected format'} fixture options`],
        ['Export.Write', `Produced 6 deterministic ${values.format || 'neutral'} output records`],
        ['Manifest.Verify', 'Checksums and source revisions recorded']
      ];
    }

    function renderLog() {
      const item = journal();
      const steps = runtimeSteps || item.steps;
      root.querySelector('[data-log-count]').textContent = `${logStates.filter(function (state) { return state === 'passed'; }).length} / ${steps.length}`;
      root.querySelector('[data-log]').innerHTML = steps.map(function (step, index) {
        const state = logStates[index] || 'queued';
        return `<li data-state="${esc(state)}"><i></i><span><code>${esc(step[0])}</code><small>${esc(step[1])}</small></span><em>${esc(state)}</em></li>`;
      }).join('');
    }

    function renderJournal(resetParams) {
      const item = journal();
      if (resetParams) root.querySelector('[data-params]').innerHTML = item.params;
      root.querySelector('[data-artifact-name]').textContent = item.name;
      root.querySelector('[data-before-preview]').innerHTML = previewMarkup(item.artifact, false);
      root.querySelector('[data-after-preview]').innerHTML = previewMarkup(item.artifact, true);
      root.querySelector('[data-before]').innerHTML = item.before.map(function (line) { return `<li>${esc(line)}</li>`; }).join('');
      root.querySelector('[data-after]').innerHTML = item.after.map(function (line) { return `<li>${esc(line)}</li>`; }).join('');
      root.querySelector('[data-after-card]').classList.toggle('is-complete', complete);
      renderLog();
    }

    function reset() {
      session.nextGeneration();
      complete = false;
      logStates = [];
      runtimeSteps = null;
      runButton.disabled = false;
      renderJournal(true);
      setStatus(status, 'Ready · journal changed · NX fixture session', 'neutral');
    }

    function run() {
      const turn = session.nextGeneration();
      const item = journal();
      runtimeSteps = resolvedSteps();
      complete = false;
      logStates = runtimeSteps.map(function () { return 'queued'; });
      runButton.disabled = true;
      root.querySelector('[data-after-card]').classList.remove('is-complete');
      renderLog();
      setStatus(status, `Running ${item.name} · NXOpen fixture`, 'busy');
      runtimeSteps.forEach(function (step, index) {
        session.later(function () {
          if (!session.isCurrent(turn)) return;
          if (index > 0) logStates[index - 1] = 'passed';
          logStates[index] = 'running';
          renderLog();
        }, index * 520);
        session.later(function () {
          if (!session.isCurrent(turn)) return;
          logStates[index] = 'passed';
          renderLog();
        }, index * 520 + 340);
      });
      session.later(function () {
        if (!session.isCurrent(turn)) return;
        complete = true;
        logStates = runtimeSteps.map(function () { return 'passed'; });
        renderJournal(false);
        runButton.disabled = false;
        setStatus(status, `Complete · ${runtimeSteps.length} NXOpen operations · fixture saved`, 'success');
      }, runtimeSteps.length * 520 + 120);
    }

    session.on(select, 'change', reset);
    session.on(runButton, 'click', run);
    renderJournal(true);
    return session.cleanup;
  }

  function mendixAudit(spec, host, head, ctx) {
    const moduleId = uid('audit-module');
    const sourceId = uid('audit-source');
    const targetId = uid('audit-target');
    const fixtures = {
      workflow: [
        { severity: 'critical', kind: 'Broken microflow', title: 'ACT_ApproveRequest', location: 'microflows/ACT_ApproveRequest', detail: 'Legacy Java action signature no longer matches the target runtime.', diff: ['- LegacyApproval.execute($Request)', '+ ApprovalService.submit($Request, $Context)'] },
        { severity: 'major', kind: 'Deprecated widget', title: 'Legacy Data Grid', location: 'pages/RequestQueue', detail: 'Widget package targets the retired client API.', diff: ['- <widget type="LegacyDataGrid" version="1" />', '+ <widget type="DataGrid2" selection="single" />'] },
        { severity: 'minor', kind: 'Expression change', title: 'Empty value comparison', location: 'microflows/VAL_Request', detail: 'Expression uses a comparison deprecated by the target version.', diff: ['- $Request/Owner != empty', '+ not(isEmpty($Request/Owner))'] }
      ],
      operations: [
        { severity: 'critical', kind: 'Broken microflow', title: 'DS_LineDashboard', location: 'microflows/DS_LineDashboard', detail: 'Return type changed after domain association migration.', diff: ['- return $LegacyLineList', '+ return $LineViewList'] },
        { severity: 'major', kind: 'Deprecated widget', title: 'Charts v7', location: 'pages/OperationsDashboard', detail: 'Chart widget depends on the legacy Dojo client.', diff: ['- <widget type="Charts7" series="LegacySignal" />', '+ <widget type="AnyChart" source="SignalView" />'] },
        { severity: 'minor', kind: 'Theme token', title: 'Legacy spacing variable', location: 'themesource/main.scss', detail: 'Spacing token was renamed in the target design system.', diff: ['- padding: $spacing-large;', '+ padding: var(--spacing-large);'] }
      ],
      connector: [
        { severity: 'critical', kind: 'Broken microflow', title: 'SUB_SyncMaterial', location: 'microflows/SUB_SyncMaterial', detail: 'Import mapping expects a removed entity attribute.', diff: ['- $Material/LegacyPlant = $Payload/plant', '+ $Material/PlantCode = $Payload/plantCode'] },
        { severity: 'major', kind: 'Deprecated connector', title: 'OData v3 action', location: 'mappings/SAPMaterial', detail: 'Connector action must move to the target OData client.', diff: ['- ODataV3.Get(MaterialSet)', '+ ODataClient.Get(MaterialSet, $ReadPolicy)'] },
        { severity: 'minor', kind: 'Domain model', title: 'Index recommendation', location: 'domain-model/Material', detail: 'Target runtime recommends an index for the new lookup path.', diff: ['  Material.PlantCode', '+ index Material(PlantCode, ExternalId)'] }
      ]
    };

    const root = mount(host, head, 'mendixAudit', (spec && spec.title) || 'Mendix migration audit', `
      <div class="pwb__toolbar">
        <div class="pwb__status" data-status data-tone="neutral" role="status" aria-live="polite">Ready · select a version boundary</div>
        <button class="pwb__button pwb__button--primary" type="button" data-audit>Run module audit</button>
      </div>
      <div class="pwb-audit__controls">
        <label for="${moduleId}">Module profile<select id="${moduleId}" data-module><option value="workflow">Workflow module</option><option value="operations">Operations UI</option><option value="connector">SAP data connector</option></select></label>
        <label for="${sourceId}">Source version<select id="${sourceId}" data-source><option value="8">Mendix 8</option><option value="9" selected>Mendix 9</option><option value="10">Mendix 10</option></select></label>
        <span class="pwb-audit__arrow" aria-hidden="true">→</span>
        <label for="${targetId}">Target version<select id="${targetId}" data-target><option value="9">Mendix 9</option><option value="10">Mendix 10</option><option value="11" selected>Mendix 11</option></select></label>
      </div>
      <div class="pwb-audit__summary" data-summary aria-label="Audit finding summary">
        <div><span>Critical</span><strong>—</strong></div><div><span>Major</span><strong>—</strong></div><div><span>Minor</span><strong>—</strong></div><div><span>Patchable</span><strong>—</strong></div>
      </div>
      <div class="pwb-audit__layout">
        <section class="pwb__panel" aria-labelledby="${moduleId}-findings">
          <div class="pwb__panel-title" id="${moduleId}-findings">Compatibility findings <span data-count>not audited</span></div>
          <div class="pwb__table-wrap" data-findings><span class="pwb__empty">Run the audit to inspect deprecated widgets and broken microflows.</span></div>
        </section>
        <aside class="pwb__panel pwb-audit__diff" aria-labelledby="${moduleId}-diff">
          <div class="pwb__panel-title" id="${moduleId}-diff">Proposed patch diff</div>
          <div data-diff><span class="pwb__empty">Select a finding to inspect a bounded patch.</span></div>
          <button class="pwb__button" type="button" data-patch disabled>Add selected patch to plan</button>
        </aside>
      </div>`);

    const session = createSession(root, ctx);
    const status = root.querySelector('[data-status]');
    const auditButton = root.querySelector('[data-audit]');
    const moduleSelect = root.querySelector('[data-module]');
    const sourceSelect = root.querySelector('[data-source]');
    const targetSelect = root.querySelector('[data-target]');
    let findings = [];
    let selected = -1;
    const planned = new Set();

    function validBoundary() {
      const valid = Number(targetSelect.value) > Number(sourceSelect.value);
      auditButton.disabled = !valid;
      if (!valid) setStatus(status, 'Blocked · target version must be newer than source', 'danger');
      else setStatus(status, `Ready · Mendix ${sourceSelect.value} → ${targetSelect.value}`, 'neutral');
      return valid;
    }

    function renderSummary() {
      const counts = ['critical', 'major', 'minor'].map(function (severity) { return findings.filter(function (item) { return item.severity === severity; }).length; });
      const values = counts.concat([planned.size]);
      root.querySelectorAll('[data-summary] strong').forEach(function (node, index) { node.textContent = findings.length ? String(values[index]) : '—'; });
    }

    function renderFindings() {
      const hostNode = root.querySelector('[data-findings]');
      root.querySelector('[data-count]').textContent = findings.length ? `${findings.length} findings` : 'not audited';
      if (!findings.length) {
        hostNode.innerHTML = '<span class="pwb__empty">Run the audit to inspect deprecated widgets and broken microflows.</span>';
        renderSummary();
        return;
      }
      hostNode.innerHTML = `<table><thead><tr><th>Severity</th><th>Finding</th><th>Location</th></tr></thead><tbody>${findings.map(function (item, index) {
        return `<tr class="${index === selected ? 'is-selected' : ''}"><td><span class="pwb-audit__severity" data-severity="${esc(item.severity)}">${esc(item.severity)}</span></td><td><button type="button" data-finding="${index}"><strong>${esc(item.title)}</strong><small>${esc(item.kind)}${planned.has(index) ? ' · patch planned' : ''}</small></button></td><td><code>${esc(item.location)}</code></td></tr>`;
      }).join('')}</tbody></table>`;
      renderSummary();
    }

    function renderDiff() {
      const item = findings[selected];
      const node = root.querySelector('[data-diff]');
      const patchButton = root.querySelector('[data-patch]');
      if (!item) {
        node.innerHTML = '<span class="pwb__empty">Select a finding to inspect a bounded patch.</span>';
        patchButton.disabled = true;
        return;
      }
      node.innerHTML = `<div class="pwb-audit__diff-head"><span class="pwb-audit__severity" data-severity="${esc(item.severity)}">${esc(item.severity)}</span><strong>${esc(item.title)}</strong><small>${esc(item.location)}</small></div><p>${esc(item.detail)}</p><pre>${item.diff.map(function (line) { return `<span data-line="${line.trim().startsWith('-') ? 'remove' : line.trim().startsWith('+') ? 'add' : 'context'}">${esc(line)}</span>`; }).join('\n')}</pre>`;
      patchButton.disabled = false;
      patchButton.textContent = planned.has(selected) ? 'Patch already in plan' : 'Add selected patch to plan';
      patchButton.disabled = planned.has(selected);
    }

    function clearResults() {
      session.nextGeneration();
      findings = [];
      selected = -1;
      planned.clear();
      renderFindings();
      renderDiff();
      validBoundary();
    }

    function audit() {
      if (!validBoundary()) return;
      const turn = session.nextGeneration();
      auditButton.disabled = true;
      findings = [];
      selected = -1;
      renderFindings();
      renderDiff();
      setStatus(status, 'Parsing module model and migration contracts', 'busy');
      session.later(function () {
        if (!session.isCurrent(turn)) return;
        setStatus(status, 'Checking widgets, microflows, and domain mappings', 'busy');
      }, 480);
      session.later(function () {
        if (!session.isCurrent(turn)) return;
        findings = fixtures[moduleSelect.value].map(function (item) { return Object.assign({}, item); });
        selected = 0;
        auditButton.disabled = false;
        renderFindings();
        renderDiff();
        setStatus(status, `${findings.length} findings · 1 blocking migration issue`, 'warning');
      }, 980);
    }

    [moduleSelect, sourceSelect, targetSelect].forEach(function (selectNode) { session.on(selectNode, 'change', clearResults); });
    session.on(auditButton, 'click', audit);
    session.on(root.querySelector('[data-findings]'), 'click', function (event) {
      const button = event.target.closest('[data-finding]');
      if (!button) return;
      selected = Number(button.dataset.finding);
      renderFindings();
      renderDiff();
      const selectedButton = root.querySelector(`[data-finding="${selected}"]`);
      if (selectedButton) selectedButton.focus();
    });
    session.on(root.querySelector('[data-patch]'), 'click', function () {
      if (selected < 0) return;
      planned.add(selected);
      renderFindings();
      renderDiff();
      setStatus(status, `Patch plan · ${planned.size} bounded ${planned.size === 1 ? 'change' : 'changes'} · no module written`, 'success');
    });
    validBoundary();
    return session.cleanup;
  }

  function release(spec, host, head, ctx) {
    const thresholdId = uid('release-threshold');
    const evidence = [
      { label: 'Structure maturity', score: 92, owner: 'Product configuration', evidence: 'BOM-C-204 · 184 / 184 lines classified' },
      { label: 'Validation coverage', score: 87, owner: 'Verification lead', evidence: 'VAL-772 · 61 / 64 checks passed' },
      { label: 'Change closure', score: 79, owner: 'Change coordinator', evidence: 'CHG-104 · 2 follow-ups remain open' },
      { label: 'Manufacturing readiness', score: 90, owner: 'Process planning', evidence: 'MFG-040 · route and work instructions released' }
    ];

    const root = mount(host, head, 'release', (spec && spec.title) || 'Release readiness gate', `
      <div class="pwb__toolbar">
        <div class="pwb__status" data-status data-tone="neutral" role="status" aria-live="polite">Gate preview · fixed evidence loaded</div>
        <button class="pwb__button pwb__button--primary" type="button" data-review>Review release gate</button>
      </div>
      <div class="pwb-release__threshold">
        <label for="${thresholdId}"><span>Required maturity</span><output for="${thresholdId}" data-threshold-output>85%</output></label>
        <input id="${thresholdId}" data-threshold type="range" min="60" max="100" step="1" value="85">
        <div><span>60%</span><span>Evidence scores remain fixed; only the decision boundary moves.</span><span>100%</span></div>
      </div>
      <div class="pwb-release__layout">
        <section class="pwb__panel" aria-labelledby="${thresholdId}-evidence">
          <div class="pwb__panel-title" id="${thresholdId}-evidence">Fixed release evidence <span>sanitized sample</span></div>
          <div class="pwb-release__evidence" data-evidence></div>
        </section>
        <aside class="pwb__panel pwb-release__decision" aria-labelledby="${thresholdId}-decision">
          <div class="pwb__panel-title" id="${thresholdId}-decision">Computed decision</div>
          <div class="pwb-release__verdict" data-verdict aria-live="polite"></div>
          <div class="pwb-release__blockers" data-blockers></div>
        </aside>
      </div>
      <section class="pwb__panel pwb-release__trace" aria-labelledby="${thresholdId}-trace">
        <div class="pwb__panel-title" id="${thresholdId}-trace">Gate evaluation trace</div>
        <ol data-trace>${evidence.map(function (item, index) { return `<li data-check="${index}" data-state="queued"><i></i><span>${esc(item.label)}</span><em>queued</em></li>`; }).join('')}</ol>
      </section>`);

    const session = createSession(root, ctx);
    const status = root.querySelector('[data-status]');
    const threshold = root.querySelector('[data-threshold]');
    const reviewButton = root.querySelector('[data-review]');

    function result() {
      const limit = Number(threshold.value);
      const failing = evidence.filter(function (item) { return item.score < limit; });
      return { limit, failing, go: failing.length === 0 };
    }

    function renderDecision(reviewed) {
      const evaluation = result();
      root.querySelector('[data-threshold-output]').textContent = `${evaluation.limit}%`;
      root.querySelector('[data-evidence]').innerHTML = evidence.map(function (item) {
        const pass = item.score >= evaluation.limit;
        return `<article data-result="${pass ? 'pass' : 'hold'}">
          <div><span>${esc(item.label)}</span><strong>${item.score}%</strong></div>
          <div class="pwb-release__bar" role="progressbar" aria-label="${esc(item.label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${item.score}"><i style="width:${item.score}%"></i><b style="left:${evaluation.limit}%" title="Threshold ${evaluation.limit}%"></b></div>
          <p>${esc(item.evidence)}</p><small>${pass ? 'clears gate' : `${evaluation.limit - item.score} points below gate`} · owner: ${esc(item.owner)}</small>
        </article>`;
      }).join('');
      root.querySelector('[data-verdict]').innerHTML = `<span data-go="${evaluation.go}">${evaluation.go ? 'GO' : 'NO-GO'}</span><strong>${evaluation.go ? 'Evidence clears the configured gate' : `${evaluation.failing.length} evidence ${evaluation.failing.length === 1 ? 'lane' : 'lanes'} below threshold`}</strong><p>${reviewed ? 'Reviewed against fixed, traceable evidence.' : 'Preview updates without changing source evidence.'}</p>`;
      root.querySelector('[data-blockers]').innerHTML = evaluation.go ? '<div class="pwb-release__clear"><strong>No maturity blockers</strong><span>All evidence owners remain visible in the gate record.</span></div>' : `<h4>Owned blockers</h4>${evaluation.failing.map(function (item) {
        return `<div><span>${esc(item.label)}</span><strong>${esc(item.owner)}</strong><small>${evaluation.limit - item.score} point gap · ${esc(item.evidence.split(' · ')[0])}</small></div>`;
      }).join('')}`;
      return evaluation;
    }

    function resetTrace() {
      root.querySelectorAll('[data-check]').forEach(function (row) {
        row.dataset.state = 'queued';
        row.querySelector('em').textContent = 'queued';
      });
    }

    function review() {
      const turn = session.nextGeneration();
      const evaluation = result();
      reviewButton.disabled = true;
      resetTrace();
      setStatus(status, `Reviewing fixed evidence against ${evaluation.limit}%`, 'busy');
      evidence.forEach(function (item, index) {
        session.later(function () {
          if (!session.isCurrent(turn)) return;
          const row = root.querySelector(`[data-check="${index}"]`);
          const pass = item.score >= evaluation.limit;
          row.dataset.state = pass ? 'passed' : 'failed';
          row.querySelector('em').textContent = pass ? `${item.score}% · pass` : `${item.score}% · hold`;
        }, index * 360);
      });
      session.later(function () {
        if (!session.isCurrent(turn)) return;
        const current = renderDecision(true);
        reviewButton.disabled = false;
        setStatus(status, current.go ? `GO · all evidence clears ${current.limit}%` : `NO-GO · ${current.failing.length} owned blockers below ${current.limit}%`, current.go ? 'success' : 'danger');
      }, evidence.length * 360 + 120);
    }

    session.on(threshold, 'input', function () {
      session.nextGeneration();
      reviewButton.disabled = false;
      resetTrace();
      const evaluation = renderDecision(false);
      setStatus(status, `Gate preview · ${evaluation.go ? 'GO' : 'NO-GO'} at ${evaluation.limit}%`, evaluation.go ? 'success' : 'warning');
    });
    session.on(reviewButton, 'click', review);
    renderDecision(false);
    return session.cleanup;
  }

  window.PROJECT_WORKBENCHES = Object.assign(window.PROJECT_WORKBENCHES || {}, {
    vision,
    testRunner,
    activity,
    fileCleaner,
    fabric,
    nxJournal,
    mendixAudit,
    release
  });
}());
