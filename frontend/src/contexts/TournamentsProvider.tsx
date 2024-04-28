import { createContext, useContext, useState } from 'react';
import React from 'react';
import { iTournament } from '../interfaces/tournaments-interface';
import { useSnackbar } from './SnackbarProvider';

type TournamentsContextType = {
  tournaments: iTournament[];
  setTournaments: React.Dispatch<React.SetStateAction<iTournament[]>>;
  selectedTournament: iTournament | undefined;
  setSelectedTournament: React.Dispatch<React.SetStateAction<iTournament | undefined>>;

  getTournaments: () => void;
  postTournament: (newTournamentName: string) => void;
  getTournament: (tournamentId: string) => void;
  putTournament: (tournamentId: string, tournamentName: string) => void;
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
      date: '2024-1-10'
    },
    {
      _id: 'asdf2',
      name: 'Turnaj 2',
      date: '2024-2-10'
    },
    {
      _id: 'asdf3',
      name: 'Turnaj 3',
      date: '2024-3-10'
    }
  ])
  const [selectedTournament, setSelectedTournament] = useState<iTournament>()

  const { openSnackbar } = useSnackbar();
  
  const generateRandomString = (length: number) => {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  const getTournaments = async (select?: string) => {
    console.log('getTournaments')
  }

  const postTournament = async (newTournamentName: string) => {
    if (newTournamentName) {
      setTournaments([...tournaments, {
        _id: generateRandomString(10),
        name: newTournamentName,
        date: '2024-1-10'
      }])
      openSnackbar('Turnaj vytvořen!')
    }
  }

  const getTournament = async (tournamentId: string) => {
    setSelectedTournament(tournaments.find(tournament => tournament._id === tournamentId))
  }

  const putTournament = async (tournamentId: string, tournamentName: string) => {
    const updatedTournaments = tournaments.map(tournament => {
      if (tournament._id === tournamentId) {
        return {
          ...tournament,
          name: tournamentName
        }
      }
      return tournament
    })
    setTournaments(updatedTournaments)
    openSnackbar('Turnaj upraven!')
  }

  const deleteTournament = async (tournamentId: string) => {
    const updatedTournaments = tournaments.filter(tournament => tournament._id !== tournamentId)
    setTournaments(updatedTournaments)
    openSnackbar('Turnaj smazán!')
  }

  const contextValue: TournamentsContextType = {
    tournaments: tournaments,
    setTournaments: setTournaments,
    selectedTournament: selectedTournament,
    setSelectedTournament: setSelectedTournament,

    getTournaments: getTournaments,
    postTournament: postTournament,
    getTournament: getTournament,
    putTournament: putTournament,
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
