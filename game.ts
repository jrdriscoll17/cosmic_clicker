import { Upgrade } from "./upgrade.ts";
import { Research } from "./research.ts";
import { Achievement } from "./achievement.ts";
import { Artifact } from "./artifact.ts";
import { formatNumber, formatDecimal } from "./utils.ts";

export class Game {
  energy: number;
  energyPerClick: number;
  energyPerSecond: number;
  stardust: number;
  stardustPerSecond: number;
  prestigePoints: number;
  prestigeMultiplier: number;
  totalClicks: number;
  totalEnergy: number;
  lastUpdate: number;
  lastSave: number;
  researchPoints: number;
  researchPointsPerSecond: number;
  starSystemLevel: number;
  activeResearch: Research | null;
  researchProgress: number;
  allAchievements: Achievement[];
  completedAchievements: Achievement[];
  upgrades: Upgrade[];
  research: Research[];
  unlocked: { stardust: boolean; research: boolean; prestige: boolean };
  artifactSlots: Artifact[];
  artifacts: Artifact[];
  researchSpeedMultiplier: number;
  config: {
    autosaveInterval: number;
    updateInterval: number;
    offlineProgressMax: number;
    prestigeRequirement: number;
    prestigePointsFormula: Function;
    clickMultiplier: number;
    stardustUnlockEnergy: number;
    researchPointMultiplier: number;
  };

