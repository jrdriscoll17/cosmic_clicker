export class Achievement {
  state: {
    id: string;
    name: string;
    description: string;
    icon: string;
    isAchieved: () => boolean;
    hidden?: boolean;
    bonusDesc?: string;
  };

  constructor(state: {
    id: string;
    name: string;
    description: string;
    icon: string;
    isAchieved: () => boolean;
    hidden?: boolean;
    bonusDesc?: string;
  }) {
    this.state.id = state.id;
    this.state.name = state.name;
    this.state.description = state.description;
    this.state.icon = state.icon;
    this.state.isAchieved = state.isAchieved;
    this.state.hidden = state.hidden || false;
    this.state.bonusDesc = state.bonusDesc;
  }
}
