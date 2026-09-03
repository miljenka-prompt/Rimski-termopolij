import { Chronovisor } from "./chronovisor.js";
import { Diorama } from "./diorama.js?v=3";
import { Experience } from "./experience.js";

const loadingScreen = document.querySelector("#loadingScreen");
const chronovisor = new Chronovisor(
  document.querySelector("#chronovisor"),
  document.querySelector("#chronovisorVideo"),
);

let experience;
const diorama = new Diorama(document.querySelector("#diorama"), {
  onReady: () => loadingScreen.classList.add("is-hidden"),
  onARSupport: (supported) => experience?.handleARSupport(supported),
  onARState: (state) => experience?.handleARState(state),
});

experience = new Experience({ diorama, chronovisor });
experience.init();

try {
  await diorama.init();
  experience.handleARSupport(diorama.arSupported);
  experience.render();
} catch (error) {
  console.error("Eumachus experience failed to initialise.", error);
  loadingScreen.classList.add("is-hidden");
  document.querySelector("#arInstruction").textContent =
    "3D prikaz se nije učitao. Tekstualna priča ostaje dostupna.";
  document.querySelector("#arInstruction").classList.add("is-visible");
}

window.addEventListener("beforeunload", () => diorama.destroy(), { once: true });
