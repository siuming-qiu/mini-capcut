import "./index.css";
import CanvasPlayer from "./CanvasPlayer";
import PlayerControl from "./PlayerControl";
import Uploader from "./Uploader";
import TimeLine from "./components/Timeline";
import TrackList from "./TrackList";

const App = () => {
  return (
    <div className="p-4">
      <Uploader />
      <CanvasPlayer />
      <PlayerControl />
      <TimeLine />
      <TrackList />
    </div>
  );
};

export default App;
