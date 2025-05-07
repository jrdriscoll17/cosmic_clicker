type ArtifactEffect = {
  type: string;
  value: number;
  onlyOnClick?: boolean;
  disables?: string;
  sideEffect?: ArtifactEffect;
};

export class Artifact {
  state: {
    id: string;
    name: string;
    description: string;
    rarity: "common" | "uncommon" | "rare" | "epic";
    effect: ArtifactEffect;
    level: number;
  };

  constructor(state: {
    id: string;
    name: string;
    description: string;
    rarity: "common" | "uncommon" | "rare" | "epic";
    effect: ArtifactEffect;
    level?: number;
  }) {
    this.state.id = state.id;
    this.state.name = state.name;
    this.state.description = state.description;
    this.state.rarity = state.rarity;
    this.state.effect = state.effect;
    this.state.level = state.level || 0
  }
}
