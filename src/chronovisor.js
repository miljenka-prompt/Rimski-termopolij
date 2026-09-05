export class Chronovisor {
  constructor(container, video) {
    this.container = container;
    this.video = video;
    this.retry = container.querySelector("#chronovisorRetry");
    this.active = false;
    this.retry?.addEventListener("click", (event) => {
      event.stopPropagation();
      void this.play();
    });
    this.video.addEventListener("playing", () => {
      if (this.retry) this.retry.hidden = true;
      this.container.classList.remove("is-waiting");
    });
    this.video.addEventListener("waiting", () => this.container.classList.add("is-waiting"));
    this.video.addEventListener("error", () => {
      this.container.classList.remove("is-waiting");
      if (this.retry) this.retry.hidden = false;
    });
  }

  async show(title) {
    this.active = true;
    this.container.hidden = false;
    const titleElement = this.container.querySelector("#chronovisorTitle");
    if (titleElement) titleElement.textContent = title;
    this.video.muted = true;
    await this.play();
  }

  async play() {
    this.container.classList.add("is-waiting");
    try {
      await this.video.play();
    } catch {
      this.container.classList.remove("is-waiting");
      if (this.retry) this.retry.hidden = false;
    }
  }

  hide() {
    this.active = false;
    this.video.pause();
    this.video.muted = true;
    this.container.hidden = true;
    this.container.classList.remove("is-waiting");
    if (this.retry) this.retry.hidden = true;
  }

  setSound(enabled) {
    this.video.muted = !enabled;
    if (enabled && this.active) void this.video.play();
  }
}
