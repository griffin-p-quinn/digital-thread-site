(function installPortfolioApiFixture() {
  "use strict";

  const originalFetch = window.fetch.bind(window);
  const record = {
    id: "portfolio-demo-assembly-walkthrough",
    created_at: "2026-07-08T14:32:00Z",
    model: "Antigravity / Gemini 3.5 Flash (Medium)",
    source_file: {
      name: "assembly-line-walkthrough.mp4",
      mime_type: "video/mp4",
      size_bytes: 18432640
    },
    report: {
      summary: "A technician walks the final-assembly cell, pausing at the conveyor transfer and the guarding around station 04.",
      duration_estimate: "00:42",
      timeline: [
        {
          timestamp: "00:00",
          title: "Cell overview",
          description: "The clip opens on the conveyor transfer and the adjacent guarded work area.",
          confidence: "high"
        },
        {
          timestamp: "00:14",
          title: "Operator enters frame",
          description: "A technician approaches station 04 and checks the transfer point from the aisle.",
          confidence: "high"
        },
        {
          timestamp: "00:31",
          title: "Guarding detail",
          description: "The camera holds on the access gate, floor marking, and control pedestal.",
          confidence: "medium"
        }
      ],
      visual_observations: [
        "The conveyor is stationary for most of the clip.",
        "The access gate appears closed while the technician is in the aisle.",
        "Station 04 and the control pedestal remain visible in the final third."
      ],
      audio_observations: [
        "Ambient factory noise is present throughout.",
        "No clearly intelligible speech is detected."
      ],
      objects_entities: [
        "technician",
        "conveyor transfer",
        "safety gate",
        "control pedestal",
        "station 04"
      ],
      quality_notes: [
        "Handheld motion is moderate but the main equipment remains identifiable.",
        "Lighting is consistent across the clip."
      ],
      risks_or_anomalies: [
        "A loose cable or hose is visible near the marked pedestrian boundary at 00:34."
      ],
      recommended_questions: [
        "Is the cable or hose inside the approved routing zone?",
        "Was the conveyor intentionally stopped during this inspection?"
      ]
    }
  };

  let records = [record];

  function historyItem(item) {
    return {
      id: item.id,
      created_at: item.created_at,
      model: item.model,
      source_file: item.source_file,
      summary: item.report.summary,
      duration_estimate: item.report.duration_estimate
    };
  }

  function json(body, init) {
    return new Response(JSON.stringify(body), {
      status: (init && init.status) || 200,
      headers: { "content-type": "application/json" }
    });
  }

  window.fetch = async function portfolioFixtureFetch(input, init) {
    const rawUrl = typeof input === "string" ? input : input && input.url;
    const url = new URL(rawUrl || "", window.location.href);
    if (!url.pathname.startsWith("/api/")) {
      return originalFetch(input, init);
    }

    const method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();

    if (url.pathname === "/api/analyses" && method === "GET") {
      return json({ analyses: records.map(historyItem) });
    }

    if (url.pathname === "/api/analyze" && method === "POST") {
      let selectedFile;
      const body = init && init.body;
      if (body && typeof body.get === "function") {
        selectedFile = body.get("file");
      }

      const nextRecord = {
        ...record,
        id: "portfolio-demo-" + Date.now(),
        created_at: new Date().toISOString(),
        source_file: {
          name: (selectedFile && selectedFile.name) || "selected-video.mp4",
          mime_type: (selectedFile && selectedFile.type) || "video/mp4",
          size_bytes: (selectedFile && selectedFile.size) || 0
        }
      };
      records = [nextRecord, ...records];
      return json(nextRecord);
    }

    const match = url.pathname.match(/^\/api\/analyses\/([^/]+)$/);
    if (match && method === "GET") {
      const found = records.find((item) => item.id === decodeURIComponent(match[1]));
      return found ? json(found) : json({ detail: "Saved analysis was not found." }, { status: 404 });
    }

    if (match && method === "DELETE") {
      const id = decodeURIComponent(match[1]);
      records = records.filter((item) => item.id !== id);
      return new Response(null, { status: 204 });
    }

    return json({ detail: "This portfolio build uses a browser-safe sample API." }, { status: 404 });
  };
})();
