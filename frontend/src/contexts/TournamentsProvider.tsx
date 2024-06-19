import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { iMatch, iRawMatch, iRawTournamentPlayer, iTournament, iTournamentPlayer } from '../interfaces/tournaments-interface';
import { useSnackbar } from './SnackbarProvider';

type TournamentsContextType = {
  tournaments: iTournament[];
  setTournaments: React.Dispatch<React.SetStateAction<iTournament[]>>;
  selectedTournament: iTournament | undefined;
  setSelectedTournament: React.Dispatch<React.SetStateAction<iTournament | undefined>>;

  getTournaments: () => void;
  postTournament: (newTournamentName: string, roundsCount: number) => void;
  getTournament: (tournamentId: number) => void;
  putTournament: (tournamentId: number, tournamentName: string) => void;
  deleteTournament: (tournament: iTournament) => void;
  changeTournamentPhase: (phase: string) => void;
  changeTournamentRound: (round: string) => void;

  tournamentPlayers: iTournamentPlayer[];
  setTournamentPlayers: React.Dispatch<React.SetStateAction<iTournamentPlayer[]>>;
  getTournamentPlayers: () => void;
  addTournamentPlayer: (newPlayerName: string) => void;
  removeTournamentPlayer: (playerId: number) => void;

  matches: iMatch[];
  setMatches: React.Dispatch<React.SetStateAction<iMatch[]>>;
  allTournamentMatches: iMatch[][];
  setAllTournamentMatches: React.Dispatch<React.SetStateAction<iMatch[][]>>;
  getAllMatches: () => void;
  selectedMatchIndex: number | undefined;
  setSelectedMatchIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
  setResult: (result: number) => void;
  isAnyResultNull: boolean;
  getMatches: () => void;

  formatNumber: (num: number) => string | number;
};

export const TournamentsContext = createContext<TournamentsContextType | null>(null);

type TournamentsProviderProps = {
  children: React.ReactNode;
};

