import { createRoutesView } from "atomic-router-react";
import { GameRoute } from "./Game";
import { GamesRoute } from "./Games";
import { GameStartRoute } from "./GameStart";
import { LoginRoute } from "./Login";
import { RegisterRoute } from "./Register";

export const Pages = createRoutesView({
  routes: [GameRoute, GamesRoute, GameStartRoute, LoginRoute, RegisterRoute],
});
