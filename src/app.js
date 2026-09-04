import { Chronovisor } from "./chronovisor.js?v=6";
import { Diorama } from "./diorama.js?v=6";
import { Experience } from "./experience.js?v=6";

const loadingScreen = document.querySelector("#loadingScreen");

function finishLoading() {
  if (window.EumachusLoading) {
    window.EumachusLoading.complete();
    return;
  }
  loadingScreen.classList.add("is-hidden");
}

function showInitialisationFailure() {
  if (window.EumachusLoading) {
    window.EumachusLoading.fail();
    return;
  }
  loadingScreen.classList.add("is-hidden");
  const instruction = document.querySelector("#arInstruction");
  instruction.textContent = "3D prikaz se nije učitao. Tekstualna priča ostaje dostupna.";
  instruction.classList.add("is-visible");
}

async function initialiseExperience() {
  let diorama;
  try {
    const chronovisor = new Chronovisor(
      document.querySelector("#chronovisor"),
      document.querySelector("#chronovisorVideo"),
    );

    let experience;
    diorama = new Diorama(document.querySelector("#diorama"), {
      onReady: finishLoading,
      onARSupport: (supported) => experience?.handleARSupport(supported),
      onARState: (state) => experience?.handleARState(state),
    });

    experience = new Experience({ diorama, chronovisor });
    experience.init();
    await diorama.init();
    experience.render();
    window.addEventListener("beforeunload", () => diorama.destroy(), { once: true });
  } catch (error) {
    console.error("Eumachus experience failed to initialise.", error);
    diorama?.destroy();
    showInitialisationFailure();
  }
}

void initialiseExperience();
