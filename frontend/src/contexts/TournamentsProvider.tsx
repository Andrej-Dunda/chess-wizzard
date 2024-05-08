import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { iParticipant, iTournament } from '../interfaces/tournaments-interface';
import { useSnackbar } from './SnackbarProvider';
// import { v4 as uuidv4 } from 'uuid';

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
    // {
    //   id: 'asdf1',
    //   name: 'Turnaj 1',
    //   date: '2024-1-10',
    //   participants: [
    //     {
    //       id: uuidv4(),
    //       name: 'Andrej'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Jirka'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Honza'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Kuba'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Lukáš'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Martin'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Michal'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Petr'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Tomáš'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Vojta'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Zdeněk'
    //     }
    //   ]
    // },
    // {
    //   id: 'asdf2',
    //   name: 'Turnaj 2',
    //   date: '2024-2-10',
    //   participants: []
    // },
    // {
    //   id: 'asdf3',
    //   name: 'Turnaj 3',
    //   date: '2024-3-10',
    //   participants: [
    //     {
    //       id: uuidv4(),
    //       name: 'Branibor'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Borek'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Drahoslav'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Egon'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'František'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Gustav'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Hynek'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Ivan'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Jaroslav'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Kamil'
    //     },
    //     {
    //       id: uuidv4(),
    //       name: 'Ladislav'
    //     }
    //   ]
    // }
  ])
  const [selectedTournament, setSelectedTournament] = useState<iTournament>()
  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    getTournaments()
  }, []);

  const getTournaments = async () => {
    const tournamentsData = await window.api.getTournaments();
    tournamentsData && setTournaments(tournamentsData)
    console.log(tournamentsData)
  }

  const postTournament = async (newTournamentName: string) => {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    
    if (newTournamentName) {
      await window.api.createTournament({ name: newTournamentName, date: formattedDate })
      getTournaments()
      openSnackbar('Turnaj vytvořen!')
    }
  }

  const getTournament = (tournamentId: string) => {
    setSelectedTournament(tournaments.find(tournament => tournament.id === tournamentId))
  }

  const putTournament = (tournamentId: string, tournamentName: string, tournamentParticipants: iParticipant[]) => {
    const updatedTournaments = tournaments.map(tournament => {
      if (tournament.id === tournamentId) {
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
    setSelectedTournament(updatedTournaments.find(tournament => tournament.id === tournamentId))
  }

  const deleteTournament = (tournamentId: string) => {
    const updatedTournaments = tournaments.filter(tournament => tournament.id !== tournamentId)
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
