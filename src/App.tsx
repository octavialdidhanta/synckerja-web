import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./home/pages/Index.tsx";
import NotFound from "./home/pages/NotFound.tsx";
import WhatsappCentangBiruPage from "./fitur/whatsapp-centang-biru/WhatsappCentangBiruPage.tsx";
import GtmPageView from "./share/analytics/GtmPageView.tsx";

const App = () => (
  <BrowserRouter>
    <GtmPageView />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/fitur/whatsapp-centang-biru" element={<WhatsappCentangBiruPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
