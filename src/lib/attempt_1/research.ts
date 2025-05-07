export class Research {
  state: {
    id: string;
    name: string;
    description: string;
    cost: number;
    duration: number;
    unlockRequirement: number;
    effect: () => void;
    requiresResearch?: string;
    purchased?: boolean;
  };

  constructor(state: {
    id: string;
    name: string;
    description: string;
    cost: number;
    duration: number;
    unlockRequirement: number;
    effect: () => void;
    requiresResearch?: string;
    purchased?: boolean;
  }) {
    this.state.id = state.id;
    this.state.name = state.name;
    this.state.description = state.description;
    this.state.cost = state.cost;
    this.state.duration = state.duration;
    this.state.unlockRequirement = state.unlockRequirement;
    this.state.effect = state.effect;
    this.state.requiresResearch = state.requiresResearch;
    this.state.purchased = state.purchased || false;
  }
}