  constructor() {
    this.energy = 0;
    this.energyPerClick = 1;
    this.energyPerSecond = 0;
    this.stardust = 0;
    this.stardustPerSecond = 0;
    this.prestigePoints = 0;
    this.prestigeMultiplier = 1;
    this.totalClicks = 0;
    this.totalEnergy = 0;
    this.lastUpdate = Date.now();
    this.lastSave = Date.now();
    this.researchPoints = 0;
    this.researchPointsPerSecond = 0;
    this.starSystemLevel = 1;
    this.activeResearch = null;
    this.researchProgress = 0;
    this.completedAchievements = [];
    this.allAchievements = [
      new Achievement({
        id: "firstClick",
        name: "First Click",
        description: "Click the collector for the first time.",
        icon: "👆",
        isAchieved: () => this.totalClicks >= 1,
      }),
      new Achievement({
        id: "tenClicks",
        name: "Getting Started",
        description: "Click the collector 10 times.",
        icon: "🔟",
        isAchieved: () => this.totalClicks >= 10,
      }),
      new Achievement({
        id: "hundredClicks",
        name: "Click Master",
        description: "Click the collector 100 times.",
        icon: "💯",
        isAchieved: () => this.totalClicks >= 100,
      }),
      new Achievement({
        id: "thousandClicks",
        name: "Click Virtuoso",
        description: "Click the collector 1,000 times.",
        icon: "🖱️",
        isAchieved: () => this.totalClicks >= 1000,
      }),
      new Achievement({
        id: "firstUpgrade",
        name: "Upgrader",
        description: "Purchase your first upgrade.",
        icon: "🔼",
        isAchieved: () => this.upgrades.length > 0,
      }),
      new Achievement({
        id: "fiveUpgrades",
        name: "Upgrade Enthusiast",
        description: "Purchase 5 levels of any upgrade.",
        icon: "⏫",
        isAchieved: () => this.upgrades.length >= 5,
      }),
      new Achievement({
        id: "thousandEnergy",
        name: "Energy Wealthy",
        description: "Have 1,000 energy at once.",
        icon: "💰",
        isAchieved: () => this.energy >= 1000,
      }),
      new Achievement({
        id: "millionEnergy",
        name: "Energy Magnate",
        description: "Have 1,000,000 energy at once.",
        icon: "💎",
        isAchieved: () => this.energy >= 1000000,
      }),
      new Achievement({
        id: "firstResearch",
        name: "Researcher",
        description: "Complete your first research.",
        icon: "🔬",
        isAchieved: () => this.research.some((r) => r.state.purchased === true),
      }),
      new Achievement({
        id: "threeResearch",
        name: "Scientist",
        description: "Complete 3 different research projects.",
        icon: "🧪",
        isAchieved: () =>
          this.research.filter((r) => r.state.purchased === true).length >= 3,
      }),
      new Achievement({
        id: "firstStardust",
        name: "Stardust Collector",
        description: "Collect your first Stardust.",
        icon: "⭐",
        isAchieved: () => this.stardust >= 1,
      }),
      new Achievement({
        id: "hundredStardust",
        name: "Cosmic Dust",
        description: "Collect 100 Stardust.",
        icon: "✨",
        isAchieved: () => this.stardust >= 100,
      }),
      new Achievement({
        id: "firstAscension",
        name: "Ascended",
        description: "Perform your first Ascension.",
        icon: "🌠",
        isAchieved: () => this.prestigePoints >= 1,
      }),
      new Achievement({
        id: "thirdAscension",
        name: "Celestial Being",
        description: "Perform 3 Ascensions.",
        icon: "👼",
        isAchieved: () => this.prestigePoints >= 3,
        bonusDesc: "+10% energy from clicks",
      }),
    ];
    this.upgrades = [
      new Upgrade({
        id: "energyCollector",
        name: "Energy Collector",
        description: "A basic device that collects cosmic energy.",
        icon: "📡",
        baseCost: 15,
        costGrowth: 1.18,
        baseProduction: 0.05,
        productionGrowth: 0.05,
        unlockRequirement: 0,
      }),
      new Upgrade({
        id: "energyCapacitor",
        name: "Energy Capacitor",
        description: "Increases the amount of energy per click.",
        icon: "🔋",
        baseCost: 75,
        costGrowth: 1.25,
        clickIncrease: 1,
        unlockRequirement: 0,
      }),
      new Upgrade({
        id: "orbitalSatellite",
        name: "Orbital Satellite",
        description: "Collects energy from orbit.",
        icon: "🛰️",
        baseCost: 350,
        costGrowth: 1.18,
        baseProduction: 0.5,
        productionGrowth: 0.25,
        unlockRequirement: 150,
      }),
      new Upgrade({
        id: "quantumExtractor",
        name: "Quantum Extractor",
        description: "Uses quantum fields to extract energy from space-time.",
        icon: "⚛️",
        baseCost: 1500,
        costGrowth: 1.2,
        baseProduction: 2,
        productionGrowth: 0.5,
        unlockRequirement: 750,
      }),
      new Upgrade({
        id: "cosmicCondenser",
        name: "Cosmic Condenser",
        description: "Condenses cosmic radiation into pure energy.",
        icon: "🌀",
        baseCost: 7500,
        costGrowth: 1.22,
        baseProduction: 5,
        productionGrowth: 1,
        unlockRequirement: 3000,
      }),
      new Upgrade({
        id: "wormholeHarvester",
        name: "Wormhole Harvester",
        description: "Extracts energy from microscopic wormholes.",
        icon: "🕳️",
        baseCost: 35000,
        costGrowth: 1.25,
        baseProduction: 12,
        productionGrowth: 2.5,
        unlockRequirement: 15000,
      }),
      new Upgrade({
        id: "nebulaConverter",
        name: "Nebula Converter",
        description: "Converts nebula gases into pure cosmic energy.",
        icon: "☁️",
        baseCost: 150000,
        costGrowth: 1.27,
        baseProduction: 30,
        productionGrowth: 6,
        unlockRequirement: 50000,
      }),
      new Upgrade({
        id: "stardustCollector",
        name: "Stardust Collector",
        description: "Generates stardust from cosmic energy.",
        icon: "⭐",
        baseCost: 250000,
        costGrowth: 1.3,
        stardustProduction: 0.1,
        stardustGrowth: 0.05,
        unlockRequirement: 100000,
        requiresResearch: "stardustGeneration",
      }),
    ];
    this.research = [
      new Research({
        id: "improvedCollection",
        name: "Improved Collection",
        description: "Improves energy collection efficiency by 20%.",
        cost: 200,
        duration: 120,
        unlockRequirement: 0,
        effect: () => {
          this.energyPerSecond *= 1.2;
          this.showNotification(
            "Research Complete",
            "Improved Collection is now active.",
          );
        },
      }),
      new Research({
        id: "enhancedClicking",
        name: "Enhanced Clicking",
        description: "Increases energy per click by 30%.",
        cost: 400,
        duration: 180,
        unlockRequirement: 0,
        effect: () => {
          this.energyPerClick *= 1.3;
          this.showNotification(
            "Research Complete",
            "Enhanced Clicking is now active.",
          );
        },
      }),
      new Research({
        id: "stardustGeneration",
        name: "Stardust Generation",
        description: "Allows the collection of Stardust, a rare resource.",
        cost: 750,
        duration: 300,
        unlockRequirement: 2000,
        effect: () => {
          this.unlocked.stardust = true;
          document.getElementById("stardustResource")!.style.display = "flex";
          this.showNotification(
            "Research Complete",
            "You can now collect Stardust!",
          );
        },
      }),
      new Research({
        id: "prestige",
        name: "Ascension Technology",
        description: "Allows you to ascend and gain permanent bonuses.",
        cost: 3000,
        duration: 450,
        unlockRequirement: 10000,
        effect: () => {
          this.unlocked.prestige = true;
          document.getElementById("prestigeResource")!.style.display = "flex";
          document.getElementById("ascensionTab")!.style.display = "";
          this.showNotification(
            "Research Complete",
            "You can now Ascend for permanent bonuses!",
          );
        },
      }),
      new Research({
        id: "efficientResearch",
        name: "Efficient Research",
        description: "Increases research speed by 25%.",
        cost: 1200,
        duration: 240,
        unlockRequirement: 5000,
        effect: () => {
          this.researchSpeedMultiplier *= 1.25;
          this.showNotification(
            "Research Complete",
            "Research now completes 25% faster!",
          );
        },
      }),
      new Research({
        id: "stardustEfficiency",
        name: "Stardust Efficiency",
        description: "Increases stardust production by 50%.",
        cost: 2500,
        duration: 360,
        unlockRequirement: 12000,
        requiresResearch: "stardustGeneration",
        effect: () => {
          this.stardustPerSecond *= 1.5;
          this.showNotification(
            "Research Complete",
            "Stardust production increased by 50%!",
          );
        },
      }),
      new Research({
        id: "celestialHarmonics",
        name: "Celestial Harmonics",
        description: "Increases prestige points gained by 20%.",
        cost: 5000,
        duration: 600,
        unlockRequirement: 20000,
        requiresResearch: "prestige",
        effect: () => {
          this.config.prestigePointsFormula = (energy: number) =>
            Math.floor(Math.sqrt(energy / 2500) * 1.2);
          this.showNotification(
            "Research Complete",
            "Prestige points gained increased by 20%!",
          );
        },
      }),
    ];
    this.unlocked = { stardust: false, research: false, prestige: false };
    this.artifactSlots = [];
    this.artifacts = [
      new Artifact({
        id: "energyCrystal",
        name: "Energy Crystal",
        description: "A crystal that amplifies passive energy production.",
        rarity: "common",
        effect: { type: "energyMultiplier", value: 1.1 },
      }),
      new Artifact({
        id: "cosmicShard",
        name: "Cosmic Shard",
        description: "A shard that enhances click power.",
        rarity: "common",
        effect: { type: "clickMultiplier", value: 1.15 },
      }),
      new Artifact({
        id: "starFragment",
        name: "Star Fragment",
        description:
          "A fragment from a distant star that boosts stardust production.",
        rarity: "uncommon",
        effect: { type: "stardustBonus", value: 0.25 },
      }),
      new Artifact({
        id: "quantumLens",
        name: "Quantum Lens",
        description:
          "Focuses cosmic rays for more click power, but reduces passive energy (-10%).",
        rarity: "uncommon",
        effect: {
          type: "clickMultiplier",
          value: 1.25,
          sideEffect: { type: "energyMultiplier", value: 0.9 },
        },
      }),
      new Artifact({
        id: "dustyComet",
        name: "Dusty Comet",
        description:
          "A comet that leaves a trail of stardust with every click (+30% stardust per click).",
        rarity: "rare",
        effect: { type: "stardustBonus", value: 0.3, onlyOnClick: true },
      }),
      new Artifact({
        id: "researchTome",
        name: "Research Tome",
        description: "Ancient knowledge that speeds up research.",
        rarity: "rare",
        effect: { type: "researchSpeed", value: 1.5 },
      }),
      new Artifact({
        id: "celestialCore",
        name: "Celestial Core",
        description: "A core that boosts all production.",
        rarity: "rare",
        effect: { type: "allProduction", value: 1.2 },
      }),
      new Artifact({
        id: "ancientRelic",
        name: "Ancient Relic",
        description: "A relic that increases prestige points gained.",
        rarity: "epic",
        effect: { type: "prestigeBonus", value: 1.4 },
      }),
      new Artifact({
        id: "voidFragment",
        name: "Void Fragment",
        description:
          "A fragment from the void: +30% all production, disables click upgrades.",
        rarity: "epic",
        effect: {
          type: "allProduction",
          value: 1.3,
          disables: "clickUpgrades",
        },
      }),
      new Artifact({
        id: "stellarBattery",
        name: "Stellar Battery",
        description:
          "Stores cosmic energy for a burst: +25% energy/s, disables stardust gain.",
        rarity: "epic",
        effect: {
          type: "energyMultiplier",
          value: 1.25,
          disables: "stardust",
        },
      }),
    ];
    this.researchSpeedMultiplier = 1;
    this.config = {
      autosaveInterval: 30000,
      updateInterval: 1000,
      offlineProgressMax: 24 * 60 * 60 * 1000,
      prestigeRequirement: 25000,
      prestigePointsFormula: () =>
        Math.floor(Math.sqrt((this.totalEnergy || 0) / 2500)),
      clickMultiplier: 1,
      stardustUnlockEnergy: 5000,
      researchPointMultiplier: 1,
    };
    this.createStars();
    this.setupTabs();
    this.setupModals();
    this.setupClicker();
    this.setupPrestige();
    this.setupArtifacts();
    this.loadGame();
    this.gameLoop();
    this.setupTabs();
  }

