// const energyValue = document.getElementById("energyValue")
// const energyPerSecond = document.getElementById("energyPerSecond")
// const stardustValue = document.getElementById("stardustValue")
// const stardustPerSecond = document.getElementById("stardustPerSecond")
// const prestigeValue = document.getElementById("prestigeValue")
// const clickerButton = document.getElementById("clickerButton")
// const clickValue = document.getElementById("clickValue")
// const autoClickValue = document.getElementById("autoClickValue")
// const tabs = document.querySelectorAll(".tab")
// const tabContents = document.querySelectorAll(".tab-content")
// const upgradesContainer = document.getElementById("upgradesContainer")
// const researchContainer = document.getElementById("researchContainer")
// const achievementsContainer = document.getElementById("achievementsContainer")
// const artifactsContainer = document.getElementById("artifactsContainer")
// const equippedArtifacts = document.getElementById("equippedArtifacts")
// const discoverArtifactButton = document.getElementById("discoverArtifactButton")
// const prestigeButton = document.getElementById("prestigeButton")
// const prestigeReward = document.getElementById("prestigeReward")
// const settingsModal = document.getElementById("settingsModal")
// const resetConfirmModal = document.getElementById("resetConfirmModal")
// const settingsButton = document.getElementById("settingsButton")
// const closeSettings = document.getElementById("closeSettings")
// const saveButton = document.getElementById("saveButton")
// const resetButton = document.getElementById("resetButton")
// const cancelResetButton = document.getElementById("cancelResetButton")
// const confirmResetButton = document.getElementById("confirmResetButton")
// const notification = document.getElementById("notification")
// const notificationTitle = document.getElementById("notificationTitle")
// const notificationMessage = document.getElementById("notificationMessage")
// const starsBg = document.getElementById("starsBg")

window.toggleArtifact = toggleArtifact;
window.discoverArtifact = discoverArtifact;
window.upgradeArtifact = function(index) {
  const artifact = gameState.artifacts[index];
  if (!artifact || artifact.level >= 5) return;
  const upgradeCost = artifact.level * 100;
  if (gameState.stardust < upgradeCost) {
    showNotification(
      "Not enough stardust",
      `You need ${upgradeCost} stardust to upgrade this artifact.`,
    );
    return;
  }
  gameState.stardust -= upgradeCost;
  artifact.level = (artifact.level || 1) + 1;
  gameState.energyPerSecond = calculateEnergyPerSecond();
  if (gameState.unlocked.stardust) {
    gameState.stardustPerSecond = calculateStardustPerSecond();
  }
  gameState.energyPerClick = calculateEnergyPerClick();
  showNotification(
    "Artifact Upgraded",
    `${artifact.name} is now level ${artifact.level}!`,
  );
  renderArtifacts();
  updateUI();
};
document.addEventListener("DOMContentLoaded", function() {
  init();
  const exportBtn = document.getElementById("exportSaveButton");
  if (exportBtn) exportBtn.addEventListener("click", exportSave);
  const importBtn = document.getElementById("importSaveButton");
  if (importBtn) importBtn.addEventListener("click", importSave);
  const importModal = document.getElementById("importModal");
  const closeImportModal = document.getElementById("closeImportModal");
  const importBase64Button = document.getElementById("importBase64Button");
  const importBase64Input = document.getElementById("importBase64Input");
  if (closeImportModal)
    closeImportModal.addEventListener("click", () => {
      importModal.classList.remove("active");
      importBase64Input.value = "";
    });
  if (importBase64Button)
    importBase64Button.addEventListener("click", () => {
      const base64 = importBase64Input.value.trim();
      if (!base64) {
        showNotification("Import Failed", "No base64 string provided.");
        return;
      }
      try {
        const json = decodeURIComponent(escape(atob(base64)));
        const imported = JSON.parse(json);
        if (
          imported &&
          typeof imported === "object" &&
          imported.energy !== undefined
        ) {
          gameState = imported;
          saveGame();
          updateUI();
          renderResearch();
          renderAchievements();
          renderArtifacts();
          showNotification("Import Successful", "Save loaded!");
          importModal.classList.remove("active");
          importBase64Input.value = "";
        } else {
          showNotification("Import Failed", "Invalid save string.");
        }
      } catch (err) {
        showNotification("Import Failed", "Could not parse base64 string.");
      }
    });
  // Export modal logic
  const exportModal = document.getElementById("exportModal");
  const closeExportModal = document.getElementById("closeExportModal");
  const exportBase64Output = document.getElementById("exportBase64Output");
  const copyExportBase64Button = document.getElementById(
    "copyExportBase64Button",
  );
  const downloadExportBase64Button = document.getElementById(
    "downloadExportBase64Button",
  );
  if (closeExportModal)
    closeExportModal.addEventListener("click", () => {
      exportModal.classList.remove("active");
      exportBase64Output.value = "";
    });
  if (copyExportBase64Button)
    copyExportBase64Button.addEventListener("click", () => {
      if (exportBase64Output && exportBase64Output.value) {
        navigator.clipboard.writeText(exportBase64Output.value).then(
          () => {
            showNotification("Copied", "Base64 save copied to clipboard!");
          },
          () => {
            showNotification("Copy Failed", "Could not copy to clipboard.");
          },
        );
      }
    });
  if (downloadExportBase64Button)
    downloadExportBase64Button.addEventListener("click", () => {
      if (exportBase64Output && exportBase64Output.value) {
        const blob = new Blob([exportBase64Output.value], {
          type: "text/plain",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cosmic_clicker_save.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification(
          "Export Successful",
          "Base64 save downloaded as file!",
        );
      }
    });
});

function exportSave() {
  const exportModal = document.getElementById("exportModal");
  const exportBase64Output = document.getElementById("exportBase64Output");
  if (exportModal && exportBase64Output) {
    // Convert gameState to base64
    const json = JSON.stringify(gameState);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    exportBase64Output.value = base64;
    exportModal.classList.add("active");
  }
}

function importSave() {
  const importModal = document.getElementById("importModal");
  if (importModal) {
    importModal.classList.add("active");
  }
}
