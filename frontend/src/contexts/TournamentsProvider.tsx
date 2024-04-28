import { createContext, useContext, useState } from 'react';
import React from 'react';
import { iParticipant, iTournament } from '../interfaces/tournaments-interface';
import { useSnackbar } from './SnackbarProvider';
import { v4 as uuidv4 } from 'uuid';

type TournamentsContextType = {
  tournaments: iTournament[];
  setTournaments: React.Dispatch<React.SetStateAction<iTournament[]>>;
  selectedTournament: iTournament | undefined;
  setSelectedTournament: React.Dispatch<React.SetStateAction<iTournament | undefined>>;

  getTournaments: () => void;
  postTournament: (newTournamentName: string) => void;
  getTournament: (tournamentId: string) => void;
  putTournament: (tournamentId: string, tournamentName: string, participants: iParticipant[]) => void;
  deleteTournament: (tournamentId: string) => void;
};

export const TournamentsContext = createContext<TournamentsContextType | null>(null);

type TournamentsProviderProps = {
  children: React.ReactNode;
};

export const TournamentsProvider = ({ children }: TournamentsProviderProps) => {
  const [tournaments, setTournaments] = useState<iTournament[]>([
    {
      _id: 'asdf1',
      name: 'Turnaj 1',
      date: '2024-1-10',
      participants: [
        {
          _id: uuidv4(),
          name: 'Andrej'
        },
        {
          _id: uuidv4(),
          name: 'Jirka'
        },
        {
          _id: uuidv4(),
          name: 'Honza'
        },
        {
          _id: uuidv4(),
          name: 'Kuba'
        },
        {
          _id: uuidv4(),
          name: 'Lukáš'
        },
        {
          _id: uuidv4(),
          name: 'Martin'
        },
        {
          _id: uuidv4(),
          name: 'Michal'
        },
        {
          _id: uuidv4(),
          name: 'Petr'
        },
        {
          _id: uuidv4(),
          name: 'Tomáš'
        },
        {
          _id: uuidv4(),
          name: 'Vojta'
        },
        {
          _id: uuidv4(),
          name: 'Zdeněk'
        }
      ]
    },
    {
      _id: 'asdf2',
      name: 'Turnaj 2',
      date: '2024-2-10',
      participants: []
    },
    {
      _id: 'asdf3',
      name: 'Turnaj 3',
      date: '2024-3-10',
      participants: [
        {
          _id: uuidv4(),
          name: 'Branibor'
        },
        {
          _id: uuidv4(),
          name: 'Borek'
        },
        {
          _id: uuidv4(),
          name: 'Drahoslav'
        },
        {
          _id: uuidv4(),
          name: 'Egon'
        },
        {
          _id: uuidv4(),
          name: 'František'
        },
        {
          _id: uuidv4(),
          name: 'Gustav'
        },
        {
          _id: uuidv4(),
          name: 'Hynek'
        },
        {
          _id: uuidv4(),
          name: 'Ivan'
        },
        {
          _id: uuidv4(),
          name: 'Jaroslav'
        },
        {
          _id: uuidv4(),
          name: 'Kamil'
        },
        {
          _id: uuidv4(),
          name: 'Ladislav'
        }
      ]
    }
  ])
  const [selectedTournament, setSelectedTournament] = useState<iTournament>()

  const { openSnackbar } = useSnackbar();

  const getTournaments = async (select?: string) => {
    console.log('getTournaments')
  }

  const postTournament = async (newTournamentName: string) => {
    if (newTournamentName) {
      setTournaments([...tournaments, {
        _id: uuidv4(),
        name: newTournamentName,
        date: '2024-1-10',
        participants: []
      }
      ])
      openSnackbar('Turnaj vytvořen!')
    }
  }

  const getTournament = (tournamentId: string) => {
    setSelectedTournament(tournaments.find(tournament => tournament._id === tournamentId))
  }

  const putTournament = (tournamentId: string, tournamentName: string, tournamentParticipants: iParticipant[]) => {
    const updatedTournaments = tournaments.map(tournament => {
      if (tournament._id === tournamentId) {
        return {
          ...tournament,
          name: tournamentName,
          participants: tournamentParticipants
        }
      }
      return tournament
    })
    console.log(updatedTournaments)
    setTournaments(updatedTournaments)
    setSelectedTournament(updatedTournaments.find(tournament => tournament._id === tournamentId))
  }

  const deleteTournament = (tournamentId: string) => {
    const updatedTournaments = tournaments.filter(tournament => tournament._id !== tournamentId)
    setTournaments(updatedTournaments)
    openSnackbar('Turnaj smazán!')
  }

  const contextValue: TournamentsContextType = {
    tournaments: tournaments,
    setTournaments: setTournaments,
    selectedTournament: selectedTournament,
    setSelectedTournament: setSelectedTournament,

    getTournaments,
    postTournament,
    getTournament,
    putTournament,
    deleteTournament: deleteTournament
  };

  return (
    <TournamentsContext.Provider value={contextValue}>
      {children}
    </TournamentsContext.Provider>
  );
};

export const useTournaments = () => {
  const currentContext = useContext(TournamentsContext);

  if (!currentContext) {
    throw new Error('useTournaments must be used within TournamentsProvider');
  }

  return currentContext;
};
