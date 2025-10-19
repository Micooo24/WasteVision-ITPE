// dashboard.js — handles upload, preview, showing result and history
const dashboard = (function () {
  const latestKey = "wv_latest_detection";
  let topLevelFile = null;

  function init() {
    bindUI();
    showGreeting();
    loadRecentSnippet();
  }

  function showGreeting() {
    const hour = new Date().getHours();
    let greeting = "Hello";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    const greetingEl = document.getElementById("greeting");
    if (greetingEl) greetingEl.textContent = greeting;
  }

  function bindUI() {
    document.getElementById("detectBtn").addEventListener("click", onDetect);
    document
      .getElementById("saveHistoryBtn")
      .addEventListener("click", saveLatestToHistory);

    const fileInput = document.getElementById("wasteFile");
    fileInput.addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (!f) return;
      topLevelFile = f;
      const img = document.getElementById("previewImage");
      img.src = URL.createObjectURL(f);
      document.getElementById("previewWrap").style.display = "block";
    });
  }

  async function onDetect() {
    const file = document.getElementById("wasteFile").files[0];
    if (!file) return alert("Please choose an image.");
    topLevelFile = file;
    setResultLoading();

    try {
      const detectBtn = document.getElementById("detectBtn");
      detectBtn.textContent = "Detecting...";
      detectBtn.disabled = true;

      const data = await sendToMicroservice(file);
      const imageUrl = URL.createObjectURL(file);

      const normalized = {
        detections: data.default_model?.detections || [],
        image: imageUrl,
        raw: data,
      };
      console.log(normalized);

      displayResult(normalized);
      localStorage.setItem(latestKey, JSON.stringify(normalized));
      loadRecentSnippet();
    } catch (err) {
      console.error("Detection error:", err);
      displayError(err.message || "Failed to detect waste. Please try again.");
    } finally {
      const detectBtn = document.getElementById("detectBtn");
      detectBtn.textContent = "Detect Waste";
      detectBtn.disabled = false;
    }
  }

  async function sendToMicroservice(file) {
    const formData = new FormData();
    formData.append("file", file);

    console.log("Sending file to microservice:", file.name, file.type, file.size);

    try {
      const response = await fetch("http://localhost:5000/identify", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Detection result:", result);
      return result;
    } catch (error) {
      console.error("Fetch error:", error);
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        throw new Error(
          "Cannot connect to detection service. Please make sure the microservice is running on localhost:5000"
        );
      }
      throw error;
    }
  }

  function setResultLoading() {
    const container = document.getElementById("resultContent");
    container.innerHTML = '<p class="muted">Processing image... please wait.</p>';
  }

  function displayResult(res) {
    const c = document.getElementById("resultContent");
    c.innerHTML = "";

    if (res.image) {
      const img = document.createElement("img");
      img.src = res.image;
      img.className = "preview-img";
      img.style.maxHeight = "200px";
      img.style.marginBottom = "16px";
      img.style.borderRadius = "8px";
      c.appendChild(img);
    }

    if (!res.detections || res.detections.length === 0) {
      const p = document.createElement("p");
      p.className = "muted";
      p.innerText = "No waste items detected in this image.";
      c.appendChild(p);
      return;
    }

    const resultsContainer = document.createElement("div");
    resultsContainer.className = "detection-results";

    res.detections.forEach((item) => {
      const d = document.createElement("div");
      d.className = `det-item ${getTypeClass(item.type)}`;

      const confidencePercent = item.confidence
        ? (item.confidence * 100).toFixed(1)
        : "N/A";

      d.innerHTML = `
        <div class="det-item-header">
          <strong class="item-name">${item.item || "Unknown Item"}</strong>
          <span class="confidence">${confidencePercent}%</span>
        </div>
        <div class="det-item-type">${item.type || "Unknown Type"}</div>
      `;

      resultsContainer.appendChild(d);
    });

    c.appendChild(resultsContainer);
  }

  function getTypeClass(type) {
    if (!type) return "";
    const typeMap = {
      recyclable: "type-recyclable",
      biodegradable: "type-biodegradable",
      hazardous: "type-hazardous",
      general: "type-general",
    };
    return typeMap[type.toLowerCase()] || "type-general";
  }

  function displayError(msg) {
    const c = document.getElementById("resultContent");
    c.innerHTML = `
      <div style="color: #dc3545; background: #f8d7da; padding: 12px; border-radius: 6px; border: 1px solid #f5c6cb;">
        <strong>Error:</strong> ${msg}
      </div>
    `;
  }

  async function saveLatestToHistory() {
    try {
      const latestData = localStorage.getItem(latestKey);
      if (!latestData) {
        alert("No detection results to save. Please detect waste first.");
        return;
      }

      const detectionData = JSON.parse(latestData);
      if (!topLevelFile) {
        alert("No image file found to save.");
        return;
      }

      const saveBtn = document.getElementById("saveHistoryBtn");
      const originalText = saveBtn.textContent;
      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to save records.");
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        return;
      }

      const formData = new FormData();
      formData.append("image", topLevelFile);

      const itemsData = detectionData.detections.map((detection) => ({
        item: detection.item || "Unknown",
        type: detection.type || "general",
        confidence: detection.confidence || 0,
      }));

      formData.append("items", JSON.stringify(itemsData));

      const response = await fetch("http://localhost:4000/api/v1/save-record", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("wv_user");
        alert("Session expired. Please log in again.");
        window.location.href = "/login.html";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save record");
      }

      const result = await response.json();
      console.log("Save result:", result);

      alert("Record saved successfully!");
      // loadRecentSnippet();
    } catch (error) {
      console.error("Save error:", error);
      // alert("Failed to save record: " + error.message);
    } finally {
      const saveBtn = document.getElementById("saveHistoryBtn");
      saveBtn.textContent = "Save to History";
      saveBtn.disabled = false;
    }
  }

  async function loadRecentSnippet() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const container = document.getElementById("recentList");
        if (container) container.innerHTML = '<p class="muted">Please log in to view history</p>';
        return;
      }
      // console.log(token)
      const response = await fetch("http://localhost:4000/api/v1/user-records", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const container = document.getElementById("recentList");
      if (!container) return;

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("wv_user");
        container.innerHTML = '<p class="muted">Please log in to view history</p>';
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load recent records");
      }

      const data = await response.json();
      const records = data.records || [];

      container.innerHTML = "";

      if (records.length === 0) {
        container.innerText = "No recent uploads.";
        return;
      }

      records.slice(0, 4).forEach((record) => {
        const el = document.createElement("div");
        el.className = "recent-item";

        const img = document.createElement("img");
        img.src = record.image?.url || "/placeholder-image.jpg";
        img.style.maxHeight = "70px";
        img.style.width = "70px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "4px";
        img.alt = "Detection result";
        img.onerror = function() {
          this.src = "/placeholder-image.jpg";
        };

        const label = document.createElement("div");
        label.style.fontSize = "12px";
        label.style.marginTop = "8px";
        label.style.textAlign = "center";

        const detectionCount = record.items ? record.items.length : 0;
        label.innerText = detectionCount > 0
          ? `${detectionCount} item${detectionCount !== 1 ? "s" : ""}`
          : "No items";

        el.appendChild(img);
        el.appendChild(label);
        container.appendChild(el);
      });
    } catch (error) {
      console.error("Error loading recent snippets:", error);
      const container = document.getElementById("recentList");
      if (container) {
        container.innerHTML = '<p class="muted">Error loading recent items</p>';
      }
    }
  }

  async function loadHistoryPage() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const cont = document.getElementById("historyContainer");
        if (cont) cont.innerHTML = '<p class="muted">Please log in to view history</p>';
        return;
      }

      const response = await fetch("http://localhost:4000/api/v1/user-records", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const cont = document.getElementById("historyContainer");
      if (!cont) return;

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("wv_user");
        cont.innerHTML = '<p class="muted">Please log in to view history</p>';
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load history");
      }

      const data = await response.json();
      const records = data.records || [];

      cont.innerHTML = "";

      if (records.length === 0) {
        cont.innerHTML = '<p class="muted">No saved detections yet.</p>';
        return;
      }

      records.forEach((record) => {
        const card = document.createElement("div");
        card.className = "history-card";

        const img = document.createElement("img");
        img.src = record.image?.url || "/placeholder-image.jpg";
        img.style.width = "100%";
        img.style.height = "150px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        img.alt = "Detection result";
        img.onerror = function() {
          this.src = "/placeholder-image.jpg";
        };

        const content = document.createElement("div");
        content.style.padding = "12px";

        const title = document.createElement("div");
        title.innerHTML = `<strong>Detection Results</strong>`;

        const meta = document.createElement("small");
        meta.className = "muted";
        meta.innerText = new Date(record.createdAt).toLocaleString();
        meta.style.display = "block";
        meta.style.marginBottom = "8px";

        const detectionsList = document.createElement("div");
        detectionsList.style.fontSize = "14px";

        if (record.items && record.items.length > 0) {
          record.items.slice(0, 3).forEach((item) => {
            const detEl = document.createElement("div");
            const confidencePercent = item.confidence ? (item.confidence * 100).toFixed(1) : "N/A";
            detEl.innerHTML = `• ${item.item} (${item.type}) - ${confidencePercent}%`;
            detectionsList.appendChild(detEl);
          });

          if (record.items.length > 3) {
            const moreEl = document.createElement("div");
            moreEl.innerHTML = `... and ${record.items.length - 3} more`;
            moreEl.style.color = "#666";
            detectionsList.appendChild(moreEl);
          }
        } else {
          detectionsList.innerHTML = "<div>No items detected</div>";
        }

        content.appendChild(title);
        content.appendChild(meta);
        content.appendChild(detectionsList);

        card.appendChild(img);
        card.appendChild(content);
        cont.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading history:", error);
      const cont = document.getElementById("historyContainer");
      if (cont) {
        cont.innerHTML = '<p class="muted">Error loading history</p>';
      }
    }
  }

  return { init, loadHistoryPage };
})();

document.addEventListener("DOMContentLoaded", function () {
  dashboard.init();
});