export const TournamentsProvider = ({ children }: TournamentsProviderProps) => {
  const [tournaments, setTournaments] = useState<iTournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState<iTournament>()
  const [tournamentPlayers, setTournamentPlayers] = useState<iTournamentPlayer[]>([])
  const { openSnackbar } = useSnackbar();
  const [matches, setMatches] = useState<iMatch[]>([])
  const [allTournamentMatches, setAllTournamentMatches] = useState<iMatch[][]>([]);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number>();
  const isAnyResultNull = matches.some(match => match.result === null);

  useEffect(() => {
    getTournaments();
  
    const selectedTournamentId = localStorage.getItem('selectedTournamentId');
    if (selectedTournamentId) {
      getTournament(parseInt(selectedTournamentId));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      getTournamentPlayers();
      getMatches();
      localStorage.setItem('selectedTournamentId', selectedTournament.id.toString());
      getAllMatches();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournament]);

  useEffect(() => {
    if (selectedTournament) {
      getMatches();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournament?.currentRound]);

  // useEffect(() => {
  //   console.log(matches.map(match => [match.whitePlayer.colorSequence, match.blackPlayer.colorSequence]))
  // }, [matches])

  const getTournaments = async () => {
    const tournamentsData = await window.api.getTournaments();
    tournamentsData && setTournaments(tournamentsData)
  }

  const postTournament = async (newTournamentName: string, roundsCount: number) => {
    if (newTournamentName) {
      await window.api.createTournament({ name: newTournamentName, roundsCount: roundsCount })
      getTournaments()
      openSnackbar('Turnaj vytvořen!')
    }
  }

  const getTournament = async (tournamentId: number) => {
    setSelectedTournament(await window.api.getTournament({ tournamentId: tournamentId }))
  }

  const putTournament = async (tournamentId: number, tournamentName: string) => {
    await window.api.putTournament({ tournamentId: tournamentId, name: tournamentName })
    getTournaments()
    openSnackbar('Turnaj upraven!')
  }

  const deleteTournament = async (tournament: iTournament) => {
    await window.api.deleteTournament({ tournamentId: tournament.id })
    getTournaments()
    openSnackbar('Turnaj smazán!')
  }

  const changeTournamentPhase = async (phase: string) => {
    if (selectedTournament) {
      const { matches, tournament, players } = await window.api.changeTournamentPhase({ tournamentId: selectedTournament.id, phase: phase, currentPhase: selectedTournament.phase })
      setMatches(matches)
      setTournamentPlayers(parsePlayers(players))
      setSelectedTournament(tournament)
    }
  }

  const changeTournamentRound = async (round: string) => {
    if (!selectedTournament) return

    setSelectedMatchIndex(undefined)
    // setMatches([])

    if (round === 'next') {
      const { matches, tournament, players } = await window.api.nextTournamentRound({ tournamentId: selectedTournament.id })
      setMatches(matches)
      setTournamentPlayers(parsePlayers(players))
      setSelectedTournament(tournament)
    } else if (round === 'previous') {
      await window.api.previousTournamentRound({ tournamentId: selectedTournament?.id })
      selectedTournament && getTournament(selectedTournament.id)
    }
    getAllMatches()
  }

  const parsePlayers = (players: iRawTournamentPlayer[]) => {
    const parsedPlayers = players.map((player: iRawTournamentPlayer) => {
      return {
        ...player,
        opponentIdSequence: JSON.parse(player.opponentIdSequence),
        colorSequence: JSON.parse(player.colorSequence)
      }
    });
    const sortedPlayers: iTournamentPlayer[] = parsedPlayers.sort((a: iTournamentPlayer, b: iTournamentPlayer) => {
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
    return sortedPlayers;
  }

  const getTournamentPlayers = async () => {
    if (!selectedTournament) return
    const players: iRawTournamentPlayer[] = await window.api.getPlayers({ tournamentId: selectedTournament.id });
    setTournamentPlayers(parsePlayers(players));
  }

  const addTournamentPlayer = async (newPlayerName: string) => {
    selectedTournament && await window.api.addPlayer({ name: newPlayerName, tournamentId: selectedTournament.id })
    getTournamentPlayers()
    openSnackbar('Hráč přidán!')
  }

  const removeTournamentPlayer = async (playerId: number) => {
    await window.api.removePlayer({ playerId: playerId })
    getTournamentPlayers()
    openSnackbar('Hráč odebrán!')
  }

  const setResult = async (result: number) => {
    if (selectedMatchIndex === undefined || selectedMatchIndex === -1) {
      const nextMatchIndex = matches.findIndex(match => match.result === null);
      setSelectedMatchIndex(nextMatchIndex);
      return
    }
    selectedTournament && await window.api.saveResult({ matchId: matches[selectedMatchIndex].id, result: result })
    getMatches()
    // find next match with null result after the selectedMatchIndex
    const nextMatchIndex = matches.findIndex((match, index) => index > selectedMatchIndex && match.result === null)
    // if nextMatchIndex is -1, find first match with null result
    setSelectedMatchIndex(nextMatchIndex === -1 ? matches.findIndex(match => match.result === null) : nextMatchIndex)
  }

  const getMatches = async () => {
    if (selectedTournament) {
      const matchesData = await window.api.getMatches({ tournamentId: selectedTournament.id, currentRound: selectedTournament.currentRound })
      const parsedMatches: iMatch[] = matchesData.map((match: iRawMatch) => {
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

  const getAllMatches = async () => {
    if (selectedTournament) {
      const matchesData = await window.api.getAllMatches({ tournamentId: selectedTournament.id, currentRound: selectedTournament.currentRound })
      const parsedMatches: iMatch[][] = matchesData.map((roundMatches: iRawMatch[]) => {
        return roundMatches.map((match: iRawMatch) => {
          return {
            id: match.id,
            whitePlayer: JSON.parse(match.whitePlayer),
            blackPlayer: JSON.parse(match.blackPlayer),
            result: match.result,
            boardNumber: match.boardNumber,
            round: match.round
          }
        }).sort((a, b) => a.boardNumber - b.boardNumber)
      })
      setAllTournamentMatches(parsedMatches);
    }
  }

  const formatNumber = (num: number) => {
    if (num === 0.5) return '½';
    const integerPart = Math.floor(num);
    const decimalPart = num - integerPart;
    if (decimalPart === 0.5) {
      return `${integerPart}½`;
    } else {
      return num;
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
    allTournamentMatches,
    setAllTournamentMatches,
    getAllMatches,
    selectedMatchIndex,
    setSelectedMatchIndex,
    setResult,
    isAnyResultNull,
    getMatches,

    formatNumber
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
