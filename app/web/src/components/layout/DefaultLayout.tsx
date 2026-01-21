import { Outlet } from "react-router-dom";
import LayoutFooter from "./LayoutFooter";
import LayoutHeader from "./LayoutHeader";


export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (<div className="min-h-screen ">
    <LayoutHeader />
    <main>
      {children || <Outlet />}
    </main>
    <LayoutFooter />  
  </div>)
}