  showNotification(title: string, message: string) {
    const notification = document.getElementById("notification")!;
    const notificationTitle = document.getElementById("notificationTitle")!;
    const notificationMessage = document.getElementById("notificationMessage")!;

    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  updateEnergyPerSecond() {
    let total = 0;

    for (const upgrade of this.upgrades) {
      const { baseProduction, productionGrowth, level } = upgrade.state;

      if (!baseProduction || !productionGrowth) continue;

      const productionPerItem = baseProduction + productionGrowth * (level - 1);
      total += productionPerItem * level;
    }

    total *= 1 + this.prestigePoints * 0.1;

    for (const artifact of this.artifactSlots) {
      const { type, value } = artifact.state.effect;

      if (!["energyMultiplier", "allProduction"].includes(type)) continue;

      total *= value;
    }

    this.energyPerSecond = total;
  }

  updateStardustPerSecond() {
    let total = 0;

    const stardustCollector = this.upgrades.find(
      (u) => u.state.id === "stardustCollector",
    );

    if (!stardustCollector) throw Error();

    const { level, stardustProduction, stardustGrowth } =
      stardustCollector.state;

    if (level > 0 && stardustProduction && stardustGrowth) {
      total +=
        stardustProduction +
        stardustGrowth *
        (stardustCollector.state.level - 1) *
        stardustCollector.state.level;
    }

    total *= 1 + this.prestigePoints * 0.05;

    let stardustBonusMultiplier = 1;
    let allProductionMultiplier = 1;

    for (const artifact of this.artifactSlots) {
      const { type, value } = artifact.state.effect;

      if (type === "stardustBonus") stardustBonusMultiplier *= 1 + value;
      if (type === "allProduction") allProductionMultiplier *= value;
    }

    total *= stardustBonusMultiplier;
    total *= allProductionMultiplier;

    this.stardustPerSecond = total;
  }

  updateEnergyPerClick() {
    let total = 1;

    for (const upgrade of this.upgrades) {
      if (!upgrade.state.clickIncrease) continue;

      total += upgrade.state.clickIncrease * upgrade.state.level;
    }

    if (this.research.find(({ state: { id } }) => id === "enhancedClicking")) {
      total *= 1.3;
    }

    for (const artifact of this.artifactSlots) {
      const { type, value } = artifact.state.effect;

      if (["clickMultiplier", "allProduction"].includes(type)) total *= value;
    }

    total *= this.config.clickMultiplier || 1;

    this.energyPerClick = total;
  }

  updateResearchSpeed() {
    let researchSpeed = 1;

    for (const artifact of this.artifactSlots) {
      if (artifact.state.effect.type !== "researchSpeed") continue;

      researchSpeed *= artifact.state.effect.value;
    }

    this.researchSpeedMultiplier = researchSpeed;
  }

  renderAchievements() {
    const achievementsContainer = document.getElementById(
      "achievementsContainer",
    )!;
    achievementsContainer.innerHTML = "";

    for (const { state } of this.allAchievements) {
      const { isAchieved, icon, name, description, bonusDesc } = state;

      const achievementElement = document.createElement("div");
      achievementElement.className = `achievement ${isAchieved() ? "unlocked" : "locked"}`;
      achievementElement.innerHTML = `
      <div class="achievement-icon">${icon}</div>
      <div class="achievement-name">${name}</div>
      <div class="achievement-desc">${description}</div>
      ${bonusDesc && isAchieved() ? `<div class="upgrade-effect">${bonusDesc}</div>` : ""}
    `;

      achievementsContainer.appendChild(achievementElement);
    }
  }

  checkAchievements() {
    let newAchievements = false;

    for (const achievement of this.allAchievements) {
      const { isAchieved, name, id } = achievement.state;

      if (isAchieved() && !this.completedAchievements.includes(achievement)) {
        this.completedAchievements.push(achievement);

        newAchievements = true;

        this.showNotification("Achievement Unlocked", `${name}`);

        if (id === "thirdAscension") this.config.clickMultiplier = 1.1;
      }
    }

    if (newAchievements) this.renderAchievements();
  }

  updateUI() {
    const energyValue = document.getElementById("energyValue")!;
    energyValue.textContent = formatNumber(this.energy);

    const energyPerSecond = document.getElementById("energyPerSecond")!;
    energyPerSecond.textContent = `${formatDecimal(this.energyPerSecond)} per second`;

    if (this.unlocked.stardust) {
      const stardustValue = document.getElementById("stardustValue")!;
      stardustValue.textContent = formatNumber(this.stardust);

      const stardustPerSecond = document.getElementById("stardustPerSecond")!;
      stardustPerSecond.textContent = `${formatDecimal(this.stardustPerSecond)} per second`;
    }

    // Always use a fresh DOM reference for prestigeValue
    const prestigeValueElem = document.getElementById("prestigeValue");

    if (
      (this.unlocked.prestige || this.prestigePoints > 0) &&
      prestigeValueElem
    ) {
      prestigeValueElem.textContent = formatNumber(this.prestigePoints);
      document.getElementById("prestigeResource")!.style.display = "flex";
    }

    this.updateEnergyPerClick();
    this.updateResearchSpeed();

    const clickValue = document.getElementById("clickValue")!;
    clickValue.textContent = this.energyPerClick.toFixed(2);

    const autoClickValue = document.getElementById("autoClickValue")!;
    autoClickValue.textContent = formatDecimal(this.energyPerSecond);

    const prestigeReward = document.getElementById("prestigeReward")!;
    prestigeReward.textContent = formatNumber(
      this.config.prestigePointsFormula(this.energy),
    );

    const prestigeButton = document.getElementById(
      "prestigeButton",
    ) as HTMLButtonElement;
    prestigeButton.disabled = this.energy <= this.config.prestigeRequirement;

    const discoverArtifactButton = document.getElementById(
      "discoverArtifactButton",
    ) as HTMLButtonElement | undefined;

    if (discoverArtifactButton) {
      discoverArtifactButton.disabled =
        !this.unlocked.stardust || this.stardust < 100;
    }

    this.renderUpgrades();

    if (this.activeResearch) {
      const researchItem = document.getElementById(
        `research-${this.activeResearch}`,
      );

      if (researchItem) {
        const progressBar =
          (researchItem.querySelector(
            ".research-progress-bar",
          ) as HTMLElement) || undefined;

        if (progressBar) {
          const progressPercent =
            (this.researchProgress / this.activeResearch.state.duration) * 100;
          progressBar.style.width = `${progressPercent}%`;
        }
      }
    }
  }

  renderUpgrades() {
    const upgradesContainer = document.getElementById("upgradesContainer")!;
    upgradesContainer.innerHTML = "";

    for (const upgrade of this.upgrades) {
      if (this.totalEnergy < upgrade.state.unlockRequirement) continue;

      if (upgrade.state.requiresResearch) {
        const research = this.research.find(
          ({ state }) => state.id === upgrade.state.requiresResearch,
        );
        if (research?.state.purchased === false) continue;
      }

      const isAffordable = this.energy >= upgrade.getCost();

      const upgradeElement = document.createElement("div");
      upgradeElement.className = `upgrade ${isAffordable ? "" : "disabled"}`;
      upgradeElement.id = `upgrade-${upgrade.state.id}`;

      let effectText = "";

      const {
        level,
        baseProduction,
        productionGrowth,
        stardustProduction,
        stardustGrowth,
        clickIncrease,
      } = upgrade.state;

      if (baseProduction && productionGrowth) {
        const currentProduction =
          level > 0
            ? baseProduction + productionGrowth * (level - 1)
            : baseProduction;
        effectText = `+${formatDecimal(currentProduction)} energy/s each`;
      } else if (clickIncrease) {
        effectText = `+${formatNumber(clickIncrease)} energy per click each`;
      } else if (stardustProduction && stardustGrowth) {
        const currentProduction =
          level > 0
            ? stardustProduction + stardustGrowth * (level - 1)
            : stardustProduction;
        effectText = `+${formatDecimal(currentProduction)} stardust/s each`;
      }

      upgradeElement.innerHTML = `
      <div class="upgrade-info">
        <div class="upgrade-name">
          <span class="upgrade-icon">${upgrade.state.icon}</span>
          ${upgrade.state.name}
          ${level > 0 ? `<span class="upgrade-level">Lvl ${level}</span>` : ""}
        </div>
        <div class="upgrade-desc">${upgrade.state.description}</div>
        <div class="upgrade-effect">${effectText}</div>
      </div>
      <div class="upgrade-cost ${isAffordable ? "affordable" : "not-affordable"}">
        ${formatNumber(upgrade.getCost())}
      </div>
      <div class="progress-bar" style="width: 0%"></div>
    `;

      upgradeElement.addEventListener("click", () => {
        if (!isAffordable) return;

        this.energy -= upgrade.getCost();
        upgrade.state.level += 1;

        this.updateEnergyPerSecond();

        if (this.unlocked.stardust) this.updateStardustPerSecond();

        this.updateEnergyPerClick();

        this.updateUI();

        const progressBar = upgradeElement.querySelector(
          ".progress-bar",
        ) as HTMLElement;
        progressBar.style.width = "100%";
        setTimeout(() => {
          progressBar.style.width = "0%";
        }, 500);

        this.showNotification(
          "Upgrade Purchased",
          `You purchased ${upgrade.state.name} level ${upgrade.state.level}`,
        );

        this.checkAchievements();
      });

      const upgradesContainer = document.getElementById("upgradesContainer")!;
      upgradesContainer.appendChild(upgradeElement);
    }
  }

  toggleArtifact(artifact: Artifact) {
    if (this.artifactSlots.includes(artifact)) {
      this.artifactSlots = this.artifactSlots.filter((a) => a !== artifact);
    } else {
      if (this.artifactSlots.length >= 3) {
        this.showNotification(
          "Artifact Slots Full",
          "Unequip an artifact first to equip this one.",
        );
        return;
      }

      this.artifactSlots.push(artifact);
    }

    this.updateEnergyPerSecond();
    if (this.unlocked.stardust) this.updateStardustPerSecond();
    this.updateEnergyPerClick();
    this.renderArtifacts();
    this.updateUI();
  }

  renderArtifacts() {
    const artifactsContainer = document.getElementById("artifactsContainer");

    if (!artifactsContainer) return;

    artifactsContainer.innerHTML = "";

    for (const artifact of this.artifacts) {
      const { rarity, effect, level } = artifact.state;

      let rarityColor = "var(--text)";
      switch (rarity) {
        case "uncommon":
          rarityColor = "#2dce89";
          break;
        case "rare":
          rarityColor = "#5e72e4";
          break;
        case "epic":
          rarityColor = "#fb6ed3";
          break;
      }

      let effectText = "";
      switch (effect.type) {
        case "energyMultiplier":
          effectText = `+${Math.round((effect.value - 1) * 100)}% energy production`;
          break;
        case "clickMultiplier":
          effectText = `+${Math.round((effect.value - 1) * 100)}% click power`;
          break;
        case "stardustBonus":
          effectText = `+${Math.round(effect.value * 100)}% stardust production`;
          break;
        case "allProduction":
          effectText = `+${Math.round((effect.value - 1) * 100)}% all production`;
          break;
        case "prestigeBonus":
          effectText = `+${Math.round((effect.value - 1) * 100)}% prestige points`;
          break;
        case "researchSpeed":
          effectText = `+${Math.round((effect.value - 1) * 100)}% research speed`;
          break;
      }

      let upgradeBtn = "";
      if (level < 5) {
        upgradeBtn = `<button class="modal-button" style="margin-left:10px;" onclick="window.upgradeArtifact(${index})">Upgrade (${artifact.state.level}/5)</button>`;
      } else {
        upgradeBtn = `<span style="margin-left:10px; color:var(--text-secondary);">Max</span>`;
      }

      const isEquipped = this.artifactSlots.includes(artifact);

      const artifactElement = document.createElement("div");
      artifactElement.className = `upgrade ${isEquipped ? "equipped" : ""}`;
      artifactElement.innerHTML = `
      <div class="upgrade-info">
        <div class="upgrade-name">
          <span class="upgrade-icon">🔮</span>
          ${artifact.state.name}
          <span class="upgrade-level" style="background-color: ${rarityColor};">
            ${artifact.state.rarity} Lvl ${artifact.state.level || 1}
          </span>
        </div>
        <div class="upgrade-desc">${artifact.state.description}</div>
        <div class="upgrade-effect">${effectText}</div>
      </div>
      <div class="upgrade-cost ${isEquipped ? "equipped" : ""}">
        ${isEquipped ? "Unequip" : "Equip"}
        ${upgradeBtn}
      </div>
    `;
      artifactElement.addEventListener("click", (e) => {
        if (!e.target?.closest("button")) this.toggleArtifact(artifact);
      });
      artifactsContainer.appendChild(artifactElement);
    }
    const equippedArtifacts = document.getElementById("equippedArtifacts");
    if (!equippedArtifacts) return;

    equippedArtifacts.innerHTML = "";

    if (this.artifactSlots.length === 0) {
      equippedArtifacts.innerHTML =
        '<div class="panel-subtitle">No artifacts equipped.</div>';
    } else {
      for (const artifact of this.artifactSlots) {
        const slotElement = document.createElement("div");
        slotElement.className = "research-item equipped";
        slotElement.innerHTML = `
          <div class="research-name">${artifact.state.name} (Lvl ${artifact.state.level || 1})</div>
          <div class="research-desc">${artifact.state.description}</div>
        `;
        equippedArtifacts.appendChild(slotElement);
      }
    }
  }

  setupTabs() {
    let tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach((tab) => {
      const clone = tab.cloneNode(true);
      tab.parentNode?.replaceChild(clone, tab);
    });

    tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        const tabId = tab.getAttribute("data-tab");
        document.getElementById(`${tabId}Tab`)!.classList.add("active");
        if (tabId === "artifacts") {
          this.renderArtifacts();
        }
      });
    });
  }

  renderResearch() {
    const inProgressSection = document.getElementById(
      "researchInProgressSection",
    );
    if (inProgressSection) inProgressSection.innerHTML = "";

    const availableSection = document.getElementById(
      "availableResearchSection",
    );
    if (availableSection) availableSection.innerHTML = "";

    const completedSection = document.getElementById(
      "completedResearchSection",
    );
    if (completedSection) completedSection.innerHTML = "";

    const inProgress: Research[] = [];
    const available: Research[] = [];
    const completed: Research[] = [];

    for (const research of this.research) {
      const isUnlocked = this.totalEnergy >= research.state.unlockRequirement;
      if (!isUnlocked) continue;

      if (research.state.requiresResearch) {
        const reqiredResearch = this.research.find(
          (r) => r.state.id === research.state.requiresResearch,
        )!;
        if (reqiredResearch.state.purchased === false) continue;
      }

      const isInProgress = this.activeResearch === research;

      if (research.state.purchased === true) completed.push(research);
      else if (isInProgress) inProgress.push(research);
      else available.push(research);
    }

    if (inProgressSection && inProgress.length > 0) {
      inProgressSection.innerHTML =
        '<h3 style="color:var(--accent);margin-bottom:8px;">In Progress</h3>';
      inProgress.forEach((research) => {
        const researchElement = document.createElement("div");
        researchElement.className = "research-item in-progress";
        researchElement.id = `research-${research.state.id}`;
        const minutes = Math.floor(research.state.duration / 60);
        const seconds = (research.state.duration % 60)
          .toString()
          .padStart(2, "0");
        const progressPercent =
          (this.researchProgress / research.state.duration) * 100;
        researchElement.innerHTML = `
        <div class="research-name">${research.state.name}</div>
        <div class="research-desc">${research.state.description}</div>
        <div class="research-cost">Time: ${minutes}:${seconds}</div>
        <div class="research-progress">
          <div class="research-progress-bar" style="width: ${progressPercent}%"></div>
        </div>
      `;
        inProgressSection.appendChild(researchElement);
      });
    }

    if (availableSection && available.length > 0) {
      availableSection.innerHTML =
        '<h3 style="color:var(--accent);margin-bottom:8px;">Available Research</h3>';
      available.forEach((research) => {
        const isAffordable = this.energy >= research.state.cost;
        const researchElement = document.createElement("div");
        researchElement.className =
          "research-item" + (isAffordable ? "" : " locked");
        researchElement.id = `research-${research.state.id}`;
        const minutes = Math.floor(research.state.duration / 60);
        const seconds = (research.state.duration % 60)
          .toString()
          .padStart(2, "0");
        researchElement.innerHTML = `
        <div class="research-name">${research.state.name}</div>
        <div class="research-desc">${research.state.description}</div>
        <div class="research-cost">Cost: ${formatNumber(research.state.cost)} energy | Time: ${minutes}:${seconds}</div>
      `;
        if (isAffordable && !this.activeResearch) {
          researchElement.addEventListener("click", () => {
            this.energy -= research.state.cost;
            this.activeResearch = research;
            this.researchProgress = 0;
            this.updateUI();
            this.renderResearch();
            this.showNotification(
              "Research Started",
              `You started researching ${research.state.name}`,
            );
            this.setupTabs();
          });
        }
        availableSection.appendChild(researchElement);
      });
    }

    if (completedSection && completed.length > 0) {
      completedSection.innerHTML =
        '<h3 style="color:var(--accent);margin-bottom:8px;">Completed Research</h3>';
      completed.forEach((research) => {
        const researchElement = document.createElement("div");
        researchElement.className = "research-item researched";
        researchElement.id = `research-${research.state.id}`;
        researchElement.innerHTML = `
        <div class="research-name">${research.state.name}</div>
        <div class="research-desc">${research.state.description}</div>
      `;
        completedSection.appendChild(researchElement);
      });
    }
  }

  updateResearch(deltaTime: number) {
    if (this.activeResearch) {
      this.researchProgress += deltaTime / 1000;
      if (this.researchProgress >= this.activeResearch.state.duration) {
        this.research.find(
          (r) => r.state.id === this.activeResearch!.state.id,
        )!.state.purchased = true;
        this.activeResearch.state.effect();
        this.activeResearch = null;
        this.researchProgress = 0;
        this.updateEnergyPerClick();
        this.renderResearch();
        this.updateUI();
        this.checkAchievements();
      }
    }
  }

  discoverArtifact() {
    if (this.stardust < 100) return;

    this.stardust -= 100;

    const rarityRoll = Math.random();

    let rarity = "common";
    if (rarityRoll > 0.98) rarity = "epic";
    else if (rarityRoll > 0.85) rarity = "rare";
    else if (rarityRoll > 0.6) rarity = "uncommon";

    const possibleArtifacts = this.artifacts.filter(
      (a) => a.state.rarity === rarity && a.state.level < 5,
    );

    if (possibleArtifacts.length === 0) {
      const total = this.artifacts.filter(
        (a) => a.state.rarity === rarity,
      ).length;
      const owned = this.artifacts.filter((a) =>
        this.artifacts.find(
          (def) => def.state.id === a.state.id && def.state.rarity === rarity,
        ),
      ).length;
      const percent = Math.round((100 * (total - owned)) / total);

      this.showNotification(
        "No More Artifacts",
        `You have all ${rarity} artifacts. Chance to get a new one: ${percent}%`,
      );
      this.updateUI();
      return;
    }

    const selectedArtifact =
      possibleArtifacts[Math.floor(Math.random() * possibleArtifacts.length)];
    this.artifacts.push({
      ...selectedArtifact,
      state: { ...selectedArtifact.state, level: 1 },
    });
    this.showNotification(
      "Artifact Discovered",
      `You found a ${rarity} ${selectedArtifact.state.name}!`,
    );
    this.renderArtifacts();
    this.updateUI();
  }

  createSparkles(count = 5) {
    const starSystem = document.querySelector(".star-system");
    const rect = starSystem!.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";
      sparkle.style.left = `${Math.random() * rect.width}px`;
      sparkle.style.top = `${Math.random() * rect.height}px`;
      sparkle.style.position = "absolute";
      starSystem!.appendChild(sparkle);
      setTimeout(() => {
        sparkle.remove();
      }, 500);
    }
  }

  createStars() {
    const starsContainer = document.getElementById("starsBg");
    for (let i = 0; i < 100; i++) {
      const star = document.createElement("div");
      star.className = "star-bg";
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      starsContainer!.appendChild(star);
    }
  }

  saveGame() {
    localStorage.setItem("cosmicClickerSave", JSON.stringify(this));
    this.lastSave = Date.now();
  }

  resetGame(resetEverything = true) {
    if (resetEverything) {
      this.energy = 0;
      this.energyPerClick = 1;
      this.energyPerSecond = 0;
      this.stardust = 0;
      this.stardustPerSecond = 0;
      this.prestigePoints = 0;
      this.prestigeMultiplier = 1;
      this.totalClicks = 0;
      this.totalEnergy = 0;
      this.lastUpdate = Date.now();
      this.lastSave = Date.now();
      this.researchPoints = 0;
      this.researchPointsPerSecond = 0;
      this.starSystemLevel = 1;
      this.activeResearch = null;
      this.researchProgress = 0;
      this.completedAchievements = [];
      this.upgrades = [
        new Upgrade({
          id: "energyCollector",
          name: "Energy Collector",
          description: "A basic device that collects cosmic energy.",
          icon: "📡",
          baseCost: 15,
          costGrowth: 1.18,
          baseProduction: 0.05,
          productionGrowth: 0.05,
          unlockRequirement: 0,
        }),
        new Upgrade({
          id: "energyCapacitor",
          name: "Energy Capacitor",
          description: "Increases the amount of energy per click.",
          icon: "🔋",
          baseCost: 75,
          costGrowth: 1.25,
          clickIncrease: 1,
          unlockRequirement: 0,
        }),
        new Upgrade({
          id: "orbitalSatellite",
          name: "Orbital Satellite",
          description: "Collects energy from orbit.",
          icon: "🛰️",
          baseCost: 350,
          costGrowth: 1.18,
          baseProduction: 0.5,
          productionGrowth: 0.25,
          unlockRequirement: 150,
        }),
        new Upgrade({
          id: "quantumExtractor",
          name: "Quantum Extractor",
          description: "Uses quantum fields to extract energy from space-time.",
          icon: "⚛️",
          baseCost: 1500,
          costGrowth: 1.2,
          baseProduction: 2,
          productionGrowth: 0.5,
          unlockRequirement: 750,
        }),
        new Upgrade({
          id: "cosmicCondenser",
          name: "Cosmic Condenser",
          description: "Condenses cosmic radiation into pure energy.",
          icon: "🌀",
          baseCost: 7500,
          costGrowth: 1.22,
          baseProduction: 5,
          productionGrowth: 1,
          unlockRequirement: 3000,
        }),
        new Upgrade({
          id: "wormholeHarvester",
          name: "Wormhole Harvester",
          description: "Extracts energy from microscopic wormholes.",
          icon: "🕳️",
          baseCost: 35000,
          costGrowth: 1.25,
          baseProduction: 12,
          productionGrowth: 2.5,
          unlockRequirement: 15000,
        }),
        new Upgrade({
          id: "nebulaConverter",
          name: "Nebula Converter",
          description: "Converts nebula gases into pure cosmic energy.",
          icon: "☁️",
          baseCost: 150000,
          costGrowth: 1.27,
          baseProduction: 30,
          productionGrowth: 6,
          unlockRequirement: 50000,
        }),
        new Upgrade({
          id: "stardustCollector",
          name: "Stardust Collector",
          description: "Generates stardust from cosmic energy.",
          icon: "⭐",
          baseCost: 250000,
          costGrowth: 1.3,
          stardustProduction: 0.1,
          stardustGrowth: 0.05,
          unlockRequirement: 100000,
          requiresResearch: "stardustGeneration",
        }),
      ];
      this.research = [
        new Research({
          id: "improvedCollection",
          name: "Improved Collection",
          description: "Improves energy collection efficiency by 20%.",
          cost: 200,
          duration: 120,
          unlockRequirement: 0,
          effect: () => {
            this.energyPerSecond *= 1.2;
            this.showNotification(
              "Research Complete",
              "Improved Collection is now active.",
            );
          },
        }),
        new Research({
          id: "enhancedClicking",
          name: "Enhanced Clicking",
          description: "Increases energy per click by 30%.",
          cost: 400,
          duration: 180,
          unlockRequirement: 0,
          effect: () => {
            this.energyPerClick *= 1.3;
            this.showNotification(
              "Research Complete",
              "Enhanced Clicking is now active.",
            );
          },
        }),
        new Research({
          id: "stardustGeneration",
          name: "Stardust Generation",
          description: "Allows the collection of Stardust, a rare resource.",
          cost: 750,
          duration: 300,
          unlockRequirement: 2000,
          effect: () => {
            this.unlocked.stardust = true;
            document.getElementById("stardustResource")!.style.display = "flex";
            this.showNotification(
              "Research Complete",
              "You can now collect Stardust!",
            );
          },
        }),
        new Research({
          id: "prestige",
          name: "Ascension Technology",
          description: "Allows you to ascend and gain permanent bonuses.",
          cost: 3000,
          duration: 450,
          unlockRequirement: 10000,
          effect: () => {
            this.unlocked.prestige = true;
            document.getElementById("prestigeResource")!.style.display = "flex";
            document.getElementById("ascensionTab")!.style.display = "";
            this.showNotification(
              "Research Complete",
              "You can now Ascend for permanent bonuses!",
            );
          },
        }),
        new Research({
          id: "efficientResearch",
          name: "Efficient Research",
          description: "Increases research speed by 25%.",
          cost: 1200,
          duration: 240,
          unlockRequirement: 5000,
          effect: () => {
            this.researchSpeedMultiplier *= 1.25;
            this.showNotification(
              "Research Complete",
              "Research now completes 25% faster!",
            );
          },
        }),
        new Research({
          id: "stardustEfficiency",
          name: "Stardust Efficiency",
          description: "Increases stardust production by 50%.",
          cost: 2500,
          duration: 360,
          unlockRequirement: 12000,
          requiresResearch: "stardustGeneration",
          effect: () => {
            this.stardustPerSecond *= 1.5;
            this.showNotification(
              "Research Complete",
              "Stardust production increased by 50%!",
            );
          },
        }),
        new Research({
          id: "celestialHarmonics",
          name: "Celestial Harmonics",
          description: "Increases prestige points gained by 20%.",
          cost: 5000,
          duration: 600,
          unlockRequirement: 20000,
          requiresResearch: "prestige",
          effect: () => {
            this.config.prestigePointsFormula = (energy: number) =>
              Math.floor(Math.sqrt(energy / 2500) * 1.2);
            this.showNotification(
              "Research Complete",
              "Prestige points gained increased by 20%!",
            );
          },
        }),
      ];
      this.unlocked = { stardust: false, research: false, prestige: false };
      this.artifacts = [];
      this.artifactSlots = [];
      this.researchSpeedMultiplier = 1;
      document.getElementById("stardustResource")!.style.display = "none";
      document.getElementById("prestigeResource")!.style.display = "none";
    } else {
      this.energy = 0;
      this.energyPerClick = 1;
      this.energyPerSecond = 0;
      this.stardust = 0;
      this.stardustPerSecond = 0;
      this.totalClicks = 0;
      this.activeResearch = null;
      this.researchProgress = 0;
      this.upgrades = [
        new Upgrade({
          id: "energyCollector",
          name: "Energy Collector",
          description: "A basic device that collects cosmic energy.",
          icon: "📡",
          baseCost: 15,
          costGrowth: 1.18,
          baseProduction: 0.05,
          productionGrowth: 0.05,
          unlockRequirement: 0,
        }),
        new Upgrade({
          id: "energyCapacitor",
          name: "Energy Capacitor",
          description: "Increases the amount of energy per click.",
          icon: "🔋",
          baseCost: 75,
          costGrowth: 1.25,
          clickIncrease: 1,
          unlockRequirement: 0,
        }),
        new Upgrade({
          id: "orbitalSatellite",
          name: "Orbital Satellite",
          description: "Collects energy from orbit.",
          icon: "🛰️",
          baseCost: 350,
          costGrowth: 1.18,
          baseProduction: 0.5,
          productionGrowth: 0.25,
          unlockRequirement: 150,
        }),
        new Upgrade({
          id: "quantumExtractor",
          name: "Quantum Extractor",
          description: "Uses quantum fields to extract energy from space-time.",
          icon: "⚛️",
          baseCost: 1500,
          costGrowth: 1.2,
          baseProduction: 2,
          productionGrowth: 0.5,
          unlockRequirement: 750,
        }),
        new Upgrade({
          id: "cosmicCondenser",
          name: "Cosmic Condenser",
          description: "Condenses cosmic radiation into pure energy.",
          icon: "🌀",
          baseCost: 7500,
          costGrowth: 1.22,
          baseProduction: 5,
          productionGrowth: 1,
          unlockRequirement: 3000,
        }),
        new Upgrade({
          id: "wormholeHarvester",
          name: "Wormhole Harvester",
          description: "Extracts energy from microscopic wormholes.",
          icon: "🕳️",
          baseCost: 35000,
          costGrowth: 1.25,
          baseProduction: 12,
          productionGrowth: 2.5,
          unlockRequirement: 15000,
        }),
        new Upgrade({
          id: "nebulaConverter",
          name: "Nebula Converter",
          description: "Converts nebula gases into pure cosmic energy.",
          icon: "☁️",
          baseCost: 150000,
          costGrowth: 1.27,
          baseProduction: 30,
          productionGrowth: 6,
          unlockRequirement: 50000,
        }),
        new Upgrade({
          id: "stardustCollector",
          name: "Stardust Collector",
          description: "Generates stardust from cosmic energy.",
          icon: "⭐",
          baseCost: 250000,
          costGrowth: 1.3,
          stardustProduction: 0.1,
          stardustGrowth: 0.05,
          unlockRequirement: 100000,
          requiresResearch: "stardustGeneration",
        }),
      ];

      this.lastUpdate = Date.now();
    }

    if (this.energy >= 100) {
      this.unlocked.research = true;
      this.renderResearch();
      this.updateUI();
    }

    this.updateEnergyPerClick();
    this.saveGame();
    this.updateUI();
    this.renderResearch();
    this.renderAchievements();
    this.renderArtifacts();
  }

  setupModals() {
    const settingsModal = document.getElementById("settingsModal")!;
    const resetConfirmModal = document.getElementById("resetConfirmModal")!;
    const settingsButton = document.getElementById("settingsButton")!;
    const closeSettings = document.getElementById("closeSettings")!;
    const saveButton = document.getElementById("saveButton")!;
    const resetButton = document.getElementById("resetButton")!;
    const cancelResetButton = document.getElementById("cancelResetButton")!;
    const confirmResetButton = document.getElementById("confirmResetButton")!;

    settingsButton.addEventListener("click", () => {
      settingsModal.classList.add("active");
    });
    closeSettings.addEventListener("click", () => {
      settingsModal.classList.remove("active");
    });
    resetButton.addEventListener("click", () => {
      resetConfirmModal.classList.add("active");
      settingsModal.classList.remove("active");
    });
    cancelResetButton.addEventListener("click", () => {
      resetConfirmModal.classList.remove("active");
    });
    confirmResetButton.addEventListener("click", () => {
      this.resetGame();
      resetConfirmModal.classList.remove("active");
      this.showNotification("Game Reset", "Your game has been reset.");
    });
    saveButton.addEventListener("click", () => {
      this.saveGame();
      settingsModal.classList.remove("active");
      this.showNotification("Game Saved", "Your game has been saved.");
    });
  }

  checkUnlocks() {
    if (this.energy < 100) return;
    if (!this.unlocked.research) {
      this.unlocked.research = true;
      this.showNotification(
        "Feature Unlocked",
        "You can now conduct research!",
      );
    }
    this.renderResearch();
    this.updateUI();
  }

  setupClicker() {
    const clickerButton = document.getElementById("clickerButton")!;
    clickerButton.addEventListener("click", () => {
      const clickAmount = this.energyPerClick;
      this.energy += clickAmount;
      this.totalEnergy += clickAmount;
      this.totalClicks++;
      this.checkUnlocks();
      this.createSparkles(2);
      this.updateUI();
      this.checkAchievements();
    });
  }

  createArtifactTab() {
    const tabExists = document.querySelector('.tab[data-tab="artifacts"]');
    if (tabExists) return;

    const tabsContainer = document.querySelector(".tabs")!;
    const artifactTab = document.createElement("div");
    artifactTab.className = "tab";
    artifactTab.setAttribute("data-tab", "artifacts");
    artifactTab.textContent = "Artifacts";
    tabsContainer.appendChild(artifactTab);
    this.setupTabs();
  }

  setupPrestige() {
    const prestigeButton = document.getElementById("prestigeButton")!;
    prestigeButton.addEventListener("click", () => {
      if (this.energy < this.config.prestigeRequirement) return;

      let prestigePoints = this.config.prestigePointsFormula(this.energy);

      this.artifactSlots.forEach(({ state: { effect } }) => {
        if (effect.type !== "prestigeBonus") return;
        prestigePoints = Math.floor(prestigePoints * effect.value);
      });

      const oldPrestigePoints = this.prestigePoints;
      const oldAchievements = this.completedAchievements;
      const oldResearch = { ...this.research };
      const oldArtifacts = [...this.artifacts];
      const oldArtifactSlots = [...this.artifactSlots];
      const oldUnlocked = { ...this.unlocked };
      this.resetGame(false);
      this.unlocked = oldUnlocked;
      this.completedAchievements = oldAchievements;
      this.research = oldResearch;
      this.artifacts = oldArtifacts;
      this.artifactSlots = oldArtifactSlots;
      this.prestigePoints = oldPrestigePoints + prestigePoints;

      if (this.unlocked.stardust) {
        document.getElementById("stardustResource")!.style.display = "flex";
      }

      if (this.unlocked.prestige) {
        document.getElementById("prestigeResource")!.style.display = "flex";
        document.getElementById("ascensionTab")!.style.display = "";
      }

      if (
        this.unlocked.stardust &&
        !document.querySelector('.tab[data-tab="artifacts"]')
      ) {
        this.createArtifactTab();
      }

      this.updateEnergyPerSecond();
      if (this.unlocked.stardust) this.updateStardustPerSecond();

      this.updateUI();
      this.renderResearch();
      this.renderAchievements();
      this.renderArtifacts();

      this.showNotification(
        "Ascension Complete",
        `You gained ${prestigePoints} Celestial Power!`,
      );
      this.checkAchievements();
    });
  }

  setupArtifacts() {
    const discoverArtifactButton = document.getElementById(
      "discoverArtifactButton",
    );
    if (discoverArtifactButton) {
      discoverArtifactButton.addEventListener("click", this.discoverArtifact);
    }
  }

  loadGame() {
    const savedGame = localStorage.getItem("cosmicClickerSave");
    if (savedGame) {
      try {
        const parsedSave = JSON.parse(savedGame);
        // Merge defaults with loaded save
        gameState = {
          energy: 0,
          energyPerClick: 1,
          energyPerSecond: 0,
          stardust: 0,
          stardustPerSecond: 0,
          prestigePoints: 0,
          prestigeMultiplier: 1,
          totalClicks: 0,
          totalEnergy: 0,
          lastUpdate: Date.now(),
          lastSave: Date.now(),
          researchPoints: 0,
          researchPointsPerSecond: 0,
          starSystemLevel: 1,
          activeResearch: null,
          researchProgress: 0,
          achievements: {},
          upgrades: {},
          research: {},
          unlocked: { stardust: false, research: false, prestige: false },
          artifacts: [],
          artifactSlots: [],
          researchSpeedMultiplier: 1,
          ...parsedSave, // loaded values overwrite defaults
        };
        const currentTime = Date.now();
        const offlineTime = Math.min(
          currentTime - parsedSave.lastUpdate,
          this.config.offlineProgressMax,
        );
        if (offlineTime > 5000) {
          const offlineEarnings = (this.energyPerSecond * offlineTime) / 1000;
          let offlineStardust = 0;
          if (this.unlocked.stardust) {
            offlineStardust = (this.stardustPerSecond * offlineTime) / 1000;
            this.stardust += offlineStardust;
          }
          if (offlineEarnings > 0) {
            this.energy += offlineEarnings;
            this.totalEnergy += offlineEarnings;
            setTimeout(() => {
              let message = `You earned ${formatNumber(offlineEarnings)} energy while away!`;
              if (offlineStardust > 0) {
                message += ` And ${formatNumber(offlineStardust)} stardust!`;
              }
              this.showNotification("Welcome Back", message);
            }, 1000);
          }
        }
        if (this.unlocked.stardust) {
          document.getElementById("stardustResource")!.style.display = "flex";
        }
        if (this.unlocked.prestige) {
          document.getElementById("prestigeResource")!.style.display = "flex";
          document.getElementById("ascensionTab")!.style.display = "";
        }
        if (!this.researchSpeedMultiplier) this.researchSpeedMultiplier = 1;
        if (!this.artifacts) this.artifacts = [];
        if (!this.artifactSlots) this.artifactSlots = [];

        this.updateEnergyPerSecond();
        if (this.unlocked.stardust) this.updateStardustPerSecond();

        this.updateEnergyPerClick();
        this.createArtifactTab();
        this.updateUI();
        this.renderResearch();
        this.renderAchievements();
        this.renderArtifacts();
      } catch (error) {
        console.error("Error loading save:", error);
        this.showNotification("Error", "Could not load your saved game.");
      }
    }
    this.setupTabs();
  }

  gameLoop() {
    const currentTime = Date.now();
    const deltaTime = Math.min(currentTime - this.lastUpdate, 10000);
    const energyToAdd = (this.energyPerSecond * deltaTime) / 1000;
    if (energyToAdd > 0) {
      this.energy += energyToAdd;
      this.totalEnergy += energyToAdd;
      this.checkUnlocks();
    }
    if (this.unlocked.stardust) {
      const stardustToAdd = (this.stardustPerSecond * deltaTime) / 1000;
      if (stardustToAdd > 0) this.stardust += stardustToAdd;
    }
    this.updateResearch(deltaTime);
    if (currentTime - this.lastSave >= this.config.autosaveInterval) {
      this.saveGame();
    }
    this.lastUpdate = currentTime;
    this.updateUI();
    setTimeout(this.gameLoop, this.config.updateInterval);
  }
}
