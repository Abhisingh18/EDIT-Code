import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { T } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition id="Pragyan" component={Main} durationInFrames={T.TOTAL} fps={30} width={1920} height={1080} />
);
