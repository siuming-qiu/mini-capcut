import "./index.css";
import CanvasPlayer from "./CanvasPlayer";
import PlayerControl from "./PlayerControl";
import Uploader from "./Uploader";

const App = () => {
  return (
    <div className="p-4">
      <Uploader />
      <CanvasPlayer />
      <PlayerControl />
    </div>
  );
};

export default App;
