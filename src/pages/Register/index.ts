import { Spinner } from "~/shared/ui";
import { anonymousRoute, currentRoute } from "./model/model";
import { RegisterPage } from "./ui/Page";
import { createRouteView } from "atomic-router-react";

export const RegisterRoute = {
  view: createRouteView({ route: anonymousRoute, view: RegisterPage, otherwise: Spinner }),
  route: currentRoute,
};
