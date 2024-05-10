import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { iTournament, iTournamentPlayer } from '../interfaces/tournaments-interface';
import { useSnackbar } from './SnackbarProvider';

type TournamentsContextType = {
  tournaments: iTournament[];
  setTournaments: React.Dispatch<React.SetStateAction<iTournament[]>>;
  selectedTournament: iTournament | undefined;
  setSelectedTournament: React.Dispatch<React.SetStateAction<iTournament | undefined>>;

  getTournaments: () => void;
  postTournament: (newTournamentName: string) => void;
  getTournament: (tournamentId: number) => void;
  putTournament: (tournamentId: number, tournamentName: string) => void;
  deleteTournament: (tournament: iTournament) => void;
  changeTournamentPhase: (phase: string) => void;

  tournamentPlayers: iTournamentPlayer[];
  setTournamentPlayers: React.Dispatch<React.SetStateAction<iTournamentPlayer[]>>;
  getTournamentPlayers: (players_table_name: string) => void;
  addTournamentPlayer: (players_table_name: string, newPlayerName: string) => void;
  removeTournamentPlayer: (players_table_name: string, playerId: number) => void;
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
  const [tournamentPlayers, setTournamentPlayers] = useState<iTournamentPlayer[]>([])
  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    getTournaments();
  
    const selectedTournamentId = localStorage.getItem('selectedTournamentId');
    if (selectedTournamentId) {
      getTournament(parseInt(selectedTournamentId));
    }
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      getTournamentPlayers(selectedTournament.players_table_name);
      localStorage.setItem('selectedTournamentId', selectedTournament.id.toString());
    }
  }, [selectedTournament]);

  const getTournaments = async () => {
    const tournamentsData = await window.api.getTournaments();
    tournamentsData && setTournaments(tournamentsData)
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

  const getTournament = async (tournamentId: number) => {
    setSelectedTournament(await window.api.getTournament({ id: tournamentId }))
  }

  const putTournament = async (tournamentId: number, tournamentName: string) => {
    await window.api.putTournament({ id: tournamentId, name: tournamentName })
    getTournaments()
    openSnackbar('Turnaj upraven!')
  }

  const deleteTournament = async (tournament: iTournament) => {
    await window.api.deleteTournament({ id: tournament.id, players_table_name: tournament.players_table_name })
    getTournaments()
    openSnackbar('Turnaj smazán!')
  }

  const changeTournamentPhase = async (phase: string) => {
    if (selectedTournament) {
      await window.api.changeTournamentPhase({ id: selectedTournament.id, phase: phase })
      getTournament(selectedTournament.id)
    }
  }

  const getTournamentPlayers = async (players_table_name: string) => {
    setTournamentPlayers(await window.api.getPlayers({ players_table_name: players_table_name }))
  }

  const addTournamentPlayer = async (players_table_name: string, newPlayerName: string) => {
    await window.api.addPlayer({ players_table_name: players_table_name, name: newPlayerName })
    getTournamentPlayers(players_table_name)
    openSnackbar('Hráč přidán!')
  }

  const removeTournamentPlayer = async (players_table_name: string, playerId: number) => {
    await window.api.removePlayer({ players_table_name: players_table_name, id: playerId })
    getTournamentPlayers(players_table_name)
    openSnackbar('Hráč odebrán!')
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
    deleteTournament,
    changeTournamentPhase,

    getTournamentPlayers,
    tournamentPlayers,
    setTournamentPlayers,
    addTournamentPlayer,
    removeTournamentPlayer
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
