import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { iMatch, iTournament, iTournamentPlayer } from '../interfaces/tournaments-interface';
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
  changeTournamentRound: (round: string) => void;

  tournamentPlayers: iTournamentPlayer[];
  setTournamentPlayers: React.Dispatch<React.SetStateAction<iTournamentPlayer[]>>;
  getTournamentPlayers: (playersTableName: string) => void;
  addTournamentPlayer: (playersTableName: string, newPlayerName: string) => void;
  removeTournamentPlayer: (playersTableName: string, playerId: number) => void;

  matches: iMatch[];
  setMatches: React.Dispatch<React.SetStateAction<iMatch[]>>;
  selectedMatchIndex: number | undefined;
  setSelectedMatchIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
  setResult: (result: number) => void;
  isAnyResultNull: boolean;
  getMatches: () => void;
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
  const [matches, setMatches] = useState<iMatch[]>([])
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number>();
  const isAnyResultNull = matches.some(match => match.result === null);

  useEffect(() => {
    getTournaments();
  
    const selectedTournamentId = localStorage.getItem('selectedTournamentId');
    if (selectedTournamentId) {
      getTournament(parseInt(selectedTournamentId));
    }
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      getTournamentPlayers();
      localStorage.setItem('selectedTournamentId', selectedTournament.id.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournament]);

  useEffect(() => {
    getMatches()
    selectedTournament && console.log(selectedTournament.round)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournament?.round])

  useEffect(() => {
    console.log(matches)
  }, [matches])

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
    await window.api.deleteTournament({ id: tournament.id, playersTableName: tournament.playersTableName })
    getTournaments()
    openSnackbar('Turnaj smazán!')
  }

  const changeTournamentPhase = async (phase: string) => {
    if (selectedTournament) {
      await window.api.changeTournamentPhase({ id: selectedTournament.id, phase: phase })
      await getTournament(selectedTournament.id)
    }
  }

  const changeTournamentRound = async (round: string) => {
    if (!selectedTournament) return
    if (round === 'next') {
      await window.api.nextTournamentRound({ id: selectedTournament.id })
    } else if (round === 'previous') {
      await window.api.previousTournamentRound({ id: selectedTournament.id })
    }
    await getTournament(selectedTournament.id)
  }

  const getTournamentPlayers = async () => {
    if (!selectedTournament) return
    const players: iTournamentPlayer[] = await window.api.getPlayers({ playersTableName: selectedTournament.playersTableName, matchesTableName: selectedTournament.matchesTableName});
    const sortedPlayers = players.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      } else if (b.sonnenbornBerger !== a.sonnenbornBerger) {
        return b.sonnenbornBerger - a.sonnenbornBerger;
      } else if (b.bucholz !== a.bucholz) {
        return b.bucholz - a.bucholz;
      } else {
        return a.startPosition - b.startPosition;
      }
    });
    setTournamentPlayers(sortedPlayers);
  }

  const addTournamentPlayer = async (playersTableName: string, newPlayerName: string) => {
    await window.api.addPlayer({ playersTableName: playersTableName, name: newPlayerName })
    getTournamentPlayers()
    openSnackbar('Hráč přidán!')
  }

  const removeTournamentPlayer = async (playersTableName: string, playerId: number) => {
    await window.api.removePlayer({ playersTableName: playersTableName, id: playerId })
    getTournamentPlayers()
    openSnackbar('Hráč odebrán!')
  }

  const setResult = async (result: number) => {
    if (selectedMatchIndex === undefined || selectedMatchIndex === -1) return
    console.log('selectedMatch', matches[selectedMatchIndex])
    selectedTournament && await window.api.saveResult({ matchesTableName: selectedTournament.matchesTableName, id: matches[selectedMatchIndex].id, result: result })
    getMatches()
    // find next match with null result after the selectedMatchIndex
    const nextMatchIndex = matches.findIndex((match, index) => index > selectedMatchIndex && match.result === null)
    // if nextMatchIndex is -1, find first match with null result
    setSelectedMatchIndex(nextMatchIndex === -1 ? matches.findIndex(match => match.result === null) : nextMatchIndex)
    // selectedMatchIndex < matches.length - 1 && setSelectedMatchIndex(selectedMatchIndex + 1)
  }

  const getMatches = async () => {
    if (selectedTournament) {
      console.log('before getMatches')
      const matchesData = await window.api.getMatches({ matchesTableName: selectedTournament.matchesTableName, round: selectedTournament.round })
      console.log('matchesData', matchesData)
      const parsedMatches: iMatch[] = matchesData.map((match: any) => {
        return {
          id: match.id,
          whitePlayer: JSON.parse(match.whitePlayer),
          blackPlayer: JSON.parse(match.blackPlayer),
          result: match.result,
          boardNumber: match.boardNumber,
          round: match.round
        }
      })
      setMatches(parsedMatches.sort((a, b) => a.boardNumber - b.boardNumber));
    }
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
    changeTournamentRound,

    getTournamentPlayers,
    tournamentPlayers,
    setTournamentPlayers,
    addTournamentPlayer,
    removeTournamentPlayer,

    matches,
    setMatches,
    selectedMatchIndex,
    setSelectedMatchIndex,
    setResult,
    isAnyResultNull,
    getMatches
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
