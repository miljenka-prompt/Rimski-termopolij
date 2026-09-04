import { CONTENT, EVIDENCE_COLORS } from "./content.js?v=6";

class AmbientSound {
  constructor() {
    this.context = null;
    this.nodes = [];
  }

  async start() {
    if (this.context) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = 0.13;
    master.connect(context.destination);

    const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;

    const room = context.createBufferSource();
    room.buffer = buffer;
    room.loop = true;
    const roomFilter = context.createBiquadFilter();
    roomFilter.type = "bandpass";
    roomFilter.frequency.value = 740;
    roomFilter.Q.value = 0.55;
    const roomGain = context.createGain();
    roomGain.gain.value = 0.08;
    room.connect(roomFilter).connect(roomGain).connect(master);

    const fire = context.createBufferSource();
    fire.buffer = buffer;
    fire.loop = true;
    const fireFilter = context.createBiquadFilter();
    fireFilter.type = "highpass";
    fireFilter.frequency.value = 1650;
    const fireGain = context.createGain();
    fireGain.gain.value = 0.018;
    fire.connect(fireFilter).connect(fireGain).connect(master);

    const murmur = [98, 123, 147].map((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index === 1 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      const gain = context.createGain();
      gain.gain.value = 0.004 + index * 0.001;
      oscillator.connect(gain).connect(master);
      oscillator.start();
      return oscillator;
    });

    room.start();
    fire.start();
    await context.resume();
    this.context = context;
    this.nodes = [room, fire, ...murmur];
  }

  stop() {
    if (!this.context) return;
    this.nodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // Already stopped.
      }
    });
    void this.context.close();
    this.context = null;
    this.nodes = [];
  }
}

export class Experience {
  constructor({ diorama, chronovisor }) {
    this.diorama = diorama;
    this.chronovisor = chronovisor;
    this.language = localStorage.getItem("eumachus-language") === "en" ? "en" : "hr";
    this.sceneIndex = 0;
    this.viewpoint = "diorama";
    this.soundEnabled = false;
    this.ambient = new AmbientSound();
    this.instructionTimer = null;
    this.lastARState = null;

    this.elements = {
      sceneNumber: document.querySelector("#sceneNumber"),
      sceneKicker: document.querySelector("#sceneKicker"),
      sceneTitle: document.querySelector("#sceneTitle"),
      sceneDeck: document.querySelector("#sceneDeck"),
      sceneVoice: document.querySelector("#sceneVoice"),
      sceneBody: document.querySelector("#sceneBody"),
      scenePosition: document.querySelector("#scenePosition"),
      progressBar: document.querySelector("#progressBar"),
      previousScene: document.querySelector("#previousScene"),
      nextScene: document.querySelector("#nextScene"),
      enterAR: document.querySelector("#enterAR"),
      toggleView: document.querySelector("#toggleView"),
      toggleSound: document.querySelector("#toggleSound"),
      resetView: document.querySelector("#resetView"),
      evidenceLabel: document.querySelector("#evidenceLabel"),
      evidenceDot: document.querySelector("#evidenceDot"),
      evidenceDialog: document.querySelector("#evidenceDialog"),
      evidenceLegend: document.querySelector("#evidenceLegend"),
      evidenceSceneTitle: document.querySelector("#evidenceSceneTitle"),
      evidenceSceneText: document.querySelector("#evidenceSceneText"),
      arInstruction: document.querySelector("#arInstruction"),
    };
  }

  get copy() {
    return CONTENT[this.language];
  }

  get scene() {
    return this.copy.scenes[this.sceneIndex];
  }

  init() {
    this.bindEvents();
    this.setLanguage(this.language);
    this.render();
  }

