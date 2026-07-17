import "./vendor/ix-icons/ix-icons.esm.js";
import "./vendor/siemens-ix/siemens-ix.esm.js";

const requiredComponents = [
  "ix-application",
  "ix-application-header",
  "ix-menu",
  "ix-menu-item",
  "ix-button",
  "ix-toggle",
  "ix-pill",
  "ix-card",
  "ix-tabs",
  "ix-tab-item",
];

await Promise.all(requiredComponents.map((tagName) => customElements.whenDefined(tagName)));

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const app = $("#nexus-app");
const page = $("#nexus-page");
const schemaToggle = $("#schema-toggle");
const schemaLabel = $("#schema-label");
const runButton = $("#run-signal");
const pipeline = $("#pipeline");
const signalStatus = $("#signal-status");
const nodes = $$(".signal-node");
const detailStep = $("#detail-step");
const detailTitle = $("#detail-title");
const detailDescription = $("#detail-description");
const traceLabel = $("#trace-label");
const announcer = document.createElement("span");

announcer.className = "sr-only";
announcer.setAttribute("aria-live", "polite");
document.body.append(announcer);

const stages = [
  {
    step: "01 / EDGE INTAKE",
    title: "Capture a condition signal",
    description: "A shop-floor source enters the platform through an edge connection.",
    trace: "Condition signal received",
  },
  {
    step: "02 / FACTORY CONTEXT",
    title: "Unify signal and operating context",
    description: "Nexus relates the signal to the machine, process, and current operating state.",
    trace: "Operational context assembled",
  },
  {
    step: "03 / PATTERN INSIGHT",
    title: "Turn change into an explanation",
    description: "The platform compares the condition pattern with the surrounding production picture.",
    trace: "Condition pattern interpreted",
  },
  {
    step: "04 / OPERATOR ACTION",
    title: "Route insight into the workflow",
    description: "A unified alert gives the team enough context to decide what happens next.",
    trace: "Context-rich action prepared",
  },
];

const workflows = {
  maintenance: {
    overline: "PREDICTIVE MAINTENANCE",
    heading: "Plan around equipment condition.",
    description:
      "Connect machine signals with operating context so a developing issue becomes a maintenance decision.",
    points: [
      "Watch condition signals at the edge",
      "Relate changes to the operating state",
      "Route an actionable alert to the team",
    ],
  },
  quality: {
    overline: "QUALITY ASSURANCE",
    heading: "See defects in process context.",
    description:
      "Bring quality observations and production conditions together so teams can investigate the process, not just the symptom.",
    points: [
      "Combine visual and process observations",
      "Connect a finding to its production context",
      "Share the evidence behind the alert",
    ],
  },
  energy: {
    overline: "ENERGY OPTIMIZATION",
    heading: "Coordinate production and energy use.",
    description:
      "View operational demand alongside the production plan to make scheduling and optimization decisions with the full picture.",
    points: [
      "Track demand with production activity",
      "Expose where operating choices matter",
      "Carry recommendations into planning",
    ],
  },
};

let activeStage = 0;
let activeRun = 0;

function selectStage(index, announce = false) {
  activeStage = index;
  const stage = stages[index];
  nodes.forEach((node, nodeIndex) => {
    const selected = nodeIndex === index;
    node.classList.toggle("is-active", selected);
    node.setAttribute("aria-pressed", String(selected));
  });
  detailStep.textContent = stage.step;
  detailTitle.textContent = stage.title;
  detailDescription.textContent = stage.description;
  traceLabel.textContent = stage.trace;
  pipeline.style.setProperty("--active-stage", index);
  if (announce) announcer.textContent = `${stage.title}. ${stage.description}`;
}

function finishRun(runId) {
  if (runId !== activeRun) return;
  pipeline.classList.remove("is-running");
  pipeline.classList.add("is-complete");
  runButton.loading = false;
  signalStatus.variant = "success";
  signalStatus.outline = false;
  signalStatus.textContent = "Action ready";
  announcer.textContent = "The sample signal reached an operator action with its context attached.";
}

function runSignal() {
  activeRun += 1;
  const runId = activeRun;
  pipeline.classList.remove("is-complete");
  pipeline.classList.remove("is-running");
  void pipeline.offsetWidth;
  pipeline.classList.add("is-running");
  runButton.loading = true;
  signalStatus.variant = "warning";
  signalStatus.outline = false;
  signalStatus.textContent = "Signal moving";
  selectStage(0);

  stages.forEach((_, index) => {
    window.setTimeout(() => {
      if (runId !== activeRun) return;
      selectStage(index, true);
      if (index === stages.length - 1) {
        window.setTimeout(() => finishRun(runId), 520);
      }
    }, index * 560);
  });
}

function setSchema(schema) {
  document.documentElement.dataset.ixTheme = "classic";
  document.documentElement.dataset.ixColorSchema = schema;
  document.documentElement.style.colorScheme = schema;
  app.theme = "classic";
  app.colorSchema = schema;
  schemaLabel.textContent = schema === "light" ? "Light" : "Dark";
  schemaToggle.checked = schema === "light";
  announcer.textContent = `Classic ${schema} color schema applied.`;
}

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  $$('ix-menu-item[data-target]').forEach((item) => {
    item.active = item.dataset.target === id && !item.hasAttribute("slot");
  });
}

function renderWorkflow(key) {
  const workflow = workflows[key];
  if (!workflow) return;
  $("#workflow-overline").textContent = workflow.overline;
  $("#workflow-heading").textContent = workflow.heading;
  $("#workflow-description").textContent = workflow.description;
  const list = $("#workflow-points");
  list.replaceChildren(
    ...workflow.points.map((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      return item;
    }),
  );
  announcer.textContent = `${workflow.overline}. ${workflow.heading}`;
}

nodes.forEach((node, index) => node.addEventListener("click", () => selectStage(index, true)));
runButton.addEventListener("click", runSignal);

schemaToggle.addEventListener("checkedChange", (event) => {
  setSchema(event.detail ? "light" : "dark");
});

$("#workflow-tabs").addEventListener("tabChange", (event) => {
  renderWorkflow(String(event.detail || ""));
});

$$('ix-menu-item[data-target]').forEach((item) => {
  item.addEventListener("click", () => scrollToSection(item.dataset.target));
});

$("#header-capabilities").addEventListener("click", () => scrollToSection("capabilities"));
$("#explore-capabilities").addEventListener("click", () => scrollToSection("capabilities"));

page.addEventListener(
  "scroll",
  () => {
    const sections = ["overview", "capabilities", "workflows", "principles"];
    let current = "overview";
    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top < 180) current = id;
    });
    $$('ix-menu-item[data-target]').forEach((item) => {
      item.active = item.dataset.target === current && !item.hasAttribute("slot");
    });
  },
  { passive: true },
);

setSchema("dark");
selectStage(0);
renderWorkflow("maintenance");
document.documentElement.dataset.nexusReady = "true";
