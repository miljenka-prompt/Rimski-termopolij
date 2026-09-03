export class Chronovisor {
  constructor(container, video) {
    this.container = container;
    this.video = video;
    this.active = false;
  }

  async show(title) {
    this.active = true;
    this.container.hidden = false;
    const titleElement = this.container.querySelector("#chronovisorTitle");
    if (titleElement) titleElement.textContent = title;
    this.video.muted = true;
    try {
      await this.video.play();
    } catch {
      // The static frame remains a valid fallback until the visitor interacts.
    }
  }

  hide() {
    this.active = false;
    this.video.pause();
    this.video.muted = true;
    this.container.hidden = true;
  }

  setSound(enabled) {
    this.video.muted = !enabled;
    if (enabled && this.active) void this.video.play();
  }
}
