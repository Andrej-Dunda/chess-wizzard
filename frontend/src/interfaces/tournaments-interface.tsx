export interface iTournament {
  _id: string;
  name: string;
  date: string;
  participants: iParticipant[];
}

export interface iParticipant {
  _id: string;
  name: string;
}