export interface iTournament {
  id: string;
  name: string;
  date: string;
  participants: iParticipant[];
}

export interface iParticipant {
  id: string;
  name: string;
}