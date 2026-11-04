export interface ChampionUnitState {
  id: string;
  team: "BLUE" | "RED";
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attackPower: number;
  gold: number;
  xp: number;
}

export class Match5v5CoreEngine {
  public elapsedSeconds = 0;

  stepTick(units: ChampionUnitState[], dtSeconds: number = 1): void {
    this.elapsedSeconds += dtSeconds;
    for (const u of units) {
      if (u.hp <= 0) continue;
      u.gold += Math.round(2.04 * dtSeconds);
    }
    for (const a of units) {
      if (a.hp <= 0) continue;
      for (const b of units) {
        if (b.hp <= 0 || a.team === b.team) continue;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist <= 550) {
          b.hp = Math.max(0, b.hp - a.attackPower * dtSeconds);
          if (b.hp === 0) {
            a.gold += 300;
            a.xp += 280;
          }
          break;
        }
      }
    }
  }
}
