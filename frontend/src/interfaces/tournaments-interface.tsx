export interface iTournament {
  id: number;
  name: string;
  date: string;
  participants: iParticipant[];
}

export interface iParticipant {
  id: number;
  name: string;
}