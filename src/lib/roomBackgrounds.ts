export interface RoomBackground {
  id: string;
  name: string;
  description: string;
  src: string;
  objectPosition: string;
}

export const ROOM_BACKGROUNDS: RoomBackground[] = [
  {
    id: "library",
    name: "Classic Library",
    description: "The warm gothic reading room you first stepped into.",
    src: "/sophie-room.png",
    objectPosition: "center 62%",
  },
  {
    id: "premium-library",
    name: "Premium Library",
    description: "A rose-gold parlour with castle views, candlelight, and crystal glow.",
    src: "/sophie-room-premium.png",
    objectPosition: "center center",
  },
];

const BACKGROUND_IDS = new Set(ROOM_BACKGROUNDS.map((b) => b.id));

export function getRoomBackground(id: string): RoomBackground {
  return ROOM_BACKGROUNDS.find((b) => b.id === id) ?? ROOM_BACKGROUNDS[0];
}

export function normalizeBackgroundId(id: string): string {
  if (BACKGROUND_IDS.has(id)) return id;
  if (id === "moonlit") return "premium-library";
  return "library";
}
