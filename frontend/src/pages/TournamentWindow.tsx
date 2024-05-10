import './TournamentWindow.scss'
import RegistrationTournamentWindow from '../components/tournament-windows/RegistrationTournamentWindow';
import { useTournaments } from '../contexts/TournamentsProvider';
import PlaytimeTournamentWindow from '../components/tournament-windows/PlaytimeTournamentWindow';
import FinishedTournamentWindow from '../components/tournament-windows/FinishedTournamentWindow';
import { useEffect } from 'react';
import { useNav } from '../contexts/NavigationProvider';

const TournamentWindow = () => {
  const { selectedTournament } = useTournaments();
  const { toHome } = useNav();

  // Empty react component that redirects the user to tournament overview page
  const ToTournamentOverview = () => {
    useEffect(() => {
      toHome();
    }, []);

    return (<></>)
  }

  return (
    <>
      {
        selectedTournament ? (
          selectedTournament.phase === 'registration' ? <RegistrationTournamentWindow />
          : selectedTournament.phase === 'playtime' ? <PlaytimeTournamentWindow />
          : selectedTournament.phase === 'finished' ? <FinishedTournamentWindow />
          : <ToTournamentOverview />
        ) : <ToTournamentOverview />
      }
    </>
  )
}

export default TournamentWindow
