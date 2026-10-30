import { Outlet, useLocation, useNavigation } from "react-router-dom";
import Box from "@mui/material/Box";

import DetailModal from "src/components/DetailModal";
import VideoPortalContainer from "src/components/VideoPortalContainer";
import DetailModalProvider from "src/providers/DetailModalProvider";
import PortalProvider from "src/providers/PortalProvider";
import { MAIN_PATH } from "src/constant";
import { Footer, MainHeader } from "src/components/layouts";
import MainLoadingScreen from "src/components/MainLoadingScreen";

export default function MainLayout() {
  const location = useLocation();
  const navigation = useNavigation();
  const isWatchPage = location.pathname.startsWith(`/${MAIN_PATH.watch}`);

  return (
    <DetailModalProvider>
      <PortalProvider>
        <Box
          sx={{
            width: "100%",
            minHeight: "100vh",
            bgcolor: "background.default",
            overflowX: "hidden",
            position: "relative",
          }}
        >
          {!isWatchPage && <MainHeader />}
          {navigation.state !== "idle" && <MainLoadingScreen />}
          <DetailModal />
          <Outlet />
          <VideoPortalContainer />
          {!isWatchPage && <Footer />}
        </Box>
      </PortalProvider>
    </DetailModalProvider>
  );
}
