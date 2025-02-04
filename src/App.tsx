import CanvasPlayer from "./CanvasPlayer";
import "./index.css";
import Uploader from "./Uploader";

const App = () => {
  return (
    <div className="p-4">
      <Uploader />
      <CanvasPlayer />
    </div>
  );
};

export default App;
