import { useTournaments } from '../../../contexts/TournamentsProvider';
import { iMatch, iRawMatch } from '../../../interfaces/tournaments-interface';
import './TournamentRoundsWindow.scss'
import React, { useEffect, useState } from 'react'
import Dropdown from '../../buttons/dropdown/Dropdown';

const TournamentRoundsWindow = () => {
  const [allTournamentMatches, setAllTournamentMatches] = useState<iMatch[][]>([]);
  const { setSelectedMatchIndex, selectedTournament } = useTournaments();
  const [selectedRound, setSelectedRound] = useState<string>('1');
  const [selectedRoundMatches, setSelectedRoundMatches] = useState<iMatch[]>([]);

  useEffect(() => {
    getAllMatches();
    console.log('TournamentRoundsWindow rendered')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (allTournamentMatches.length > 0) {
      setSelectedRoundMatches(allTournamentMatches[parseInt(selectedRound) - 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTournamentMatches])

  useEffect(() => {
    if (allTournamentMatches.length > 0) {
      setSelectedRoundMatches(allTournamentMatches[parseInt(selectedRound) - 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRound])

  const getAllMatches = async () => {
    if (selectedTournament) {
      const matchesData = await window.api.getAllMatches({ tournamentId: selectedTournament.id, currentRound: selectedTournament.currentRound })
      console.log(matchesData)
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

  return (
    <div className='tournament-rounds-window'>
      <Dropdown dropdownItems={Array.from({ length: selectedTournament ? selectedTournament.currentRound : 1 }, (_, index) => (index + 1).toString())} selectedItem={selectedRound} setSelectedItem={setSelectedRound} prefix='Kolo' />
      <div className="rounds-wrapper">
        <div className='tournament-round'>
          <div className="matches-wrapper">
            <table className="matches">
              <thead>
                <tr className="matches-heading">
                  <th className="board-number width-s text-center">Stůl</th>
                  <th className="start-position width-s text-center">St.č.</th>
                  <th className="name text-left">Bílý</th>
                  <th className="score text-center">B</th>
                  <th className="result text-center">Výsledek</th>
                  <th className="score text-center">B</th>
                  <th className="name text-left">Černý</th>
                  <th className="start-position width-s text-center">St.č.</th>
                </tr>
              </thead>
              <tbody>
                {
                  selectedRoundMatches.map((match, index) => (
                    <tr key={index} className='match' onClick={() => setSelectedMatchIndex(index)}>
                      <td className="board-number width-s text-center">{match.boardNumber}</td>
                      <td className="start-position width-s text-center">{match.whitePlayer.startPosition}</td>
                      <td className="name text-left">{match.whitePlayer.name}</td>
                      <td className="score text-center">{formatNumber(match.whitePlayer.score)}</td>
                      <td className="result text-center">
                        {
                          match.result !== null ?
                            match.result === 0.5 ? '½  :  ½' : `${match.result} : ${Math.abs(match.result - 1)}`
                            : ':'
                        }
                      </td>
                      <td className="score text-center">{formatNumber(match.blackPlayer.score)}</td>
                      <td className="name text-left">{match.blackPlayer.name}</td>
                      <td className="start-position width-s text-center">{match.blackPlayer.startPosition}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TournamentRoundsWindow
