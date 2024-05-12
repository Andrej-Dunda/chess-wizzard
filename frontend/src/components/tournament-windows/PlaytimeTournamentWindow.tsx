import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTournaments } from '../../contexts/TournamentsProvider'
import './PlaytimeTournamentWindow.scss'
import React from 'react'
import { faAnglesLeft, faAnglesRight, faFlagCheckered } from '@fortawesome/free-solid-svg-icons';

const PlaytimeTournamentWindow = () => {
  const { changeTournamentPhase, selectedTournament, tournamentPlayers, changeTournamentRound } = useTournaments();
  const [showResults, setShowResults] = React.useState<boolean>(true);
  const firstRound: boolean = selectedTournament?.round === 1;

  const backToRegistration = async () => {
    await changeTournamentRound(0)
    changeTournamentPhase('registration')
  }
  const previousRound = () => selectedTournament && changeTournamentRound(selectedTournament.round - 1)
  const nextRound = () => selectedTournament && changeTournamentRound(selectedTournament.round + 1)

  return (
    <div className='playtime-tournament-window'>
      <div className="tournament-window-header">
        <h5 className="tournament-title">{selectedTournament?.name}</h5>
        <div className="results-toggle">
          <button className={`show-results-button toggle-button${showResults ? ' active' : ''}`} onClick={() => setShowResults(true)}>{firstRound ? 'Startovní listina' : 'Výsledky'}</button>
          <button className={`show-matches-button toggle-button${!showResults ? ' active' : ''}`} onClick={() => setShowResults(false)}>Nasazení</button>
        </div>
        <span className='tournament-round'>{selectedTournament && selectedTournament.round}. kolo</span>
      </div>
      <div className="tournament-window-body">
        {
          showResults ? (
            <section className='results-section'>
              <h4 className="h4">{firstRound ? 'Startovní listina' : `Výsledky po ${selectedTournament && selectedTournament.round - 1}. kole`}</h4>
              <div className="table-wrapper">
                <table className='results-table'>
                  <thead>
                    <tr className='heading-row'>
                      {!firstRound && <th className='width-s'>#</th>}
                      <th className='width-s'>St.č.</th>
                      <th className='text-left'>Jméno</th>
                      <th className='with-m'>B</th>
                      <th className='with-m'>SB</th>
                      <th className='with-m'>BH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      tournamentPlayers.map((player, index) => (
                        <tr key={index} className='player-row'>
                          {!firstRound && <td className='text-right width-s'>{index + 1}</td>}
                          <td className='text-right width-s'>{player.startPosition}</td>
                          <td className='name'>{player.name}</td>
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
          ) : (
            <section className='matches-section'>
              <h4>Nasazení</h4>
              <div className="matches">
                <div className="matches-wrapper">
                  <div className="match">
                    <span className="player-name">Andrej</span>
                    <span className="player-name">Jirka</span>
                  </div>
                  <div className="match">
                    <span className="player-name">Honza</span>
                    <span className="player-name">Kuba</span>
                  </div>
                  <div className="match">
                    <span className="player-name">Lukáš</span>
                    <span className="player-name">Martin</span>
                  </div>
                </div>
              </div>
            </section>
          )
        }
        <div className="control-panel">
          {
            firstRound ? <button className='back-to-registration-button dark' onClick={backToRegistration}>
              <FontAwesomeIcon icon={faAnglesLeft} />
              Zpět k registraci
            </button>
            : (
              <>
                <button className="previous-round-button dark" onClick={previousRound}>
                  <FontAwesomeIcon icon={faAnglesLeft} />
                  Zpět k předchozímu kolu
                </button>
                <button className='finish-tournament-button dark' onClick={() => changeTournamentPhase('finished')}>
                  Ukončit turnaj
                  <FontAwesomeIcon icon={faFlagCheckered} />
                </button>
              </>
            )
          }
          <button className="next-round-button dark" onClick={nextRound}>
            Další kolo
            <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlaytimeTournamentWindow
