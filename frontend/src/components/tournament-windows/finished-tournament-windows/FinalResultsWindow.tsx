import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTournaments } from '../../../contexts/TournamentsProvider';
import './FinalResultsWindow.scss'
import { faAnglesLeft, faMedal } from '@fortawesome/free-solid-svg-icons';
import React from 'react'
import PlayerNameComponent from '../../player-name-component/PlayerNameComponent';

const FinalResultsWindow = () => {
  const { changeTournamentPhase, selectedTournament, tournamentPlayers, formatNumber } = useTournaments();

  return (
    <div className='final-results'>
      <h4 className="h4">Konečné pořadí po {selectedTournament?.currentRound}. kole</h4>
      <div className="table-wrapper">
        <table className='results-table'>
          <thead>
            <tr className='heading-row'>
              <th className='width-s text-right position' title='Pořadí'>#</th>
              <th className='start-position text-center' title='Startovní číslo'>St.č.</th>
              <th className='text-left'>Jméno</th>
              <th className='with-m text-center' title='Body'>B</th>
              <th className='with-m text-center' title='Sonnenborn-Berger'>SB</th>
              <th className='with-m text-center' title='Bucholz'>BH</th>
            </tr>
          </thead>
          <tbody>
            {
              tournamentPlayers.map((player, index) => (
                <tr key={index} className={`player-row`}>
                  <td className='text-right width-s position'>{index < 3 ? <FontAwesomeIcon icon={faMedal} className={index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''} /> : index + 1}</td>
                  <td className='text-center width-s'>{player.startPosition}</td>
                  <td className='name text-left'><PlayerNameComponent playerId={player.id} /></td>
                  <td className='text-center width-m'>{formatNumber(player.score)}</td>
                  <td className='text-center width-m'>{player.sonnenbornBerger}</td>
                  <td className='text-center width-m'>{player.bucholz}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <button className="back-to-playtime dark" onClick={() => changeTournamentPhase('playtime')}>
        <FontAwesomeIcon icon={faAnglesLeft} />
        <span>Předchozí kolo</span>
      </button>
    </div>
  )
}

export default FinalResultsWindow
