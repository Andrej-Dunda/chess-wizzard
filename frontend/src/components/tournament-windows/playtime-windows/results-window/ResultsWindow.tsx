import { useTournaments } from '../../../../contexts/TournamentsProvider';
import TournamentControlPanel from '../../../tournament-control-panel/TournamentControlPanel';
import './ResultsWindow.scss'
import React from 'react'

const ResultsWindow = () => {
  const { selectedTournament, tournamentPlayers } = useTournaments();
  const firstRound: boolean = selectedTournament?.round === 1;

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
    <section className='results-window'>
      <h4 className="h4">{firstRound ? 'Startovní listina' : `Výsledky po ${selectedTournament && selectedTournament.round - 1}. kole`}</h4>
      <div className="table-wrapper">
        <table className='results-table'>
          <thead>
            <tr className='heading-row'>
              {!firstRound && <th className='width-s text-right' title='Pořadí'>#</th>}
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
                <tr key={index} className='player-row'>
                  {!firstRound && <td className='text-right width-s'>{index + 1}</td>}
                  <td className='text-center width-s'>{player.startPosition}</td>
                  <td className='name text-left'>{player.name}</td>
                  <td className='text-center width-m'>{formatNumber(player.score)}</td>
                  <td className='text-center width-m'>{formatNumber(player.bucholz)}</td>
                  <td className='text-center width-m'>{formatNumber(player.sonnenbornBerger)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <TournamentControlPanel />
    </section>
  )
}

export default ResultsWindow
