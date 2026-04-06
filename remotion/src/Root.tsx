import { Composition } from "remotion";
import { SplashScreen } from "./SplashScreen";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={SplashScreen}
    durationInFrames={90}
    fps={30}
    width={1080}
    height={1920}
  />
);
