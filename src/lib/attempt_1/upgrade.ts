export class Upgrade {
  state: {
    id: string;
    name: string;
    description: string;
    icon: string;
    baseCost: number;
    costGrowth: number;
    unlockRequirement: number;
    level: number;
    baseProduction?: number;
    productionGrowth?: number;
    clickIncrease?: number;
    stardustProduction?: number;
    stardustGrowth?: number;
    requiresResearch?: string;
  };

  constructor(state: {
    id: string;
    name: string;
    description: string;
    icon: string;
    baseCost: number;
    costGrowth: number;
    level?: number;
    baseProduction?: number;
    productionGrowth?: number;
    unlockRequirement: number;
    clickIncrease?: number;
    stardustProduction?: number;
    stardustGrowth?: number;
    requiresResearch?: string;
  }) {
    this.state.id = state.id;
    this.state.name = state.name;
    this.state.level = state.level || 0;
    this.state.description = state.description;
    this.state.icon = state.icon;
    this.state.baseCost = state.baseCost;
    this.state.costGrowth = state.costGrowth;
    this.state.baseProduction = state.baseProduction;
    this.state.productionGrowth = state.productionGrowth;
    this.state.unlockRequirement = state.unlockRequirement;
    this.state.clickIncrease = state.clickIncrease;
    this.state.stardustProduction = state.stardustProduction;
    this.state.stardustGrowth = state.stardustGrowth;
    this.state.requiresResearch = state.requiresResearch;
  }

  getCost() {
    return Math.floor(
      this.state.baseCost * Math.pow(this.state.costGrowth, this.state.level),
    );
  }
}
