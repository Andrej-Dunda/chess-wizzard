import { useTournaments } from '../../../contexts/TournamentsProvider';
import { iMatch } from '../../../interfaces/tournaments-interface';
import './TournamentRoundsWindow.scss'
import React, { useEffect, useState } from 'react'
import PlayerNameComponent from '../../player-name-component/PlayerNameComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

const TournamentRoundsWindow = () => {
  const { setSelectedMatchIndex, selectedTournament, allTournamentMatches, formatNumber } = useTournaments();
  const [selectedRound, setSelectedRound] = useState<number>(selectedTournament?.currentRound || 1);
  const [selectedRoundMatches, setSelectedRoundMatches] = useState<iMatch[]>([]);

  useEffect(() => {
    if (allTournamentMatches.length > 0) {
      setSelectedRoundMatches(allTournamentMatches[selectedRound - 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTournamentMatches])

  useEffect(() => {
    if (allTournamentMatches.length > 0) {
      setSelectedRoundMatches(allTournamentMatches[selectedRound - 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRound])

  const showRound = (direction: string) => {
    if (direction === 'previous') {
      setSelectedRound(selectedRound - 1);
    } else {
      setSelectedRound(selectedRound + 1);
    }
  }

  return (
    <div className='tournament-rounds-window'>
      <div className="round-switch">
        <FontAwesomeIcon icon={faAngleLeft} className={`${selectedRound === 1 ? 'disabled ' : ''}previous-round-icon toggle`} onClick={() => selectedRound > 1 && showRound('previous')} />
        <h4>Kolo {selectedRound}</h4>
        <FontAwesomeIcon icon={faAngleRight} className={`${selectedRound === selectedTournament?.currentRound ? 'disabled ' : ''}next-round-icon toggle`} onClick={() => selectedTournament && selectedRound < selectedTournament.currentRound && showRound('next')} />
      </div>
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
                      <td className="name text-left"><PlayerNameComponent playerId={match.whitePlayer.id} /></td>
                      <td className="score text-center">{formatNumber(match.whitePlayer.score)}</td>
                      <td className="result text-center">
                        {
                          match.result !== null ?
                            match.result === 0.5 ? '½  :  ½' : `${match.result} : ${Math.abs(match.result - 1)}`
                            : ':'
                        }
                      </td>
                      <td className="score text-center">{formatNumber(match.blackPlayer.score)}</td>
                      <td className="name text-left"><PlayerNameComponent playerId={match.blackPlayer.id} /></td>
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
