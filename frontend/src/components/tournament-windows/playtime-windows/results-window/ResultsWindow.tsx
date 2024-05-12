import { useTournaments } from '../../../../contexts/TournamentsProvider';
import './ResultsWindow.scss'
import React from 'react'

const ResultsWindow = () => {
  const { selectedTournament, tournamentPlayers } = useTournaments();
  const firstRound: boolean = selectedTournament?.round === 1;

  return (
    <section className='results-window'>
      <h4 className="h4">{firstRound ? 'Startovní listina' : `Výsledky po ${selectedTournament && selectedTournament.round - 1}. kole`}</h4>
      <div className="table-wrapper">
        <table className='results-table'>
          <thead>
            <tr className='heading-row'>
              {!firstRound && <th className='width-s text-right' title='Pořadí'>#</th>}
              <th className='width-s text-right' title='Startovní číslo'>St.č.</th>
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
                  <td className='text-right width-s'>{player.startPosition}</td>
                  <td className='name text-left'>{player.name}</td>
                  <td className='text-center width-m'>{player.score}</td>
                  <td className='text-center width-m'>{player.bucholz}</td>
                  <td className='text-center width-m'>{player.sonnenbornBerger}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ResultsWindow