  bindEvents() {
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => this.setLanguage(button.dataset.language));
    });

    this.elements.previousScene.addEventListener("click", () => this.go(-1));
    this.elements.nextScene.addEventListener("click", () => {
      if (this.sceneIndex === this.copy.scenes.length - 1) {
        this.sceneIndex = 0;
        this.render();
        return;
      }
      this.go(1);
    });

    this.elements.toggleView.addEventListener("click", () => this.toggleViewpoint());
    this.elements.toggleSound.addEventListener("click", () => void this.toggleSound());
    this.elements.resetView.addEventListener("click", () => this.diorama.resetView());
    this.elements.enterAR.addEventListener("click", () => void this.toggleAR());

    document.querySelector("#openEvidence").addEventListener("click", () => this.openEvidence());
    document.querySelector("#openSceneEvidence").addEventListener("click", () => this.openEvidence());
    document.querySelector("#closeEvidence").addEventListener("click", () => this.elements.evidenceDialog.close());
    this.elements.evidenceDialog.addEventListener("click", (event) => {
      if (event.target === this.elements.evidenceDialog) this.elements.evidenceDialog.close();
    });

    const stopAudio = () => {
      this.ambient.stop();
      this.chronovisor.setSound(false);
      this.soundEnabled = false;
      this.renderSoundState();
    };
    window.addEventListener("pagehide", stopAudio);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") stopAudio();
    });
  }

  setLanguage(language) {
    if (!CONTENT[language]) return;
    this.language = language;
    localStorage.setItem("eumachus-language", language);
    document.documentElement.lang = language;
    document.querySelectorAll("[data-language]").forEach((button) => {
      const active = button.dataset.language === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    this.renderStaticCopy();
    this.render();
    if (this.diorama.arSupportResolved) this.handleARSupport(this.diorama.arSupported);
  }

  renderStaticCopy() {
    document.querySelectorAll("[data-copy]").forEach((element) => {
      const value = this.copy.ui[element.dataset.copy];
      if (typeof value === "string") element.textContent = value;
    });
    this.elements.toggleSound.setAttribute(
      "aria-label",
      this.soundEnabled ? this.copy.ui.soundOff : this.copy.ui.soundOn,
    );
    this.elements.toggleView.querySelector("span").textContent =
      this.viewpoint === "chronovisor" ? this.copy.ui.diorama : this.copy.ui.chronovisor;
    this.elements.enterAR.querySelector("span").textContent =
      this.diorama.arSession ? this.copy.ui.exitAR : this.copy.ui.placeInSpace;
    this.renderLegend();
  }

  render() {
    const scene = this.scene;
    const total = this.copy.scenes.length;
    const evidence = this.copy.evidence.find((entry) => entry.id === scene.evidence);
    this.elements.sceneNumber.textContent = String(this.sceneIndex + 1).padStart(2, "0");
    this.elements.sceneKicker.textContent = scene.kicker;
    this.elements.sceneTitle.textContent = scene.title;
    this.elements.sceneDeck.textContent = scene.deck;
    this.elements.sceneVoice.textContent = `“${scene.voice}”`;
    this.elements.sceneBody.textContent = scene.body;
    this.elements.scenePosition.textContent = this.copy.ui.position(this.sceneIndex + 1, total);
    this.elements.progressBar.style.width = `${((this.sceneIndex + 1) / total) * 100}%`;
    this.elements.previousScene.disabled = this.sceneIndex === 0;
    this.elements.nextScene.querySelector("span").textContent =
      this.sceneIndex === total - 1 ? this.copy.ui.restart : this.copy.ui.next;
    this.elements.evidenceLabel.textContent = evidence.label;
    this.elements.evidenceDot.style.background = EVIDENCE_COLORS[scene.evidence];
    this.elements.evidenceDot.style.boxShadow = `0 0 0 4px ${EVIDENCE_COLORS[scene.evidence]}22`;
    this.elements.evidenceSceneTitle.textContent = scene.title;
    this.elements.evidenceSceneText.textContent = scene.evidenceText;
    document.querySelector("#chronovisorTitle").textContent = scene.title;
    this.diorama.setScene(scene);
  }

  renderLegend() {
    this.elements.evidenceLegend.replaceChildren();
    this.copy.evidence.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "legend-row";
      row.style.setProperty("--legend-color", EVIDENCE_COLORS[entry.id]);
      const dot = document.createElement("i");
      dot.setAttribute("aria-hidden", "true");
      const label = document.createElement("strong");
      label.textContent = entry.label;
      const description = document.createElement("span");
      description.textContent = entry.description;
      row.append(dot, label, description);
      this.elements.evidenceLegend.append(row);
    });
  }

  go(delta) {
    const target = Math.min(Math.max(this.sceneIndex + delta, 0), this.copy.scenes.length - 1);
    if (target === this.sceneIndex) return;
    this.sceneIndex = target;
    this.render();
  }

  async toggleViewpoint() {
    if (this.diorama.arSession) await this.diorama.stopAR();
    if (this.viewpoint === "diorama") {
      this.viewpoint = "chronovisor";
      await this.chronovisor.show(this.scene.title);
      if (this.soundEnabled) {
        this.ambient.stop();
        this.chronovisor.setSound(true);
      }
      this.elements.toggleView.querySelector("span").textContent = this.copy.ui.diorama;
      return;
    }
    this.viewpoint = "diorama";
    this.chronovisor.hide();
    if (this.soundEnabled) await this.ambient.start();
    this.elements.toggleView.querySelector("span").textContent = this.copy.ui.chronovisor;
  }

  async toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (this.viewpoint === "chronovisor") {
      this.ambient.stop();
      this.chronovisor.setSound(this.soundEnabled);
    } else if (this.soundEnabled) {
      await this.ambient.start();
    } else {
      this.ambient.stop();
    }
    this.renderSoundState();
  }

  renderSoundState() {
    this.elements.toggleSound.classList.toggle("sound-enabled", this.soundEnabled);
    this.elements.toggleSound.setAttribute(
      "aria-label",
      this.soundEnabled ? this.copy.ui.soundOff : this.copy.ui.soundOn,
    );
  }

  async toggleAR() {
    if (this.diorama.arSession) {
      await this.diorama.stopAR();
      return;
    }
    if (!this.diorama.arSupported && this.needsExternalARBrowser()) {
      this.openARInChrome();
      return;
    }
    if (!navigator.xr || typeof navigator.xr.requestSession !== "function") {
      this.showInstruction(this.copy.ui.unsupportedAR);
      return;
    }
    if (this.viewpoint === "chronovisor") {
      this.viewpoint = "diorama";
      this.chronovisor.hide();
      this.elements.toggleView.querySelector("span").textContent = this.copy.ui.chronovisor;
    }
    await this.diorama.startAR();
  }

  handleARSupport(supported) {
    const externalHandoff = !supported && this.needsExternalARBrowser();
    this.elements.enterAR.classList.toggle("is-fallback", !supported);
    this.elements.enterAR.querySelector("span").textContent = externalHandoff
      ? this.copy.ui.openARBrowser
      : this.copy.ui.placeInSpace;
    this.elements.enterAR.title = supported
      ? ""
      : externalHandoff
        ? this.copy.ui.openingARBrowser
        : this.copy.ui.unsupportedAR;
  }

  needsExternalARBrowser() {
    const parameters = new URLSearchParams(window.location.search);
    return /Android/i.test(navigator.userAgent) && !parameters.has("external-ar");
  }

  openARInChrome() {
    const url = new URL(window.location.href);
    url.searchParams.set("external-ar", "1");
    const target = `${url.host}${url.pathname}${url.search}${url.hash}`;
    const intent =
      `intent://${target}#Intent;scheme=https;package=com.android.chrome;` +
      `S.browser_fallback_url=${encodeURIComponent(url.href)};end`;
    this.showInstruction(this.copy.ui.openingARBrowser, true);
    window.location.href = intent;
  }

  handleARState(state) {
    if (state === this.lastARState && state !== "placed") return;
    this.lastARState = state;
    if (state === "finding") {
      this.elements.enterAR.querySelector("span").textContent = this.copy.ui.exitAR;
      this.showInstruction(this.copy.ui.findingSurface, true);
    } else if (state === "ready") {
      this.showInstruction(this.copy.ui.tapToPlace, true);
    } else if (state === "placed") {
      this.showInstruction(this.copy.ui.placed);
    } else if (state === "failed") {
      this.elements.enterAR.querySelector("span").textContent = this.copy.ui.placeInSpace;
      this.showInstruction(this.copy.ui.arFailed);
    } else if (state === "ended") {
      this.elements.enterAR.querySelector("span").textContent = this.copy.ui.placeInSpace;
      this.hideInstruction();
    }
  }

  showInstruction(message, persistent = false) {
    window.clearTimeout(this.instructionTimer);
    this.elements.arInstruction.textContent = message;
    this.elements.arInstruction.classList.add("is-visible");
    if (!persistent) {
      this.instructionTimer = window.setTimeout(() => this.hideInstruction(), 4200);
    }
  }

  hideInstruction() {
    window.clearTimeout(this.instructionTimer);
    this.elements.arInstruction.classList.remove("is-visible");
  }

  openEvidence() {
    this.elements.evidenceSceneTitle.textContent = this.scene.title;
    this.elements.evidenceSceneText.textContent = this.scene.evidenceText;
    this.elements.evidenceDialog.showModal();
  }
}
